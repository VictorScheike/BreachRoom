import { findOption, findStage, isComplete, uniqueStrings } from "./lookups";
import {
  SCORING_CONFIG,
  applyImpacts,
  calculateOverallScore,
  createInitialScores,
  getResultLabel,
  identifyCategoryGaps,
  identifyCategoryStrengths,
} from "./scoring";
import type {
  AfterActionReport,
  DecisionReviewItem,
  RecordedDecision,
  Scenario,
  ScoreVector,
} from "./types";

export function calculateScores(
  scenario: Scenario,
  decisions: readonly RecordedDecision[],
): ScoreVector {
  return decisions.reduce((scores, decision) => {
    const option = findOption(scenario, decision.stageId, decision.optionId);
    return applyImpacts(scores, option.scoreImpacts);
  }, createInitialScores());
}

export function buildDecisionReviews(
  scenario: Scenario,
  decisions: readonly RecordedDecision[],
): DecisionReviewItem[] {
  return decisions.map((decision) => {
    const stage = findStage(scenario, decision.stageId);
    const option = findOption(scenario, decision.stageId, decision.optionId);

    return {
      stageId: stage.id,
      stageTitle: stage.title,
      timestamp: stage.timestamp,
      incidentUpdate: stage.incidentUpdate,
      selectedOptionId: option.id,
      selectedTitle: option.title,
      selectedDescription: option.description,
      rationale: option.rationale,
      tradeOffs: option.tradeOffs,
      strengths: [...option.strengths],
      potentialGaps: [...option.potentialGaps],
      recommendedFollowUp: [...option.recommendedFollowUp],
    };
  });
}

export function generateReport(
  scenario: Scenario,
  decisions: readonly RecordedDecision[],
): AfterActionReport {
  if (!isComplete(scenario, decisions)) {
    throw new Error(
      `Cannot generate a report before all ${scenario.stages.length} decisions are complete`,
    );
  }

  const categoryScores = calculateScores(scenario, decisions);
  const overallScore = calculateOverallScore(categoryScores);
  const resultLabel = getResultLabel(overallScore);
  const categoryStrengths = identifyCategoryStrengths(categoryScores);
  const categoryGaps = identifyCategoryGaps(categoryScores);
  const timeline = buildDecisionReviews(scenario, decisions);

  const strengths = uniqueStrings([
    ...categoryStrengths.map(
      (dimension) => SCORING_CONFIG.categoryStrengthNotes[dimension],
    ),
    ...timeline.flatMap((item) => item.strengths),
  ]);

  const gaps = uniqueStrings([
    ...categoryGaps.map(
      (dimension) => SCORING_CONFIG.categoryGapNotes[dimension],
    ),
    ...timeline.flatMap((item) => item.potentialGaps),
  ]);

  const recommendedFollowUp = uniqueStrings([
    ...categoryGaps.map(
      (dimension) => SCORING_CONFIG.categoryFollowUp[dimension],
    ),
    ...timeline.flatMap((item) => item.recommendedFollowUp),
  ]);

  return {
    overallScore,
    resultLabel,
    scoreCaption: SCORING_CONFIG.scoreCaption,
    categoryScores,
    categoryStrengths,
    categoryGaps,
    timeline,
    strengths,
    gaps,
    recommendedFollowUp,
  };
}
