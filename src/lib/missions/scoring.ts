import {
  DIMENSION_MAX_POINTS,
  type AnswerQuality,
  type MissionDefinition,
  type OutcomeLevel,
  type RecordedChoice,
  type ScorePoints,
} from "./types";

export function pointsToPercent(points: number): number {
  return Math.round((points / DIMENSION_MAX_POINTS) * 100);
}

export function outcomeLevel(overall: number): OutcomeLevel {
  if (overall >= 85) {
    return "Resilient response";
  }
  if (overall >= 70) {
    return "Strong response with gaps";
  }
  if (overall >= 50) {
    return "Developing response";
  }
  return "High-risk response";
}

export function qualityFromPoints(total: number): AnswerQuality {
  if (total >= 8) {
    return "strong";
  }
  if (total >= 5) {
    return "defensible";
  }
  if (total >= 3) {
    return "weak";
  }
  return "high-risk";
}

export function optionPoints(scores: Record<string, ScorePoints>): number {
  return Object.values(scores).reduce<number>((sum, value) => sum + value, 0);
}

export interface DimensionScore {
  id: string;
  label: string;
  points: number;
  percent: number;
}

export interface PlayScore {
  dimensions: DimensionScore[];
  overall: number;
  level: OutcomeLevel;
}

export function scorePlaythrough(
  mission: MissionDefinition,
  choices: readonly RecordedChoice[],
): PlayScore {
  const totals: Record<string, number> = {};
  for (const dimension of mission.dimensions) {
    totals[dimension.id] = 0;
  }

  for (const choice of choices) {
    const question = mission.questions.find((item) => item.id === choice.questionId);
    const option = question?.options.find((item) => item.id === choice.optionId);
    if (!option) {
      throw new Error(`Unknown choice ${choice.questionId}/${choice.optionId}`);
    }
    for (const dimension of mission.dimensions) {
      totals[dimension.id] =
        (totals[dimension.id] ?? 0) + (option.scores[dimension.id] ?? 0);
    }
  }

  const dimensions = mission.dimensions.map((dimension) => {
    const points = totals[dimension.id] ?? 0;
    return {
      id: dimension.id,
      label: dimension.label,
      points,
      percent: pointsToPercent(points),
    };
  });

  const overall = Math.round(
    dimensions.reduce((sum, item) => sum + item.percent, 0) / dimensions.length,
  );

  return {
    dimensions,
    overall,
    level: outcomeLevel(overall),
  };
}

export const SCORING_EXPLAINER =
  "Each answer gives 0–3 points in three dimensions. Eight decisions make 24 points per dimension. The dimension score is points ÷ 24 × 100. The overall score is the rounded average of those three percentages. It is a BreachRoom simulation score, not a certification.";
