import { LAB_MISSION, optionForChoice } from "./catalog";
import { resolveCampaignStages } from "./campaign";
import type {
  ArchitectureImprovement,
  ArchitectureReview,
  AttackSimulation,
  DecisionId,
  DefencePillar,
  FinalResultKind,
  LabChoices,
  ResolvedStage,
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

export function simulateAttack(choices: LabChoices): AttackSimulation {
  const stages = resolveCampaignStages(choices);
  const byId = (id: ResolvedStage["id"]) => stages.find((item) => item.id === id);
  const stolen = byId("stolen-credentials");
  const upload = byId("poisoned-document");
  const unrelated = byId("unrelated-claims");
  const extract = byId("extract-modify");
  const recover = byId("contain-recover");
  const monitor = byId("monitoring");

  const extractHeld = extract?.outcome === "blocked";
  const recovered = recover?.outcome === "recovered";
  const stolenHeld = stolen?.outcome === "blocked";
  const uploadHeld = upload?.outcome === "blocked";
  const unrelatedOpen = unrelated?.outcome === "compromised";
  const extractOpen = extract?.outcome === "compromised";

  let result: FinalResultKind;
  if (extractOpen && !recovered) {
    result = "breached";
  } else if (extractHeld && (stolenHeld || uploadHeld) && !unrelatedOpen) {
    result = "prevented";
  } else {
    result = "contained";
  }

  const pillars = buildPillars(choices, stages);
  const score = overallScore(pillars);
  const review = buildReview(choices, stages, result);

  return {
    stages,
    result,
    resultLabel: RESULT_LABEL[result],
    resultSummary: summaryFor(result, {
      stolenHeld,
      uploadHeld,
      extractHeld,
      recovered,
      detected: monitor?.outcome === "detected",
    }),
    review,
    score,
  };
}

function summaryFor(
  result: FinalResultKind,
  flags: {
    stolenHeld: boolean;
    uploadHeld: boolean;
    extractHeld: boolean;
    recovered: boolean;
    detected: boolean;
  },
): string {
  if (result === "prevented") {
    return flags.stolenHeld && flags.uploadHeld
      ? "The architecture stopped the stolen password and the poisoned document. The campaign did not reach the records."
      : "Later layers still kept the Claims Database from being rewritten. The attacker did not complete the objective.";
  }
  if (result === "contained") {
    if (flags.recovered) {
      return "Part of the chain succeeded, then isolation, revocation or restore reduced the lasting damage.";
    }
    return flags.extractHeld
      ? "Part of the chain succeeded, but least privilege or segmentation kept the blast radius in check."
      : "The campaign moved, then a later control limited how far it could go.";
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

function buildPillars(choices: LabChoices, stages: readonly ResolvedStage[]): DefencePillar[] {
  const prevention = pillarScore(choices, PREVENTION_DECISIONS, "prevention");
  const limitation = pillarScore(choices, LIMITATION_DECISIONS, "blast");
  const detection = pillarScore(choices, ["detection"], "detection");
  const recovery = pillarScore(choices, ["recovery"], "recovery");

  return [
    {
      id: "prevention",
      label: "Prevention",
      summary: "Whether stolen credentials, hostile uploads and unauthenticated API calls were stopped.",
      score: prevention,
      ...splitStages(stages, ["stolen-credentials", "poisoned-document", "api-call"], ["blocked"]),
    },
    {
      id: "limitation",
      label: "Blast-radius limitation",
      summary: "Whether segmentation, retrieval bounds and least privilege kept the hit on one case.",
      score: limitation,
      ...splitStages(stages, ["ai-manipulation", "unrelated-claims", "extract-modify"], ["blocked", "limited"]),
    },
    {
      id: "detection",
      label: "Detection",
      summary: "Whether identity, API, AI and database events became one incident.",
      score: detection,
      ...splitStages(stages, ["monitoring"], ["detected", "limited"]),
    },
    {
      id: "recovery",
      label: "Recovery",
      summary: "Whether isolation, revocation and protected backups reduced lasting damage.",
      score: recovery,
      ...splitStages(stages, ["contain-recover"], ["recovered", "limited"]),
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
    if (!stage) {
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
  const extract = stages.find((item) => item.id === "extract-modify");
  const unrelated = stages.find((item) => item.id === "unrelated-claims");
  const api = stages.find((item) => item.id === "api-call");
  const ai = stages.find((item) => item.id === "ai-manipulation");
  const upload = stages.find((item) => item.id === "poisoned-document");
  const stolen = stages.find((item) => item.id === "stolen-credentials");
  if (extract?.outcome === "compromised") {
    return "Claims Database";
  }
  if (unrelated?.outcome === "compromised") {
    return "Claims Database (unrelated records)";
  }
  if (extract?.outcome === "limited" || unrelated?.outcome === "limited") {
    return "Open claim in the Claims Database";
  }
  if (api?.outcome === "compromised") {
    return "Claims API";
  }
  if (ai?.outcome === "compromised") {
    return "AI Claims App";
  }
  if (upload?.outcome === "compromised") {
    return "Document pipeline";
  }
  if (stolen?.outcome === "compromised") {
    return "Claims Portal";
  }
  return "No protected asset. The campaign stopped at the edge.";
}

function buildReview(
  choices: LabChoices,
  stages: readonly ResolvedStage[],
  result: FinalResultKind,
): ArchitectureReview {
  const protectedItems: string[] = [];
  const exposedItems: string[] = [];
  for (const stage of stages) {
    if (stage.outcome === "blocked" || stage.outcome === "recovered" || stage.outcome === "detected") {
      protectedItems.push(`${stage.name}: ${stage.impact}`);
    } else if (stage.outcome === "limited") {
      protectedItems.push(`${stage.name}: limited. ${stage.impact}`);
    } else {
      exposedItems.push(`${stage.name}: ${stage.impact}`);
    }
  }

  const improvements = rankedImprovements(choices);
  const remainingRisks = DECISION_IDS.map((id) => optionForChoice(choices, id)).flatMap((option) =>
    option && option.strength !== "strong" ? [option.residualRisk] : [],
  );

  const extract = stages.find((item) => item.id === "extract-modify");
  const recover = stages.find((item) => item.id === "contain-recover");
  const stolen = optionForChoice(choices, "identity");
  const upload = optionForChoice(choices, "input");
  const api = optionForChoice(choices, "data-access");

  const greatestImpact =
    extract?.outcome === "blocked"
      ? `${api?.title ?? "Database permissions"} kept the campaign off a full rewrite of the Claims Database.`
      : recover?.outcome === "recovered"
        ? `${optionForChoice(choices, "recovery")?.title ?? "Recovery"} reduced the lasting damage after the path opened.`
        : stolen?.strength === "strong"
          ? `${stolen.title} closed the stolen-password route.`
          : upload?.strength === "strong"
            ? `${upload.title} stopped the poisoned file.`
            : `${api?.title ?? "API permissions"} decided how far a steered workflow could read.`;

  const recommended = improvements[0];

  return {
    pillars: buildPillars(choices, stages),
    protectedItems: protectedItems.slice(0, 8),
    exposedItems: exposedItems.slice(0, 8),
    greatestImpact,
    defenceInDepth:
      result === "prevented" || result === "contained"
        ? "A blocked stage ended at that control. The next attempt was a new pivot, not a continuation past a layer that already held."
        : "When neighbouring choices were thin — identity, uploads, API reach and recovery — the campaign had a clear run to the records.",
    recommendedImprovement: recommended
      ? `${recommended.title} ${recommended.why}`
      : "Keep treating retrieved documents as untrusted input and rehearse isolation.",
    recommendedDecisionId: recommended?.decisionId ?? "input",
    dataExposed: extract?.outcome === "compromised"
      ? recover?.outcome === "recovered"
        ? "The Claims Database was reached, then restore reduced what remained changed."
        : "Additional claims data was reachable through the service path."
      : extract?.outcome === "limited"
        ? "The open claim could be affected. The rest of the book was harder to reach."
        : "No customer dataset was shown to have left through bulk API access.",
    assetReached: assetReached(stages),
    remainingRisks: remainingRisks.slice(0, 6),
    improvements,
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
      return "Because a stolen password should not become a working claims session.";
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
