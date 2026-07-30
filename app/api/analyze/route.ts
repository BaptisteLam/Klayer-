import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";
import type { AnalyzeRequestBody, AnalyseResult } from "@/lib/types";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-5";

function extractJson(rawText: string): string {
  const trimmed = rawText.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY n'est pas configurée sur le serveur. Ajoutez-la dans .env.local puis redémarrez le serveur.",
      },
      { status: 500 }
    );
  }

  let body: AnalyzeRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
  }

  const notes = (body.notes ?? "").trim();
  const contexte = (body.contexte ?? "").trim();

  if (!notes) {
    return NextResponse.json(
      { error: "Le champ 'notes' est vide. Collez vos notes de rendez-vous avant d'analyser." },
      { status: 400 }
    );
  }

  const client = new Anthropic({ apiKey });

  const userMessage = contexte
    ? `Contexte entreprise fourni par le consultant :\n${contexte}\n\nNotes brutes de l'entretien :\n${notes}`
    : `Notes brutes de l'entretien :\n${notes}`;

  let rawText: string;
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Le modèle n'a renvoyé aucun texte exploitable." },
        { status: 502 }
      );
    }
    rawText = textBlock.text;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue lors de l'appel à l'API Anthropic.";
    return NextResponse.json({ error: `Erreur API Anthropic : ${message}` }, { status: 502 });
  }

  const jsonCandidate = extractJson(rawText);

  let parsed: AnalyseResult;
  try {
    parsed = JSON.parse(jsonCandidate) as AnalyseResult;
  } catch {
    return NextResponse.json(
      {
        error:
          "Le modèle a renvoyé une réponse qui n'est pas un JSON valide. Réessayez, ou reformulez vos notes si le problème persiste.",
        raw: rawText,
      },
      { status: 502 }
    );
  }

  if (!parsed.irritants || !Array.isArray(parsed.irritants)) {
    return NextResponse.json(
      {
        error: "La réponse du modèle ne correspond pas au schéma attendu (champ 'irritants' manquant).",
        raw: rawText,
      },
      { status: 502 }
    );
  }

  return NextResponse.json(parsed satisfies AnalyseResult);
}
