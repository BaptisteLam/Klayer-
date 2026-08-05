import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildPptxPrompt } from "@/lib/pptxPrompt";
import type { AnalyseResult } from "@/lib/types";

export const runtime = "nodejs";
// La compétence pptx passe par plusieurs allers-retours d'exécution de code
// (génération, validation, rendu visuel) : ça prend en pratique 1 à 3 minutes.
export const maxDuration = 300;

const MODEL = "claude-sonnet-5";

interface GeneratePptxBody {
  result: AnalyseResult;
  contexteEntreprise: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY n'est pas configurée sur le serveur." },
      { status: 500 }
    );
  }

  let body: GeneratePptxBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
  }

  if (!body.result || !Array.isArray(body.result.irritants)) {
    return NextResponse.json({ error: "Résultat d'analyse manquant ou invalide." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  const prompt = buildPptxPrompt(body.result, body.contexteEntreprise ?? "");

  let fileId: string | undefined;
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ["code-execution-2025-08-25", "skills-2025-10-02"],
      container: {
        skills: [{ type: "anthropic", skill_id: "pptx", version: "latest" }],
      },
      tools: [{ type: "code_execution_20260521", name: "code_execution" }],
      messages: [{ role: "user", content: prompt }],
    });

    for (const block of response.content) {
      if (block.type === "bash_code_execution_tool_result") {
        const content = block.content;
        if (content.type === "bash_code_execution_result") {
          for (const item of content.content) {
            if (item.type === "bash_code_execution_output") {
              fileId = item.file_id;
            }
          }
        }
      }
    }

    if (!fileId) {
      return NextResponse.json(
        {
          error:
            "Claude n'a produit aucun fichier PowerPoint exploitable. Réessayez, ou simplifiez l'analyse (moins d'hypothèses) si le problème persiste.",
        },
        { status: 502 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue lors de l'appel à l'API Anthropic.";
    return NextResponse.json({ error: `Erreur API Anthropic : ${message}` }, { status: 502 });
  }

  try {
    const fileResponse = await client.beta.files.download(fileId, {
      betas: ["files-api-2025-04-14"],
    });
    const arrayBuffer = await fileResponse.arrayBuffer();

    const contexteSlug = (body.contexteEntreprise || "decouverte-client")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="klayer-synthese-${contexteSlug}.pptx"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue lors du téléchargement du fichier.";
    return NextResponse.json({ error: `Fichier généré mais téléchargement impossible : ${message}` }, { status: 502 });
  }
}
