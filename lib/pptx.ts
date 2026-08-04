import type PptxGenJS from "pptxgenjs";
import type { AnalyseResult, KlayerCategorie } from "@/lib/types";
import { KLAYER_MECHANISMS } from "@/lib/klayerSolutions";

type Slide = ReturnType<InstanceType<typeof PptxGenJS>["addSlide"]>;

const BRAND = "12222C";
const BRAND_DARK = "0B161D";
const INK = "2A2622";
const MUTED = "78716C";
const WHITE = "FFFFFF";
const CREAM = "FAF8F4";

const CATEGORY_COLORS: Record<KlayerCategorie, string> = {
  "Smarter Employees": "2563EB",
  "Faster Processes": "16A34A",
  "Agentic Products": "7C3AED",
};

const MARGIN_X = 0.6;
const CONTENT_W = 12.13; // 13.33 - 2 * MARGIN_X

function addFooter(slide: Slide, pageLabel: string) {
  slide.addText("Klayer — Boutique IA, 100 % Anthropic", {
    x: MARGIN_X,
    y: 7.05,
    w: 8,
    h: 0.3,
    fontSize: 9,
    color: MUTED,
  });
  slide.addText(pageLabel, {
    x: 11.5,
    y: 7.05,
    w: 1.2,
    h: 0.3,
    fontSize: 9,
    color: MUTED,
    align: "right",
  });
}

