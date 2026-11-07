# Pin formal per layar (screen.md → kode) — dipakai verify-formal.sh

## Onboarding (4 langkah)

- require 'const SESSION_COUNT = 8;' — apps/web/src/features/quiz/quiz-pick.ts
- require 'PILIH SATU ALASAN' — onboarding-steps.tsx:209
- require 'LANGKAH ' — onboarding-steps.tsx:163 (template LANGKAH n DARI total)
- require 'Siap Mulai' — onboarding-steps.tsx:345
- require 'profileNameSchema' — onboarding-gate.tsx (validasi nama)

## Kuis (4 tipe + 2 hasil + resume)

- require "dengar_pilih" — question.ts (tipe wajib bila bank punya)
- require 'PASANGKAN YANG BENAR' — prompt bank cocokkan (Pencil)
- require 'SUSUN YANG BENAR' — prompt bank susun (Pencil)
- require 'Mantap, modul beres!' — quiz-result.tsx:93
- require 'Belum lulus, semangat ya' — quiz-result.tsx:91,94
- require 'Lanjutkan kuis?' — quiz-resume-dialog.tsx:30
- require 'matches?: Record<string, string>;' — quiz-store.ts (regresi #84)
- require 'Coba Lagi' — quiz-game-over.tsx:41

## KB

- require 'Basis Pengetahuan' — kb-list.tsx:98
- require 'Kembali ke daftar KB' — kb detail back button
- require 'TEACHER_OUTSIDE_REPLY' — teacher-data (Guru fallback lock)
- require 'allQuestionsGrounded' — quiz-grounding (setiap soal Gemini → sourceRef)

## Game rules

- require 'MAX_HEARTS = 5' — game-rules.ts:7
- require 'XP_PER_CORRECT = 10' — game-rules.ts:8
- require 'XP_STREAK_BONUS = 20' — game-rules.ts:10
- require 'LEADERBOARD_LIMIT = 20' — leaderboard-data.ts:15
