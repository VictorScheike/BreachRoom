import type {
  ResultBand,
  ResultLabel,
  ScoreDimension,
  ScoreImpacts,
  ScoreVector,
} from "./types";
import { SCORE_DIMENSIONS } from "./types";

export const SCORING_CONFIG = {
  initialScore: 50,
  minScore: 0,
  maxScore: 100,
  dimensions: SCORE_DIMENSIONS,
  strengthThreshold: 70,
  gapThreshold: 50,
  scoreCaption: "BreachRoom simulation score",
  resultBands: [
    { min: 80, max: 100, label: "Strong response" },
    { min: 60, max: 79, label: "Solid response with gaps" },
    { min: 40, max: 59, label: "Developing response" },
    { min: 0, max: 39, label: "Major readiness gaps" },
  ] as const satisfies readonly ResultBand[],
  dimensionLabels: {
    containment: "Containment",
    governance: "Governance",
    communication: "Communication",
    continuity: "Continuity",
    evidence: "Evidence",
  } as const satisfies Record<ScoreDimension, string>,
  dimensionSummaries: {
    containment:
      "Limiting spread and reducing immediate harm to systems and data.",
    governance:
      "Decision-making, escalation, supplier coordination and accountability.",
    communication:
      "Timely, accurate updates to management, staff, customers and other parties.",
    continuity:
      "Keeping time-sensitive operations running or recovering them safely.",
    evidence:
      "Preserving logs, devices and records that support later investigation.",
  } as const satisfies Record<ScoreDimension, string>,
  categoryStrengthNotes: {
    containment:
      "Containment choices limited further spread while the situation was still developing.",
    governance:
      "Escalation and decision ownership were treated as part of the response, not an afterthought.",
    communication:
      "Stakeholder updates were paced to known facts rather than rumour or silence.",
    continuity:
      "Operational workarounds were considered alongside technical response.",
    evidence:
      "Potential evidence was protected early enough to support later analysis.",
  } as const satisfies Record<ScoreDimension, string>,
  categoryGapNotes: {
    containment:
      "The response left more room for the incident to spread or reappear.",
    governance:
      "Roles, authority and supplier coordination were under-defined at key moments.",
    communication:
      "Messages to management, customers or the public were delayed, incomplete or premature.",
    continuity:
      "Delivery operations were either unprotected or resumed without enough safety checks.",
    evidence:
      "Logs, devices or records were at risk of being altered, overwritten or overlooked.",
  } as const satisfies Record<ScoreDimension, string>,
  categoryFollowUp: {
    containment:
      "Document containment playbooks for endpoints, identity and shared file services, including who can isolate systems.",
    governance:
      "Clarify incident roles, decision rights and outsourced IT escalation paths before the next exercise.",
    communication:
      "Prepare holding statements and approval paths for staff, customers, management and media enquiries.",
    continuity:
      "Rehearse manual delivery and warehouse procedures for logistics-platform outages.",
    evidence:
      "Agree how devices, logs and cloud audit records are preserved during an incident.",
  } as const satisfies Record<ScoreDimension, string>,
} as const;

export function createInitialScores(): ScoreVector {
  return {
    containment: SCORING_CONFIG.initialScore,
    governance: SCORING_CONFIG.initialScore,
    communication: SCORING_CONFIG.initialScore,
    continuity: SCORING_CONFIG.initialScore,
    evidence: SCORING_CONFIG.initialScore,
  };
}

export function clampScore(value: number): number {
  if (value < SCORING_CONFIG.minScore) {
    return SCORING_CONFIG.minScore;
  }
  if (value > SCORING_CONFIG.maxScore) {
    return SCORING_CONFIG.maxScore;
  }
  return value;
}

export function applyImpacts(
  scores: ScoreVector,
  impacts: ScoreImpacts,
): ScoreVector {
  const nextScores = { ...scores };

  for (const dimension of SCORE_DIMENSIONS) {
    const delta = impacts[dimension];
    if (delta === undefined) {
      continue;
    }
    nextScores[dimension] = clampScore(nextScores[dimension] + delta);
  }

  return nextScores;
}

export function calculateOverallScore(scores: ScoreVector): number {
  const total = SCORE_DIMENSIONS.reduce(
    (sum, dimension) => sum + scores[dimension],
    0,
  );
  return Math.round(total / SCORE_DIMENSIONS.length);
}

export function getResultLabel(overallScore: number): ResultLabel {
  const clamped = clampScore(overallScore);
  const band = SCORING_CONFIG.resultBands.find(
    (resultBand) => clamped >= resultBand.min && clamped <= resultBand.max,
  );

  if (!band) {
    return "Major readiness gaps";
  }

  return band.label;
}

export function identifyCategoryStrengths(
  scores: ScoreVector,
): ScoreDimension[] {
  return SCORE_DIMENSIONS.filter(
    (dimension) => scores[dimension] >= SCORING_CONFIG.strengthThreshold,
  );
}

export function identifyCategoryGaps(scores: ScoreVector): ScoreDimension[] {
  return SCORE_DIMENSIONS.filter(
    (dimension) => scores[dimension] < SCORING_CONFIG.gapThreshold,
  );
}
