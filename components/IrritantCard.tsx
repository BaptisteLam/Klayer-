import type { Irritant } from "@/lib/types";
import { klayerColorClasses } from "@/lib/klayerStyle";

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-full border border-klayer-border bg-klayer-bg px-2.5 py-1 text-xs text-klayer-muted">
      <span className="font-medium text-klayer-ink">{label} :</span>
      {value}
    </span>
  );
}

export function IrritantCard({ irritant }: { irritant: Irritant }) {
  return (
    <div className="rounded-xl2 border border-klayer-border bg-klayer-card p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-klayer-ink">{irritant.nom}</h3>
        <div className="flex flex-wrap items-center gap-2">
          {irritant.priorite_exprimee_client && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700">
              ★ Priorité client
            </span>
          )}
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${klayerColorClasses(
              irritant.categorie_klayer
            )}`}
          >
            {irritant.categorie_klayer}
          </span>
        </div>
      </div>

      <p className="mt-2 italic text-sm text-klayer-muted">&ldquo;{irritant.citation_client}&rdquo;</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge label="Fréquence" value={irritant.frequence} />
        <Badge label="Temps" value={irritant.temps_unitaire} />
        <Badge label="Personnes" value={irritant.nb_personnes} />
        <Badge label="Coût horaire" value={irritant.cout_horaire} />
      </div>

      <div className="mt-4 rounded-lg bg-klayer-bg border border-klayer-border px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-klayer-muted">Coût mensuel estimé</p>
        <p className="mt-0.5 text-2xl font-bold text-amber-700">{irritant.cout_mensuel_estime}</p>
      </div>

      <p className="mt-4 text-sm text-klayer-ink">
        <span className="font-medium">Impact business : </span>
        {irritant.impact_business}
      </p>
    </div>
  );
}
