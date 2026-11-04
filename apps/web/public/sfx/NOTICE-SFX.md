# Efek suara UI — Kenney Interface Sounds (#109)

## Sumber

Kenney Interface Sounds (100 aset), https://kenney.nl/assets/interface-sounds
oleh Kenney (https://kenney.nl), lisensi **CC0 1.0 Universal**
(https://creativecommons.org/publicdomain/zero/1.0/).
Diunduh manual via cermin GitHub Calinou/kenney-interface-sounds
(plumbing unduh kenney.nl menolak bot), dikonversi WAV → ogg Vorbis q2.

## Kurasi → klip lokal (8 berkas, ±40 KB)

| Klip lokal    | Berkas sumber          | Dipakai untuk cue       |
| ------------- | ---------------------- | ----------------------- |
| `press.ogg`   | `select_001.wav`       | press                   |
| `click.ogg`   | `click_002.wav`        | (cadangan klik)         |
| `toggle.ogg`  | `toggle_001.wav`       | toggle                  |
| `success.ogg` | `confirmation_003.wav` | success                 |
| `error.ogg`   | `error_001.wav`        | error                   |
| `sparkle.ogg` | `glass_001.wav`        | sparkle, levelUp/streak |
| `chime.ogg`   | `open_002.wav`         | chime, levelUp penutup  |
| `levelup.ogg` | `maximize_001.wav`     | (cadangan fanfare)      |

Pemakaian: `src/lib/sound.ts` (`SFX_FILE`) — file diutamakan, cuelume
(Web Audio tersintesis) fallback bila file gagal. Toggle `soundEnabled`
tetap dihormati; tak ada fetch runtime (path statis lokal).