export async function generateKlayerPptx(result: AnalyseResult, contexteEntreprise: string) {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pres = new PptxGenJS();

  pres.defineLayout({ name: "KLAYER_16x9", width: 13.33, height: 7.5 });
  pres.layout = "KLAYER_16x9";
  pres.author = "Klayer";
  pres.title = "Synthèse de découverte client";

  const date = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });

  // 1. Slide de titre
  const titleSlide = pres.addSlide();
  titleSlide.background = { color: BRAND };
  titleSlide.addText("KLAYER", {
    x: MARGIN_X,
    y: 2.5,
    w: CONTENT_W,
    h: 0.6,
    fontSize: 20,
    bold: true,
    color: WHITE,
    charSpacing: 4,
  });
  titleSlide.addText("Synthèse de découverte client", {
    x: MARGIN_X,
    y: 3.1,
    w: CONTENT_W,
    h: 1.2,
    fontSize: 36,
    bold: true,
    color: WHITE,
  });
  if (contexteEntreprise) {
    titleSlide.addText(contexteEntreprise, {
      x: MARGIN_X,
      y: 4.3,
      w: CONTENT_W,
      h: 0.6,
      fontSize: 16,
      color: "C7D2D6",
    });
  }
  titleSlide.addText(date, {
    x: MARGIN_X,
    y: 6.6,
    w: CONTENT_W,
    h: 0.4,
    fontSize: 12,
    color: "8CA0A8",
  });

  // 2. Contexte
  const contextSlide = pres.addSlide();
  contextSlide.background = { color: CREAM };
  contextSlide.addText("Contexte", {
    x: MARGIN_X,
    y: 0.5,
    w: CONTENT_W,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: BRAND,
  });
  contextSlide.addText(result.contexte, {
    x: MARGIN_X,
    y: 1.5,
    w: CONTENT_W,
    h: 3,
    fontSize: 16,
    color: INK,
    valign: "top",
    lineSpacingMultiple: 1.3,
  });
  addFooter(contextSlide, "2");

  // 3. Irritants — tableau
  if (result.irritants.length > 0) {
    const irritantsSlide = pres.addSlide();
    irritantsSlide.background = { color: WHITE };
    irritantsSlide.addText("Irritants identifiés", {
      x: MARGIN_X,
      y: 0.4,
      w: CONTENT_W,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: BRAND,
    });

    const header = ["Irritant", "Fréquence", "Temps", "Personnes", "Coût mensuel estimé"].map((t) => ({
      text: t,
      options: { bold: true, color: WHITE, fill: { color: BRAND }, fontSize: 11 },
    }));
    const rows = result.irritants.map((irritant) => [
      {
        text: (irritant.priorite_exprimee_client ? "★ " : "") + irritant.nom,
        options: { fontSize: 11, color: INK, bold: irritant.priorite_exprimee_client },
      },
      { text: irritant.frequence, options: { fontSize: 11, color: INK } },
      { text: irritant.temps_unitaire, options: { fontSize: 11, color: INK } },
      { text: irritant.nb_personnes, options: { fontSize: 11, color: INK } },
      { text: irritant.cout_mensuel_estime, options: { fontSize: 11, color: "B45309", bold: true } },
    ]);

    irritantsSlide.addTable([header, ...rows], {
      x: MARGIN_X,
      y: 1.2,
      w: CONTENT_W,
      colW: [4.13, 2, 2, 2, 2],
      border: { type: "solid", color: "E7E2D8", pt: 0.5 },
      autoPage: false,
    });
    addFooter(irritantsSlide, "3");
  }

  // 4. Matrice de priorisation
  if (result.priorisation?.matrice?.length) {
    const matrixSlide = pres.addSlide();
    matrixSlide.background = { color: CREAM };
    matrixSlide.addText("Matrice de priorisation", {
      x: MARGIN_X,
      y: 0.4,
      w: CONTENT_W,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: BRAND,
    });

    const cases: { key: string; color: string }[] = [
      { key: "Prioritaire", color: "FEE2E2" },
      { key: "Quick win", color: "FEF3C7" },
      { key: "En parallèle", color: "E0F2FE" },
      { key: "Écarté", color: "F1F5F9" },
    ];
    const quadrantW = (CONTENT_W - 0.3) / 2;
    const quadrantH = 2.4;
    cases.forEach((c, i) => {
      const x = MARGIN_X + (i % 2) * (quadrantW + 0.3);
      const y = 1.3 + Math.floor(i / 2) * (quadrantH + 0.25);
      const entries = result.priorisation.matrice.filter((m) => m.case === c.key);
      matrixSlide.addShape("roundRect", {
        x,
        y,
        w: quadrantW,
        h: quadrantH,
        fill: { color: c.color },
        line: { color: "E7E2D8", width: 0.5 },
        rectRadius: 0.06,
      });
      matrixSlide.addText(c.key, { x: x + 0.2, y: y + 0.15, w: quadrantW - 0.4, h: 0.35, fontSize: 14, bold: true, color: INK });
      matrixSlide.addText(
        entries.length ? entries.map((e) => `•  ${e.irritant}`).join("\n") : "Aucun irritant",
        {
          x: x + 0.2,
          y: y + 0.55,
          w: quadrantW - 0.4,
          h: quadrantH - 0.7,
          fontSize: 11,
          color: entries.length ? INK : MUTED,
          italic: !entries.length,
          valign: "top",
        }
      );
    });
    addFooter(matrixSlide, "4");
  }

  // 5. Hypothèses de cas d'usage — une slide par hypothèse
  result.hypotheses_cas_usage.forEach((hypothese, index) => {
    const slide = pres.addSlide();
    slide.background = { color: WHITE };
    const catColor = CATEGORY_COLORS[hypothese.categorie_klayer] ?? BRAND;

    slide.addText(`Hypothèse ${index + 1}`, {
      x: MARGIN_X,
      y: 0.4,
      w: 6,
      h: 0.4,
      fontSize: 13,
      color: MUTED,
    });
    slide.addText(hypothese.titre, {
      x: MARGIN_X,
      y: 0.75,
      w: CONTENT_W,
      h: 0.7,
      fontSize: 26,
      bold: true,
      color: BRAND,
    });
    slide.addShape("roundRect", {
      x: MARGIN_X,
      y: 1.5,
      w: 2.6,
      h: 0.35,
      fill: { color: catColor },
      line: { type: "none" },
      rectRadius: 0.5,
    });
    slide.addText(hypothese.categorie_klayer, {
      x: MARGIN_X,
      y: 1.5,
      w: 2.6,
      h: 0.35,
      fontSize: 11,
      bold: true,
      color: WHITE,
      align: "center",
      valign: "middle",
    });

    slide.addText(hypothese.argumentaire, {
      x: MARGIN_X,
      y: 2.15,
      w: CONTENT_W,
      h: 1.6,
      fontSize: 15,
      color: INK,
      valign: "top",
      lineSpacingMultiple: 1.3,
    });

    const mechanism = KLAYER_MECHANISMS[hypothese.categorie_klayer];
    if (mechanism) {
      slide.addShape("roundRect", {
        x: MARGIN_X,
        y: 4,
        w: CONTENT_W,
        h: 2.2,
        fill: { color: BRAND },
        line: { type: "none" },
        rectRadius: 0.06,
      });
      slide.addText("COMMENT CLAUDE LE FAIT", {
        x: MARGIN_X + 0.3,
        y: 4.2,
        w: CONTENT_W - 0.6,
        h: 0.3,
        fontSize: 11,
        bold: true,
        color: "8CA0A8",
        charSpacing: 1,
      });
      slide.addText(mechanism.pitch, {
        x: MARGIN_X + 0.3,
        y: 4.55,
        w: CONTENT_W - 0.6,
        h: 0.8,
        fontSize: 13,
        color: WHITE,
        valign: "top",
        lineSpacingMultiple: 1.25,
      });
      slide.addText(mechanism.leviers.map((l) => `•  ${l}`).join("     "), {
        x: MARGIN_X + 0.3,
        y: 5.5,
        w: CONTENT_W - 0.6,
        h: 0.5,
        fontSize: 11,
        color: "C7D2D6",
      });
    }
    addFooter(slide, String(5 + index));
  });

  // 6. Prochaines étapes
  if (result.prochaines_etapes.length > 0) {
    const nextSlide = pres.addSlide();
    nextSlide.background = { color: BRAND };
    nextSlide.addText("Prochaines étapes", {
      x: MARGIN_X,
      y: 0.6,
      w: CONTENT_W,
      h: 0.7,
      fontSize: 28,
      bold: true,
      color: WHITE,
    });
    nextSlide.addText(
      result.prochaines_etapes.map((etape) => ({ text: etape, options: { breakLine: true, bullet: { code: "2022" } } })),
      {
        x: MARGIN_X,
        y: 1.8,
        w: CONTENT_W,
        h: 4.5,
        fontSize: 17,
        color: WHITE,
        valign: "top",
        lineSpacingMultiple: 1.5,
      }
    );
  }

  // 7. Clôture
  const closingSlide = pres.addSlide();
  closingSlide.background = { color: BRAND_DARK };
  closingSlide.addText("KLAYER", {
    x: MARGIN_X,
    y: 3.0,
    w: CONTENT_W,
    h: 0.6,
    fontSize: 22,
    bold: true,
    color: WHITE,
    charSpacing: 4,
    align: "center",
  });
  closingSlide.addText("Votre partenaire pour réussir avec Claude.", {
    x: MARGIN_X,
    y: 3.7,
    w: CONTENT_W,
    h: 0.5,
    fontSize: 15,
    color: "C7D2D6",
    align: "center",
  });
  closingSlide.addText("contact@klayer.ai   ·   Paris, France", {
    x: MARGIN_X,
    y: 4.3,
    w: CONTENT_W,
    h: 0.4,
    fontSize: 12,
    color: "8CA0A8",
    align: "center",
  });

  const fileName = `klayer-synthese-${(contexteEntreprise || "decouverte-client").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}.pptx`;
  await pres.writeFile({ fileName });
}
