export interface OnboardingOption {
  id: string;
  label: string;
  desc: string;
}

export const ONBOARDING_GOALS: OnboardingOption[] = [
  {
    id: "budaya",
    label: "Melestarikan Budaya Bali",
    desc: "Warisan leluhur yang berharga dan kaya makna",
  },
  {
    id: "sekolah",
    label: "Pelajaran Sekolah / Kuliah",
    desc: "Bantu tugas, ujian, dan muatan lokal",
  },
  {
    id: "otak",
    label: "Asah Otak & Minat Baru",
    desc: "Seru mengenal aksara kuno nusantara",
  },
  {
    id: "wisata",
    label: "Persiapan Wisata / Tinggal di Bali",
    desc: "Biar bisa baca plang jalan, pura, dan lontar",
  },
];

export const ONBOARDING_LEVELS: OnboardingOption[] = [
  {
    id: "nol",
    label: "Mulai dari nol",
    desc: "Belum pernah belajar Aksara Bali sama sekali",
  },
  {
    id: "dasar",
    label: "Tahu beberapa huruf",
    desc: "Pernah dengar Ha Na Ca Ra Ka dan bunyi dasarnya",
  },
  {
    id: "ulang",
    label: "Pernah belajar dulu",
    desc: "Ingin mengulang biar lancar dan ingat lagi",
  },
];

export const ONBOARDING_COMMITMENTS: OnboardingOption[] = [
  {
    id: "santai",
    label: "Santai (3 menit / hari)",
    desc: "1 kuis kilat, cocok untuk yang sibuk",
  },
  {
    id: "teratur",
    label: "Teratur (5 menit / hari)",
    desc: "Materi ringkas plus kuis pemantapan",
  },
  {
    id: "serius",
    label: "Serius (10 menit / hari)",
    desc: "Latihan intensif agar cepat mahir membaca",
  },
];
