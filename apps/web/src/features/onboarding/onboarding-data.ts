import type { LucideIcon } from "lucide-react";
import {
  Backpack,
  BookOpen,
  Coffee,
  Flame,
  Flower2,
  Leaf,
  Puzzle,
  Sprout,
  Target,
  TreePalm,
} from "lucide-react";

export interface OnboardingOption {
  id: string;
  icon: LucideIcon;
  label: string;
  desc: string;
}

export const ONBOARDING_GOALS: OnboardingOption[] = [
  {
    id: "budaya",
    icon: Flower2,
    label: "Melestarikan Budaya Bali",
    desc: "Warisan leluhur yang berharga dan kaya makna",
  },
  {
    id: "sekolah",
    icon: Backpack,
    label: "Pelajaran Sekolah / Kuliah",
    desc: "Bantu tugas, ujian, dan muatan lokal",
  },
  {
    id: "otak",
    icon: Puzzle,
    label: "Asah Otak & Minat Baru",
    desc: "Seru mengenal aksara kuno nusantara",
  },
  {
    id: "wisata",
    icon: TreePalm,
    label: "Persiapan Wisata / Tinggal di Bali",
    desc: "Biar bisa baca plang jalan, pura, dan pura",
  },
];

export const ONBOARDING_LEVELS: OnboardingOption[] = [
  {
    id: "nol",
    icon: Sprout,
    label: "Mulai dari nol",
    desc: "Belum pernah belajar Aksara Bali sama sekali",
  },
  {
    id: "dasar",
    icon: Leaf,
    label: "Tahu beberapa huruf",
    desc: "Pernah dengar Ha Na Ca Ra Ka dan bunyi dasarnya",
  },
  {
    id: "ulang",
    icon: BookOpen,
    label: "Pernah belajar dulu",
    desc: "Ingin mengulang biar lancar dan ingat lagi",
  },
];

export const ONBOARDING_COMMITMENTS: OnboardingOption[] = [
  {
    id: "santai",
    icon: Coffee,
    label: "Santai (3 menit / hari)",
    desc: "1 kuis kilat, cocok untuk yang sibuk",
  },
  {
    id: "teratur",
    icon: Target,
    label: "Teratur (5 menit / hari)",
    desc: "Materi ringkas plus kuis pemantapan",
  },
  {
    id: "serius",
    icon: Flame,
    label: "Serius (10 menit / hari)",
    desc: "Latihan intensif agar cepat mahir membaca",
  },
];
