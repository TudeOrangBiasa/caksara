import { useCallback, useEffect, useState } from "react";

import type { Route } from "./+types/_index";
import { BottomNav } from "../components/bottom-nav";
import type { NavTab } from "../components/bottom-nav";
import { OfflineBanner } from "../components/offline-banner";
import { TopNav } from "../components/top-nav";
import Header from "../components/header";
import { Dashboard } from "../features/dashboard/dashboard";
import { OnboardingGate } from "../features/onboarding/onboarding-gate";
import { KbDetail } from "../features/kb/kb-detail";
import { KbList } from "../features/kb/kb-list";
import type { KbEntry } from "../features/kb/kb-data";
import { ModuleDetail } from "../features/module/module-detail";
import { ModuleMateri } from "../features/module/module-materi";
import { ModuleTree } from "../features/module/module-tree";
import { hasSelesai, markSelesai } from "../features/module/module-store";
import { TeacherChat } from "../features/teacher/teacher";
import { ProfilPage } from "../features/profil/profil-page";
import { SettingsPage } from "../features/settings/settings";
import { ShareSheet } from "../features/share/share-sheet";
import type { CourseModule } from "../features/module/module-data";
import { courseModules } from "../features/module/module-data";
import { QuizShell } from "../features/quiz/quiz-shell";
import { saveQuizSession } from "../features/quiz/quiz-sync";
import { QuizResult } from "../features/quiz/quiz-result";
import { AudioSourceNote, useQuizLaunch } from "../features/quiz/quiz-generate";
import type { Quiz } from "../lib/zod/question";
import {
  buildMixedQuiz,
  buildSessionQuiz,
  getAdaptiveLevel,
  nextAttemptSeed,
  recordSessionLevel,
} from "../features/quiz/quiz-data";
import {
  applyOvernightReset,
  createAnonProfile,
  loadProfile,
  reconcileProfileId,
} from "../lib/profile-store";
import { notifyStreakReset } from "../lib/notify";
import { initSoundboard } from "../lib/sound";
import { useIsDesktop } from "../lib/use-is-desktop";
import { LandingHome } from "../features/landing/landing-home";

type View =
  | { kind: "home" }
  | { kind: "detail"; mod: CourseModule }
  | { kind: "materi"; mod: CourseModule }
  | { kind: "launch"; mod: CourseModule; isLatihan?: boolean }
  | { kind: "kb-detail"; entry: KbEntry }
  | { kind: "settings" }
  | { kind: "share" }
  | {
      kind: "result";
      mod: CourseModule;
      score: { correct: number; total: number };
      isLatihan?: boolean;
    };

/**
 * Sesi kuis modul (#23): 5 soal bervariasi 2+ tipe + dengar_pilih dari
 * bank lokal. Edge generate-quiz (Gemini) diambil via useQuizLaunch saat
 * sesi dibuka; bank lokal adalah fallback yang tidak pernah macet.
 */
function deriveQuizForMod(mod: CourseModule): Quiz {
  return buildSessionQuiz(mod.id, { seed: nextAttemptSeed(mod.id) });
}

function QuizLaunchView({
  mod,
  onReady,
  onBack,
}: {
  mod: CourseModule;
  onReady: (quiz: Quiz) => void;
  onBack: () => void;
}) {
  const launch = useQuizLaunch(mod.id, {
    localFallback: () => deriveQuizForMod(mod),
  });
  useEffect(() => {
    if (launch.status === "ready" && launch.quiz) onReady(launch.quiz);
  }, [launch, onReady]);
  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center px-4 py-10 text-center md:max-w-xl">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Menyiapkan Sesi Kuis · Level {getAdaptiveLevel(mod.id)}
      </p>
      <p className="mt-2 text-lg font-bold tracking-tight">Menyusun soal buat kamu…</p>
      <AudioSourceNote />
      <button
        type="button"
        onClick={onBack}
        className="mt-6 rounded-full bg-card px-5 py-2.5 text-sm font-semibold"
      >
        Kembali
      </button>
    </div>
  );
}

const MOD_LATIHAN: CourseModule = {
  id: "latihan",
  order: 1,
  title: "Latihan Campuran",
  theme: "Ulas ulang semua materi yang sudah dipelajari",
  description: "Latihan campuran dari semua modul yang sudah kamu selesaikan.",
  poinBelajar: ["Pengulangan"],
  jumlahSoal: 8,
  estimasiMenit: 3,
  materi: [
    {
      id: "lat_01",
      judul: "Latihan Campuran",
      isi: "Ulas ulang semua materi dari modul yang sudah kamu selesaikan.",
    },
  ],
};

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "CAKSARA | Aksara Bali" },
    { name: "description", content: "CAKSARA | Web Edukasi Aksara Bali" },
  ];
}

