import {
  ArrowLeft,
  Backpack,
  BookOpen,
  Check,
  Coffee,
  Flame,
  Flower2,
  Leaf,
  Puzzle,
  Sparkles,
  Sprout,
  Target,
  TreePalm,
} from "lucide-react";
import type { RefObject } from "react";
import { useEffect } from "react";

import { Button } from "@caksara/ui/components/button";
import { Input } from "@caksara/ui/components/input";
import { Label } from "@caksara/ui/components/label";
import { cn } from "@caksara/ui/lib/utils";

import { Bedawang } from "../../components/bedawang";
import type { BedawangMood } from "../../lib/zod/profile";
import { ONBOARDING_COMMITMENTS, ONBOARDING_GOALS, ONBOARDING_LEVELS } from "./onboarding-data";
import type { OnboardingOption } from "./onboarding-data";

const OPTION_ICONS = {
  budaya: Flower2,
  sekolah: Backpack,
  otak: Puzzle,
  wisata: TreePalm,
  nol: Sprout,
  dasar: Leaf,
  ulang: BookOpen,
  santai: Coffee,
  teratur: Target,
  serius: Flame,
} as const;

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
    <div className="flex items-center gap-4 pt-4 lg:gap-4 lg:pt-4">
      <Bedawang
        mood={mood}
        className="size-24 shrink-0 drop-shadow-xs lg:h-[122px] lg:w-24 lg:rounded-none"
      />
      <div className="flex flex-1 flex-col gap-2 rounded-2xl border-2 border-border bg-card p-4 text-left shadow-sm lg:rounded-xl lg:p-4 lg:[row-gap:8px]">
        <p className="text-[15px] font-bold text-foreground lg:text-[15px] lg:font-bold lg:leading-[18px]">
          {title}
        </p>
        {subtitle ? (
          <p className="text-[15px] text-foreground lg:text-[15px] lg:font-normal lg:leading-[18px]">
            {subtitle}
          </p>
        ) : null}
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
    <div role="radiogroup" className="flex flex-col gap-3 pt-4 lg:gap-3 lg:pt-4 lg:[row-gap:12px]">
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;
        const Icon = OPTION_ICONS[opt.id as keyof typeof OPTION_ICONS] ?? Sparkles;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(opt.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99] lg:h-16 lg:gap-3 lg:rounded-xl lg:border-2 lg:p-3.5 lg:[padding:14px]",
              isSelected
                ? "border-cta bg-cta/10 text-foreground ring-2 ring-cta/60 shadow-duo lg:border-cta lg:bg-cta/10 lg:ring-0 lg:shadow-none"
                : "border-border bg-card text-foreground hover:bg-muted/40",
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full",
                isSelected ? "bg-cta text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 lg:gap-0.5 lg:[row-gap:2px]">
              <p
                className={cn(
                  "text-[15px]",
                  isSelected ? "font-bold" : "font-normal",
                  "lg:text-[15px] lg:leading-[18px]",
                )}
              >
                {opt.label}
              </p>
              <p className="text-[13px] text-muted-foreground lg:text-[13px] lg:leading-[16px]">
                {opt.desc}
              </p>
            </div>
            {isSelected && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-cta px-2.5 py-1 text-[11px] font-bold text-primary-foreground lg:hidden">
                <Check className="size-3.5" aria-hidden /> Dipilih
              </span>
            )}
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
    <header className="flex items-center gap-3 pb-4 lg:h-8 lg:gap-3 lg:pb-0">
      {step > 0 ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          aria-label="Kembali ke langkah sebelumnya"
          className="shrink-0"
        >
          <ArrowLeft className="size-5" />
        </Button>
      ) : (
        <div className="size-8 shrink-0 lg:hidden" />
      )}
      <div className="flex-1 lg:flex lg:flex-col">
        <p className="mb-1.5 text-[13px] font-extrabold tracking-[0.8px] text-muted-foreground lg:mb-0 lg:leading-[16px]">
          LANGKAH {step + 1} DARI {totalSteps}
        </p>
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Langkah ${step + 1} dari ${totalSteps}`}
          className="flex w-full gap-2 lg:gap-2"
        >
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn("h-4 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-muted")}
            />
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onSkip}
        className="h-auto shrink-0 border-0 px-0 py-0 text-[13px] font-medium leading-4 text-muted-foreground/70 hover:bg-transparent hover:text-foreground lg:font-normal"
      >
        Lewati
      </Button>
    </header>
  );
}

function StepMeta({ label, question }: { label: string; question: string }) {
  return (
    <div className="pt-5 lg:flex lg:flex-col lg:gap-0 lg:pt-5 lg:[padding-top:20px]">
      <p className="text-[13px] font-extrabold tracking-[0.8px] text-muted-foreground lg:leading-[16px]">
        {label}
      </p>
      <p className="pt-2 text-[22px] font-extrabold text-foreground lg:pt-0 lg:leading-[27px]">
        {question}
      </p>
    </div>
  );
}

export function StepGoal({ goal, onSelect }: { goal: string; onSelect: (v: string) => void }) {
  return (
    <div>
      <StepMeta label="PILIH SATU ALASAN" question="Apa alasan utamamu belajar Aksara Bali?" />
      <MascotBubble
        mood="senang"
        title="Om Swastyastu! Aku Bedawang Nala."
        subtitle="Pilih satu yang paling memotivasimu."
      />
      <OptionPicker options={ONBOARDING_GOALS} selectedId={goal} onSelect={onSelect} />
    </div>
  );
}

export function StepLevel({ level, onSelect }: { level: string; onSelect: (v: string) => void }) {
  return (
    <div>
      <StepMeta label="PILIH SATU LEVEL" question="Sudah sejauh mana kamu kenal?" />
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
      <StepMeta label="PILIH KOMITMEN HARIANMU" question="Berapa lama tiap hari?" />
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
    <div className="flex flex-col gap-3 pt-4 lg:pt-4 lg:[padding-top:16px]">
      <div className="flex flex-col gap-3 text-left lg:gap-3 lg:[row-gap:12px]">
        <Label htmlFor="profile-name" className="text-[15px] font-bold text-foreground">
          Nama panggilan
        </Label>
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
          className="h-12 rounded-2xl border-2 text-[15px] lg:h-[52px] lg:rounded-xl lg:[padding:14px]"
        />
        {error ? (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : (
          <p className="flex items-center gap-1 text-[13px] text-muted-foreground">
            <Sparkles className="size-3.5 text-accent" />
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
      <StepMeta label="KENALKAN DIRIMU" question="Siapa nama panggilanmu?" />
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
    <div className="mx-auto flex w-full max-w-[576px] flex-col items-center gap-4 overflow-hidden rounded-[32px] bg-card p-6 text-center lg:gap-4 lg:rounded-none lg:bg-transparent lg:p-6 lg:[row-gap:16px]">
      <Bedawang
        mood="semangat"
        className="h-[142px] w-30 rounded-2xl drop-shadow-md lg:h-[284px] lg:w-[240px] lg:rounded-none"
      />
      <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary lg:gap-1.5 lg:px-3 lg:py-1 lg:text-xs lg:[font-size:12px] lg:[padding:4px_12px]">
        <Sparkles className="size-3.5 lg:size-3.5" />
        Siap Mulai
      </div>
      <h2 className="text-[22px] font-extrabold tracking-tight lg:text-[22px] lg:leading-[27px]">
        Rahajeng rawuh, {displayName}!
      </h2>
      <p className="text-sm text-muted-foreground lg:text-center lg:text-sm lg:leading-[20px]">
        Kamu sudah siap memulai petualangan dari Modul 1. Belajar pelan-pelan, sedikit demi sedikit,
        pasti bisa!
      </p>
      <div className="w-full">
        <Button
          variant="cta"
          size="lg"
          className="h-12 w-full text-base lg:h-[50px] lg:text-[16px] lg:uppercase"
          onClick={onStart}
        >
          Mulai Petualangan
        </Button>
      </div>
    </div>
  );
}

export function GoogleSaveOffer({
  onGoogle,
  onSkip,
}: {
  onGoogle: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[576px] flex-col items-center gap-4 overflow-hidden rounded-[32px] bg-card p-6 text-center">
      <Bedawang mood="senang" className="h-[142px] w-30 rounded-2xl drop-shadow-md" />
      <h2 className="text-[22px] font-extrabold tracking-tight">Simpan progresmu?</h2>
      <p className="text-sm text-muted-foreground">
        Masuk pakai Google biar XP dan streak tersimpan di semua perangkat dan muncul di papan
        peringkat. Boleh juga dilewati dulu.
      </p>
      <div className="flex w-full flex-col gap-2">
        <Button variant="cta" size="lg" className="h-12 w-full text-base" onClick={onGoogle}>
          Simpan pakai Google
        </Button>
        <Button
          size="lg"
          variant="ghost"
          className="h-12 w-full rounded-full text-base font-semibold"
          onClick={onSkip}
        >
          Lewati dulu
        </Button>
      </div>
    </div>
  );
}
