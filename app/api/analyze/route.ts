import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";
import { ANALYZE_ERROR_MARKER } from "@/lib/analyzeStream";
import type { AnalyzeRequestBody } from "@/lib/types";

// @opennextjs/cloudflare requires the nodejs runtime (its own docs recommend
// against "edge" for the default function bundle). We talk to the Anthropic
// API directly via fetch + hand-rolled SSE parsing instead of the SDK client
// so this route has no Node-specific dependencies either way.
export const runtime = "nodejs";

const MODEL = "claude-sonnet-5";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

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

  const userMessage = contexte
    ? `Contexte entreprise fourni par le consultant :\n${contexte}\n\nNotes brutes de l'entretien :\n${notes}`
    : `Notes brutes de l'entretien :\n${notes}`;

  let upstream: Response;
  try {
    upstream = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        stream: true,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur réseau lors de l'appel à l'API Anthropic.";
    return NextResponse.json({ error: `Erreur API Anthropic : ${message}` }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    let message = `Erreur API Anthropic (HTTP ${upstream.status}).`;
    try {
      const errBody = (await upstream.json()) as { error?: { message?: string } };
      message = errBody?.error?.message ?? message;
    } catch {
      // corps d'erreur non-JSON : on garde le message générique
    }
    return NextResponse.json({ error: `Erreur API Anthropic : ${message}` }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const upstreamBody = upstream.body;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstreamBody.getReader();
      let buffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const rawEvent of events) {
            const dataLine = rawEvent.split("\n").find((line) => line.startsWith("data:"));
            if (!dataLine) continue;
            const jsonStr = dataLine.slice(5).trim();
            if (!jsonStr) continue;

            let parsed: { type?: string; delta?: { type?: string; text?: string }; error?: { message?: string } };
            try {
              parsed = JSON.parse(jsonStr);
            } catch {
              continue;
            }

            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta" && parsed.delta.text) {
              controller.enqueue(encoder.encode(parsed.delta.text));
            } else if (parsed.type === "error") {
              const message = parsed.error?.message ?? "Erreur inconnue renvoyée par l'API Anthropic.";
              controller.enqueue(encoder.encode(`${ANALYZE_ERROR_MARKER}${message}`));
            }
          }
        }
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue lors de la lecture du flux Anthropic.";
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
