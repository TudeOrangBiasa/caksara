import { profileNameSchema, userProfileSchema } from "./zod/profile";
import type { ProfileAvatar, UserProfile } from "./zod/profile";
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
  try {
    return userProfileSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

function persist(profile: UserProfile | null): void {
  cache = profile;
  if (profile) {
    safeStorage()?.setItem(STORAGE_KEY, JSON.stringify(profile));
  } else {
    safeStorage()?.removeItem(STORAGE_KEY);
  }
  emit();
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T00:00:00");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  return d.getTime() >= yesterday.getTime() && d.getTime() < new Date().setHours(0, 0, 0, 0);
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

export function createAnonProfile(name: string): UserProfile {
  const today = todayStr();
  const mastery: Record<string, "belum" | "dipahami" | "ahli"> = {};
  for (const id of WRESASTRA_IDS) {
    mastery[id] = "belum";
  }
  const profile: UserProfile = {
    id: anonId(),
    isAnon: true,
    name,
    xp: 0,
    streak: 0,
    hearts: 5,
    lastActiveDate: today,
    heartsRefilledAt: today,
    mastery,
  };
  persist(profile);
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

export function refillHearts(): void {
  update((profile) => {
    const today = todayStr();
    if (profile.hearts < 5 && profile.heartsRefilledAt && profile.heartsRefilledAt < today) {
      profile.hearts = 5;
      profile.heartsRefilledAt = today;
    }
  });
}

export function updateStreak(): void {
  update((profile) => {
    const today = todayStr();
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
  persist(null);
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
