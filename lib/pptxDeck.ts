import PptxGenJS from "pptxgenjs";
import type { AnalyseResult, KlayerCategorie } from "@/lib/types";
import { KLAYER_MECHANISMS, KLAYER_CATEGORY_ORDER } from "@/lib/klayerSolutions";
import { KLAYER_LOGO_BASE64 } from "@/lib/klayerLogo";

const LOGO_DATA_URI = `image/png;base64,${KLAYER_LOGO_BASE64}`;
const LOGO_RATIO = 1594 / 1024;

const BRAND = "12222C";
const BRAND_DARK = "0B161D";
const CREAM = "FAF8F4";
const INK = "2A2622";
const MUTED = "78716C";
const WHITE = "FFFFFF";

const CATEGORY_COLORS: Record<KlayerCategorie, string> = {
  "Smarter Employees": "2563EB",
  "Faster Processes": "16A34A",
  "Agentic Products": "7C3AED",
};

const MARGIN_X = 0.6;
const CONTENT_W = 12.13; // 13.33 - 2 * MARGIN_X

/**
 * Gabarit fixe, 5 slides, généré localement (pptxgenjs, pas d'appel modèle) —
 * rapide et déterministe. Le contenu vient uniquement de l'analyse déjà produite ;
 * rien n'est inventé ici.
 */
