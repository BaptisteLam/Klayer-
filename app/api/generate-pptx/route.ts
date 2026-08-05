import { NextResponse } from "next/server";
import { buildKlayerDeck } from "@/lib/pptxDeck";
import type { AnalyseResult } from "@/lib/types";

export const runtime = "nodejs";

interface GeneratePptxBody {
  result: AnalyseResult;
  contexteEntreprise: string;
}

export async function POST(request: Request) {
  let body: GeneratePptxBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
  }

  if (!body.result || !Array.isArray(body.result.irritants)) {
    return NextResponse.json({ error: "Résultat d'analyse manquant ou invalide." }, { status: 400 });
  }

  try {
    const pres = buildKlayerDeck(body.result, body.contexteEntreprise ?? "");
    const buffer = (await pres.write({ outputType: "nodebuffer" })) as Buffer;
    const bytes = new Uint8Array(buffer);

    const contexteSlug = (body.contexteEntreprise || "decouverte-client")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="klayer-synthese-${contexteSlug}.pptx"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue lors de la génération du fichier.";
    return NextResponse.json({ error: `Génération du PowerPoint impossible : ${message}` }, { status: 500 });
  }
}
