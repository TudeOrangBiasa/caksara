import { cn } from "@caksara/ui/lib/utils";

import type { ProfileAvatar } from "../lib/zod/profile";
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
  const initial = name.trim().charAt(0).toUpperCase() || "C";
  if (avatar?.kind === "bedawang") {
    const cfg = avatar.value;
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-card",
          className,
        )}
      >
        <Bedawang
          shell={cfg.shell}
          head={cfg.head}
          accessory={cfg.accessory}
          mood={cfg.mood}
          animate={false}
          className="size-[88%]"
        />
      </span>
    );
  }
  if (avatar?.kind === "photo" && avatar.value.startsWith("data:image")) {
    return (
      <img
        src={avatar.value}
        alt={`Foto ${name}`}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold",
        avatarClass(avatar),
        className,
      )}
    >
      <span className={textClassName}>{initial}</span>
    </span>
  );
}
