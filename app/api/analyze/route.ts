import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";
import { ANALYZE_ERROR_MARKER } from "@/lib/analyzeStream";
import type { AnalyzeRequestBody } from "@/lib/types";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-5";

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.API_KEY_KLAYER;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Aucune clé API Anthropic configurée sur le serveur (variable ANTHROPIC_API_KEY ou API_KEY_KLAYER). Ajoutez-la dans .env.local en local, ou dans les variables d'environnement de l'hébergeur en production.",
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

  // L'analyse prend 30 à 60 secondes : la plupart des hébergeurs (fonctions
  // serverless, proxys) coupent une réponse tamponnée bien avant. En streamant
  // les octets au fil de l'eau, la connexion reste active et on évite le 504.
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: MODEL,
          max_tokens: 8000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        });

        anthropicStream.on("text", (delta) => {
          controller.enqueue(encoder.encode(delta));
        });

        await anthropicStream.finalMessage();
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue lors de l'appel à l'API Anthropic.";
        controller.enqueue(encoder.encode(`${ANALYZE_ERROR_MARKER}${message}`));
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
