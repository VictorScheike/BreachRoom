import { LAB_MISSION, optionForChoice } from "./catalog";
import { hasDataImpact, resolveCampaignStages } from "./campaign";
import type {
  ArchitectureImprovement,
  ArchitectureReview,
  AttackSimulation,
  DecisionId,
  DefencePillar,
  FinalResultKind,
  LabChoices,
  ResolvedStage,
  StageOutcomeKind,
} from "./types";
import { DECISION_IDS } from "./types";

const RESULT_LABEL: Record<FinalResultKind, string> = {
  prevented: "Prevented",
  contained: "Contained",
  breached: "Breached",
};

const RESULT_RANK: Record<FinalResultKind, number> = {
  breached: 0,
  contained: 1,
  prevented: 2,
};

const PREVENTION_DECISIONS: readonly DecisionId[] = ["exposure", "identity", "gateway", "input"];
const LIMITATION_DECISIONS: readonly DecisionId[] = ["network", "secrets", "data-access", "retrieval"];

function continues(outcome: StageOutcomeKind): boolean {
  return outcome === "succeeded" || outcome === "compromised" || outcome === "limited";
}

export function simulateAttack(choices: LabChoices): AttackSimulation {
  const stages = resolveCampaignStages(choices);
  const byId = (id: ResolvedStage["id"]) => stages.find((item) => item.id === id);
  const extract = byId("extract-modify");
  const payout = byId("payout-manipulation");
  const recover = byId("contain-recover");
  const monitor = byId("monitoring");
  const ai = byId("ai-manipulation");
  const impact = hasDataImpact(stages);
  const recovered = recover?.outcome === "recovered";
  const deepHit = extract?.outcome === "succeeded" || payout?.outcome === "succeeded";

  let result: FinalResultKind = "contained";
  if (deepHit && !recovered) {
    result = "breached";
  }

  const pillars = buildPillars(choices, stages, impact, recovered);
  const score = overallScore(pillars);
  const review = buildReview(choices, stages, result, impact);

  return {
    stages,
    result,
    resultLabel: RESULT_LABEL[result],
    resultSummary: summaryFor(result, {
      recovered,
      detected: monitor?.outcome === "detected",
      aiBlocked: ai?.outcome === "blocked",
      impact,
    }),
    review,
    score,
  };
}

function summaryFor(
  result: FinalResultKind,
  flags: { recovered: boolean; detected: boolean; aiBlocked: boolean; impact: boolean },
): string {
  if (flags.aiBlocked && result === "contained") {
    if (flags.detected) {
      return "The attacker compromised an authenticated employee session and reached the Claims Portal. Layered controls limited the uploaded document and stopped the attack at the AI workflow. No unrelated claims, protected database records or payout functions were reached. Monitoring detected the activity and the session was contained.";
    }
    return "The attacker compromised an authenticated employee session and reached the Claims Portal. Layered controls limited the uploaded document and stopped the attack at the AI workflow. No unrelated claims, protected database records or payout functions were reached.";
  }
  if (result === "contained") {
    if (flags.recovered) {
      return "The stolen session reached further into the architecture. Isolation, revocation and restore reduced the lasting damage.";
    }
    if (flags.detected) {
      return "Part of the chain succeeded, then detection and containment kept the blast radius in check.";
    }
    return "The stolen session reached the Claims Portal. Later controls stopped the offensive path before protected records were rewritten.";
  }
  return flags.detected
    ? "The Claims Database was reached. Monitoring produced a usable picture, but recovery did not roll the damage back."
    : "The attacker reached protected data without a timely detection or a practised recovery path.";
}

function pillarScore(choices: LabChoices, ids: readonly DecisionId[], effect: "prevention" | "detection" | "blast" | "recovery"): number {
  if (ids.length === 0) {
    return 0;
  }
  let total = 0;
  for (const id of ids) {
    const option = optionForChoice(choices, id);
    if (!option) {
      continue;
    }
    if (effect === "prevention") {
      total += option.preventionEffect;
    } else if (effect === "detection") {
      total += option.detectionEffect;
    } else if (effect === "blast") {
      total += option.blastRadiusEffect;
    } else {
      total += option.recoveryEffect;
    }
  }
  return Math.round((total / (ids.length * 2)) * 100);
}

