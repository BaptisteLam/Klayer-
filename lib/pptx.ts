import type { AnalyseResult } from "@/lib/types";

/**
 * Demande au serveur de générer le PowerPoint via la compétence Claude "pptx"
 * (code execution + skill, pas de génération côté client) et déclenche le
 * téléchargement du fichier renvoyé.
 */
export async function generateKlayerPptx(result: AnalyseResult, contexteEntreprise: string): Promise<void> {
  const response = await fetch("/api/generate-pptx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ result, contexteEntreprise }),
  });

  if (!response.ok) {
    let message = "La génération du PowerPoint a échoué.";
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // réponse non-JSON (ex: timeout de la plateforme d'hébergement) — on garde le message générique
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="(.+?)"/);
  const filename = match?.[1] ?? "klayer-synthese.pptx";

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
