# Klayer — Assistant d'analyse découverte client

Application web locale pour consultant IA junior : colle tes notes d'entretien de découverte
client (texte libre, désordonné), et l'app génère une synthèse structurée — irritants chiffrés,
matrice de priorisation, hypothèses de cas d'usage, prochaines étapes et données manquantes.

## Stack

- Next.js 15 (App Router) + TypeScript
- Route API serveur (`app/api/analyze/route.ts`) qui appelle l'API Anthropic côté serveur
  (la clé API n'est jamais exposée au navigateur)
- Modèle utilisé : `claude-sonnet-5`
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

## Déploiement sur Cloudflare (Workers)

Le projet est pré-configuré avec [OpenNext pour Cloudflare](https://opennext.js.org/cloudflare) et
[Wrangler](https://developers.cloudflare.com/workers/wrangler/), qui déploient l'app Next.js
complète (pages + route API) sur Cloudflare Workers.

### 1. Se connecter à Cloudflare

```bash
npx wrangler login
```

### 2. Renseigner la clé API en secret (production)

La clé ne doit jamais être commitée ni mise en clair dans `wrangler.jsonc`. On la stocke comme
secret Cloudflare :

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

(colle la clé quand c'est demandé — elle est alors chiffrée côté Cloudflare et exposée en
`process.env.ANTHROPIC_API_KEY` à l'exécution, exactement comme en local)

### 3. Déployer

```bash
npm run deploy
```

Cette commande build l'app avec OpenNext puis la déploie via Wrangler. L'URL de l'app
(`https://<nom-du-worker>.<ton-sous-domaine>.workers.dev`) s'affiche à la fin du déploiement.
Le nom du Worker est défini dans `wrangler.jsonc` (`name`), modifiable librement.

### Tester le build Cloudflare en local (optionnel)

Pour tester le comportement exact du runtime Cloudflare Workers avant de déployer :

```bash
cp .dev.vars.example .dev.vars   # puis renseigne ANTHROPIC_API_KEY dans .dev.vars
npm run preview
```

`.dev.vars` n'est jamais commité (voir `.gitignore`) — c'est l'équivalent de `.env.local` mais
pour le runtime Wrangler/Workers.

### Déploiement continu (Workers Builds — connecter le dépôt GitHub)

Pour un déploiement automatique à chaque push, connecte le dépôt dans le dashboard Cloudflare
(**Workers & Pages → ton projet → Settings → Build**). Cloudflare ne lit **pas** les scripts
`package.json` par défaut : il faut renseigner explicitement les commandes suivantes dans les
réglages du projet (Workers Builds ignore la config `wrangler.jsonc` pour les commandes de
build) :

| Champ            | Valeur                        |
| ----------------- | ------------------------------ |
| Build command      | `npm run cf:build`             |
| Deploy command      | `npx wrangler deploy`          |

> ⚠️ Ne pas laisser **Build command** sur `npm run build` : ça ne lance que `next build`
> (Next.js classique) et ne génère jamais `.open-next/`, ce dont `wrangler deploy` a besoin —
> le déploiement échoue alors avec `Could not find compiled Open Next config`.

Renseigne aussi `ANTHROPIC_API_KEY` dans la section **Build variables and secrets** (ou
**Settings → Variables and Secrets**) du projet, en tant que **secret** (pas variable en clair).
Cloudflare redéploiera automatiquement à chaque push sur la branche configurée.
