import type { HypotheseCasUsage } from "@/lib/types";
import { klayerColorClasses } from "@/lib/klayerStyle";

export function HypothesisCard({
  hypothese,
  index,
}: {
  hypothese: HypotheseCasUsage;
  index: number;
}) {
  return (
    <div className="rounded-xl2 border border-klayer-border bg-klayer-card p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-klayer-ink text-sm font-semibold text-klayer-bg">
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
        </div>
      </div>
    </div>
  );
}
