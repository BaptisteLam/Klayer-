import type { HypotheseCasUsage, KlayerCategorie } from "@/lib/types";
import { KLAYER_CATEGORY_ORDER, KLAYER_MECHANISMS } from "@/lib/klayerSolutions";
import { klayerColorClasses } from "@/lib/klayerStyle";

export function SolutionsRecap({ hypotheses }: { hypotheses: HypotheseCasUsage[] }) {
  const categoriesPresentes = KLAYER_CATEGORY_ORDER.filter((categorie) =>
    hypotheses.some((h) => h.categorie_klayer === categorie)
  );

  if (categoriesPresentes.length === 0) return null;

  return (
    <div className="rounded-xl2 border border-brand/20 bg-brand p-6 text-white shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Klayer × Claude</p>
      <h3 className="mt-1 text-base font-semibold">Ce que Claude peut faire, concrètement</h3>
      <p className="mt-1 text-sm text-white/70">
        Pour chaque hypothèse retenue, le levier Klayer correspondant et la mécanique Claude associée.
      </p>

      <div className="mt-5 space-y-5">
        {categoriesPresentes.map((categorie: KlayerCategorie) => {
          const mechanism = KLAYER_MECHANISMS[categorie];
          const hypothesesLiees = hypotheses.filter((h) => h.categorie_klayer === categorie);
          return (
            <div key={categorie} className="rounded-lg border border-white/15 bg-white/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${klayerColorClasses(
                    categorie
                  )}`}
                >
                  {categorie}
                </span>
                <span className="text-sm font-medium text-white">{mechanism.titre}</span>
              </div>
              <p className="mt-2 text-sm text-white/80">{mechanism.pitch}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {mechanism.leviers.map((levier) => (
                  <li
                    key={levier}
                    className="rounded-full border border-white/20 px-2.5 py-1 text-xs text-white/80"
                  >
                    {levier}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs uppercase tracking-wide text-white/50">
                Hypothèse{hypothesesLiees.length > 1 ? "s" : ""} concernée{hypothesesLiees.length > 1 ? "s" : ""}
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-white/85">
                {hypothesesLiees.map((h) => (
                  <li key={h.titre}>{h.titre}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
