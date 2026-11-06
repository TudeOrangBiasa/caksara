import { WRESASTRA_AKSARA } from "../features/module/aksara-data";

const statusBox = {
  belum: "border-border/60 bg-card text-muted-foreground",
  dipahami: "border-accent bg-accent/15 shadow-[0_2px_0_0_var(--color-accent)]",
  ahli: "border-cta bg-cta/10 shadow-[0_2px_0_0_var(--color-cta-edge)]",
} as const;

const statusTag = {
  belum: "bg-muted/60 text-muted-foreground",
  dipahami: "bg-accent/25 text-accent-foreground",
  ahli: "bg-cta/15 text-cta",
} as const;

const statusLabel = {
  belum: "Belum",
  dipahami: "Lv 1",
  ahli: "Lv 2",
} as const;

export function MasteryGrid({
  mastery,
}: {
  mastery: Record<string, "belum" | "dipahami" | "ahli"> | undefined;
}) {
  const unlocked = WRESASTRA_AKSARA.filter((a) => (mastery?.[a.id] ?? "belum") !== "belum").length;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold tracking-tight">Mastery 18 Wresastra</h3>
        <span className="rounded-full bg-duo-blue/15 px-2.5 py-1 text-[10px] font-bold text-duo-blue">
          {unlocked} / {WRESASTRA_AKSARA.length}
        </span>
      </div>
      <div className="grid grid-cols-6 gap-1.5 md:grid-cols-9">
        {WRESASTRA_AKSARA.map((a) => {
          const status = mastery?.[a.id] ?? "belum";
          return (
            <div
              key={a.id}
              title={`${a.latin} - ${status === "belum" ? "Belum" : statusLabel[status]}`}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 px-1 py-2 ${statusBox[status]}`}
            >
              <span className="font-balinese text-lg leading-none">{a.glyph}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${statusTag[status]}`}
              >
                {statusLabel[status]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
