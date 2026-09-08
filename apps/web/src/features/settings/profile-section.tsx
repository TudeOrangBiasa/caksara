import { Camera, Check } from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";

import { Input } from "@caksara/ui/components/input";
import { Label } from "@caksara/ui/components/label";
import { cn } from "@caksara/ui/lib/utils";

import { ProfileAvatar } from "../../components/profile-avatar";
import { SATWA_NAMES, satwaAvatarUri } from "../../lib/default-avatar";
import { loadProfile, setAvatar, setProfileName, subscribeProfile } from "../../lib/profile-store";
import { BedawangStudio } from "./bedawang-studio";

const PHOTO_SIZE = 128;

function fileToAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Pilih file gambar ya."));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      reject(new Error("Ukuran foto maksimal 3 MB."));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = PHOTO_SIZE;
        canvas.height = PHOTO_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Gagal memproses foto.");
        const side = Math.min(img.width, img.height);
        ctx.drawImage(
          img,
          (img.width - side) / 2,
          (img.height - side) / 2,
          side,
          side,
          0,
          0,
          PHOTO_SIZE,
          PHOTO_SIZE,
        );
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err instanceof Error ? err : new Error("Gagal memproses foto."));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("File gambar tidak terbaca."));
    };
    img.src = url;
  });
}

export function ProfileSection() {
  const profile = useSyncExternalStore(subscribeProfile, loadProfile, loadProfile);
  const [name, setName] = useState(profile?.name ?? "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const savedTimer = useRef<number | null>(null);

  if (!profile) return null;
  const activeAvatar = profile.avatar;

  function flashSaved() {
    setSaved(true);
    if (savedTimer.current) window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setSaved(false), 2000);
  }

  function handleSaveName() {
    const err = setProfileName(name);
    setNameError(err);
    if (!err) {
      setName(name.trim());
      flashSaved();
    }
  }

  async function handlePhoto(file: File | undefined) {
    if (!file) return;
    setPhotoError(null);
    try {
      const dataUrl = await fileToAvatar(file);
      setAvatar({ kind: "photo", value: dataUrl });
      flashSaved();
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Gagal memproses foto.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <section aria-labelledby="profil-heading">
      <h2
        id="profil-heading"
        className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        Profil
      </h2>
      <div className="rounded-3xl bg-card p-5">
        <div className="flex items-center gap-4">
          <ProfileAvatar name={profile.name} avatar={activeAvatar} className="size-16 text-xl" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold">{profile.name}</p>
            <p className="text-xs text-muted-foreground">
              {profile.xp} XP · Streak {profile.streak} hari
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
            aria-label="Ganti foto profil"
          >
            <Camera className="size-4" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-label="Pilih foto profil"
            onChange={(e) => void handlePhoto(e.target.files?.[0])}
          />
        </div>

        <div
          className="mt-4 grid grid-cols-6 gap-2"
          role="radiogroup"
          aria-label="Pilih avatar satwa"
        >
          {SATWA_NAMES.map((label, i) => {
            const uri = satwaAvatarUri(i);
            const active = activeAvatar?.kind === "photo" && activeAvatar.value === uri;
            return (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={label}
                title={label}
                onClick={() => {
                  setPhotoError(null);
                  setAvatar({ kind: "photo", value: uri });
                }}
                className={cn(
                  "flex aspect-square items-center justify-center overflow-hidden rounded-2xl transition-transform active:scale-95",
                  active && "ring-2 ring-foreground ring-offset-2 ring-offset-card",
                )}
              >
                <img src={uri} alt="" aria-hidden className="size-full object-cover" />
              </button>
            );
          })}
        </div>
        {photoError && (
          <p role="alert" className="mt-2 text-xs text-destructive">
            {photoError}
          </p>
        )}

        <BedawangStudio current={activeAvatar?.kind === "bedawang" ? activeAvatar.value : null} />

        <div className="mt-4 space-y-1.5">
          <Label htmlFor="settings-name">Nama panggilan</Label>
          <div className="flex gap-2">
            <Input
              id="settings-name"
              value={name}
              maxLength={20}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
              }}
              className="h-11 rounded-2xl"
              aria-invalid={nameError ? true : undefined}
            />
            <button
              type="button"
              onClick={handleSaveName}
              className="flex h-11 shrink-0 items-center gap-1 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
            >
              <Check className="size-4" /> Simpan
            </button>
          </div>
          {nameError ? (
            <p role="alert" className="text-xs text-destructive">
              {nameError}
            </p>
          ) : (
            saved && <p className="text-xs text-success">Tersimpan.</p>
          )}
        </div>
      </div>
    </section>
  );
}
