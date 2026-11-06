import { cn } from "@caksara/ui/lib/utils";

import type { ProfileAvatar } from "../lib/zod/profile";
import { defaultAvatarUri, ipAvatarUriForName } from "../lib/default-avatar";
import { Bedawang } from "./bedawang";

export const AVATAR_PRESETS = [
  { id: "terakota", label: "Terakota", cls: "bg-primary text-primary-foreground" },
  { id: "emas", label: "Emas", cls: "bg-accent text-stone-900" },
  { id: "daun", label: "Daun", cls: "bg-success text-white" },
  { id: "laut", label: "Laut", cls: "bg-sky-600 text-white" },
  { id: "anggur", label: "Anggur", cls: "bg-purple-600 text-white" },
  { id: "arang", label: "Arang", cls: "bg-secondary text-secondary-foreground" },
] as const;

export const DEFAULT_AVATAR: ProfileAvatar = { kind: "color", value: "terakota" };

export function avatarClass(avatar: ProfileAvatar | undefined): string {
  if (!avatar || avatar.kind !== "color") return AVATAR_PRESETS[0].cls;
  return AVATAR_PRESETS.find((p) => p.id === avatar.value)?.cls ?? AVATAR_PRESETS[0].cls;
}

export function ProfileAvatar({
  name,
  avatar,
  className,
  textClassName,
}: {
  name: string;
  avatar: ProfileAvatar | undefined;
  className?: string;
  textClassName?: string;
}) {
  if (!avatar) {
    const ip = ipAvatarUriForName(name);
    const fallback = defaultAvatarUri(name);
    return (
      <img
        src={ip}
        onError={(e) => {
          if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
        }}
        alt={`Avatar ${name}`}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }
  if (avatar.kind === "bedawang") {
    const cfg = avatar.value;
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-card",
          className,
        )}
      >
        <Bedawang mood={cfg.mood} animate={false} className="size-[88%]" />
      </span>
    );
  }
  // Allowlist sempit: foto upload (data:image) + avatar IP lokal
  // (/assets/avatar-*.webp). BUKAN /assets/ umum, BUKAN http(s) eksternal.
  if (
    avatar?.kind === "photo" &&
    (avatar.value.startsWith("data:image") || avatar.value.startsWith("/assets/avatar-"))
  ) {
    const svgFallback = defaultAvatarUri(name);
    return (
      <img
        src={avatar.value}
        onError={(e) => {
          if (e.currentTarget.src !== svgFallback) e.currentTarget.src = svgFallback;
        }}
        alt={`Foto ${name}`}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        avatarClass(avatar),
        className,
      )}
    >
      <img
        src={defaultAvatarUri(name)}
        alt=""
        className={cn("size-[92%] rounded-full object-cover", textClassName)}
      />
    </span>
  );
}
