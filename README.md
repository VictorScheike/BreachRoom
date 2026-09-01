# BreachRoom

Playable cybersecurity training. You practise the decisions people actually make — in an incident, in architecture, and when a digital solution is being built.

**Live site:** [https://breachroom.victorscheike.com](https://breachroom.victorscheike.com)

Free to play. No account required. Questions are reviewed in the codebase, not generated at runtime.

It is meant for people in security, operations, product, communications, development and leadership who want a short rehearsal without live data or attacker tooling.

## Play

| | |
| --- | --- |
| Home | [breachroom.victorscheike.com](https://breachroom.victorscheike.com/) |
| Missions | [/missions/](https://breachroom.victorscheike.com/missions/) |
| Architecture Defence Lab | [/lab/](https://breachroom.victorscheike.com/lab/) |
| Secure Solution Builder | [/secure-solution-builder/](https://breachroom.victorscheike.com/secure-solution-builder/) |
| Training by role | [/training/](https://breachroom.victorscheike.com/training/) |
| My progress | [/progress/](https://breachroom.victorscheike.com/progress/) |

## What you can play

### Decision exercises

These sit on their own in the mission library, side by side.

- **Architecture Defence Lab** — ten architecture questions for a fictional claims system (front door, AI, customer data). Then one attack walks the path you built.
- **Secure Solution Builder** — 15 decisions from idea to launch. A security architect guides you with a speech bubble. You can reset the game back to the intro without losing your best score.

### Map missions

Walking maps with locked doors. A wrong answer keeps the door shut until you choose a stronger response. Progress is saved in the browser.

| Mission | Topic | Length |
| --- | --- | --- |
| Inbox Under Siege | Phishing and social engineering | 8 decisions |
| Locked Out | Ransomware on the Northstar campus | 8 decisions |
| Northstar: Zero Hour | Organisation-wide incident coordination | 15 decisions |
| The AI Forge | Launching AI with rails | 8 decisions |
| Dependency Depths | Packages, pipelines and cloud | 8 decisions |

### Training by role

[/training/](https://breachroom.victorscheike.com/training/) assembles a short deck from reviewed questions for:

- General employees
- Finance & HR
- Developers & DevOps
- IT & Security
- Leaders, Risk & Governance

### My progress

Completed sessions stay in **this browser** (`localStorage`). There is no login and no server-side history. Clearing site data clears progress.

## What it does not do

- It does not create user accounts or store progress in a database.
- It does not connect to a live organisation, SIEM or AI model for answers.
- It does not use real customer data.
- It does not include offensive security functionality, real malware, network scanning or exploit material.
- It does not provide legal advice, compliance certification, NIS2 certification, or a complete assessment of an organisation’s incident readiness.

**Educational disclaimer**

> BreachRoom is an educational tabletop simulation. It does not provide legal advice, compliance certification or a complete assessment of an organisation’s incident readiness.

Scores are teaching models. They must not be described as an official maturity, compliance or security certification.

## Technology stack

- TypeScript
- Next.js App Router (static export)
- Tailwind CSS
- Zod for catalog validation
- Vitest
- Cloudflare Workers for hosting

Question banks live in typed TypeScript modules and are validated before use.

## Local installation

Requirements: Node.js 20 or later, and npm.

```bash
git clone https://github.com/VictorScheike/BreachRoom.git
cd BreachRoom
npm install
```

## Development commands

```bash
npm run dev         # local Next.js server
npm run build       # production static export to /out
npm run preview:cf  # build and preview the Cloudflare Worker locally
npm run deploy      # build and publish to Cloudflare Workers
npm run lint        # ESLint
npm run typecheck   # TypeScript without emitting files
npm test            # Vitest unit tests
npm run test:watch  # Vitest watch mode
```

Open [http://localhost:3000](http://localhost:3000) while `npm run dev` is running. Tests are local. They do not use the network.

## Deploy on Cloudflare

The public hostname is `https://breachroom.victorscheike.com`.

### From your machine

```bash
npm install
npx wrangler login
npm run deploy
```

The Worker config in `wrangler.jsonc` attaches `breachroom.victorscheike.com` as a custom domain.

### From git (auto-deploy)

Cloudflare Workers Builds currently deploys the **production branch** `cursor/breachroom-simulator-103f`. That branch is what the live site tracks.

`main` is the GitHub default branch. Keep it in sync with production so people who clone the repo get the same app as the live site.

1. Open the BreachRoom Worker → **Settings** → **Build**.
2. Production branch: `cursor/breachroom-simulator-103f` (or `main` once you point Cloudflare at it).
3. Build command: `npm run build`
4. Deploy command: `npx wrangler deploy`

The free plan is enough: no database, no accounts, no server APIs.

## Project structure

```text
src/
  app/                         # Routes: /, /missions, /play, /lab,
                               # /secure-solution-builder, /training, /progress, /about
  components/
    site/                      # Marketing pages, mission cards, progress
    game/                      # Walking-map missions
    lab/                       # Architecture Defence Lab
    builder/                   # Secure Solution Builder
  lib/
    missions/                  # Map catalogs and reviewed question banks
    lab/                       # Lab catalog, attack campaign, scoring
    builder/                   # Builder questions, play flow, scoring
    training/                  # Role groups, curriculum, reviewed decks
    progress/                  # Browser progress store
    game/                      # Maps, doors, walkability
    site/                      # Site copy
  tests/                       # Vitest
public/builder/                # Architect illustration
```

Map progress, lab progress and builder progress each have their own `localStorage` key, and completed sessions also sync into the shared My Progress store.

## Scoring in short

Each exercise type has its own model. The same answers always produce the same result.

- **Map missions** score a small set of dimensions (for example containment, operations and trust) from the options you lock in at each door.
- **Architecture Defence Lab** scores the controls you chose, then shows how one attack fared on that path.
- **Secure Solution Builder** scores 15 decisions (0–15) across categories such as Security by Design, data protection, identity, cloud, AI and secure delivery.

During play, the interface does not present a certificate. The debrief is a discussion aid.

## Limitations

- Progress is local to the browser.
- There is no facilitator mode or live team session.
- There is no authentication, database or PDF export.
- Scoring cannot know your actual controls, legal duties or supplier contracts.
- Map, lab and builder are separate exercises. One does not replace another.

## Licence

MIT. See `LICENSE`.
