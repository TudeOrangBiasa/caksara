import { DEFAULT_BEDAWANG, profileNameSchema, userProfileSchema } from "./zod/profile";
import type { ProfileAvatar, UserProfile } from "./zod/profile";
import { ipAvatarUriForName } from "./default-avatar";
import { ensureAnonSession } from "./supabase";
import { scheduleProfileSync } from "./profile-sync";
import { WRESASTRA_AKSARA } from "../features/module/aksara-data";

const STORAGE_KEY = "caksara.profile.v1";

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

const anonId = () => `anon_${crypto.randomUUID()}`;

const WRESASTRA_IDS = WRESASTRA_AKSARA.map((a) => a.id);

let cache: UserProfile | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function readStored(): UserProfile | null {
  const storage = safeStorage();
  if (!storage) return null;
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const direct = userProfileSchema.safeParse(json);
  if (direct.success) return direct.data;
  // Avatar korup (mis. bedawang lama) tidak boleh me-null-kan seluruh profil:
  // bila semua issue di jalur avatar, pertahankan profil dengan avatar default.
  if (typeof json !== "object" || json === null) return null;
  const avatarOnly =
    direct.error.issues.length > 0 &&
    direct.error.issues.every((issue) => issue.path[0] === "avatar");
  if (!avatarOnly) return null;
  const rest = { ...(json as Record<string, unknown>) };
  delete rest.avatar;
  const repaired = userProfileSchema.safeParse({
    ...rest,
    avatar: { kind: "bedawang", value: DEFAULT_BEDAWANG },
  });
  if (!repaired.success) return null;
  return repaired.data;
}

const WITA_OFFSET_MS = 8 * 3600 * 1000;
const DAY_MS = 24 * 3600 * 1000;
/** V9: tulis XP/Hati didebounce agar tidak membanjiri storage saat kuis. */
const DISK_WRITE_DEBOUNCE_MS = 500;

let diskTimer: number | null = null;
let pagehideWired = false;

function writeDisk(profile: UserProfile | null): void {
  const storage = safeStorage();
  if (!storage) return;
  if (profile) {
    storage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } else {
    storage.removeItem(STORAGE_KEY);
  }
}

function scheduleDiskWrite(): void {
  if (typeof window === "undefined") return;
  if (!pagehideWired) {
    pagehideWired = true;
    window.addEventListener("pagehide", () => flushProfileWrites());
  }
  if (diskTimer) window.clearTimeout(diskTimer);
  diskTimer = window.setTimeout(() => {
    diskTimer = null;
    writeDisk(cache);
  }, DISK_WRITE_DEBOUNCE_MS);
}

function persist(profile: UserProfile | null, immediate = false): void {
  cache = profile;
  if (immediate || typeof window === "undefined") {
    if (diskTimer) {
      clearTimeout(diskTimer);
      diskTimer = null;
    }
    writeDisk(profile);
  } else {
    scheduleDiskWrite();
  }
  emit();
  if (profile) scheduleProfileSync(profile);
}

/** Paksa tulis cache ke localStorage sekarang (otomatis dipanggil saat pagehide). */
export function flushProfileWrites(): void {
  if (diskTimer) {
    clearTimeout(diskTimer);
    diskTimer = null;
  }
  writeDisk(cache);
}

/** Tanggal kalender WITA (UTC+8 tetap, tanpa DST) format YYYY-MM-DD. */
export function witaTodayStr(now = Date.now()): string {
  return new Date(now + WITA_OFFSET_MS).toISOString().slice(0, 10);
}

function witaYesterdayStr(now = Date.now()): string {
  return new Date(now + WITA_OFFSET_MS - DAY_MS).toISOString().slice(0, 10);
}

function isYesterday(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  return dateStr === witaYesterdayStr();
}

export function loadProfile(): UserProfile | null {
  if (cache) return cache;
  cache = readStored();
  return cache;
}

