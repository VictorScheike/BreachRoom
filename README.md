# BreachRoom

BreachRoom is an open-source educational tabletop simulator for practising cybersecurity incident decisions. The first version walks through a single fictional ransomware scenario, records eight response choices, and produces a structured after-action report.

It is designed for security, operations, communications and leadership teams who want a short, self-paced exercise without accounts, live data or attacker tooling.

## What it does

- Presents a fictional organisation, **Northstar Logistics**, and a developing ransomware incident.
- Asks the user to make one decision at each of eight chronological stages.
- Covers identification, containment, escalation, evidence, continuity, communication, supplier coordination, recovery and lessons learned.
- Calculates a deterministic **BreachRoom simulation score** across five areas.
- Shows strengths, gaps and recommended follow-up actions only after the exercise is complete.

## What it does not do

- It does not create user accounts or store exercise history.
- It does not connect to a database, AI model or external API.
- It does not use real organisation data.
- It does not include offensive security functionality, real malware, network scanning or exploit material.
- It does not provide legal advice, compliance certification, NIS2 certification, or a complete assessment of an organisation’s incident readiness.

**Educational disclaimer**

> BreachRoom is an educational tabletop simulation. It does not provide legal advice, compliance certification or a complete assessment of an organisation’s incident readiness.

The numeric result is a **BreachRoom simulation score**. It must not be described as an official maturity, compliance or security certification.

## Technology stack

- TypeScript
- Next.js App Router
- Tailwind CSS
- Zod for scenario validation
- Vitest for unit tests
- npm

The first version is a single Next.js application. Scenario data lives in typed TypeScript objects and is validated before use.

## Local installation

Requirements: Node.js 20 or later, and npm.

```bash
git clone <repository-url>
cd breachroom
npm install
```

## Development commands

```bash
npm run dev        # start the local Next.js development server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # TypeScript without emitting files
```

Open [http://localhost:3000](http://localhost:3000) while `npm run dev` is running.

## Test command

```bash
npm test
```

Tests are local unit tests. They do not use the network.

```bash
npm run test:watch
```

## Project structure

```text
src/
  app/                         # Next.js App Router entry
  components/                  # Screens and UI pieces
    LandingPage.tsx
    ScenarioBriefing.tsx
    SimulationView.tsx
    IncidentTimeline.tsx
    DecisionCard.tsx
    ProgressHeader.tsx
    AfterActionReport.tsx
    ScoreSummary.tsx
    DecisionReview.tsx
  lib/simulation/              # Scenario data, scoring, report, reducer
    types.ts
    schemas.ts
    scenario.ts
    scoring.ts
    report.ts
    reducer.ts
  tests/
    scenario.test.ts
    scoring.test.ts
    report.test.ts
```

Application state uses a reducer in `src/lib/simulation/reducer.ts`. There is no global state library.

## Scoring explanation

All weights and thresholds live in `src/lib/simulation/scoring.ts` (`SCORING_CONFIG`).

Five dimensions are scored:

| Dimension       | What it reflects                                              |
|-----------------|---------------------------------------------------------------|
| Containment     | Limiting spread and reducing immediate harm                   |
| Governance      | Escalation, decision rights and supplier coordination         |
| Communication   | Timely, accurate updates to the people who need them          |
| Continuity      | Keeping or recovering time-sensitive operations safely        |
| Evidence        | Preserving devices, logs and records for later investigation  |

Rules:

1. Each category starts at **50**.
2. Each confirmed decision adds or subtracts integer points from one or more categories.
3. Category scores are **clamped between 0 and 100**.
4. The overall score is the **rounded average** of the five category scores.
5. The same decisions always produce the same result.

Result labels:

| Overall score | Label                      |
|---------------|----------------------------|
| 80–100        | Strong response            |
| 60–79         | Solid response with gaps   |
| 40–59         | Developing response        |
| 0–39          | Major readiness gaps       |

During the live exercise the interface only shows “Assessment in progress”. Numeric scores, rationales and trade-off analysis appear in the after-action report.

A high score in one area can sit next to a gap in another. Some options are written as trade-offs rather than obviously correct or incorrect answers. No option is presented as universally correct in every real organisation.

Category strengths are recorded at **70 or above**. Category gaps are recorded **below 50**. The report also collects strengths, gaps and follow-up actions from the selected options.

## Scenario structure

The bundled scenario is **Locked Out: A Ransomware Incident**.

Northstar Logistics is a **fictional** Danish logistics company with 320 employees, serving customers across the EU. It uses Microsoft 365, Azure and an on-premises logistics platform, with parts of IT outsourced, and depends on those systems for time-sensitive deliveries.

The exercise starts at **08:15 on a Monday** and runs through eight stages:

1. Initial detection and triage
2. Containment of affected devices and systems
3. Suspected privileged-account compromise
4. Operational disruption affecting deliveries
5. Possible theft of employee or customer data
6. Communication with management, customers and media
7. Backup validation and recovery decision
8. Post-incident actions and lessons learned

Each stage has a unique id, simulated timestamp, clock time, fictional incident severity, event type, title, incident update, available facts, known unknowns, and exactly three decision options.

Event types used in the bundled scenario include System alert, IT update, Management request, Media enquiry, Attacker message and Recovery update. Confirmed choices appear on the timeline as “Decision recorded”. Incident severity (SEV-1 to SEV-3) is part of the fictional narrative and does not change with the hidden simulation score.

Each option has a unique id, title, description, score impacts, rationale, trade-offs, strengths, potential gaps and recommended follow-up actions.

Zod validates this shape, uniqueness of ids, and the presence of at least one score impact per option before the app uses the scenario.

## Adding a new scenario

The first version ships one scenario. To add another:

1. Copy the object in `src/lib/simulation/scenario.ts` into a new file, for example `src/lib/simulation/scenarios/supplier-compromise.ts`.
2. Keep the same fields: organisation profile, initial situation, player brief, and exactly eight stages with three options each.
3. Use unique stage and option ids.
4. Put score impacts only in the five known dimensions, as integers.
5. Validate with `parseScenario()` from `src/lib/simulation/schemas.ts`.
6. Point the app at the new scenario (or add a selector later) from `src/components/BreachRoomApp.tsx`.
7. Add tests that the new definition parses and that a full eight-decision path can generate a report.

Do not put live customer data, real malware, exploit steps or offensive tooling in a scenario file.

## Limitations

- One scenario only.
- No saved history; refreshing the browser resets the exercise.
- No facilitator mode or team session.
- No authentication, database or PDF export.
- Scoring is a teaching model, not a measurement of a real organisation.
- The report cannot know your actual controls, legal duties or supplier contracts.

## Roadmap

Not included in this version:

- additional ransomware scenarios
- supplier compromise scenario
- cloud account compromise scenario
- personal data breach scenario
- custom organisation profiles
- facilitator mode
- team-based exercises
- saved exercise history
- finding owners and deadlines
- evidence tracking
- NIS2-oriented scenario guidance
- PDF after-action reports
- multilingual scenarios
- scenario import and export

## Licence

MIT. See `LICENSE`.
