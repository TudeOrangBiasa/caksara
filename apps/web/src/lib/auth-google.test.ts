import { afterEach, describe, expect, test } from "bun:test";

import {
  formatLeaderboardName,
  isNativeAuthCallback,
  NATIVE_CALLBACK_URL_KEY,
  parseAuthCallbackParams,
  parseNativeAuthCallback,
  planMigration,
  preferStashedCallbackUrl,
  suffixForProfileId,
} from "./auth-google";

describe("suffixForProfileId (#89)", () => {
  test("stabil untuk profile_id yang sama", () => {
    expect(suffixForProfileId("uid-google-123")).toBe(suffixForProfileId("uid-google-123"));
  });

  test("selalu dalam rentang 100-999", () => {
    for (const id of ["a", "anon_x", "uid-google-123", "profil-yang-sangat-panjang-0123456789"]) {
      const suffix = suffixForProfileId(id);
      expect(suffix).toBeGreaterThanOrEqual(100);
      expect(suffix).toBeLessThanOrEqual(999);
    }
  });

  test("berbeda untuk id berbeda (bukan konstanta)", () => {
    const seen = new Set(
      ["uid-1", "uid-2", "uid-3", "uid-4", "uid-5"].map((id) => suffixForProfileId(id)),
    );
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe("formatLeaderboardName (#89)", () => {
  test("`Made 421`: nama + spasi + suffix", () => {
    expect(formatLeaderboardName("Made", 421)).toBe("Made 421");
  });
});

function localProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: "anon_lokal",
    isAnon: true,
    name: "Putu",
    xp: 120,
    streak: 3,
    hearts: 5,
    mastery: { wre_01: "dipahami" as const },
    ...overrides,
  };
}

describe("planMigration (#89: lokal tidak hilang)", () => {
  const session = { uid: "uid-google-1", displayName: "Putu G" };

  test("XP lokal menang bila server lebih kecil", () => {
    const plan = planMigration(localProfile({ xp: 120 }), { xp: 40, streak: 1 }, session);
    expect(plan.xp).toBe(120);
    expect(plan.uid).toBe("uid-google-1");
  });

  test("XP server menang bila lokal lebih kecil", () => {
    const plan = planMigration(localProfile({ xp: 10 }), { xp: 300, streak: 5 }, session);
    expect(plan.xp).toBe(300);
    expect(plan.streak).toBe(5);
  });

  test("tanpa baris server, lokal dipakai utuh", () => {
    const plan = planMigration(localProfile({ xp: 55, streak: 2 }), null, session);
    expect(plan.xp).toBe(55);
    expect(plan.streak).toBe(2);
  });

  test("nama Google menang; fallback ke nama lokal", () => {
    expect(planMigration(localProfile(), null, session).name).toBe("Putu G");
    expect(
      planMigration(localProfile({ name: "Putu" }), null, { uid: "u", displayName: null }).name,
    ).toBe("Putu");
  });

  test("mastery lokal ikut dibawa", () => {
    const plan = planMigration(localProfile(), null, session);
    expect(plan.mastery).toEqual({ wre_01: "dipahami" });
  });
});

describe("isNativeAuthCallback (#100)", () => {
  test("true untuk scheme + path callback native", () => {
    expect(isNativeAuthCallback("app.caksara.web://auth/callback?code=abc")).toBe(true);
  });

  test("false untuk URL web biasa dan scheme asing", () => {
    expect(isNativeAuthCallback("https://caksara.vercel.app/auth/callback?code=abc")).toBe(false);
    expect(isNativeAuthCallback("app.caksara.web://profil")).toBe(false);
    expect(isNativeAuthCallback("bukan-url")).toBe(false);
  });
});

describe("parseAuthCallbackParams (#126)", () => {
  test("baca code tanpa peduli scheme atau bentuk URL", () => {
    const expected = { code: "pkce-1", accessToken: null, refreshToken: null };
    expect(parseAuthCallbackParams("app.caksara.web://auth/callback?code=pkce-1")).toEqual(
      expected,
    );
    expect(parseAuthCallbackParams("https://localhost/auth/callback?code=pkce-1")).toEqual(
      expected,
    );
    expect(parseAuthCallbackParams("/auth/callback?code=pkce-1")).toEqual(expected);
  });

  test("baca token implicit dari fragment maupun query", () => {
    const expected = { code: null, accessToken: "at-1", refreshToken: "rt-1" };
    expect(
      parseAuthCallbackParams(
        "app.caksara.web://auth/callback#access_token=at-1&refresh_token=rt-1",
      ),
    ).toEqual(expected);
    expect(
      parseAuthCallbackParams(
        "https://localhost/auth/callback?access_token=at-1&refresh_token=rt-1",
      ),
    ).toEqual(expected);
  });

  test("null untuk URL tak terurai atau kredensial kosong", () => {
    expect(parseAuthCallbackParams("bukan-url")).toBeNull();
    expect(parseAuthCallbackParams("https://localhost/auth/callback")).toBeNull();
    expect(parseAuthCallbackParams("/auth/callback?code=")).toBeNull();
    expect(parseAuthCallbackParams("https://localhost/auth/callback?access_token=at-1")).toBeNull();
  });

  test("tanpa gate path: path lain tetap terbaca di level ini", () => {
    expect(parseAuthCallbackParams("https://localhost/?code=abc")).toEqual({
      code: "abc",
      accessToken: null,
      refreshToken: null,
    });
  });
});

describe("parseNativeAuthCallback (#126)", () => {
  test("ambil code PKCE dari query", () => {
    const parsed = parseNativeAuthCallback("app.caksara.web://auth/callback?code=pkce-1");
    expect(parsed).toEqual({ code: "pkce-1", accessToken: null, refreshToken: null });
  });

  test("ambil token implicit dari fragment", () => {
    const parsed = parseNativeAuthCallback(
      "app.caksara.web://auth/callback#access_token=at-1&refresh_token=rt-1",
    );
    expect(parsed).toEqual({ code: null, accessToken: "at-1", refreshToken: "rt-1" });
  });

  test("settle href WebView yang dulu selalu null", () => {
    expect(parseNativeAuthCallback("https://localhost/auth/callback?code=pkce-1")).toEqual({
      code: "pkce-1",
      accessToken: null,
      refreshToken: null,
    });
    expect(parseNativeAuthCallback("/auth/callback?code=pkce-1")).toEqual({
      code: "pkce-1",
      accessToken: null,
      refreshToken: null,
    });
  });

  test("null bila path lain atau tanpa kredensial", () => {
    expect(parseNativeAuthCallback("https://caksara.vercel.app/?code=abc")).toBeNull();
    expect(parseNativeAuthCallback("app.caksara.web://auth/callback")).toBeNull();
    expect(parseNativeAuthCallback("app.caksara.web://auth/callback?code=")).toBeNull();
    expect(parseNativeAuthCallback("https://localhost/profil?code=abc")).toBeNull();
  });
});

describe("preferStashedCallbackUrl (#126)", () => {
  const map = new Map<string, string>();
  const fakeSession = {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };

  afterEach(() => {
    map.clear();
  });

  test("URL mentah menang atas href WebView lalu dibersihkan", () => {
    Object.assign(globalThis, { window: { sessionStorage: fakeSession } });
    fakeSession.setItem(NATIVE_CALLBACK_URL_KEY, "app.caksara.web://auth/callback?code=pkce-1");
    expect(preferStashedCallbackUrl("https://localhost/auth/callback?code=pkce-1")).toBe(
      "app.caksara.web://auth/callback?code=pkce-1",
    );
    expect(fakeSession.getItem(NATIVE_CALLBACK_URL_KEY)).toBeNull();
  });

  test("tanpa simpanan pakai href apa adanya", () => {
    Object.assign(globalThis, { window: { sessionStorage: fakeSession } });
    expect(preferStashedCallbackUrl("https://localhost/auth/callback?code=pkce-1")).toBe(
      "https://localhost/auth/callback?code=pkce-1",
    );
  });
});