export function subscribeProfile(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Satukan identitas ganda: baris server dikunci ke auth.uid() sementara UI
 * memakai anon_uuid lokal. Setelah sesi anon ada, adopsi uid sebagai id
 * profil agar tulis lokal dan server merujuk baris yang sama. No-op saat
 * backend mati (offline-first tetap jalan dengan id lokal).
 */
export async function reconcileProfileId(): Promise<string | null> {
  const uid = await ensureAnonSession();
  if (!uid) return null;
  const current = loadProfile();
  if (current && current.id !== uid) {
    persist({ ...current, id: uid }, true);
  }
  return uid;
}

export function createAnonProfile(name: string): UserProfile {
  const parsed = profileNameSchema.safeParse(name);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Nama tidak valid.");
  }
  const clean = parsed.data;
  const today = witaTodayStr();
  const mastery: Record<string, "belum" | "dipahami" | "ahli"> = {};
  for (const id of WRESASTRA_IDS) {
    mastery[id] = "belum";
  }
  const profile: UserProfile = {
    id: anonId(),
    isAnon: true,
    name: clean,
    xp: 0,
    streak: 0,
    hearts: 5,
    lastActiveDate: today,
    heartsRefilledAt: today,
    mastery,
    // Avatar IP stabil-unik per profil (hash nama + id acak); user bisa ganti nanti.
    avatar: {
      kind: "photo",
      value: ipAvatarUriForName(`${clean}-${crypto.randomUUID().slice(0, 8)}`),
    },
  };
  // Tulis sinkron: profil identitas tidak boleh hilang bila reload sebelum flush debounce.
  persist(profile, true);
  return profile;
}

function update(mutate: (profile: UserProfile) => void): void {
  const current = loadProfile();
  if (!current) return;
  const next: UserProfile = { ...current };
  mutate(next);
  persist(next);
}

export function addXp(delta: number): void {
  update((profile) => {
    profile.xp = Math.max(0, profile.xp + delta);
  });
}

export function setHearts(hearts: number): void {
  update((profile) => {
    profile.hearts = Math.min(5, Math.max(0, hearts));
  });
}

/**
 * Isi hati penuh 5 bila sudah lewat 00:00 WITA sejak refill terakhir.
 * Kembalikan true bila refill terjadi (pemanggil wajib toast).
 */
export function refillHearts(): boolean {
  const today = witaTodayStr();
  let didRefill = false;
  update((profile) => {
    if (profile.hearts < 5 && (!profile.heartsRefilledAt || profile.heartsRefilledAt < today)) {
      profile.hearts = 5;
      profile.heartsRefilledAt = today;
      didRefill = true;
    }
  });
  return didRefill;
}

/**
 * Cermin lokal cron harian V9: bila terakhir aktif lebih tua dari kemarin
 * (WITA), streak dinolkan. Dijalankan sekali saat aplikasi dimuat.
 * Kembalikan true bila streak direset (pemanggil wajib toast).
 */
export function applyOvernightReset(): boolean {
  const yesterday = witaYesterdayStr();
  let didReset = false;
  update((profile) => {
    if (profile.lastActiveDate && profile.lastActiveDate < yesterday && profile.streak !== 0) {
      profile.streak = 0;
      didReset = true;
    }
  });
  return didReset;
}

export function updateStreak(): void {
  update((profile) => {
    const today = witaTodayStr();
    if (profile.lastActiveDate === today) return;
    if (isYesterday(profile.lastActiveDate)) {
      profile.streak += 1;
    } else {
      profile.streak = 1;
    }
    profile.lastActiveDate = today;
  });
}

export function markAksara(aksaraId: string, level: "belum" | "dipahami" | "ahli"): void {
  update((profile) => {
    if (profile.mastery && profile.mastery[aksaraId] !== undefined) {
      profile.mastery[aksaraId] = level;
    }
  });
}

export function markModuleMastered(moduleAksaraIds: string[]): void {
  update((profile) => {
    if (!profile.mastery) return;
    for (const id of moduleAksaraIds) {
      if (profile.mastery[id] !== undefined) {
        profile.mastery[id] = "ahli";
      }
    }
  });
}

export function resetProfile(): void {
  persist(null, true);
}

/** Ganti nama panggilan. Kembalikan pesan error bila tidak valid, null bila sukses. */
export function setProfileName(name: string): string | null {
  const trimmed = name.trim();
  const parsed = profileNameSchema.safeParse(trimmed);
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Nama tidak valid.";
  }
  const current = loadProfile();
  if (!current) return "Profil belum ada.";
  update((profile) => {
    profile.name = parsed.data;
  });
  return null;
}

export function setAvatar(avatar: ProfileAvatar): void {
  update((profile) => {
    profile.avatar = avatar;
  });
}

export { WRESASTRA_IDS };
