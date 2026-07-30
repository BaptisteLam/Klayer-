export type KlayerCategorie =
  | "Smarter Employees"
  | "Faster Processes"
  | "Agentic Products";

export type PrioriteCase = "Prioritaire" | "Quick win" | "En parallèle" | "Écarté";

export interface Irritant {
  nom: string;
  citation_client: string;
  frequence: string;
  temps_unitaire: string;
  nb_personnes: string;
  cout_horaire: string;
  cout_mensuel_estime: string;
  priorite_exprimee_client: boolean;
  impact_business: string;
  categorie_klayer: KlayerCategorie;
}

export interface MatriceEntry {
  irritant: string;
  case: PrioriteCase;
  justification: string;
}

export interface HypotheseCasUsage {
  titre: string;
  irritant_lie: string;
  argumentaire: string;
  categorie_klayer: KlayerCategorie;
}

export interface AnalyseResult {
  contexte: string;
  irritants: Irritant[];
  priorisation: {
    matrice: MatriceEntry[];
  };
  hypotheses_cas_usage: HypotheseCasUsage[];
  prochaines_etapes: string[];
  donnees_manquantes: string[];
}

export interface AnalyzeRequestBody {
  contexte: string;
  notes: string;
}
