import type { KlayerCategorie, PrioriteCase } from "@/lib/types";

export function klayerColorClasses(categorie: KlayerCategorie): string {
  switch (categorie) {
    case "Smarter Employees":
      return "bg-smarter-bg text-smarter border border-smarter-border";
    case "Faster Processes":
      return "bg-faster-bg text-faster border border-faster-border";
    case "Agentic Products":
      return "bg-agentic-bg text-agentic border border-agentic-border";
    default:
      return "bg-klayer-border text-klayer-ink border border-klayer-border";
  }
}

export function priorityCaseColorClasses(priorityCase: PrioriteCase): string {
  switch (priorityCase) {
    case "Prioritaire":
      return "bg-rose-50 border-rose-200 text-rose-900";
    case "Quick win":
      return "bg-amber-50 border-amber-200 text-amber-900";
    case "En parallèle":
      return "bg-sky-50 border-sky-200 text-sky-900";
    case "Écarté":
      return "bg-stone-100 border-stone-200 text-stone-500";
    default:
      return "bg-klayer-bg border-klayer-border text-klayer-ink";
  }
}
