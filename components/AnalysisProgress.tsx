"use client";

import { useEffect, useState } from "react";

const STAGES = [
  { at: 0, label: "Lecture des notes..." },
  { at: 15, label: "Extraction des irritants..." },
  { at: 35, label: "Calcul des coûts et impacts..." },
  { at: 55, label: "Priorisation..." },
  { at: 78, label: "Rédaction de la synthèse..." },
];

const CAP = 92; // on ne monte jamais à 100% tant que la réponse n'est pas là

export function AnalysisProgress() {
  const [progress, setProgress] = useState(4);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= CAP) return p;
        // avance vite au début, ralentit en s'approchant du plafond — donne une
        // impression de progrès réel même si la durée totale varie d'un appel à l'autre
        const remaining = CAP - p;
        const step = Math.max(0.4, remaining * 0.045);
        return Math.min(CAP, p + step);
      });
    }, 200);
    const elapsedInterval = setInterval(() => setElapsed((s) => s + 1), 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(elapsedInterval);
    };
  }, []);

  const stage = [...STAGES].reverse().find((s) => progress >= s.at) ?? STAGES[0];

  return (
    <div className="w-full max-w-sm">
      <div className="h-2 w-full overflow-hidden rounded-full bg-klayer-border">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm text-klayer-muted">{stage.label}</p>
        <p className="text-xs text-klayer-muted/70">{elapsed}s</p>
      </div>
    </div>
  );
}