function buildPillars(
  choices: LabChoices,
  stages: readonly ResolvedStage[],
  impact: boolean,
  recovered: boolean,
): DefencePillar[] {
  const prevention = pillarScore(choices, PREVENTION_DECISIONS, "prevention");
  const limitation = pillarScore(choices, LIMITATION_DECISIONS, "blast");
  const detection = pillarScore(choices, ["detection"], "detection");
  const recoveryChoice = pillarScore(choices, ["recovery"], "recovery");
  const recoveryScore = impact ? (recovered ? recoveryChoice : Math.min(recoveryChoice, 50)) : 0;

  return [
    {
      id: "prevention",
      label: "Prevention",
      summary: "Whether uploads, unauthorised AI actions and API abuse were stopped after the mandatory foothold.",
      score: prevention,
      ...splitStages(stages, ["poisoned-document", "ai-manipulation", "api-call"], ["blocked", "limited"]),
    },
    {
      id: "limitation",
      label: "Blast-radius limitation",
      summary: "Whether segmentation, retrieval bounds and least privilege kept the hit on one case.",
      score: limitation,
      ...splitStages(stages, ["unrelated-claims", "extract-modify", "payout-manipulation"], ["blocked", "limited", "not-reached"]),
    },
    {
      id: "detection",
      label: "Detection",
      summary: "Whether identity, upload, AI and API events became one incident.",
      score: detection,
      ...splitStages(stages, ["monitoring"], ["detected"]),
    },
    {
      id: "recovery",
      label: "Recovery",
      summary: impact
        ? "Whether isolation, revocation and protected backups reduced lasting damage."
        : "Recovery readiness: Prepared, but not required during this incident.",
      score: recoveryScore,
      ...splitStages(stages, ["contain-recover"], impact ? ["recovered", "contained"] : ["contained", "not-required"]),
    },
  ];
}

function splitStages(
  stages: readonly ResolvedStage[],
  ids: readonly ResolvedStage["id"][],
  success: readonly ResolvedStage["outcome"][],
): { worked: string[]; failed: string[] } {
  const worked: string[] = [];
  const failed: string[] = [];
  for (const id of ids) {
    const stage = stages.find((item) => item.id === id);
    if (!stage || stage.outcome === "not-reached" || stage.outcome === "not-required") {
      continue;
    }
    const line = `${stage.name}: ${stage.choiceTitle}. ${stage.impact}`;
    if (success.includes(stage.outcome)) {
      worked.push(line);
    } else {
      failed.push(line);
    }
  }
  return { worked, failed };
}

function overallScore(pillars: readonly DefencePillar[]): number {
  if (pillars.length === 0) {
    return 0;
  }
  const weighted =
    (pillars.find((item) => item.id === "prevention")?.score ?? 0) * 0.35 +
    (pillars.find((item) => item.id === "limitation")?.score ?? 0) * 0.25 +
    (pillars.find((item) => item.id === "detection")?.score ?? 0) * 0.2 +
    (pillars.find((item) => item.id === "recovery")?.score ?? 0) * 0.2;
  return Math.round(weighted);
}

function assetReached(stages: readonly ResolvedStage[]): string {
  const payout = stages.find((item) => item.id === "payout-manipulation");
  const extract = stages.find((item) => item.id === "extract-modify");
  const unrelated = stages.find((item) => item.id === "unrelated-claims");
  const api = stages.find((item) => item.id === "api-call");
  const portal = stages.find((item) => item.id === "claims-portal");
  if (payout?.outcome === "succeeded") {
    return "Payout functions";
  }
  if (extract?.outcome === "succeeded") {
    return "Claims Database";
  }
  if (unrelated?.outcome === "succeeded") {
    return "Claims Database (unrelated records)";
  }
  if (extract?.outcome === "limited" || payout?.outcome === "limited") {
    return "Open claim in the Claims Database";
  }
  if (api?.outcome === "succeeded" || api?.outcome === "limited") {
    return "Claims API";
  }
  if (portal?.outcome === "compromised") {
    return "Claims Portal";
  }
  return "Authenticated employee session";
}

