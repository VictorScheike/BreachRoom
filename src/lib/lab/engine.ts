import { LAB_MISSION, optionById, optionForChoice } from "./catalog";
import type {
  ArchitectureReview,
  AttackSimulation,
  DecisionId,
  FinalResultKind,
  LabChoices,
  MapNodeId,
  ResolvedStage,
  StageOutcomeKind,
} from "./types";

const RESULT_LABEL: Record<FinalResultKind, string> = {
  prevented: "Prevented",
  contained: "Contained",
  breached: "Breached",
};

const RESULT_SCORE: Record<FinalResultKind, number> = {
  prevented: 92,
  contained: 64,
  breached: 28,
};

const RESULT_RANK: Record<FinalResultKind, number> = {
  breached: 0,
  contained: 1,
  prevented: 2,
};

function pathUntil(path: readonly MapNodeId[], stopNode: MapNodeId): MapNodeId[] {
  const index = path.indexOf(stopNode);
  if (index < 0) {
    return [...path];
  }
  return path.slice(0, index + 1);
}

export function simulateAttack(choices: LabChoices): AttackSimulation {
  const stages: ResolvedStage[] = [];
  let previousBlocked = false;

  for (const technique of LAB_MISSION.techniques) {
    let matched: {
      outcome: StageOutcomeKind;
      stopNode: MapNodeId;
      attackerAction: string;
      controlResponse: string;
      explanation: string;
      impact: string;
    } | null = null;

    for (const check of technique.checks) {
      if (choices[check.decisionId] === check.strongOptionId) {
        matched = {
          outcome: check.outcome,
          stopNode: check.stopNode,
          attackerAction: check.attackerAction,
          controlResponse: check.controlResponse,
          explanation: check.explanation,
          impact: check.impact,
        };
        break;
      }
    }

    const blocked = matched !== null && matched.outcome !== "successful";
    const stopNode = matched?.stopNode ?? technique.path[technique.path.length - 1] ?? technique.entryNode;
    const travelledPath = matched ? pathUntil(technique.path, matched.stopNode) : [...technique.path];
    const isPivot = stages.length > 0 && previousBlocked;
    const stage: ResolvedStage = {
      id: technique.id,
      number: technique.number,
      name: technique.name,
      outcome: matched?.outcome ?? "successful",
      attackerAction: matched?.attackerAction ?? technique.successAction,
      controlResponse: matched?.controlResponse ?? technique.successResponse,
      explanation: matched?.explanation ?? technique.successExplanation,
      impact: matched?.impact ?? technique.successImpact,
      entryNode: technique.entryNode,
      stopNode,
      travelledPath,
      blocked,
      isPivot,
      pivotLabel: isPivot ? "Blocked. Red Team changes technique." : null,
    };
    stages.push(stage);
    previousBlocked = blocked && stage.outcome !== "detected";
  }

  const byId = (id: ResolvedStage["id"]) => stages.find((item) => item.id === id);
  const identityHeld = byId("stolen-credentials")?.outcome === "blocked";
  const uploadHeld = byId("poisoned-document")?.outcome === "blocked";
  const injection = byId("prompt-injection");
  const api = byId("api-abuse");
  const payout = byId("payout-manipulation");
  const lateral = byId("lateral-movement");
  const detection = byId("detection");
  const injectionHeld = injection?.outcome === "blocked" || injection?.outcome === "contained";
  const apiHeld = api?.outcome === "blocked" || api?.outcome === "contained";
  const payoutHeld = payout?.outcome === "blocked";
  const detected = detection?.outcome === "detected";
  const apiSuccessful = api?.outcome === "successful";

  let result: FinalResultKind;
  if (!payoutHeld) {
    result = "breached";
  } else if (apiSuccessful && !detected) {
    result = "breached";
  } else if (apiSuccessful && detected) {
    result = "contained";
  } else if (identityHeld && uploadHeld && payoutHeld && apiHeld) {
    result = "prevented";
  } else {
    result = "contained";
  }

  const review = buildReview(choices, stages, result, {
    identityHeld,
    uploadHeld,
    injectionHeld,
    apiHeld,
    payoutHeld,
    lateralHeld: lateral?.outcome === "blocked",
    detected,
  });

  return {
    stages,
    result,
    resultLabel: RESULT_LABEL[result],
    resultSummary: summaryFor(result, { identityHeld, uploadHeld, payoutHeld, apiHeld, detected }),
    review,
    score: RESULT_SCORE[result],
  };
}

