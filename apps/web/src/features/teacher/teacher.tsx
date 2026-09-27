import { SendHorizontal, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@caksara/ui/lib/utils";

import { Bedawang } from "../../components/bedawang";
import { getTeacherReply, QUICK_REPLIES } from "./teacher-data";
import type { TeacherReply } from "./teacher-data";

interface Message {
  id: number;
  role: "user" | "guru";
  content: string;
  full: string;
  sources?: TeacherReply["sources"];
  title?: string;
  glyph?: string;
  suggestions?: string[];
  streaming?: boolean;
}

let msgId = 0;
const nextId = () => ++msgId;

const GREETING =
  "Rahajeng! Aku Bedawang Nala, guru virtual CAKSARA. Tanya apa aja seputar aksara, bahasa, atau budaya Bali, jawabanmu selalu kutunjukkan sumbernya biar tidak asal.";

export function TeacherChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: nextId(), role: "guru", content: GREETING, full: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    setInput("");
    setMessages((m) => [...m, { id: nextId(), role: "user", content: trimmed, full: trimmed }]);

    setThinking(true);
    window.setTimeout(() => {
      setThinking(false);
      const reply = getTeacherReply(trimmed);
      const id = nextId();
      setMessages((m) => [
        ...m,
        {
          id,
          role: "guru",
          content: "",
          full: reply.answer,
          sources: reply.sources,
          title: reply.title,
          glyph: reply.glyph,
          suggestions: reply.outside ? reply.suggestions : undefined,
          streaming: true,
        },
      ]);
      const stream = setInterval(() => {
        setMessages((m) => {
          const target = m[m.length - 1];
          if (!target || target.id !== id || target.full.length === 0) {
            clearInterval(stream);
            return m;
          }
          const next = target.full.slice(0, target.content.length + 3);
          const done = next.length >= target.full.length;
          return m.map((msg) =>
            msg.id === id ? { ...msg, content: next, streaming: !done } : msg,
          );
        });
      }, 24);
      window.setTimeout(() => clearInterval(stream), 4000);
    }, 700);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col md:max-w-2xl lg:max-w-6xl lg:grid lg:grid-cols-[340px_1fr] lg:gap-8 lg:p-6 lg:overflow-hidden">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-col lg:gap-6 overflow-y-auto pr-2 pb-6">
        <div className="relative overflow-hidden rounded-[1.75rem] shadow-sm min-h-[220px] flex flex-col justify-end p-6">
          <img
            src="/assets/feature_teacher_2d_1788968442321.jpg"
            alt="Ilustrasi Guru"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

          <div className="relative z-10 flex flex-col items-start justify-end">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md mb-3 shadow-inner">
              <Sparkles className="size-5" />
            </span>
            <h3 className="text-[22px] font-extrabold tracking-tight text-white leading-tight">
              Tanya Bedawang
            </h3>
            <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-white/80 max-w-[280px]">
              Tanyakan apa saja seputar Aksara Bali. Saya mencarikan jawaban akurat.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-[1.75rem] p-6 shadow-sm border border-border/50">
          <QuickReplies onPick={send} />
        </div>
      </div>

      {/* Main Chat Area (Mobile wrapper + Desktop styling) */}
      <div className="flex h-full flex-col lg:bg-card lg:rounded-[2rem] lg:shadow-md lg:border lg:border-border/60 lg:overflow-hidden">
        {/* Header */}
        <header className="mx-auto flex w-full items-center gap-3 border-b border-border/60 px-4 py-4 lg:px-6 lg:bg-card lg:border-border/40">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <Bedawang className="size-8" />
          </span>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Guru virtual
            </p>
            <p className="text-base font-bold tracking-tight">Bedawang Nala</p>
            <p className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
              <span className="size-1.5 rounded-full bg-success" />
              Online · jawab pakai sumber
            </p>
          </div>
          <span className="hidden lg:flex size-10 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-4 text-primary" />
          </span>
        </header>

        {/* Chat Window */}
        <div
          ref={scrollRef}
          className="mx-auto w-full flex-1 space-y-3 overflow-y-auto px-4 py-4 lg:px-6"
        >
          {messages.map((msg, idx) => (
            <Bubble key={msg.id} msg={msg} index={idx} onSuggest={(s) => send(s)} />
          ))}

          {thinking && <ThinkingBubble />}

          {/* Mobile-only welcome & quick replies */}
          {messages.length <= 1 && (
            <div className="animate-in fade-in zoom-in-95 duration-700 delay-100 flex flex-col gap-6 py-2 lg:hidden">
              <div className="relative overflow-hidden rounded-[1.75rem] shadow-sm min-h-[220px] flex flex-col justify-end p-6">
                <img
                  src="/assets/feature_teacher_2d_1788968442321.jpg"
                  alt="Ilustrasi Guru"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

                <div className="relative z-10 flex flex-col items-start justify-end">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md mb-3 shadow-inner">
                    <Sparkles className="size-5" />
                  </span>
                  <h3 className="text-[22px] font-extrabold tracking-tight text-white leading-tight">
                    Tanya Bedawang Nala
                  </h3>
                  <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-white/80 max-w-[280px]">
                    Tanyakan apa saja seputar Aksara Bali. Saya akan mencarikan jawabannya dari
                    berbagai sumber!
                  </p>
                </div>
              </div>

              <QuickReplies onPick={send} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          className="mx-auto w-full bg-transparent p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:px-6 lg:pb-6 lg:pt-0"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <div className="flex items-end gap-2 rounded-[1.5rem] bg-card lg:bg-background lg:border lg:border-border/50 py-2 pl-4 pr-2 shadow-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Tanya seputar aksara Bali…"
              aria-label="Tulis pertanyaan untuk Guru Virtual"
              className="max-h-32 min-h-8 w-full resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Kirim"
              disabled={!input.trim() || thinking}
              className={cn(
                "mb-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
                input.trim() && !thinking
                  ? "bg-primary text-primary-foreground hover:bg-primary/80"
                  : "bg-muted text-muted-foreground disabled:opacity-60",
              )}
            >
              <SendHorizontal className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Enter untuk kirim · Shift+Enter buat baris baru
          </p>
        </form>
      </div>
    </div>
  );
}

function Bubble({
  msg,
  index,
  onSuggest,
}: {
  msg: Message;
  index: number;
  onSuggest: (s: string) => void;
}) {
  const isUser = msg.role === "user";
  const isDone = !msg.streaming;

  return (
    <div
      className={cn("flex gap-2.5 animate-bubble-in", isUser ? "justify-end" : "justify-start")}
      style={{ animationDelay: `${Math.min(index * 30, 240)}ms` }}
    >
      {!isUser && (
        <Bedawang className="size-7 shrink-0 self-end" mood={isDone ? "senang" : "semangat"} />
      )}
      <div
        className={cn(
          "max-w-[82%] border-2 px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-3xl rounded-br-sm border-transparent bg-primary text-primary-foreground"
            : "rounded-xl border-border bg-card text-foreground shadow-none",
        )}
      >
        {msg.title && (
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
            {msg.glyph && <span className="font-balinese text-sm leading-none">{msg.glyph}</span>}
            {msg.title}
          </p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {msg.content}
          {msg.streaming && (
            <span className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 animate-blink bg-current align-baseline" />
          )}
        </p>

        {msg.sources && msg.sources.length > 0 && isDone && (
          <div className="mt-2 rounded-2xl bg-muted/60 px-2.5 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Sumber rujukan
            </p>
            <ul className="mt-1 space-y-0.5">
              {msg.sources.map((s) => (
                <li key={s.nama} className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{s.nama}</span> · {s.ket}
                </li>
              ))}
            </ul>
          </div>
        )}

        {msg.suggestions && msg.suggestions.length > 0 && isDone && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSuggest(s)}
                className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/15"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <Bedawang className="size-7 shrink-0 self-end" mood="semangat" />
      <div className="flex items-center gap-1 rounded-xl border-2 border-border bg-card px-4 py-3">
        <span
          className="size-1.5 animate-shimmer rounded-full bg-muted-foreground"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="size-1.5 animate-shimmer rounded-full bg-muted-foreground"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="size-1.5 animate-shimmer rounded-full bg-muted-foreground"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

function QuickReplies({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Mulai cepat
      </p>
      <p className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
        Ketuk untuk langsung tanya:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {QUICK_REPLIES.map((q) => (
          <button
            key={q.text}
            type="button"
            onClick={() => onPick(q.text)}
            className="rounded-full bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-transform active:scale-95"
          >
            {q.label}
          </button>
        ))}
      </div>
    </div>
  );
}
