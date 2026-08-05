"use client";

import Image from "next/image";
import { useState } from "react";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { InputPanel } from "@/components/InputPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { SAMPLE_CONTEXTE, SAMPLE_NOTES } from "@/lib/sampleCase";
import { ANALYZE_ERROR_MARKER, extractJsonFromModelText } from "@/lib/analyzeStream";
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

      if (!response.ok) {
        let message = "Une erreur est survenue lors de l'analyse.";
        try {
          const data = await response.json();
          message = data.error ?? message;
        } catch {
          // corps non-JSON (page d'erreur de l'hébergeur, timeout amont) : on garde le message générique
        }
        setError(message);
        return;
      }

      if (!response.body) {
        setError("Réponse vide du serveur.");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }
      accumulated += decoder.decode();

      if (accumulated.includes(ANALYZE_ERROR_MARKER)) {
        const message = accumulated.split(ANALYZE_ERROR_MARKER)[1]?.trim();
        setError(message ? `Erreur API Anthropic : ${message}` : "Erreur lors de l'appel à l'API Anthropic.");
        return;
      }

      const jsonCandidate = extractJsonFromModelText(accumulated);
      let parsed: AnalyseResult;
      try {
        parsed = JSON.parse(jsonCandidate) as AnalyseResult;
      } catch {
        setError(
          "Le modèle a renvoyé une réponse qui n'est pas un JSON valide. Réessayez, ou reformulez vos notes si le problème persiste."
        );
        return;
      }

      if (!parsed.irritants || !Array.isArray(parsed.irritants)) {
        setError("La réponse du modèle ne correspond pas au schéma attendu (champ 'irritants' manquant).");
        return;
      }

      setResult(parsed);
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
      <header className="bg-brand">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Boutique IA · 100&nbsp;% Anthropic
          </p>
          <div className="mt-1 flex items-center gap-3">
            <Image src="/klayer-logo.png" alt="Klayer" width={28} height={18} className="shrink-0" priority />
            <span className="text-xl font-bold tracking-tight text-white">Klayer</span>
            <h1 className="text-sm text-white/80">Assistant d&apos;analyse — découverte client</h1>
          </div>
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
              <AnalysisProgress />
              <p className="mt-4 text-xs text-klayer-muted">
                L&apos;analyse complète prend généralement 30 à 60 secondes.
              </p>
            </div>
          )}

          {result && <ResultPanel result={result} contexteEntreprise={contexte} onReset={handleReset} />}
        </div>
      </div>
    </main>
  );
}
