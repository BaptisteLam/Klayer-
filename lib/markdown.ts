import type { AnalyseResult } from "@/lib/types";

function bulletList(items: string[]): string {
  if (!items.length) return "_Aucune._";
  return items.map((item) => `- ${item}`).join("\n");
}

export function buildMarkdown(result: AnalyseResult, contexteEntreprise?: string): string {
  const date = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const lines: string[] = [];

  lines.push(`# Synthèse de découverte client`);
  lines.push("");
  lines.push(`_Généré le ${date}_`);
  if (contexteEntreprise) {
    lines.push("");
    lines.push(`**Contexte entreprise :** ${contexteEntreprise}`);
  }
  lines.push("");
  lines.push(`## Contexte`);
  lines.push("");
  lines.push(result.contexte || "_Non renseigné._");
  lines.push("");

  lines.push(`## Irritants identifiés`);
  lines.push("");
  if (!result.irritants.length) {
    lines.push("_Aucun irritant identifié._");
  } else {
    for (const irritant of result.irritants) {
      lines.push(`### ${irritant.nom}`);
      lines.push("");
      lines.push(`> ${irritant.citation_client}`);
      lines.push("");
      lines.push(`| Fréquence | Temps unitaire | Personnes | Coût horaire | Coût mensuel estimé |`);
      lines.push(`|---|---|---|---|---|`);
      lines.push(
        `| ${irritant.frequence} | ${irritant.temps_unitaire} | ${irritant.nb_personnes} | ${irritant.cout_horaire} | **${irritant.cout_mensuel_estime}** |`
      );
      lines.push("");
      lines.push(`- **Catégorie Klayer :** ${irritant.categorie_klayer}`);
      lines.push(`- **Priorité exprimée par le client :** ${irritant.priorite_exprimee_client ? "Oui" : "Non"}`);
      lines.push(`- **Impact business :** ${irritant.impact_business}`);
      lines.push("");
    }
  }

  lines.push(`## Matrice de priorisation`);
  lines.push("");
  if (!result.priorisation?.matrice?.length) {
    lines.push("_Non renseignée._");
  } else {
    lines.push(`| Irritant | Case | Justification |`);
    lines.push(`|---|---|---|`);
    for (const entry of result.priorisation.matrice) {
      lines.push(`| ${entry.irritant} | ${entry.case} | ${entry.justification} |`);
    }
  }
  lines.push("");

  lines.push(`## Hypothèses de cas d'usage`);
  lines.push("");
  if (!result.hypotheses_cas_usage.length) {
    lines.push("_Aucune hypothèse formulée._");
  } else {
    result.hypotheses_cas_usage.forEach((hypothese, index) => {
      lines.push(`### ${index + 1}. ${hypothese.titre}`);
      lines.push("");
      lines.push(`- **Irritant lié :** ${hypothese.irritant_lie}`);
      lines.push(`- **Catégorie Klayer :** ${hypothese.categorie_klayer}`);
      lines.push("");
      lines.push(hypothese.argumentaire);
      lines.push("");
    });
  }

  lines.push(`## Prochaines étapes`);
  lines.push("");
  lines.push(bulletList(result.prochaines_etapes));
  lines.push("");

  lines.push(`## Données manquantes à redemander`);
  lines.push("");
  lines.push(bulletList(result.donnees_manquantes));
  lines.push("");

  return lines.join("\n");
}

export function downloadMarkdown(markdown: string, filename = "synthese-decouverte-client.md") {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJson(result: AnalyseResult, filename = "synthese-decouverte-client.json") {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
