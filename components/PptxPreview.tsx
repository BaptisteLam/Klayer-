"use client";

import { useState } from "react";
import type { AnalyseResult } from "@/lib/types";
import { generateKlayerPptx } from "@/lib/pptx";

const SLIDE_MOCKS = [
  { label: "Titre", bg: "bg-brand", text: "text-white" },
  { label: "Contexte", bg: "bg-klayer-bg", text: "text-klayer-ink" },
  { label: "Chantiers", bg: "bg-white", text: "text-klayer-ink" },
  { label: "Comment Claude aide", bg: "bg-brand", text: "text-white" },
  { label: "Prochaines étapes", bg: "bg-brand-dark", text: "text-white" },
];

export function PptxPreview({
  result,
  contexteEntreprise,
}: {
  result: AnalyseResult;
  contexteEntreprise: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      await generateKlayerPptx(result, contexteEntreprise);
    } catch (err) {
      setError(err instanceof Error ? err.message : "La génération du PowerPoint a échoué. Réessayez.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="rounded-xl2 border border-klayer-border bg-klayer-card p-5 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-klayer-muted">Récap PowerPoint</h2>
          <p className="mt-1 text-sm text-klayer-ink">
            5 slides aux couleurs Klayer — contexte, chantiers identifiés, ce que Claude peut faire, prochaines
            étapes. Prêt à envoyer au client.
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Génération...
            </>
          ) : (
            "Télécharger le PowerPoint"
          )}
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-700">{error}</p>}

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1" aria-hidden>
        {SLIDE_MOCKS.map((slide, index) => (
          <div
            key={slide.label}
            className={`flex h-24 w-40 shrink-0 flex-col justify-between rounded-md border border-klayer-border p-2.5 ${slide.bg}`}
          >
            <span className={`text-[9px] font-semibold uppercase tracking-wide ${slide.text} opacity-60`}>
              Slide {index + 1}
            </span>
            <span className={`text-xs font-medium leading-tight ${slide.text}`}>{slide.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-klayer-muted">
        Aperçu schématique — le fichier réel reprend le contenu complet de l&apos;analyse (
        {result.hypotheses_cas_usage.length} chantier{result.hypotheses_cas_usage.length > 1 ? "s" : ""},{" "}
        {result.irritants.length} irritant{result.irritants.length > 1 ? "s" : ""}).
      </p>
    </section>
  );
}