function stoppingControl(choices: LabChoices, stages: readonly ResolvedStage[]): string {
  const blocked = stages.find((item) => item.role === "offensive" && item.outcome === "blocked");
  if (blocked) {
    const option = optionForChoice(choices, blocked.testedDecisionId);
    const name = option?.mapTitle ?? blocked.choiceTitle;
    return `${name} stopped the offensive path at ${blocked.name}.`;
  }
  const limited = [...stages].reverse().find((item) => item.role === "offensive" && item.outcome === "limited");
  if (limited) {
    return `${limited.choiceTitle} limited ${limited.name}.`;
  }
  return "No control fully stopped the offensive path.";
}

function endedAt(stages: readonly ResolvedStage[]): string {
  const blocked = stages.find((item) => item.role === "offensive" && item.outcome === "blocked");
  if (blocked) {
    return blocked.name;
  }
  const lastOffensive = [...stages].reverse().find((item) => item.role === "offensive" && item.outcome !== "not-reached");
  return lastOffensive?.name ?? "Initial foothold";
}

function neverReachedAssets(stages: readonly ResolvedStage[]): string[] {
  const labels: string[] = [];
  const byId = (id: ResolvedStage["id"]) => stages.find((item) => item.id === id);
  if (byId("api-call")?.outcome === "not-reached" || byId("api-call")?.outcome === "blocked") {
    labels.push("Claims API");
  }
  if (byId("unrelated-claims")?.outcome === "not-reached" || byId("unrelated-claims")?.outcome === "blocked") {
    labels.push("Unrelated claims");
  }
  if (byId("extract-modify")?.outcome === "not-reached" || byId("extract-modify")?.outcome === "blocked") {
    labels.push("Protected database records");
  }
  if (byId("payout-manipulation")?.outcome === "not-reached" || byId("payout-manipulation")?.outcome === "blocked") {
    labels.push("Payout functions");
  }
  return labels;
}

function compromisedSystems(stages: readonly ResolvedStage[]): string[] {
  const items: string[] = [];
  if (stages.some((item) => item.id === "initial-foothold" && item.outcome === "succeeded")) {
    items.push("Authenticated employee session");
  }
  if (stages.some((item) => item.id === "claims-portal" && item.outcome === "compromised")) {
    items.push("Claims Portal");
  }
  if (stages.some((item) => item.id === "ai-manipulation" && continues(item.outcome))) {
    items.push("AI Claims App");
  }
  if (stages.some((item) => item.id === "api-call" && continues(item.outcome))) {
    items.push("Claims API");
  }
  if (hasDataImpact(stages)) {
    items.push("Claims Database");
  }
  return items;
}

