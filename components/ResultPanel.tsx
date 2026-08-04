"use client";

import { useState } from "react";
import type { AnalyseResult } from "@/lib/types";
import { IrritantCard } from "@/components/IrritantCard";
import { PriorityMatrix } from "@/components/PriorityMatrix";
import { HypothesisCard } from "@/components/HypothesisCard";
import { SolutionsRecap } from "@/components/SolutionsRecap";
import { buildMarkdown, downloadJson, downloadMarkdown } from "@/lib/markdown";
import { generateKlayerPptx } from "@/lib/pptx";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-klayer-muted">{title}</h2>
      {children}
    </section>
  );
}

export function ResultPanel({
  result,
  contexteEntreprise,
  onReset,
}: {
  result: AnalyseResult;
  contexteEntreprise: string;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPptx, setIsGeneratingPptx] = useState(false);
  const [pptxError, setPptxError] = useState<string | null>(null);

  const handleExportMarkdown = () => {
    const markdown = buildMarkdown(result, contexteEntreprise || undefined);
    downloadMarkdown(markdown);
  };

  const handleExportJson = () => {
    downloadJson(result);
  };

  const handleCopy = async () => {
    const markdown = buildMarkdown(result, contexteEntreprise || undefined);
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable (permissions, non-secure context) — silently ignore
    }
  };

  const handleGeneratePptx = async () => {
    setIsGeneratingPptx(true);
    setPptxError(null);
    try {
      await generateKlayerPptx(result, contexteEntreprise);
    } catch {
      setPptxError("La génération du PowerPoint a échoué. Réessayez.");
    } finally {
      setIsGeneratingPptx(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-klayer-ink">Synthèse de découverte</h1>
          <button
            onClick={onReset}
            className="text-xs text-klayer-muted underline decoration-dotted underline-offset-2 hover:text-klayer-ink"
          >
            ← Nouvelle analyse
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg border border-klayer-border bg-klayer-card px-3.5 py-2 text-sm font-medium text-klayer-ink shadow-soft transition hover:bg-klayer-bg"
          >
            {copied ? "Copié ✓" : "Copier"}
          </button>
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 rounded-lg border border-klayer-border bg-klayer-card px-3.5 py-2 text-sm font-medium text-klayer-ink shadow-soft transition hover:bg-klayer-bg"
          >
            Exporter en JSON
          </button>
          <button
            onClick={handleExportMarkdown}
            className="inline-flex items-center gap-2 rounded-lg border border-klayer-border bg-klayer-card px-3.5 py-2 text-sm font-medium text-klayer-ink shadow-soft transition hover:bg-klayer-bg"
          >
            Exporter en Markdown
          </button>
          <button
            onClick={handleGeneratePptx}
            disabled={isGeneratingPptx}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGeneratingPptx ? "Génération..." : "Générer le PowerPoint"}
          </button>
        </div>
      </div>

      {pptxError && (
        <p className="-mt-4 text-right text-xs text-red-700">{pptxError}</p>
      )}

      <Section title="Contexte">
        <div className="rounded-xl2 border border-klayer-border bg-klayer-card p-5 shadow-soft">
          <p className="text-sm leading-relaxed text-klayer-ink">{result.contexte}</p>
        </div>
      </Section>

      <Section title={`Irritants identifiés (${result.irritants.length})`}>
        <div className="space-y-4">
          {result.irritants.map((irritant, index) => (
            <IrritantCard key={`${irritant.nom}-${index}`} irritant={irritant} />
          ))}
        </div>
      </Section>

      <Section title="Matrice de priorisation">
        <PriorityMatrix matrice={result.priorisation?.matrice ?? []} />
      </Section>

      <Section title="Hypothèses de cas d'usage">
        <div className="space-y-4">
          {result.hypotheses_cas_usage.map((hypothese, index) => (
            <HypothesisCard key={`${hypothese.titre}-${index}`} hypothese={hypothese} index={index} />
          ))}
        </div>
      </Section>

      <SolutionsRecap hypotheses={result.hypotheses_cas_usage} />

      <Section title="Prochaines étapes">
        <div className="rounded-xl2 border border-klayer-border bg-klayer-card p-5 shadow-soft">
          <ul className="list-disc space-y-2 pl-5 text-sm text-klayer-ink">
            {result.prochaines_etapes.map((etape, index) => (
              <li key={index}>{etape}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="Données manquantes">
        <div className="rounded-xl2 border border-amber-200 bg-amber-50 p-5">
          <p className="mb-2 text-xs text-amber-800">
            À redemander au client pour affiner l&apos;analyse lors d&apos;un prochain échange :
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-amber-900">
            {result.donnees_manquantes.map((donnee, index) => (
              <li key={index}>{donnee}</li>
            ))}
          </ul>
        </div>
      </Section>
    </div>
  );
}
