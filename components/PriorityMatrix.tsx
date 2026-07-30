import type { MatriceEntry, PrioriteCase } from "@/lib/types";
import { priorityCaseColorClasses } from "@/lib/klayerStyle";

const CASES: { key: PrioriteCase; description: string }[] = [
  { key: "Prioritaire", description: "Impact fort + priorité client" },
  { key: "Quick win", description: "Impact modéré, facile à traiter vite" },
  { key: "En parallèle", description: "Utile, à mener en tâche de fond" },
  { key: "Écarté", description: "Faible impact ou hors périmètre" },
];

export function PriorityMatrix({ matrice }: { matrice: MatriceEntry[] }) {
  const grouped: Record<PrioriteCase, MatriceEntry[]> = {
    Prioritaire: [],
    "Quick win": [],
    "En parallèle": [],
    Écarté: [],
  };

  for (const entry of matrice) {
    if (entry.case in grouped) {
      grouped[entry.case].push(entry);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {CASES.map(({ key, description }) => (
        <div
          key={key}
          className={`rounded-xl2 border p-4 ${priorityCaseColorClasses(key)}`}
        >
          <div className="flex items-baseline justify-between">
            <h4 className="text-sm font-semibold">{key}</h4>
            <span className="text-xs opacity-70">{grouped[key].length}</span>
          </div>
          <p className="mt-0.5 text-xs opacity-70">{description}</p>

          <div className="mt-3 space-y-2">
            {grouped[key].length === 0 && (
              <p className="text-xs italic opacity-50">Aucun irritant</p>
            )}
            {grouped[key].map((entry, index) => (
              <div key={`${entry.irritant}-${index}`} className="rounded-lg bg-white/60 px-3 py-2">
                <p className="text-sm font-medium">{entry.irritant}</p>
                <p className="mt-0.5 text-xs opacity-80">{entry.justification}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
