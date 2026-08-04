"use client";

import { QuestionGuide } from "@/components/QuestionGuide";
import { SAMPLE_CONTEXTE, SAMPLE_NOTES } from "@/lib/sampleCase";

interface InputPanelProps {
  contexte: string;
  onContexteChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  onAnalyze: () => void;
  onLoadExample: () => void;
  onClear: () => void;
  isLoading: boolean;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function InputPanel({
  contexte,
  onContexteChange,
  notes,
  onNotesChange,
  onAnalyze,
  onLoadExample,
  onClear,
  isLoading,
}: InputPanelProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && notes.trim() && !isLoading) {
      e.preventDefault();
      onAnalyze();
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-klayer-ink">Notes d&apos;entretien</h1>
          <p className="mt-1 text-sm text-klayer-muted">
            Collez vos notes brutes de rendez-vous, puis lancez l&apos;analyse.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onLoadExample}
            className="rounded-lg border border-klayer-border bg-klayer-card px-2.5 py-1.5 text-xs font-medium text-klayer-muted transition hover:bg-klayer-bg hover:text-klayer-ink"
            title="Charger un exemple (cas Colibri Home) pour tester l'app"
          >
            Charger un exemple
          </button>
          {(notes || contexte) && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border border-klayer-border bg-klayer-card px-2.5 py-1.5 text-xs font-medium text-klayer-muted transition hover:bg-klayer-bg hover:text-klayer-ink"
              title="Effacer le contexte et les notes"
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      <QuestionGuide />

      <div>
        <label htmlFor="contexte" className="mb-1.5 block text-sm font-medium text-klayer-ink">
          Contexte entreprise <span className="font-normal text-klayer-muted">(optionnel)</span>
        </label>
        <input
          id="contexte"
          type="text"
          value={contexte}
          onChange={(e) => onContexteChange(e.target.value)}
          placeholder={`ex : ${SAMPLE_CONTEXTE}`}
          className="w-full rounded-lg border border-klayer-border bg-klayer-card px-3.5 py-2.5 text-sm text-klayer-ink placeholder:text-klayer-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="mb-1.5 flex items-baseline justify-between">
          <label htmlFor="notes" className="block text-sm font-medium text-klayer-ink">
            Notes de rendez-vous
          </label>
          <span className="text-xs text-klayer-muted">
            {countWords(notes)} mot{countWords(notes) > 1 ? "s" : ""}
          </span>
        </div>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Collez ici vos notes en vrac : bribes de phrases, citations du client, chiffres éparpillés..."
          className="min-h-[360px] w-full flex-1 resize-none rounded-lg border border-klayer-border bg-klayer-card px-3.5 py-3 text-sm leading-relaxed text-klayer-ink placeholder:text-klayer-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <p className="mt-1.5 text-xs text-klayer-muted">
          Astuce : <kbd className="rounded border border-klayer-border bg-klayer-bg px-1 py-0.5 font-sans">⌘/Ctrl</kbd>{" "}
          + <kbd className="rounded border border-klayer-border bg-klayer-bg px-1 py-0.5 font-sans">Entrée</kbd> pour
          lancer l&apos;analyse directement depuis le champ de texte.
        </p>
      </div>

      <button
        onClick={onAnalyze}
        disabled={isLoading || !notes.trim()}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Analyse en cours...
          </>
        ) : (
          "Analyser"
        )}
      </button>
    </div>
  );
}
