"use client";

interface InputPanelProps {
  contexte: string;
  onContexteChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export function InputPanel({
  contexte,
  onContexteChange,
  notes,
  onNotesChange,
  onAnalyze,
  isLoading,
}: InputPanelProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-klayer-ink">Notes d&apos;entretien</h1>
        <p className="mt-1 text-sm text-klayer-muted">
          Collez vos notes brutes de rendez-vous, puis lancez l&apos;analyse.
        </p>
      </div>

      <div>
        <label htmlFor="contexte" className="mb-1.5 block text-sm font-medium text-klayer-ink">
          Contexte entreprise <span className="font-normal text-klayer-muted">(optionnel)</span>
        </label>
        <input
          id="contexte"
          type="text"
          value={contexte}
          onChange={(e) => onContexteChange(e.target.value)}
          placeholder="ex : Colibri Home, distribution ameublement/déco, 180 magasins, ~100 pers. au siège"
          className="w-full rounded-lg border border-klayer-border bg-klayer-card px-3.5 py-2.5 text-sm text-klayer-ink placeholder:text-klayer-muted/70 focus:border-smarter focus:outline-none focus:ring-2 focus:ring-smarter/20"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-klayer-ink">
          Notes de rendez-vous
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Collez ici vos notes en vrac : bribes de phrases, citations du client, chiffres éparpillés..."
          className="min-h-[420px] w-full flex-1 resize-none rounded-lg border border-klayer-border bg-klayer-card px-3.5 py-3 text-sm leading-relaxed text-klayer-ink placeholder:text-klayer-muted/70 focus:border-smarter focus:outline-none focus:ring-2 focus:ring-smarter/20"
        />
      </div>

      <button
        onClick={onAnalyze}
        disabled={isLoading || !notes.trim()}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-klayer-ink px-4 py-3 text-sm font-semibold text-klayer-bg shadow-soft transition hover:bg-klayer-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-klayer-bg/30 border-t-klayer-bg" />
            Analyse en cours...
          </>
        ) : (
          "Analyser"
        )}
      </button>
    </div>
  );
}
