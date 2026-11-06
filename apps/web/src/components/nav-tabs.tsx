import {
  BookOpen,
  Download,
  Home,
  LibraryBig,
  MessageCircleQuestion,
  Trophy,
  User,
} from "lucide-react";

export type NavTab = "beranda" | "belajar" | "kb" | "guru" | "peringkat" | "unduh" | "profil";

export const tabs: { id: NavTab; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  { id: "beranda", label: "Beranda", shortLabel: "Beranda", icon: <Home className="size-5" /> },
  { id: "belajar", label: "Belajar", shortLabel: "Belajar", icon: <BookOpen className="size-5" /> },
  { id: "kb", label: "Kamus", shortLabel: "Kamus", icon: <LibraryBig className="size-5" /> },
  {
    id: "guru",
    label: "Guru",
    shortLabel: "Guru",
    icon: <MessageCircleQuestion className="size-5" />,
  },
  {
    id: "peringkat",
    label: "Papan Peringkat",
    shortLabel: "Peringkat",
    icon: <Trophy className="size-5" />,
  },
  { id: "unduh", label: "Unduh", shortLabel: "Unduh", icon: <Download className="size-5" /> },
  { id: "profil", label: "Profil", shortLabel: "Profil", icon: <User className="size-5" /> },
];
