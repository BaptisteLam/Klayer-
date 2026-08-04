"use client";

import { useState } from "react";
import { InputPanel } from "@/components/InputPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { SAMPLE_CONTEXTE, SAMPLE_NOTES } from "@/lib/sampleCase";
import type { AnalyseResult } from "@/lib/types";

export default function Home() {
  const [contexte, setContexte] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<AnalyseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contexte, notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Une erreur est survenue lors de l'analyse.");
        return;
      }

      setResult(data as AnalyseResult);
    } catch {
      setError("Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleLoadExample() {
    setContexte(SAMPLE_CONTEXTE);
    setNotes(SAMPLE_NOTES);
    setResult(null);
    setError(null);
  }

  function handleClear() {
    setContexte("");
    setNotes("");
    setResult(null);
    setError(null);
  }

  function handleReset() {
    setResult(null);
    setError(null);
  }

  return (
    <main className="min-h-screen bg-klayer-bg">
      <header className="border-b border-klayer-border bg-klayer-card">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-klayer-muted">Klayer</p>
          <h1 className="text-xl font-semibold text-klayer-ink">Assistant d&apos;analyse — découverte client</h1>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-2">
        <div className="rounded-xl2 border border-klayer-border bg-klayer-card p-6 shadow-soft lg:sticky lg:top-8 lg:h-fit lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
          <InputPanel
            contexte={contexte}
            onContexteChange={setContexte}
            notes={notes}
            onNotesChange={setNotes}
            onAnalyze={handleAnalyze}
            onLoadExample={handleLoadExample}
            onClear={handleClear}
            isLoading={isLoading}
          />
        </div>

        <div>
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl2 border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <span aria-hidden className="mt-0.5">
                ⚠️
              </span>
              <div>
                <p className="font-medium">L&apos;analyse a échoué</p>
                <p className="mt-1 text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!result && !error && !isLoading && (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl2 border border-dashed border-klayer-border p-10 text-center">
              <p className="text-sm text-klayer-muted">
                Collez vos notes de rendez-vous à gauche puis cliquez sur &laquo; Analyser &raquo; pour
                générer la synthèse structurée.
              </p>
              <p className="mt-2 text-xs text-klayer-muted">
                Pas encore de notes sous la main ? Clique sur &laquo; Charger un exemple &raquo; pour voir l&apos;app
                en action.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl2 border border-klayer-border bg-klayer-card p-10 text-center shadow-soft">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-klayer-border border-t-smarter" />
              <p className="mt-4 text-sm text-klayer-muted">
                Analyse de l&apos;entretien en cours — extraction des irritants, calcul des coûts,
                priorisation...
              </p>
            </div>
          )}

          {result && <ResultPanel result={result} contexteEntreprise={contexte} onReset={handleReset} />}
        </div>
      </div>
    </main>
  );
}
