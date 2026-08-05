import type { AnalyseResult } from "@/lib/types";
import { KLAYER_MECHANISMS } from "@/lib/klayerSolutions";

const BRAND = "#12222C";
const BRAND_DARK = "#0B161D";
const CREAM = "#FAF8F4";
const INK = "#2A2622";
const CATEGORY_COLORS: Record<string, string> = {
  "Smarter Employees": "#2563EB",
  "Faster Processes": "#16A34A",
  "Agentic Products": "#7C3AED",
};

/**
 * Construit les instructions envoyées à Claude (via la compétence pptx) pour générer le
 * récap client. Tout le contenu texte est déjà écrit ici — Claude n'a qu'à l'assembler et
 * le mettre en forme avec la compétence, pas à l'inventer.
 */
export function buildPptxPrompt(result: AnalyseResult, contexteEntreprise: string): string {
  const date = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });

  const irritantsList = result.irritants
    .map(
      (irritant) =>
        `- "${irritant.nom}"${irritant.priorite_exprimee_client ? " (★ priorité exprimée par le client)" : ""} — fréquence: ${irritant.frequence}, temps: ${irritant.temps_unitaire}, personnes: ${irritant.nb_personnes}, coût mensuel estimé: ${irritant.cout_mensuel_estime}. Catégorie Klayer: ${irritant.categorie_klayer}.`
    )
    .join("\n");

  const matriceList = (result.priorisation?.matrice ?? [])
    .map((m) => `- ${m.irritant} → case "${m.case}" (${m.justification})`)
    .join("\n");

  const hypothesesList = result.hypotheses_cas_usage
    .map((h, i) => {
      const mechanism = KLAYER_MECHANISMS[h.categorie_klayer];
      return `Hypothèse ${i + 1} — "${h.titre}" (catégorie Klayer: ${h.categorie_klayer}, couleur d'accent ${CATEGORY_COLORS[h.categorie_klayer] ?? BRAND})
Irritant lié : ${h.irritant_lie}
Argumentaire : ${h.argumentaire}
Comment Claude le fait (à afficher dans un bandeau distinct sur la slide) : ${mechanism?.pitch ?? ""}
Leviers concrets : ${mechanism?.leviers.join(" · ") ?? ""}`;
    })
    .join("\n\n");

  const etapesList = result.prochaines_etapes.map((e) => `- ${e}`).join("\n");

  return `Utilise la compétence pptx pour créer un fichier PowerPoint (.pptx) professionnel, au format 16:9 large, qui sert de synthèse de découverte client pour le cabinet de conseil Klayer. C'est un document destiné à être envoyé/présenté à un client — le rendu doit être soigné, épuré, cohérent, sans faute, sans placeholder.

CHARTE GRAPHIQUE KLAYER (à respecter strictement) :
- Couleur de marque (bleu nuit) : ${BRAND}, variante plus sombre pour les à-plats de clôture : ${BRAND_DARK}
- Fond clair alternatif : ${CREAM}
- Texte sombre sur fond clair : ${INK}
- Couleurs d'accent par catégorie Klayer : Smarter Employees = ${CATEGORY_COLORS["Smarter Employees"]}, Faster Processes = ${CATEGORY_COLORS["Faster Processes"]}, Agentic Products = ${CATEGORY_COLORS["Agentic Products"]}
- Typographie sobre, pas de fioritures, alignements cohérents, marges régulières
- Chaque slide de contenu porte en pied de page discret : "Klayer — Boutique IA, 100 % Anthropic" et le numéro de page

STRUCTURE ATTENDUE (dans cet ordre) :

1. Slide de titre — fond ${BRAND}, texte blanc : wordmark "KLAYER" en haut, titre "Synthèse de découverte client", sous-titre = le contexte entreprise ci-dessous, date en petit en bas.
Contexte entreprise : ${contexteEntreprise || "(non renseigné)"}
Date : ${date}

2. Slide "Contexte" — fond ${CREAM}, reprend ce résumé tel quel :
${result.contexte}

3. Slide "Irritants identifiés" — un tableau avec les colonnes Irritant / Fréquence / Temps / Personnes / Coût mensuel estimé (mets le coût en évidence, couleur ambre foncé, gras). Marque d'une étoile ★ les irritants où la priorité a été exprimée par le client.
${irritantsList}

4. Slide "Matrice de priorisation" — 4 encadrés (grille 2x2) intitulés "Prioritaire", "Quick win", "En parallèle", "Écarté", chacun listant les irritants qui s'y trouvent avec leur justification courte :
${matriceList}

5. Une slide PAR hypothèse de cas d'usage (${result.hypotheses_cas_usage.length} slide(s)) — titre de l'hypothèse en grand, badge de couleur avec le nom de la catégorie Klayer, l'argumentaire en dessous, puis un bandeau distinct sur fond ${BRAND} avec le texte blanc intitulé "COMMENT CLAUDE LE FAIT" reprenant le mécanisme et les leviers fournis :

${hypothesesList}

6. Slide "Prochaines étapes" — fond ${BRAND}, texte blanc, liste à puces :
${etapesList}

7. Slide de clôture — fond ${BRAND_DARK}, centré : wordmark "KLAYER", accroche "Votre partenaire pour réussir avec Claude.", puis "contact@klayer.ai · Paris, France".

CONTRAINTE IMPORTANTE SUR LA VALIDATION — à respecter impérativement pour ne pas saturer le contexte :
Ne convertis PAS le fichier en PDF/JPEG et ne visualise AUCUNE image de slide rendue (pas d'étape "view" sur un fichier image). Avec ${2 + 1 + result.hypotheses_cas_usage.length + 3} slides, cette étape de rendu visuel consomme un volume de contexte qui dépasse la limite du modèle et fait échouer la génération. Valide uniquement avec le script validate.py de la compétence (contrôle structurel) et, si besoin, une inspection du texte via python-pptx — jamais de rendu image.

Une fois le fichier généré et validé (script uniquement, sans rendu visuel), place-le dans le dossier de sortie. Réponds ensuite en une phrase confirmant que le fichier est prêt, sans détailler les étapes techniques.`;
}
