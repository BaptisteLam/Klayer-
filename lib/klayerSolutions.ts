import type { KlayerCategorie } from "@/lib/types";

export interface KlayerMechanism {
  titre: string;
  pitch: string;
  leviers: string[];
}

/**
 * Vocabulaire et positionnement repris tel quel du site klayer.ai (section "Nos services") —
 * pas généré par le modèle, pour garantir un wording toujours fidèle à la marque.
 */
export const KLAYER_MECHANISMS: Record<KlayerCategorie, KlayerMechanism> = {
  "Smarter Employees": {
    titre: "Des équipes augmentées",
    pitch:
      "Déploiement de Claude Cowork avec des plugins et des skills pensés pour vos métiers : chaque expert gagne un assistant qui connaît votre contexte.",
    leviers: ["Déploiement de Claude Cowork", "Plugins & skills sur mesure", "Formation des équipes"],
  },
  "Faster Processes": {
    titre: "Des processus accélérés",
    pitch:
      "Des agents Claude qui exécutent les tâches répétitives et orchestrent le processus de bout en bout — y compris en routine planifiée — plus vite et plus fiablement.",
    leviers: ["Agents sur vos workflows", "Automatisation de bout en bout", "Mesure des résultats"],
  },
  "Agentic Products": {
    titre: "Des applications réinventées",
    pitch:
      "Une application agentique sur mesure, qui intègre les capacités de Claude dans votre SI ou votre produit via le SDK, l'API et MCP.",
    leviers: ["Apps agentiques sur mesure", "Intégration SDK / API", "Mise à l'échelle sécurisée"],
  },
};

export const KLAYER_CATEGORY_ORDER: KlayerCategorie[] = [
  "Smarter Employees",
  "Faster Processes",
  "Agentic Products",
];
