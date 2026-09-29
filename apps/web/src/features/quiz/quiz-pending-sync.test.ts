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

  test("progress gagal → sesi tidak di-drop (kirim ulang utuh)", async () => {
    enqueue();
    const out = await pending.flushPendingSessions({
      online: true,
      hasBackend: true,
      saveSession: async () => ({ saved: true }),
      saveProgress: async () => ({ saved: false }),
    });
    expect(out.sent).toBe(0);
    expect(out.remaining).toBe(1);
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

describe("syncOnBackOnline — antrean + KB cache", () => {
  test("tuntas → KB cache disegarkan", async () => {
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

  test("sisa antrean → KB cache tidak disegarkan", async () => {
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
    expect(refreshed).toBe(false);
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
