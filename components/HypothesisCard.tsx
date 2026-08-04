import type { HypotheseCasUsage } from "@/lib/types";
import { klayerColorClasses } from "@/lib/klayerStyle";
import { KLAYER_MECHANISMS } from "@/lib/klayerSolutions";

export function HypothesisCard({
  hypothese,
  index,
}: {
  hypothese: HypotheseCasUsage;
  index: number;
}) {
  const mechanism = KLAYER_MECHANISMS[hypothese.categorie_klayer];

  return (
    <div className="rounded-xl2 border border-klayer-border bg-klayer-card p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
          {index + 1}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-klayer-ink">{hypothese.titre}</h3>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${klayerColorClasses(
                hypothese.categorie_klayer
              )}`}
            >
              {hypothese.categorie_klayer}
            </span>
          </div>
          <p className="mt-1 text-xs text-klayer-muted">
            Irritant lié : <span className="font-medium text-klayer-ink">{hypothese.irritant_lie}</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-klayer-ink">{hypothese.argumentaire}</p>

          {mechanism && (
            <div className="mt-3 rounded-lg border border-brand/15 bg-brand-bg px-3.5 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                Comment Claude le fait
              </p>
              <p className="mt-1 text-sm text-klayer-ink">{mechanism.pitch}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