function summaryFor(
  result: FinalResultKind,
  flags: {
    identityHeld: boolean;
    uploadHeld: boolean;
    payoutHeld: boolean;
    apiHeld: boolean;
    detected: boolean;
  },
): string {
  if (result === "prevented") {
    return flags.identityHeld && flags.uploadHeld
      ? "Several techniques ended at the control that owned them. The campaign did not complete its objective."
      : "Later layers still stopped payout and bulk access. The architecture prevented the outcome the attacker wanted.";
  }
  if (result === "contained") {
    return flags.payoutHeld
      ? "Part of the chain succeeded, but high-impact actions did not complete."
      : "The campaign moved, then met a later control that limited the damage.";
  }
  return flags.detected
    ? "Sensitive actions completed. Monitoring still produced a usable picture afterwards."
    : "The attacker completed a high-impact action without a timely, joined-up detection.";
}

function buildReview(
  choices: LabChoices,
  stages: readonly ResolvedStage[],
  result: FinalResultKind,
  flags: {
    identityHeld: boolean;
    uploadHeld: boolean;
    injectionHeld: boolean;
    apiHeld: boolean;
    payoutHeld: boolean;
    lateralHeld: boolean;
    detected: boolean;
  },
): ArchitectureReview {
  const protectedItems: string[] = [];
  const exposedItems: string[] = [];
  for (const stage of stages) {
    if (stage.outcome === "blocked" || stage.outcome === "contained" || stage.outcome === "detected") {
      protectedItems.push(`${stage.name}: ${stage.impact}`);
    } else if (stage.outcome === "partial") {
      protectedItems.push(`${stage.name}: partial protection. ${stage.impact}`);
    } else {
      exposedItems.push(`${stage.name}: ${stage.impact}`);
    }
  }

  const identity = optionForChoice(choices, "identity");
  const upload = optionForChoice(choices, "input");
  const payout = optionForChoice(choices, "oversight");
  const api = optionForChoice(choices, "data-access");

  const greatestImpact = flags.payoutHeld
    ? `${payout?.title ?? "Human approval"} stopped a manipulated instruction becoming a real payout.`
    : flags.identityHeld
      ? `${identity?.title ?? "Identity"} closed the stolen-password route.`
      : flags.uploadHeld
        ? `${upload?.title ?? "The sandbox"} stopped the poisoned file.`
        : `${api?.title ?? "API permissions"} decided how far a manipulated workflow could read.`;

  const recommended = recommendedControl(flags);
  const improvement = !flags.payoutHeld
    ? "Require human approval before payout changes and customer-facing actions."
    : !flags.uploadHeld
      ? "Sandbox and sanitise uploads before the model retrieves them."
      : !flags.identityHeld
        ? "Put MFA and role-based access on the claims portal."
        : !flags.apiHeld
          ? "Restrict the Claims API to the active case and approved reads."
          : !flags.detected
            ? "Correlate identity, upload, AI and API events in a SIEM with a response playbook."
            : "Keep treating retrieved documents as untrusted input.";

  return {
    protectedItems: protectedItems.slice(0, 6),
    exposedItems: exposedItems.slice(0, 6),
    greatestImpact,
    defenceInDepth:
      result === "prevented" || result === "contained"
        ? "A blocked technique ended at that node. The next attempt was a new pivot, not a magical continuation past the control that already held."
        : "When several neighbouring choices were thin — identity, uploads, API reach and approval — the campaign had a clear run.",
    recommendedImprovement: improvement,
    recommendedDecisionId: recommended,
    dataExposed: flags.apiHeld
      ? flags.payoutHeld
        ? "No customer dataset was shown to have left through payout or bulk API access."
        : "Payout was exposed even though bulk API reads were limited."
      : "Additional claims data was reachable through the service path.",
  };
}

function recommendedControl(flags: {
  identityHeld: boolean;
  uploadHeld: boolean;
  apiHeld: boolean;
  payoutHeld: boolean;
  detected: boolean;
}): DecisionId {
  if (!flags.payoutHeld) {
    return "oversight";
  }
  if (!flags.uploadHeld) {
    return "input";
  }
  if (!flags.identityHeld) {
    return "identity";
  }
  if (!flags.apiHeld) {
    return "data-access";
  }
  if (!flags.detected) {
    return "detection";
  }
  return "model";
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
  return optionById(optionId).strength === "strong";
}

export { RESULT_LABEL, RESULT_SCORE, RESULT_RANK };
