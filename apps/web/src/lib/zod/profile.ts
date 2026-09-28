import { z } from "zod";

export const profileNameSchema = z
  .string()
  .trim()
  .min(1, "Nama masih kosong, isi dulu ya.")
  .max(20, "Nama maksimal 20 karakter.");

export type ProfileName = z.infer<typeof profileNameSchema>;

export const bedawangMoodSchema = z.enum(["senang", "semangat", "sedih"]);
export type BedawangMood = z.infer<typeof bedawangMoodSchema>;

export const bedawangConfigSchema = z
  .object({ mood: bedawangMoodSchema })
  .catchall(z.unknown())
  .transform(({ mood }) => ({ mood }))
  .pipe(z.object({ mood: bedawangMoodSchema }))
  .catch({ mood: "senang" });
export type BedawangConfig = z.infer<typeof bedawangConfigSchema>;

export const DEFAULT_BEDAWANG: BedawangConfig = { mood: "senang" };

export const profileAvatarSchema = z.union([
  z.object({
    kind: z.enum(["color", "photo"]),
    value: z.string().min(1).max(200000),
  }),
  z.object({ kind: z.literal("bedawang"), value: bedawangConfigSchema }),
]);

export type ProfileAvatar = z.infer<typeof profileAvatarSchema>;

export const userProfileSchema = z.object({
  id: z.string().min(1),
  isAnon: z.boolean(),
  name: z.string().min(1).max(20),
  xp: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(),
  hearts: z.number().int().min(0).max(5),
  lastActiveDate: z.string().optional(),
  heartsRefilledAt: z.string().optional(),
  mastery: z.record(z.string(), z.enum(["belum", "dipahami", "ahli"])).optional(),
  avatar: profileAvatarSchema.optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