export function buildKlayerDeck(result: AnalyseResult, contexteEntreprise: string): PptxGenJS {
  const pres = new PptxGenJS();
  pres.defineLayout({ name: "KLAYER_16x9", width: 13.33, height: 7.5 });
  pres.layout = "KLAYER_16x9";
  pres.author = "Klayer";
  pres.title = "Synthèse de découverte client";

  const date = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });

  function footer(slide: PptxGenJS.Slide, page: number) {
    slide.addText("Klayer — Boutique IA, 100 % Anthropic  ·  Document confidentiel", {
      x: MARGIN_X,
      y: 7.08,
      w: 9,
      h: 0.28,
      fontSize: 8,
      color: MUTED,
    });
    slide.addText(String(page), {
      x: 12.1,
      y: 7.08,
      w: 0.6,
      h: 0.28,
      fontSize: 8,
      color: MUTED,
      align: "right",
    });
  }

  // 1. Titre
  const s1 = pres.addSlide();
  s1.background = { color: BRAND };
  const s1LogoH = 0.42;
  const s1LogoW = s1LogoH * LOGO_RATIO;
  s1.addImage({ data: LOGO_DATA_URI, x: MARGIN_X, y: 2.44, w: s1LogoW, h: s1LogoH });
  s1.addText("KLAYER", {
    x: MARGIN_X + s1LogoW + 0.15,
    y: 2.5,
    w: CONTENT_W - s1LogoW - 0.15,
    h: 0.55,
    fontSize: 18,
    bold: true,
    color: WHITE,
    charSpacing: 4,
  });
  s1.addText("Synthèse de découverte client", { x: MARGIN_X, y: 3.05, w: CONTENT_W, h: 1.1, fontSize: 34, bold: true, color: WHITE });
  if (contexteEntreprise) {
    s1.addText(contexteEntreprise, { x: MARGIN_X, y: 4.15, w: CONTENT_W, h: 0.6, fontSize: 15, color: "C7D2D6" });
  }
  s1.addText(date, { x: MARGIN_X, y: 6.7, w: CONTENT_W, h: 0.4, fontSize: 11, color: "8CA0A8" });

  // 2. Contexte + irritants clés
  const s2 = pres.addSlide();
  s2.background = { color: CREAM };
  s2.addText("Contexte", { x: MARGIN_X, y: 0.5, w: CONTENT_W, h: 0.55, fontSize: 22, bold: true, color: BRAND });
  s2.addText(result.contexte, {
    x: MARGIN_X,
    y: 1.25,
    w: CONTENT_W,
    h: 1.3,
    fontSize: 14,
    color: INK,
    valign: "top",
    lineSpacingMultiple: 1.25,
  });
  if (result.irritants.length > 0) {
    s2.addText("IRRITANTS IDENTIFIÉS", { x: MARGIN_X, y: 2.75, w: CONTENT_W, h: 0.3, fontSize: 10, bold: true, color: MUTED, charSpacing: 1 });
    const rows: PptxGenJS.TableRow[] = [
      ["Irritant", "Fréquence", "Coût mensuel estimé"].map((t) => ({
        text: t,
        options: { bold: true, color: WHITE, fill: { color: BRAND }, fontSize: 11 },
      })),
      ...result.irritants.map((irritant) => [
        { text: (irritant.priorite_exprimee_client ? "★ " : "") + irritant.nom, options: { fontSize: 11, color: INK } },
        { text: irritant.frequence, options: { fontSize: 11, color: INK } },
        { text: irritant.cout_mensuel_estime, options: { fontSize: 11, color: "B45309", bold: true } },
      ]),
    ];
    s2.addTable(rows, {
      x: MARGIN_X,
      y: 3.15,
      w: CONTENT_W,
      colW: [6.13, 3, 3],
      border: { type: "solid", color: "E7E2D8", pt: 0.5 },
      autoPage: false,
    });
  }
  footer(s2, 2);

  // 3. Les chantiers identifiés (hypothèses de cas d'usage)
  const s3 = pres.addSlide();
  s3.background = { color: WHITE };
  s3.addText("Les chantiers identifiés", { x: MARGIN_X, y: 0.5, w: CONTENT_W, h: 0.55, fontSize: 22, bold: true, color: BRAND });

  const n = Math.max(result.hypotheses_cas_usage.length, 1);
  const rowH = Math.min(1.7, (6.3 - 1.3) / n);
  result.hypotheses_cas_usage.forEach((h, i) => {
    const y = 1.3 + i * (rowH + 0.15);
    const catColor = CATEGORY_COLORS[h.categorie_klayer] ?? BRAND;
    s3.addShape("roundRect", { x: MARGIN_X, y, w: 0.08, h: rowH, fill: { color: catColor }, line: { type: "none" }, rectRadius: 0.04 });
    s3.addText(`${i + 1}.  ${h.titre}`, { x: MARGIN_X + 0.3, y, w: CONTENT_W - 2.7, h: 0.4, fontSize: 16, bold: true, color: INK });
    s3.addShape("roundRect", {
      x: MARGIN_X + CONTENT_W - 2.3,
      y: y + 0.02,
      w: 2.3,
      h: 0.32,
      fill: { color: catColor },
      line: { type: "none" },
      rectRadius: 0.5,
    });
    s3.addText(h.categorie_klayer, {
      x: MARGIN_X + CONTENT_W - 2.3,
      y: y + 0.02,
      w: 2.3,
      h: 0.32,
      fontSize: 10,
      bold: true,
      color: WHITE,
      align: "center",
      valign: "middle",
    });
    s3.addText(h.argumentaire, {
      x: MARGIN_X + 0.3,
      y: y + 0.42,
      w: CONTENT_W - 0.3,
      h: rowH - 0.45,
      fontSize: 11,
      color: MUTED,
      valign: "top",
      lineSpacingMultiple: 1.2,
    });
  });
  footer(s3, 3);

  // 4. Comment Claude peut vous aider (récap des mécanismes Klayer mobilisés)
  const s4 = pres.addSlide();
  s4.background = { color: BRAND };
  s4.addText("Comment Claude peut vous aider", { x: MARGIN_X, y: 0.5, w: CONTENT_W, h: 0.55, fontSize: 22, bold: true, color: WHITE });

  const categoriesPresentes = KLAYER_CATEGORY_ORDER.filter((c) =>
    result.hypotheses_cas_usage.some((h) => h.categorie_klayer === c)
  );
  const colW = (CONTENT_W - 0.4 * (categoriesPresentes.length - 1)) / Math.max(categoriesPresentes.length, 1);
  categoriesPresentes.forEach((cat, i) => {
    const mechanism = KLAYER_MECHANISMS[cat];
    const x = MARGIN_X + i * (colW + 0.4);
    s4.addShape("roundRect", { x, y: 1.4, w: colW, h: 5.3, fill: { color: BRAND_DARK }, line: { color: CATEGORY_COLORS[cat], width: 1.5 }, rectRadius: 0.08 });
    s4.addShape("roundRect", { x: x + 0.25, y: 1.7, w: colW - 0.5, h: 0.35, fill: { color: CATEGORY_COLORS[cat] }, line: { type: "none" }, rectRadius: 0.5 });
    s4.addText(cat, { x: x + 0.25, y: 1.7, w: colW - 0.5, h: 0.35, fontSize: 10, bold: true, color: WHITE, align: "center", valign: "middle" });
    s4.addText(mechanism.titre, { x: x + 0.25, y: 2.25, w: colW - 0.5, h: 0.5, fontSize: 14, bold: true, color: WHITE });
    s4.addText(mechanism.pitch, { x: x + 0.25, y: 2.85, w: colW - 0.5, h: 1.7, fontSize: 10.5, color: "C7D2D6", valign: "top", lineSpacingMultiple: 1.25 });
    s4.addText(mechanism.leviers.map((l) => `•  ${l}`).join("\n"), {
      x: x + 0.25,
      y: 4.7,
      w: colW - 0.5,
      h: 1.8,
      fontSize: 10,
      color: WHITE,
      valign: "top",
      lineSpacingMultiple: 1.4,
    });
  });
  footer(s4, 4);

  // 5. Prochaines étapes + clôture
  const s5 = pres.addSlide();
  s5.background = { color: BRAND_DARK };
  s5.addText("Prochaines étapes", { x: MARGIN_X, y: 0.6, w: CONTENT_W, h: 0.6, fontSize: 24, bold: true, color: WHITE });
  s5.addText(
    result.prochaines_etapes.map((etape) => ({ text: etape, options: { breakLine: true, bullet: { code: "2022" } } })),
    { x: MARGIN_X, y: 1.55, w: CONTENT_W, h: 3.6, fontSize: 15, color: WHITE, valign: "top", lineSpacingMultiple: 1.5 }
  );
  s5.addShape("line", { x: MARGIN_X, y: 5.5, w: CONTENT_W, h: 0, line: { color: "2A3A44", width: 1 } });
  const s5LogoH = 0.32;
  const s5LogoW = s5LogoH * LOGO_RATIO;
  s5.addImage({ data: LOGO_DATA_URI, x: MARGIN_X, y: 5.79, w: s5LogoW, h: s5LogoH });
  s5.addText("KLAYER", {
    x: MARGIN_X + s5LogoW + 0.15,
    y: 5.75,
    w: CONTENT_W - s5LogoW - 0.15,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: WHITE,
    charSpacing: 3,
  });
  s5.addText("Votre partenaire pour réussir avec Claude.  ·  contact@klayer.ai  ·  Paris, France", {
    x: MARGIN_X,
    y: 6.2,
    w: CONTENT_W,
    h: 0.4,
    fontSize: 11,
    color: "8CA0A8",
  });

  return pres;
}
