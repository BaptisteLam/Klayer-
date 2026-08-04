"use client";

import { useState } from "react";

interface GuideStep {
  titre: string;
  questions: string[];
}

const STEPS: GuideStep[] = [
  {
    titre: "1. Comprendre le métier",
    questions: [
      "À quoi ressemble votre semaine type ?",
      "Qui sont les personnes de votre équipe, et sur quoi passent-elles le plus de temps ?",
      "Quels outils utilisez-vous au quotidien ?",
      "Est-ce qu'il y a eu des changements récents dans votre organisation ?",
    ],
  },
  {
    titre: "2. Faire émerger les irritants",
    questions: [
      "Qu'est-ce qui vous prend le plus de temps, ou vous agace le plus, dans une semaine type ?",
      "À quelle fréquence ça arrive ? Combien de temps ça prend à chaque fois ? Combien de personnes sont concernées ?",
      "Qu'est-ce qui se passe si ce sujet n'est jamais traité ?",
      "Comment vous faites aujourd'hui pour gérer ça ?",
    ],
  },
  {
    titre: "3. Prioriser à chaud",
    questions: [
      "Si vous deviez n'en garder qu'un, lequel choisiriez-vous ?",
      "Qu'est-ce qui vous ferait dire, dans 6 mois, que c'est réglé ?",
      "Est-ce qu'il y a un sujet qu'on n'a pas abordé et qui vous tient à cœur ?",
    ],
  },
  {
    titre: "4. Clôturer",
    questions: [
      "Récapituler à voix haute ce que vous avez compris, pour valider avec le client.",
      "Annoncer les prochaines étapes claires (ex : synthèse envoyée sous 48h, second échange si besoin).",
    ],
  },
];

export function QuestionGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl2 border border-klayer-border bg-klayer-card shadow-soft">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-klayer-ink">
          <span aria-hidden className="text-smarter">
            💬
          </span>
          Guide de questions pour l&apos;entretien
        </span>
        <span
          className={`text-klayer-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="space-y-4 border-t border-klayer-border px-4 py-4">
          <p className="text-xs text-klayer-muted">
            Un pense-bête à garder sous les yeux pendant le rendez-vous — pas un script à réciter.
          </p>
          {STEPS.map((step) => (
            <div key={step.titre}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-klayer-muted">
                {step.titre}
              </h4>
              <ul className="mt-1.5 space-y-1">
                {step.questions.map((question) => (
                  <li key={question} className="text-sm text-klayer-ink">
                    <span className="text-smarter">·</span> {question}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
