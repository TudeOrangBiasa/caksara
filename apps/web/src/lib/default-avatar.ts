import { createAvatar } from "@dicebear/core";
import { adventurerNeutral } from "@dicebear/collection";

const cache = new Map<string, string>();

/**
 * Avatar default prosedural (DiceBear adventurer-neutral, CC0): wajah kartun
 * stabil per nama, digenerate lokal tanpa jaringan. Pengganti inisial huruf.
 */
export function defaultAvatarUri(seed: string): string {
  const key = seed.trim() || "C";
  const hit = cache.get(key);
  if (hit) return hit;
  const svg = createAvatar(adventurerNeutral, { seed: key }).toString();
  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  cache.set(key, uri);
  return uri;
}
