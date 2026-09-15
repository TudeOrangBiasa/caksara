import { BookOpen, Home, LibraryBig, MessageCircleQuestion, User } from "lucide-react";

export type NavTab = "beranda" | "belajar" | "kb" | "guru" | "profil";

export const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  { id: "beranda", label: "Beranda", icon: <Home className="size-5" /> },
  { id: "belajar", label: "Belajar", icon: <BookOpen className="size-5" /> },
  { id: "kb", label: "KB", icon: <LibraryBig className="size-5" /> },
  { id: "guru", label: "Guru", icon: <MessageCircleQuestion className="size-5" /> },
  { id: "profil", label: "Profil", icon: <User className="size-5" /> },
];
