import { z } from "zod";

import { WRESASTRA_AKSARA } from "../module/aksara-data";

export const kbCategorySchema = z.enum(["wresastra", "kosakata", "budaya"]);
export type KbCategory = z.infer<typeof kbCategorySchema>;

export const kbLevelSchema = z.enum(["1", "2", "3"]);
export type KbLevel = z.infer<typeof kbLevelSchema>;

export const kbSourceSchema = z.object({
  nama: z.string().min(1),
  ket: z.string().min(1),
});
export type KbSource = z.infer<typeof kbSourceSchema>;

export const kbEntrySchema = z.object({
  id: z.string().min(1),
  category: kbCategorySchema,
  title: z.string().min(1),
  latin: z.string().optional(),
  glyph: z.string().optional(),
  body: z.string().min(1),
  level: kbLevelSchema,
  sources: z.array(kbSourceSchema).min(1),
});
export type KbEntry = z.infer<typeof kbEntrySchema>;

export const KB_CATEGORY_META: Record<KbCategory, { label: string; desc: string }> = {
  wresastra: { label: "Wresastra", desc: "18 aksara dasar" },
  kosakata: { label: "Kosakata", desc: "Kata sehari-hari & sapaan" },
  budaya: { label: "Budaya", desc: "Tradisi & hari raya" },
};

const kategoriWresastra: KbEntry[] = WRESASTRA_AKSARA.map((a) => {
  const index = Number(a.id.replace("wre_", ""));
  const level = kbLevelSchema.parse(index <= 5 ? "1" : index <= 12 ? "2" : "3");
  return {
    id: `kb_wre_${a.id.replace("wre_", "")}`,
    category: "wresastra",
    title: `Aksara ${a.latin}`,
    latin: a.latin,
    glyph: a.glyph,
    body:
      `Aksara wresastra "${a.latin}" (${a.glyph}) adalah salah satu dari 18 aksara swalalita ` +
      `dasar yang dipakai menulis bahasa Bali. Bunyinya berakhiran "a". Bentuknya khas dan ` +
      `berbeda dari huruf Latin, jadi kenali dulu garis dan lengkungnya sebelum mengombinasikan ` +
      `dengan pangangge (sandhangan) untuk membentuk suku kata lain.`,
    level,
    sources: [
      { nama: "Unicode Consortium", ket: `U+1B00–U+1B7F` },
      { nama: "Parasali", ket: "Padanan & pelafalan aksara Bali" },
    ],
  };
});

