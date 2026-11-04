# ADR 0014 — Native shell: Capacitor Android + Electron, tanpa iOS/Tauri

Konteks: #99 mengunci jawaban Q1/Q2 final round. Web tetap yang disubmit
ke Digifest 6 Nov. Native hanya gelombang final, bukan blocker demo.

Keputusan: Q1 mobile = Capacitor, Android saja. iOS out of scope (tanpa
`cap add ios`, tanpa Xcode/App Store). Q2 desktop = Electron. Tauri
ditolak untuk gelombang ini. Auth tetap Supabase Auth provider Google
saja, redirect lewat deep link atau loopback sesuai #100 dan #101.

Konsekuensi: #100 (Capacitor Android) dan #101 (Electron) unblocked,
scope iOS dan Tauri sudah dicoret di body mereka. Jangan buka tiket
Tauri, React Native, atau iOS Capacitor baru sebelum keputusan baru.
Shell native tidak menyentuh skema DB, KB, atau Edge Function.
