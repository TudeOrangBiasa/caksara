import { ArrowLeft, Sparkles } from "lucide-react";
import type { RefObject } from "react";
import { useEffect } from "react";

import { Button } from "@caksara/ui/components/button";
import { Input } from "@caksara/ui/components/input";
import { Label } from "@caksara/ui/components/label";
import { cn } from "@caksara/ui/lib/utils";

import { Bedawang } from "../../components/bedawang";
import type { BedawangMood } from "../../components/bedawang";
import { ONBOARDING_COMMITMENTS, ONBOARDING_GOALS, ONBOARDING_LEVELS } from "./onboarding-data";
import type { OnboardingOption } from "./onboarding-data";

export function MascotBubble({
  mood = "senang",
  title,
  subtitle,
}: {
  mood?: BedawangMood;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <Bedawang mood={mood} className="size-16 shrink-0 drop-shadow-xs" />
      <div className="relative flex-1 rounded-2xl rounded-tl-xs border bg-card p-3.5 text-left shadow-xs">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
    </div>
  );
}

export function OptionPicker({
  options,
  selectedId,
  onSelect,
}: {
  options: OnboardingOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div role="radiogroup" className="mt-5 space-y-2.5">
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(opt.id)}
            className={cn(
              "flex w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all active:scale-[0.99]",
              isSelected
                ? "border-primary bg-primary/8 text-foreground ring-1 ring-primary"
                : "border-border bg-card/70 hover:border-border/90 hover:bg-card text-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl text-lg",
                isSelected ? "bg-primary/15" : "bg-muted/70",
              )}
            >
              {opt.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function OnboardingTopBar({
  step,
  totalSteps,
  onBack,
  onSkip,
}: {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onSkip: () => void;
}) {
  const progressPercent = Math.min(100, Math.round(((step + 1) / totalSteps) * 100));

  return (
    <header className="flex items-center gap-3 pb-4">
      {step > 0 ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          aria-label="Kembali ke langkah sebelumnya"
          className="shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>
      ) : (
        <div className="size-8 shrink-0" />
      )}
      <div className="flex-1">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          Langkah {step + 1} dari {totalSteps}
        </p>
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Langkah ${step + 1} dari ${totalSteps}`}
          className="h-2.5 w-full overflow-hidden rounded-full bg-muted/80"
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onSkip}
        className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
      >
        Lewati
      </Button>
    </header>
  );
}

export function StepGoal({ goal, onSelect }: { goal: string; onSelect: (v: string) => void }) {
  return (
    <div>
      <MascotBubble
        mood="senang"
        title="Om Swastyastu! Aku Bedawang Nala."
        subtitle="Apa alasan utamamu ingin belajar Aksara Bali?"
      />
      <OptionPicker options={ONBOARDING_GOALS} selectedId={goal} onSelect={onSelect} />
    </div>
  );
}

export function StepLevel({ level, onSelect }: { level: string; onSelect: (v: string) => void }) {
  return (
    <div>
      <MascotBubble
        mood="senang"
        title="Bagus sekali! Seberapa jauh kamu sudah kenal?"
        subtitle="Supaya langkah belajarmu pas di kemampuanmu."
      />
      <OptionPicker options={ONBOARDING_LEVELS} selectedId={level} onSelect={onSelect} />
    </div>
  );
}

export function StepCommitment({
  commitment,
  onSelect,
}: {
  commitment: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <MascotBubble
        mood="semangat"
        title="Konsistensi adalah kunci belajar aksara!"
        subtitle="Mau luangkan waktu berapa lama setiap hari?"
      />
      <OptionPicker options={ONBOARDING_COMMITMENTS} selectedId={commitment} onSelect={onSelect} />
    </div>
  );
}

function StepNameInput({
  value,
  error,
  inputRef,
  onChange,
  onSubmit,
}: {
  value: string;
  error: string | null;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-5 space-y-3">
      <div className="space-y-1.5 text-left">
        <Label htmlFor="profile-name">Nama panggilan</Label>
        <Input
          ref={inputRef}
          id="profile-name"
          placeholder="Misal: Putu, Wayan, Made..."
          value={value}
          aria-invalid={error ? true : undefined}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
          className="h-12 rounded-xl text-base"
        />
        {error ? (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="size-3 text-accent" />
            Nama ini bakal tampil di profil dan kartu prestasimu.
          </p>
        )}
      </div>
    </div>
  );
}

export function StepNameSection({
  name,
  error,
  inputRef,
  onChange,
  onSubmit,
}: {
  name: string;
  error: string | null;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);
  return (
    <div>
      <MascotBubble
        mood="semangat"
        title="Keren! Terakhir, siapa nama panggilanmu?"
        subtitle="Supaya Bedawang tahu cara menyapamu."
      />
      <StepNameInput
        value={name}
        error={error}
        inputRef={inputRef}
        onChange={onChange}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export function StepReadySection({ name, onStart }: { name: string; onStart: () => void }) {
  const displayName = name.trim() || "Penjelajah";
  return (
    <div className="flex flex-col items-center text-center">
      <Bedawang mood="semangat" className="size-24 drop-shadow-md" />
      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        <Sparkles className="size-3.5" />
        Siap Mulai
      </div>
      <h2 className="mt-3 text-xl font-bold tracking-tight">Rahajeng rawuh, {displayName}!</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Kamu sudah siap memulai petualangan dari Modul 1. Belajar pelan-pelan, sedikit demi sedikit,
        pasti bisa!
      </p>
      <div className="mt-6 w-full">
        <Button size="lg" className="w-full text-base font-semibold" onClick={onStart}>
          Mulai Petualangan 🚀
        </Button>
      </div>
    </div>
  );
}
