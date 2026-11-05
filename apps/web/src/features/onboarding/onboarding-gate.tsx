import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { Button } from "@caksara/ui/components/button";
import { cn } from "@caksara/ui/lib/utils";

import { Bedawang } from "../../components/bedawang";
import { getSupabase } from "../../lib/supabase";
import { startGoogleLogin } from "../../lib/auth-google";
import { loadProfile } from "../../lib/profile-store";
import { usePrefersReducedMotion } from "../../lib/use-prefers-reduced-motion";
import { profileNameSchema } from "../../lib/zod/profile";
import {
  GoogleSaveOffer,
  OnboardingTopBar,
  StepCommitment,
  StepGoal,
  StepLevel,
  StepNameSection,
  StepReadySection,
} from "./onboarding-steps";

const SPLASH_MS = 1500;
const TOTAL_STEPS = 4;

function Splash({ leaving }: { leaving: boolean }) {
  const reduceMotion = usePrefersReducedMotion();
  return (
    <div
      className={cn(
        "relative flex h-full flex-col items-center justify-center overflow-hidden bg-background px-6 transition-opacity duration-300",
        leaving && "opacity-0",
      )}
    >
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]"></div>
      <div className="absolute -left-32 -top-32 size-72 rounded-full bg-primary/20 blur-[100px]"></div>
      <div className="absolute -bottom-32 -right-32 size-72 rounded-full bg-warning/20 blur-[100px]"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div
          className={cn(
            "mb-8 flex size-32 items-center justify-center rounded-[3rem] bg-card shadow-2xl ring-1 ring-border/50",
            !reduceMotion && "animate-[bounce_3s_infinite]",
          )}
        >
          <Bedawang className="size-full rounded-[3rem]" />
        </div>

        <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="mb-2 font-balinese text-5xl text-primary/40">ᬳᬓ᭄ᬱᬭ</div>
          <h1 className="text-4xl font-extrabold tracking-tight">CAKSARA</h1>
          <p className="mt-3 max-w-[250px] text-sm text-muted-foreground">
            Aksara dan budaya Bali, dipelajari pelan-pelan.
          </p>
        </div>

        <div className="mt-12 animate-in fade-in duration-1000 delay-500 fill-mode-both">
          <div className="flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 ring-1 ring-border">
            <Loader2 className={cn("size-4 text-primary", !reduceMotion && "animate-spin")} />
            <span className="text-xs font-medium text-muted-foreground">Memuat data...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepBody({
  step,
  goal,
  level,
  commitment,
  name,
  nameError,
  inputRef,
  setGoal,
  setLevel,
  setCommitment,
  setName,
  setNameError,
  onNameSubmit,
}: {
  step: number;
  goal: string;
  level: string;
  commitment: string;
  name: string;
  nameError: string | null;
  inputRef: RefObject<HTMLInputElement | null>;
  setGoal: (v: string) => void;
  setLevel: (v: string) => void;
  setCommitment: (v: string) => void;
  setName: (v: string) => void;
  setNameError: (v: string | null) => void;
  onNameSubmit: () => void;
}) {
  if (step === 0) return <StepGoal goal={goal} onSelect={setGoal} />;
  if (step === 1) return <StepLevel level={level} onSelect={setLevel} />;
  if (step === 2) return <StepCommitment commitment={commitment} onSelect={setCommitment} />;
  return (
    <StepNameSection
      name={name}
      error={nameError}
      inputRef={inputRef}
      onChange={(val) => {
        setName(val);
        if (nameError) setNameError(null);
      }}
      onSubmit={onNameSubmit}
    />
  );
}

function MultiStepOnboarding({ onComplete }: { onComplete: (name: string) => void }) {
  const [step, setStep] = useState(0);
  const [offer, setOffer] = useState<"none" | "google">("none");
  const [goal, setGoal] = useState("budaya");
  const [level, setLevel] = useState("nol");
  const [commitment, setCommitment] = useState("santai");
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const resolvedName = name.trim() || "Penjelajah";

  async function handleGoogle() {
    const url = await startGoogleLogin(window.location.origin);
    if (url) {
      window.location.assign(url);
      return;
    }
    onComplete(resolvedName);
  }

  function handleNext() {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }
    handleNameSubmit();
  }

  function handleNameSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Nama masih kosong, isi dulu ya.");
      nameInputRef.current?.focus();
      return;
    }
    const parsed = profileNameSchema.safeParse(trimmed);
    if (!parsed.success) {
      setNameError(parsed.error.issues[0]?.message ?? "Nama tidak valid.");
      nameInputRef.current?.focus();
      return;
    }
    setStep(TOTAL_STEPS);
  }

  const isReadyStep = step >= TOTAL_STEPS;

  function handleSkip() {
    setStep(TOTAL_STEPS);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pemandu Mulai Belajar"
      className="flex min-h-full flex-col px-4 py-6 sm:py-10 lg:py-12 lg:pt-12"
    >
      <div className="mx-auto flex w-full max-w-md flex-1 md:max-w-xl lg:max-w-[640px] flex-col">
        <div>
          {isReadyStep ? null : (
            <OnboardingTopBar
              step={step}
              totalSteps={TOTAL_STEPS}
              onBack={() => setStep((s) => Math.max(0, s - 1))}
              onSkip={handleSkip}
            />
          )}

          <main className="pt-2 lg:pt-0">
            {isReadyStep ? (
              offer === "google" ? (
                <GoogleSaveOffer onGoogle={handleGoogle} onSkip={() => onComplete(resolvedName)} />
              ) : (
                <StepReadySection
                  name={name}
                  onStart={() => {
                    if (getSupabase()) {
                      setOffer("google");
                      return;
                    }
                    onComplete(name.trim() || "Penjelajah");
                  }}
                />
              )
            ) : (
              <StepBody
                step={step}
                goal={goal}
                level={level}
                commitment={commitment}
                name={name}
                nameError={nameError}
                inputRef={nameInputRef}
                setGoal={setGoal}
                setLevel={setLevel}
                setCommitment={setCommitment}
                setName={setName}
                setNameError={setNameError}
                onNameSubmit={handleNameSubmit}
              />
            )}
          </main>
        </div>

        {isReadyStep ? null : (
          <footer className="w-full pt-4 lg:pt-4">
            <Button
              variant="cta"
              size="lg"
              className="h-14 w-full flex-1 text-[15px] font-extrabold tracking-[0.8px] lg:h-[52px]"
              onClick={handleNext}
            >
              {step === TOTAL_STEPS - 1 ? "Selesai" : "Lanjut"}
            </Button>
          </footer>
        )}
      </div>
    </div>
  );
}

export function OnboardingGate({ onComplete }: { onComplete: (name: string) => void }) {
  const [phase, setPhase] = useState<"splash" | "onboarding" | "ready">("splash");
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (phase !== "splash") return;
    const hadProfile = Boolean(loadProfile()?.name);
    const fadeTimer = window.setTimeout(() => setLeaving(true), SPLASH_MS - 300);
    const timer = window.setTimeout(() => {
      if (hadProfile) {
        onComplete("");
        return;
      }
      setPhase("onboarding");
    }, SPLASH_MS);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(timer);
    };
  }, [phase, onComplete]);

  if (phase === "splash") return <Splash leaving={leaving} />;
  if (phase === "onboarding") {
    return <MultiStepOnboarding onComplete={onComplete} />;
  }
  return null;
}