export default function Home() {
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [view, setView] = useState<View>({ kind: "home" });
  const [navTab, setNavTab] = useState<NavTab>("beranda");
  const [kbQuery, setKbQuery] = useState("");
  const isDesktop = useIsDesktop();

  const selesai = new Set<string>(courseModules.map((m) => m.id).filter((id) => hasSelesai(id)));

  const handleComplete = useCallback((name: string) => {
    if (name) {
      try {
        createAnonProfile(name);
      } catch {
        createAnonProfile("Penjelajah");
      }
    }
    setProfileLoaded(true);
  }, []);

  useEffect(() => {
    void reconcileProfileId();
    initSoundboard();
  }, []);

  if (!profileLoaded) {
    return <OnboardingGate onComplete={handleComplete} />;
  }

  const overlay = view.kind !== "home";

  let content: React.ReactNode;
  if (view.kind === "result") {
    content = (
      <QuizResult
        mod={view.mod}
        score={view.score}
        isLatihan={view.isLatihan}
        onRetry={() =>
          setView({
            kind: "quiz",
            mod: view.mod,
            quiz: view.isLatihan ? buildMixedQuiz([...selesai]) : deriveQuizForMod(view.mod),
            isLatihan: view.isLatihan,
          })
        }
        onBack={() => setView({ kind: "home" })}
      />
    );
  } else if (view.kind === "quiz") {
    content = (
      <QuizShell
        quiz={view.quiz}
        moduleId={view.mod.id}
        initialHearts={loadProfile()?.hearts ?? 5}
        onFinish={(score, detail) => {
          if (!view.isLatihan) {
            markSelesai(view.mod.id);
            recordSessionLevel(view.mod.id, score.correct, score.total);
          }
          void saveQuizSession(view.mod.id, detail, score);
          setView({ kind: "result", mod: view.mod, score, isLatihan: view.isLatihan });
        }}
        onBack={() =>
          view.isLatihan ? setView({ kind: "home" }) : setView({ kind: "detail", mod: view.mod })
        }
      />
    );
  } else if (view.kind === "kb-detail") {
    content = <KbDetail entry={view.entry} onBack={() => setView({ kind: "home" })} />;
  } else if (view.kind === "settings") {
    content = <SettingsPage onBack={() => setView({ kind: "home" })} />;
  } else if (view.kind === "share") {
    content = (
      <ShareSheet
        modulSelesai={selesai.size}
        modulTotal={courseModules.length}
        onClose={() => setView({ kind: "home" })}
      />
    );
  } else if (view.kind === "detail") {
    content = (
      <ModuleDetail
        mod={view.mod}
        onBack={() => setView({ kind: "home" })}
        onStart={() => setView({ kind: "materi", mod: view.mod })}
      />
    );
  } else if (view.kind === "materi") {
    content = (
      <ModuleMateri
        mod={view.mod}
        onBack={() => setView({ kind: "detail", mod: view.mod })}
        onStart={() => setView({ kind: "launch", mod: view.mod })}
      />
    );
  } else if (view.kind === "launch") {
    content = (
      <QuizLaunchView
        mod={view.mod}
        onReady={(quiz) =>
          setView({ kind: "quiz", mod: view.mod, quiz, isLatihan: view.isLatihan })
        }
        onBack={() =>
          view.isLatihan ? setView({ kind: "home" }) : setView({ kind: "detail", mod: view.mod })
        }
      />
    );
  } else if (navTab === "beranda") {
    content = isDesktop ? (
      <LandingHome
        onStart={() => setNavTab("belajar")}
        onOpenKb={() => setNavTab("kb")}
        onOpenTab={setNavTab}
      />
    ) : (
      <Dashboard
        profile={loadProfile()}
        selesai={selesai}
        onStart={() => setNavTab("belajar")}
        onOpenGuru={() => setNavTab("guru")}
        onOpenKb={(q) => {
          setKbQuery(q);
          setNavTab("kb");
        }}
        onOpenDetail={(mod) => setView({ kind: "detail", mod })}
      />
    );
  } else if (navTab === "belajar") {
    content = (
      <ModuleTree
        selesai={selesai}
        onOpenDetail={(mod) => setView({ kind: "detail", mod })}
        onLatihan={() =>
          setView({
            kind: "quiz",
            mod: MOD_LATIHAN,
            quiz: buildMixedQuiz([...selesai]),
            isLatihan: true,
          })
        }
        onLatihanMod={(mod) =>
          setView({ kind: "quiz", mod, quiz: deriveQuizForMod(mod), isLatihan: true })
        }
      />
    );
  } else if (navTab === "kb") {
    content = (
      <KbList
        initialQuery={kbQuery}
        onOpenEntry={(entry) => setView({ kind: "kb-detail", entry })}
      />
    );
  } else if (navTab === "guru") {
    content = <TeacherChat />;
  } else {
    content = (
      <ProfilPage
        selesai={selesai}
        onOpenSettings={() => setView({ kind: "settings" })}
        onOpenShare={() => setView({ kind: "share" })}
      />
    );
  }

  return <HomeShell overlay={overlay} navTab={navTab} onSelect={setNavTab} content={content} />;
}

function HomeShell({
  overlay,
  navTab,
  onSelect,
  content,
}: {
  overlay: boolean;
  navTab: NavTab;
  onSelect: (t: NavTab) => void;
  content: React.ReactNode;
}) {
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (applyOvernightReset()) notifyStreakReset();
  }, []);

  return (
    <div className="flex h-full flex-col">
      {!overlay && isDesktop && <TopNav active={navTab} onSelect={onSelect} />}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {!isDesktop && <Header />}
        <OfflineBanner />
        <main className="flex-1 overflow-y-auto">{content}</main>
        {!overlay && !isDesktop && <BottomNav active={navTab} onSelect={onSelect} />}
      </div>
    </div>
  );
}