const kosakataDanBudaya: KbEntry[] = [
  {
    id: "kb_sapaan",
    category: "kosakata",
    title: "Om Swastiastu",
    latin: "Om Swastiastu",
    glyph: "ᬒᬁᬲ᭄ᬯᬲ᭄ᬢᬶᬬᬲ᭄ᬢᬸ",
    body:
      "Salam pembuka paling umum di Bali, kurang lebih berarti 'semoga dalam keadaan selamat atas " +
      "karunia-Nya'. Diucapkan saat bertemu atau memulai percakapan, sekaligus tanda kesopanan.",
    level: "1",
    sources: [
      { nama: "Parasali", ket: "Sapaan & pelafalan" },
      { nama: "Balai Bahasa Provinsi Bali", ket: "Pembakuan bahasa daerah" },
    ],
  },
  {
    id: "kb_matur_suksma",
    category: "kosakata",
    title: "Matur Suksma",
    latin: "Matur Suksma",
    glyph: "ᬫᬢᬸᬃᬲᬸᬓ᭄ᬲ᭄ᬫ",
    body:
      "'Terima kasih'. Bentuk yang lebih halus (alus madia) dari 'suksma'. Dipakai saat menerima " +
      "bantuan atau pemberian, sering dibarengi senyum dan sedikit menundukkan kepala.",
    level: "1",
    sources: [
      { nama: "Parasali", ket: "Sapaan & pelafalan" },
      { nama: "Balai Bahasa Provinsi Bali", ket: "Pembakuan bahasa daerah" },
    ],
  },
  {
    id: "kb_ampura",
    category: "kosakata",
    title: "Ampura",
    latin: "Ampura",
    glyph: "ᬅᬫ᭄ᬧᬸᬭ",
    body:
      "'Mohon maaf'. Untuk permohonan maaf yang lebih dalam, dipakai 'nunas sinampura'. Ini bagian " +
      "dari etika anggah-ungguh basa yang dijaga masyarakat Bali.",
    level: "1",
    sources: [
      { nama: "Parasali", ket: "Ungkapan & pelafalan" },
      { nama: "Balai Bahasa Provinsi Bali", ket: "Pembakuan bahasa daerah" },
    ],
  },
  {
    id: "kb_madaar_ngajeng",
    category: "kosakata",
    title: "Madaar / Ngajeng",
    latin: "Madaar · Ngajeng",
    body:
      "Kata 'makan' dalam Basa Andap (dengan teman) adalah 'madaar', sedangkan yang halus (Basa " +
      "Alus) adalah 'ngajeng'. Pakai 'ngajeng' saat berbicara dengan orang yang dihormati.",
    level: "2",
    sources: [
      { nama: "Parasali", ket: "Tingkat-tingkat kata (andap-alus)" },
      { nama: "Balai Bahasa Provinsi Bali", ket: "Pembakuan bahasa daerah" },
    ],
  },
  {
    id: "kb_pules_sirep",
    category: "kosakata",
    title: "Pules / Sirep",
    latin: "Pules · Sirep",
    body:
      "Kata 'tidur' juga punya dua tingkat: 'pules' (Andap) dan 'sirep' (Alus). Biasakan " +
      "menyesuaikan pilihan kata dengan siapa kamu berbicara agar tidak terdengar kasar.",
    level: "2",
    sources: [
      { nama: "Parasali", ket: "Tingkat-tingkat kata (andap-alus)" },
      { nama: "Balai Bahasa Provinsi Bali", ket: "Pembakuan bahasa daerah" },
    ],
  },
  {
    id: "kb_titiang",
    category: "kosakata",
    title: "Titiang",
    latin: "Titiang",
    body:
      "Kata ganti 'saya' dalam Basa Alus. 'Tiang' lebih netral (alus singgih), sedangkan 'titiang' " +
      "lebih halus lagi dan dipakai untuk menghormati lawan bicara.",
    level: "3",
    sources: [
      { nama: "Parasali", ket: "Kata ganti orang & tingkat bahasa" },
      { nama: "Balai Bahasa Provinsi Bali", ket: "Pembakuan bahasa daerah" },
    ],
  },
  {
    id: "kb_galungan",
    category: "budaya",
    title: "Galungan",
    latin: "Galungan",
    glyph: "ᬕᬮᬸᬗᬦ᭄",
    body:
      "Hari kemenangan dharma (kebaikan) atas adharma. Dirayakan dengan memasang penjor dan " +
      "sembahyang di pura sebagai tanda syukur atas kesejahteraan.",
    level: "2",
    sources: [
      { nama: "Parasali", ket: "Tradisi & hari raya" },
      { nama: "Balai Bahasa Provinsi Bali", ket: "Istilah keagamaan" },
    ],
  },
  {
    id: "kb_nyepi",
    category: "budaya",
    title: "Nyepi",
    latin: "Nyepi",
    body:
      "Tahun Baru Saka. Sehari penuh hening: tidak menyalakan api, tidak bekerja, tidak bepergian, " +
      "dan tidak bersenang-senang. Momen refleksi diri yang menjadi ciri khas Bali.",
    level: "2",
    sources: [
      { nama: "Parasali", ket: "Tradisi & hari raya" },
      { nama: "Balai Bahasa Provinsi Bali", ket: "Istilah keagamaan" },
    ],
  },
  {
    id: "kb_canang_sari",
    category: "budaya",
    title: "Canang Sari",
    latin: "Canang Sari",
    glyph: "ᬘᬦᬗ᭄ᬲᬭᬶ",
    body:
      "Sarana sesaji harian dari daun dan bunga, lambang keseimbangan serta rasa syukur. Bentuk " +
      "dan isinya menjadi bagian dari identitas budaya Bali.",
    level: "3",
    sources: [
      { nama: "Parasali", ket: "Tradisi & hari raya" },
      { nama: "Balai Bahasa Provinsi Bali", ket: "Istilah keagamaan" },
    ],
  },
];

export const KB_ENTRIES: KbEntry[] = [...kategoriWresastra, ...kosakataDanBudaya];
