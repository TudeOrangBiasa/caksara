import { beforeEach, describe, expect, test } from "bun:test";

function makeStorage() {
  const map = new Map<string, string>();
  return {
    store: map,
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

const fakeStorage = makeStorage();

Object.assign(globalThis, {
  window: { localStorage: fakeStorage },
  navigator: { onLine: true },
});

// Impor dinamis disengaja: modul dibaca setelah window palsu terpasang.
const pending = await import("./quiz-pending-sync");

const answers = [
  { questionIndex: 0, correct: true, aksaraId: "ha" },
  { questionIndex: 1, correct: false, aksaraId: "ka" },
];
const score = { correct: 1, total: 2 };

function enqueue(moduleId = "mod_01") {
  pending.enqueuePendingSession({ moduleId, answers, score });
}

beforeEach(() => {
  fakeStorage.store.clear();
});

describe("enqueuePendingSession — buffer lokal XP/Hati/answers", () => {
  test("sesi antre setelah enqueue, terbaca balik utuh", () => {
    enqueue();
    const all = pending.readPendingSessions();
    expect(all.length).toBe(1);
    expect(all[0]?.moduleId).toBe("mod_01");
    expect(all[0]?.answers.length).toBe(2);
    expect(pending.pendingSessionCount()).toBe(1);
  });

  test("input tak valid ditolak diam-diam, tidak merusak antrean", () => {
    enqueue();
    pending.enqueuePendingSession({ moduleId: "", answers: [], score });
    expect(pending.pendingSessionCount()).toBe(1);
  });

  test("entri basi 14 hari dibuang saat dibaca", () => {
    enqueue();
    const raw = fakeStorage.store.get("caksara.pending-sync.v1") ?? "[]";
    const parsed = JSON.parse(raw) as { enqueuedAt: number }[];
    if (parsed[0]) parsed[0].enqueuedAt = Date.now() - 15 * 24 * 3600 * 1000;
    fakeStorage.store.set("caksara.pending-sync.v1", JSON.stringify(parsed));
    expect(pending.readPendingSessions().length).toBe(0);
  });

  test("clearPendingSessions mengosongkan antrean", () => {
    enqueue("mod_01");
    enqueue("mod_02");
    pending.clearPendingSessions();
    expect(pending.pendingSessionCount()).toBe(0);
  });
});

describe("flushPendingSessions — sync saat online", () => {
  test("offline → no-op, antrean utuh", async () => {
    enqueue();
    const out = await pending.flushPendingSessions({
      online: false,
      saveSession: async () => ({ saved: true }),
      saveProgress: async () => ({ saved: true }),
    });
    expect(out.attempted).toBe(0);
    expect(out.remaining).toBe(1);
  });

  test("tanpa backend → no-op, antrean utuh", async () => {
    enqueue();
    const out = await pending.flushPendingSessions({
      online: true,
      hasBackend: false,
      saveSession: async () => ({ saved: true }),
      saveProgress: async () => ({ saved: true }),
    });
    expect(out.attempted).toBe(0);
    expect(out.remaining).toBe(1);
  });

  test("online sukses → antrean terkirim dan dikosongkan", async () => {
    enqueue("mod_01");
    enqueue("mod_02");
    const out = await pending.flushPendingSessions({
      online: true,
      hasBackend: true,
      saveSession: async () => ({ saved: true }),
      saveProgress: async () => ({ saved: true }),
    });
    expect(out).toEqual({ attempted: 2, sent: 2, remaining: 0 });
  });

  test("gagal kirim → entri bertahan untuk retry berikutnya", async () => {
    enqueue();
    const out = await pending.flushPendingSessions({
      online: true,
      hasBackend: true,
      saveSession: async () => ({ saved: false }),
      saveProgress: async () => ({ saved: true }),
    });
    expect(out.sent).toBe(0);
    expect(out.remaining).toBe(1);
  });

  test("save melempar → ditangkap, entri bertahan", async () => {
    enqueue();
    const out = await pending.flushPendingSessions({
      online: true,
      hasBackend: true,
      saveSession: async () => {
        throw new Error("down");
      },
      saveProgress: async () => ({ saved: true }),
    });
    expect(out.sent).toBe(0);
    expect(out.remaining).toBe(1);
  });

  test("progress gagal → sesi tidak di-drop, flag parsial dipersist", async () => {
    enqueue();
    const out = await pending.flushPendingSessions({
      online: true,
      hasBackend: true,
      saveSession: async () => ({ saved: true }),
      saveProgress: async () => ({ saved: false }),
    });
    expect(out.sent).toBe(0);
    expect(out.remaining).toBe(1);
    expect(pending.readPendingSessions()[0]?.sessionSent).toBe(true);
    expect(pending.readPendingSessions()[0]?.progressSent).toBe(false);
  });

  test("retry tak kirim ulang bagian sukses: sesi dilewati, progres dikirim", async () => {
    enqueue();
    let sessionCalls = 0;
    let progressCalls = 0;
    await pending.flushPendingSessions({
      online: true,
      hasBackend: true,
      saveSession: async () => {
        sessionCalls += 1;
        return { saved: true };
      },
      saveProgress: async () => {
        progressCalls += 1;
        return { saved: false };
      },
    });
    const out = await pending.flushPendingSessions({
      online: true,
      hasBackend: true,
      saveSession: async () => {
        sessionCalls += 1;
        return { saved: true };
      },
      saveProgress: async () => {
        progressCalls += 1;
        return { saved: true };
      },
    });
    expect(out).toEqual({ attempted: 1, sent: 1, remaining: 0 });
    expect(sessionCalls).toBe(1);
    expect(progressCalls).toBe(2);
  });

  test("sesi sudah sukses saat enqueue → flush hanya kirim progres", async () => {
    pending.enqueuePendingSession({
      moduleId: "mod_01",
      answers,
      score,
      sessionSent: true,
      progressSent: false,
    });
    let sessionCalls = 0;
    const out = await pending.flushPendingSessions({
      online: true,
      hasBackend: true,
      saveSession: async () => {
        sessionCalls += 1;
        return { saved: true };
      },
      saveProgress: async () => ({ saved: true }),
    });
    expect(out).toEqual({ attempted: 1, sent: 1, remaining: 0 });
    expect(sessionCalls).toBe(0);
  });

  test("progres sudah sukses saat enqueue → flush hanya kirim sesi", async () => {
    pending.enqueuePendingSession({
      moduleId: "mod_01",
      answers,
      score,
      sessionSent: false,
      progressSent: true,
    });
    let progressCalls = 0;
    const out = await pending.flushPendingSessions({
      online: true,
      hasBackend: true,
      saveSession: async () => ({ saved: true }),
      saveProgress: async () => {
        progressCalls += 1;
        return { saved: true };
      },
    });
    expect(out).toEqual({ attempted: 1, sent: 1, remaining: 0 });
    expect(progressCalls).toBe(0);
  });

  test("skor inkonsisten ditolak di batas (tak antre selamanya)", () => {
    const badScore = { correct: 0, total: 2 };
    const ok = pending.enqueuePendingSession({ moduleId: "mod_01", answers, score: badScore });
    expect(ok).toBe(false);
    expect(pending.pendingSessionCount()).toBe(0);
  });

  test("total tak cocok jawaban ditolak di batas", () => {
    const badScore = { correct: 1, total: 5 };
    const ok = pending.enqueuePendingSession({ moduleId: "mod_01", answers, score: badScore });
    expect(ok).toBe(false);
    expect(pending.pendingSessionCount()).toBe(0);
  });
  test("antrean kosong → no-op tanpa memanggil saver", async () => {
    let called = false;
    const out = await pending.flushPendingSessions({
      online: true,
      hasBackend: true,
      saveSession: async () => {
        called = true;
        return { saved: true };
      },
      saveProgress: async () => ({ saved: true }),
    });
    expect(out).toEqual({ attempted: 0, sent: 0, remaining: 0 });
    expect(called).toBe(false);
  });
});

describe("syncOnBackOnline — KB independen dari buffer", () => {
  test("sisa antrean → KB cache tetap disegarkan", async () => {
    enqueue();
    let refreshed = false;
    const out = await pending.syncOnBackOnline({
      online: true,
      hasBackend: true,
      saveSession: async () => ({ saved: false }),
      saveProgress: async () => ({ saved: true }),
      refreshKbCache: async () => {
        refreshed = true;
      },
    });
    expect(out.remaining).toBe(1);
    expect(refreshed).toBe(true);
  });

  test("antrean tuntas → KB cache disegarkan", async () => {
    enqueue();
    let refreshed = false;
    const out = await pending.syncOnBackOnline({
      online: true,
      hasBackend: true,
      saveSession: async () => ({ saved: true }),
      saveProgress: async () => ({ saved: true }),
      refreshKbCache: async () => {
        refreshed = true;
      },
    });
    expect(out.remaining).toBe(0);
    expect(refreshed).toBe(true);
  });

  test("refresh KB gagal → hasil flush tetap dilaporkan", async () => {
    enqueue();
    const out = await pending.syncOnBackOnline({
      online: true,
      hasBackend: true,
      saveSession: async () => ({ saved: true }),
      saveProgress: async () => ({ saved: true }),
      refreshKbCache: async () => {
        throw new Error("kb down");
      },
    });
    expect(out).toEqual({ attempted: 1, sent: 1, remaining: 0 });
  });
});

describe("shouldBufferAfterFinish — guard antrean seusai kuis", () => {
  test("sukses penuh (sesi + progres terkirim) → tanpa enqueue, tanpa notify", () => {
    let notified = false;
    const should = pending.shouldBufferAfterFinish({
      sessionOk: true,
      progressOk: true,
      sessionValidationError: false,
    });
    // Cerminkan jalur pemanggil di route: hanya enqueue + notify bila guard lolos.
    if (should) {
      if (
        pending.enqueuePendingSession({
          moduleId: "mod_01",
          answers,
          score,
          sessionSent: true,
          progressSent: true,
        })
      ) {
        notified = true;
      }
    }
    expect(should).toBe(false);
    expect(pending.pendingSessionCount()).toBe(0);
    expect(notified).toBe(false);
  });

  test("parsial (salah satu gagal) → buffer dengan flag terkirim", () => {
    const should = pending.shouldBufferAfterFinish({
      sessionOk: true,
      progressOk: false,
      sessionValidationError: false,
    });
    expect(should).toBe(true);
  });

  test("skor inkonsisten (validation) → jangan buffer", () => {
    const should = pending.shouldBufferAfterFinish({
      sessionOk: true,
      progressOk: false,
      sessionValidationError: true,
    });
    expect(should).toBe(false);
  });
});