function buildReview(
  choices: LabChoices,
  stages: readonly ResolvedStage[],
  result: FinalResultKind,
  impact: boolean,
): ArchitectureReview {
  const protectedItems: string[] = [];
  const exposedItems: string[] = [];
  for (const stage of stages) {
    if (stage.outcome === "not-reached" || stage.outcome === "not-required") {
      continue;
    }
    if (
      stage.outcome === "blocked" ||
      stage.outcome === "contained" ||
      stage.outcome === "detected" ||
      stage.outcome === "recovered"
    ) {
      protectedItems.push(`${stage.name}: ${stage.impact}`);
    } else if (stage.outcome === "limited") {
      protectedItems.push(`${stage.name}: limited. ${stage.impact}`);
    } else if (stage.role === "offensive") {
      exposedItems.push(`${stage.name}: ${stage.impact}`);
    }
  }

  const improvements = rankedImprovements(choices);
  const remainingRisks = DECISION_IDS.map((id) => optionForChoice(choices, id)).flatMap((option) =>
    option && option.strength !== "strong" ? [option.residualRisk] : [],
  );
  const monitor = stages.find((item) => item.id === "monitoring");
  const recover = stages.find((item) => item.id === "contain-recover");
  const detectionOccurred = monitor?.outcome === "detected";
  const recommended = improvements[0];
  const recoveryOption = optionForChoice(choices, "recovery");
  const prepared = recoveryOption?.strength === "strong" || recoveryOption?.strength === "medium";

  return {
    pillars: buildPillars(choices, stages, impact, recover?.outcome === "recovered"),
    protectedItems: protectedItems.slice(0, 8),
    exposedItems: exposedItems.slice(0, 8),
    greatestImpact: stoppingControl(choices, stages),
    defenceInDepth:
      result === "contained"
        ? "A blocked offensive step ended that path. Dependent later steps were not reached. Detection and containment ran only on activity that actually occurred."
        : "When neighbouring choices were thin — uploads, retrieval, API reach and recovery — the same chain continued into protected data.",
    recommendedImprovement: recommended
      ? `${recommended.title} ${recommended.why}`
      : "Keep treating retrieved documents as untrusted input and rehearse isolation.",
    recommendedDecisionId: recommended?.decisionId ?? "input",
    dataExposed: impact
      ? recover?.outcome === "recovered"
        ? "Claims data was changed, then restore reduced what remained."
        : "Claims data on the reached path could be read or changed."
      : "No protected database records or payout functions were reached.",
    assetReached: assetReached(stages),
    remainingRisks: remainingRisks.slice(0, 6),
    improvements,
    compromisedSystems: compromisedSystems(stages),
    neverReached: neverReachedAssets(stages),
    stoppingControl: stoppingControl(choices, stages),
    endedAt: endedAt(stages),
    detectionOccurred,
    recoveryRequired: impact,
    recoveryReadiness: impact
      ? recover?.outcome === "recovered"
        ? "Recovery ran because protected data was affected."
        : "Recovery was required because data was affected, but it did not fully restore the incident."
      : prepared
        ? "Recovery readiness: Prepared, but not required during this incident."
        : "Recovery was not required. Containment controls were also thin.",
  };
}

function rankedImprovements(choices: LabChoices): ArchitectureImprovement[] {
  const ranked = DECISION_IDS.map((decisionId) => {
    const option = optionForChoice(choices, decisionId);
    const decision = LAB_MISSION.decisions.find((item) => item.id === decisionId);
    const strong = decision?.options.find((item) => item.strength === "strong");
    const gap = option ? (option.strength === "weak" ? 2 : option.strength === "medium" ? 1 : 0) : 2;
    return {
      decisionId,
      gap,
      title: strong?.title ?? decision?.area ?? decisionId,
      why: whyImprovement(decisionId),
    };
  })
    .filter((item) => item.gap > 0)
    .sort((left, right) => right.gap - left.gap);

  return ranked.slice(0, 3).map((item) => ({
    decisionId: item.decisionId,
    title: item.title,
    why: item.why,
  }));
}

function whyImprovement(decisionId: DecisionId): string {
  switch (decisionId) {
    case "exposure":
      return "Because a public Claims API is an internet-reachable target even when the portal itself looks ordinary.";
    case "identity":
      return "Because a stolen password should not become a new claims session, and RBAC should keep a stolen session low-privilege.";
    case "network":
      return "Because a foothold in the AI app should not be a straight walk to the database.";
    case "gateway":
      return "Because requests to the Claims API need authentication, validation and rate limiting on a controlled path.";
    case "secrets":
      return "Because a leaked static key works outside the application.";
    case "data-access":
      return "Because the assistant should not be able to rewrite or export the whole book.";
    case "retrieval":
      return "Because one steered prompt should not search every customer’s files.";
    case "input":
      return "Because uploaded documents are an untrusted path into the AI workflow.";
    case "detection":
      return "Because isolated logs do not become an incident in time to contain it.";
    case "recovery":
      return "Because prevention fails sometimes, and untested isolation leaves the damage in place.";
  }
}

export function compareResults(left: FinalResultKind | null, right: FinalResultKind): FinalResultKind {
  if (!left) {
    return right;
  }
  return RESULT_RANK[right] > RESULT_RANK[left] ? right : left;
}

export function resultLabel(kind: FinalResultKind): string {
  return RESULT_LABEL[kind];
}

export function optionIsStrong(optionId: string): boolean {
  return LAB_MISSION.decisions.some((decision) => decision.options.some((item) => item.id === optionId && item.strength === "strong"));
}

export { RESULT_LABEL, RESULT_RANK };
