import { describe, expect, test } from "bun:test";
import {
  deriveMasteryMap,
  deriveWrongTopics,
  mergeProgressStats,
  recordAksaraAnswer,
} from "./aksara-stats";
import { aksaraStatsSchema } from "./zod/profile";
import { deriveMastery } from "./game-rules";
import { WRESASTRA_AKSARA } from "../features/module/aksara-data";

describe("recordAksaraAnswer", () => {
  test("menambah hitungan benar dan total per aksara", () => {
    const s1 = recordAksaraAnswer({}, { aksaraId: "wre_01", correct: true });
    expect(s1["wre_01"]).toEqual({ correct: 1, total: 1 });
    const s2 = recordAksaraAnswer(s1, { aksaraId: "wre_01", correct: false });
    expect(s2["wre_01"]).toEqual({ correct: 1, total: 2 });
  });

  test("id asing diabaikan, stats lain utuh", () => {
    const s1 = recordAksaraAnswer({}, { aksaraId: "wre_99", correct: true });
    expect(s1).toEqual({});
    const s2 = recordAksaraAnswer(
      { wre_01: { correct: 1, total: 1 } },
      { aksaraId: "?", correct: true },
    );
    expect(s2).toEqual({ wre_01: { correct: 1, total: 1 } });
  });
});

describe("deriveMasteryMap", () => {
  test("18 Wresastra selalu terisi, tanpa hitungan berarti belum", () => {
    const map = deriveMasteryMap({});
    expect(Object.keys(map)).toHaveLength(18);
    for (const a of WRESASTRA_AKSARA) expect(map[a.id]).toBe("belum");
  });

  test("ambang dipahami dan ahli mengikuti game-rules", () => {
    const map = deriveMasteryMap({
      wre_01: { correct: 2, total: 4 },
      wre_02: { correct: 8, total: 10 },
      wre_03: { correct: 1, total: 10 },
    });
    expect(map["wre_01"]).toBe("dipahami");
    expect(map["wre_02"]).toBe("ahli");
    expect(map["wre_03"]).toBe("belum");
  });
});

describe("mergeProgressStats", () => {
  test("menggabung baris server dengan jawaban sesi", () => {
    const merged = mergeProgressStats(
      [{ aksaraId: "wre_01", correctCount: 2, totalCount: 4 }],
      [
        { aksaraId: "wre_01", correct: true },
        { aksaraId: "wre_05", correct: false },
        { aksaraId: "asing", correct: true },
      ],
    );
    expect(merged).toContainEqual({ aksaraId: "wre_01", correctCount: 3, totalCount: 5 });
    expect(merged).toContainEqual({ aksaraId: "wre_05", correctCount: 0, totalCount: 1 });
    expect(merged.some((r) => r.aksaraId === "asing")).toBe(false);
  });

  test("skema menolak benar melebihi total", () => {
    expect(aksaraStatsSchema.safeParse({ wre_01: { correct: 3, total: 2 } }).success).toBe(false);
    expect(aksaraStatsSchema.safeParse({ wre_01: { correct: 2, total: 2 } }).success).toBe(true);
  });

  test("ambang baris progres memakai game-rules yang sama", () => {
    expect(deriveMastery({ correctCount: 0, totalCount: 0 })).toBe("belum");
    expect(deriveMastery({ correctCount: 8, totalCount: 10 })).toBe("ahli");
  });
});

describe("deriveWrongTopics #33", () => {
  test("aksara salah-terus (rate rendah + n≥3) jadi topik, yang lancar tidak", () => {
    const topics = deriveWrongTopics(
      {
        wre_01: { correct: 1, total: 4 },
        wre_02: { correct: 4, total: 4 },
        "?": { correct: 0, total: 9 },
      },
      [
        { aksaraId: "wre_01", correct: false },
        { aksaraId: "wre_01", correct: false },
        { aksaraId: "wre_02", correct: true },
      ],
    );
    expect(topics).toContain("wre_01");
    expect(topics).not.toContain("wre_02");
    expect(topics).not.toContain("?");
  });

  test("id materi non-Wresastra yang stabil ikut jadi topik", () => {
    const topics = deriveWrongTopics({ kb_sapaan: { correct: 0, total: 3 } }, [
      { aksaraId: "kb_sapaan", correct: false },
      { aksaraId: "kb_madaar_ngajeng", correct: false },
      { aksaraId: "kb_madaar_ngajeng", correct: false },
      { aksaraId: "kb_madaar_ngajeng", correct: false },
    ]);
    expect(topics).toContain("kb_sapaan");
    expect(topics).toContain("kb_madaar_ngajeng");
  });

  test("sesi lancar tanpa salah ber-aksara → topik kosong", () => {
    expect(
      deriveWrongTopics({ wre_01: { correct: 8, total: 10 } }, [
        { aksaraId: "wre_01", correct: true },
      ]),
    ).toEqual([]);
  });
});
