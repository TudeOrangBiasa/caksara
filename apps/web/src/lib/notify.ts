import { toast } from "sonner";

/**
 * Toast sistem untuk kondisi backend (429, Gemini down, kembali online).
 * Sonner bawaan: slide-in + swipe-to-dismiss. Action retry diserahkan ke pemanggil
 * karena pemicu 429/Gemini berasal dari Edge Function (#30).
 */
export function notifyRateLimited(onRetry?: () => void) {
  toast.warning("Terlalu banyak permintaan (429)", {
    description: "Tunggu sebentar lalu coba lagi.",
    action: onRetry ? { label: "Coba lagi", onClick: onRetry } : undefined,
    duration: 4000,
  });
}

export function notifyGeminiDown(onRetry?: () => void) {
  toast.error("Guru Virtual sedang gangguan", {
    description: "Jawaban dari sumber KB tetap bisa dibaca manual.",
    action: onRetry ? { label: "Coba lagi", onClick: onRetry } : undefined,
    duration: 5000,
  });
}

export function notifyBackOnline() {
  toast.success("Kembali online", {
    description: "Koneksi pulih, silakan lanjutkan.",
    duration: 3000,
  });
}

/** V9: hati diisi penuh 5 saat refresh melewati 00:00 WITA. */
export function notifyHeartsRefilled() {
  toast.success("Hati penuh lagi", {
    description: "5 dari 5 siap dipakai belajar hari ini.",
    duration: 3500,
  });
}

/** V9: streak dinolkan karena terlewat sehari penuh atau lebih. */
export function notifyStreakReset() {
  toast.warning("Streak terputus", {
    description: "Mulai lagi hari ini untuk streak baru.",
    duration: 4000,
  });
}
