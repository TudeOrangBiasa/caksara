import { WRESASTRA_AKSARA } from "../features/module/aksara-data";

const statusColor = {
  belum: "bg-mastery-belum",
  dipahami: "bg-mastery-dipahami",
  ahli: "bg-mastery-ahli",
};

const statusLabel = {
  belum: "Belum",
  dipahami: "Dipahami",
  ahli: "Ahli",
};

export function MasteryGrid({
  mastery,
}: {
  mastery: Record<string, "belum" | "dipahami" | "ahli"> | undefined;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold tracking-tight">Mastery 18 Wresastra</h3>
      <div className="grid grid-cols-6 gap-1.5 md:grid-cols-9">
        {WRESASTRA_AKSARA.map((a) => {
          const status = mastery?.[a.id] ?? "belum";
          return (
            <button
              key={a.id}
              type="button"
              title={`${a.latin} — ${statusLabel[status]}`}
              className={`flex flex-col items-center gap-0.5 rounded-lg p-1.5 ${statusColor[status]} opacity-80 hover:opacity-100 transition-opacity`}
            >
              <span className="font-balinese text-lg leading-none">{a.glyph}</span>
              <span className="text-[9px] font-medium">{statusLabel[status]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
