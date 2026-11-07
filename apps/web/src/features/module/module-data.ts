import { z } from "zod";

export const moduleStatusSchema = z.enum(["selesai", "aktif", "terkunci"]);
export type ModuleStatus = z.infer<typeof moduleStatusSchema>;

export const moduleMateriSchema = z.object({
  id: z.string().min(1),
  judul: z.string().min(1),
  isi: z.string().min(1),
  aksara: z.string().optional(),
  labelAksara: z.string().optional(),
});
export type ModuleMateri = z.infer<typeof moduleMateriSchema>;

export const courseModuleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  theme: z.string().min(1),
  description: z.string().min(1),
  poinBelajar: z.array(z.string().min(1)),
  jumlahSoal: z.number().int().positive(),
  estimasiMenit: z.number().int().positive(),
  order: z.number().int().positive(),
  materi: z.array(moduleMateriSchema).min(1),
});

export type CourseModule = z.infer<typeof courseModuleSchema>;

export const courseModules: CourseModule[] = [
  {
    id: "mod_01",
    title: "Sapaan & Adat",
    theme: "Gelaran pembuka",
    description:
      "Kenalan sama sapaan sehari-hari dan basa-basi adat Bali, dari Om Swastiastu sampai matur suksma.",
    poinBelajar: ["Sapaan pembuka", "Basa-basi adat", "Pengucapan halus"],
    jumlahSoal: 8,
    estimasiMenit: 8,
    order: 1,
    materi: [
      {
        id: "mat_01_01",
        judul: "Om Swastiastu",
        aksara: "ᬒᬁᬲ᭄ᬯᬲ᭄ᬢᬶᬬᬲ᭄ᬢᬸ",
        labelAksara: "Om Swastiastu",
        isi: "Salam pembuka paling umum di Bali. Artinya kurang lebih 'semoga dalam keadaan selamat atas karunia Hyang Widhi'. Diucapkan saat bertemu atau memulai percakapan.",
      },
      {
        id: "mat_01_02",
        judul: "Suksma & Matur Suksma",
        aksara: "ᬫᬢᬸᬃᬲᬸᬓ᭄ᬲ᭄ᬫ",
        labelAksara: "Matur Suksma",
        isi: "'Terima kasih'. Kalau mau lebih sopan lagi pakai 'Matur suksma' atau 'Matur suksma mewali'. Dibarengi senyum dan sedikit tunduk kepala.",
      },
      {
        id: "mat_01_03",
        judul: "Ampura & Nunas Sinampura",
        aksara: "ᬅᬫ᭄ᬧᬸᬭ",
        labelAksara: "Ampura",
        isi: "'Mohon maaf'. Untuk permohonan maaf yang lebih dalam, orang Bali memakai 'Nunas sinampura'. Ini bagian dari etika anggah-ungguh basa yang dijaga.",
      },
      {
        id: "mat_01_04",
        judul: "Gestur Anjali Mudra",
        isi: "Saat menyapa, tangan dicakupkan di depan dada (Anjali Mudra) lalu sedikit menundukkan kepala. Gestur ini tanda hormat dan ikhlas, bukan cuma formalitas.",
      },
    ],
  },
  {
    id: "mod_02",
    title: "Gerbang Wresastra",
    theme: "18 aksara dasar",
    description: "Kenal 18 aksara wresastra, dari bentuk, bunyi, sampai filosofi tiap aksaranya.",
    poinBelajar: ["18 aksara dasar", "Bentuk & bunyi", "Filosofi aksara"],
    jumlahSoal: 8,
    estimasiMenit: 8,
    order: 2,
    materi: [
      {
        id: "mat_02_01",
        judul: "Lima Aksara Pertama",
        aksara: "ᬳᬦᬘᬭᬓ",
        labelAksara: "Ha Na Ca Ra Ka",
        isi: "Aksara dasar Bali dimulai dari Ha, Na, Ca, Ra, Ka. Mengenal kelima ini lebih dulu membantu kamu membedakan bentuk visual tiap aksara sebelum lanjut ke yang lain.",
      },
      {
        id: "mat_02_02",
        judul: "Kisah Aji Saka",
        isi: "Urutan aksara ini bukan acak. Konon dibawa oleh Aji Saka dan penuh makna filosofis. Huruf pertama melambangkan awal mula kehidupan dan adanya utusan pembawa kebenaran.",
      },
      {
        id: "mat_02_03",
        judul: "Bentuk & Bunyi",
        isi: "Tiap aksara punya bunyi dasar ber-akhiran 'a': Ha, Na, Ca, Ra, Ka. Bentuknya khas dan berbeda dari huruf Latin, jadi fokuskan pandangan ke bentuknya sesambil dengar bunyinya.",
      },
    ],
  },
  {
    id: "mod_03",
    title: "Jangan Salah Bicara!",
    theme: "Andap vs Alus",
    description:
      "Belajar beda tingkat bahasa, biar tahu kapan pakai kata biasa dan kapan harus halus.",
    poinBelajar: ["Andap vs Alus", "Kontek sopan-santun", "Basa Alus"],
    jumlahSoal: 8,
    estimasiMenit: 8,
    order: 3,
    materi: [
      {
        id: "mat_03_01",
        judul: "Andap vs Alus",
        isi: "Bahasa Bali punya tingkat: Basa Andap untuk sesama / teman akrab, dan Basa Alus untuk orang tua, guru, atau pemuka agama. Salah pilih bisa terdengar kasar.",
      },
      {
        id: "mat_03_02",
        judul: "Makan: Madaar vs Ngajeng",
        isi: "Kata 'makan' dalam Andap adalah 'madaar', sedangkan yang halus (Alus) adalah 'ngajeng'. Pakai 'ngajeng' saat berbicara dengan orang yang dihormati.",
      },
      {
        id: "mat_03_03",
        judul: "Tidur: Pules vs Sirep",
        isi: "Sama seperti makan, kata 'tidur' juga beda tingkat: 'pules' (Andap) dan 'sirep' (Alus). Biasakan menyesuaikan dengan siapa kamu bicara.",
      },
      {
        id: "mat_03_04",
        judul: "Kata Ganti Orang",
        isi: "'Aku' dalam Andap bisa 'tiang' atau 'icang', sedangkan yang lebih halus adalah 'titiang'. Kata ganti menentukan nada sopan dalam percakapan.",
      },
    ],
  },
  {
    id: "mod_04",
    title: "Hari Raya & Tradisi",
    theme: "Galungan, Nyepi & lainnya",
    description:
      "Mengenal hari raya dan tradisi Bali: Galungan, Nyepi, canang, sampai caranya menghormati.",
    poinBelajar: ["Galungan", "Nyepi", "Canang & upacara"],
    jumlahSoal: 8,
    estimasiMenit: 8,
    order: 4,
    materi: [
      {
        id: "mat_04_01",
        judul: "Galungan",
        aksara: "ᬕᬮᬸᬗᬦ᭄",
        labelAksara: "Galungan",
        isi: "Hari kemenangan dharma (kebaikan) atas adharma. Dirayakan dengan memasang penjor dan sembahyang di pura, tanda syukur atas kesejahteraan.",
      },
      {
        id: "mat_04_02",
        judul: "Kuningan",
        isi: "Datang 10 hari setelah Galungan, menandai berakhirnya rangkaian Galungan. Saat itu umat bersembahyang menghaturkan suksma atas berkah yang diterima.",
      },
      {
        id: "mat_04_03",
        judul: "Nyepi",
        isi: "Tahun Baru Saka. Sehari penuh hening: tidak menyalakan api, tidak bekerja, tidak bepergian, dan tidak bersenang-senang. Momen refleksi diri yang khas Bali.",
      },
      {
        id: "mat_04_04",
        judul: "Canang Sari",
        aksara: "ᬘᬦᬗ᭄ᬲᬭᬶ",
        labelAksara: "Canang Sari",
        isi: "Sarana sesaji harian dari daun dan bunga, lambang keseimbangan serta rasa syukur. Bentuk dan isinya jadi bagian dari identitas budaya Bali.",
      },
    ],
  },
];

export function deriveStatus(selesai: ReadonlySet<string>): ModuleStatus[] {
  const lastSolved = courseModules.reduce<number>((acc, m) => {
    if (selesai.has(m.id)) return Math.max(acc, m.order);
    return acc;
  }, 0);

  return courseModules.map((m) => {
    if (selesai.has(m.id)) return "selesai";
    if (m.order === lastSolved + 1) return "aktif";
    return "terkunci";
  });
}
