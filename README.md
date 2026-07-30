# Klayer — Assistant d'analyse découverte client

Application web locale pour consultant IA junior : colle tes notes d'entretien de découverte
client (texte libre, désordonné), et l'app génère une synthèse structurée — irritants chiffrés,
matrice de priorisation, hypothèses de cas d'usage, prochaines étapes et données manquantes.

## Stack

- Next.js 15 (App Router) + TypeScript
- Route API serveur (`app/api/analyze/route.ts`) qui appelle l'API Anthropic côté serveur
  (la clé API n'est jamais exposée au navigateur)
- Modèle utilisé : `claude-sonnet-4-6`
- Tailwind CSS pour le style
- Pas de base de données — tout se passe en mémoire côté navigateur, avec export Markdown

## Installation

```bash
npm install
```

## Configuration de la clé API

1. Copie `.env.local.example` en `.env.local` :

   ```bash
   cp .env.local.example .env.local
   ```

2. Ouvre `.env.local` et renseigne ta clé API Anthropic :

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

   Tu peux générer une clé sur [platform.claude.com](https://platform.claude.com) (section API Keys).

   `.env.local` est ignoré par git — ta clé ne sera jamais commitée.

## Lancer le projet en local

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Utilisation

1. (Optionnel) Renseigne le contexte entreprise (nom, secteur, taille).
2. Colle tes notes brutes de rendez-vous dans la grande zone de texte.
3. Clique sur **Analyser**.
4. La colonne de droite affiche la synthèse structurée : contexte, cartes d'irritants
   chiffrés, matrice de priorisation, hypothèses de cas d'usage, prochaines étapes et
   données manquantes à redemander au client.
5. Clique sur **Exporter en Markdown** pour télécharger un fichier `.md` prêt à coller
   dans un compte-rendu.

## Structure du projet

```
app/
  api/analyze/route.ts   # route API serveur — appelle l'API Anthropic
  page.tsx                # page principale (deux colonnes)
  layout.tsx
  globals.css
components/
  InputPanel.tsx          # colonne gauche
  ResultPanel.tsx          # colonne droite — orchestration de l'affichage
  IrritantCard.tsx
  PriorityMatrix.tsx
  HypothesisCard.tsx
lib/
  types.ts                 # types TypeScript du schéma d'analyse
  systemPrompt.ts           # prompt système envoyé à Claude
  markdown.ts                # génération + téléchargement du .md
  klayerStyle.ts              # couleurs par catégorie Klayer
```

## Build production

```bash
npm run build
npm run start
```
