"use client";

import { useState } from "react";
import { InputPanel } from "@/components/InputPanel";
import { ResultPanel } from "@/components/ResultPanel";
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

  return (
    <main className="min-h-screen bg-klayer-bg">
      <header className="border-b border-klayer-border bg-klayer-card">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-klayer-muted">Klayer</p>
          <h1 className="text-xl font-semibold text-klayer-ink">Assistant d&apos;analyse — découverte client</h1>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-2">
        <div className="rounded-xl2 border border-klayer-border bg-klayer-card p-6 shadow-soft lg:sticky lg:top-8 lg:h-fit">
          <InputPanel
            contexte={contexte}
            onContexteChange={setContexte}
            notes={notes}
            onNotesChange={setNotes}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        </div>

        <div>
          {error && (
            <div className="mb-6 rounded-xl2 border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {!result && !error && !isLoading && (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl2 border border-dashed border-klayer-border p-10 text-center">
              <p className="text-sm text-klayer-muted">
                Collez vos notes de rendez-vous à gauche puis cliquez sur &laquo; Analyser &raquo; pour
                générer la synthèse structurée.
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

          {result && <ResultPanel result={result} contexteEntreprise={contexte} />}
        </div>
      </div>
    </main>
  );
}
