#!/usr/bin/env bun
// Fixture parity profil: profil Putu + selesai 2 modul + mastery 3 aksara.
// Dipakai shoot-profil.ts dan shoot-leaderboard.ts agar deterministik.
// LastActive = hari ini (WITA, dihitung saat jalan) supaya streak 6
// menyala penuh tanpa applyOvernightReset menolkan. Bonus belum diklaim
// supaya profil 140 XP stabil antar gate run.
const WITA_MS = 8 * 3600 * 1000;

export function witaToday(): string {
  return new Date(Date.now() + WITA_MS).toISOString().slice(0, 10);
}

export function profilSeed(): Record<string, string> {
  const today = witaToday();
  const mastery: Record<string, "belum" | "dipahami" | "ahli"> = {};
  for (let i = 1; i <= 18; i += 1) {
    mastery[`wre_${String(i).padStart(2, "0")}`] = "belum";
  }
  mastery["wre_01"] = "ahli";
  mastery["wre_02"] = "dipahami";
  mastery["wre_05"] = "dipahami";
  return {
    "vite-ui-theme": "light",
    "caksara.profile.v1": JSON.stringify({
      id: "parity-profil-putu",
      isAnon: true,
      name: "Putu",
      xp: 140,
      streak: 6,
      hearts: 5,
      lastActiveDate: today,
      heartsRefilledAt: today,
      mastery,
      avatar: { kind: "photo", value: "/assets/avatar-harbor-seal-2.webp" },
    }),
    "caksara.module-selesai.v1": JSON.stringify(["mod_01", "mod_02"]),
  };
}

// 8 baris leaderboard ikut baseline t8BaKT (nama + XP sama). Suffix Putu
// 777 bukan 77 karena schema minta 100-999; tampil "Putu 777".
// Profil fixture = baris rank 7 supaya highlight Kamu muncul.
export const LEAGUE_FIXTURE = [
  { profile_id: "p-wayan", display_name: "Wayan", suffix: 903, xp: 2450 },
  { profile_id: "p-made", display_name: "Made", suffix: 421, xp: 2310 },
  { profile_id: "p-ayu", display_name: "Ayu", suffix: 187, xp: 2280 },
  { profile_id: "p-gede", display_name: "Gede", suffix: 356, xp: 2104 },
  { profile_id: "p-nyoman", display_name: "Nyoman", suffix: 512, xp: 1987 },
  { profile_id: "p-kadek", display_name: "Kadek", suffix: 248, xp: 1930 },
  { profile_id: "parity-profil-putu", display_name: "Putu", suffix: 777, xp: 1875 },
  { profile_id: "p-komang", display_name: "Komang", suffix: 634, xp: 1802 },
];
