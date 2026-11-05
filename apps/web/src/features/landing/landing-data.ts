export interface LandingTestimony {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

/**
 * Testimoni pitching lomba INVENTION 2026 (data-driven, bukan hardcode klaim).
 * Nama dan kutipan tampil apa adanya dari Pencil T4HbK (keputusan Main:
 * guidebook lomba melarang data asli). Avatar: aset Userpics lokal.
 */
export const LANDING_TESTIMONIES: LandingTestimony[] = [
  {
    id: "agung",
    name: "Bli Agung",
    role: "Guru SMA",
    quote:
      "Akhirnya ada cara mengajar aksara yang bikin murid betah. Modulnya runtut, kuisnya bikin nagih banget buat anak-anak!",
    avatar: "/assets/Userpics/PNG/Circle/Afterclap-1.png",
  },
  {
    id: "ayu",
    name: "Ayu Saraswati",
    role: "Mahasiswi",
    quote:
      "Awalnya mikir aksara itu susah dan kaku, tapi kuisnya bikin berasa main game. Seru banget buat isi waktu luang!",
    avatar: "/assets/Userpics/PNG/Circle/3DDD-2.png",
  },
  {
    id: "wayan",
    name: "Bapak Wayan",
    role: "Pekerja",
    quote:
      "Pulang kerja sempatkan buka satu materi. Sangat membantu dan UI-nya sangat ramah mata. Luar biasa inovasinya.",
    avatar: "/assets/Userpics/PNG/Circle/Cranks-1.png",
  },
];

export interface LandingContact {
  id: string;
  label: string;
  href: string;
}

/** Kontak footer lomba (Pencil T4HbK apa adanya, keputusan Main). */
export const LANDING_CONTACTS: LandingContact[] = [
  { id: "telp", label: "(0361) 123 456", href: "tel:+62361123456" },
  { id: "email", label: "halo@caksara.id", href: "mailto:halo@caksara.id" },
];
