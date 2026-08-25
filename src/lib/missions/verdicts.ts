import { optionPoints, type PlayScore } from "@/lib/missions/scoring";
import type { AnswerOption } from "@/lib/missions/types";

export type VerdictId = "correct" | "partly-correct" | "incorrect";

export interface Verdict {
  id: VerdictId;
  label: string;
  meaning: string;
  icon: "check" | "warning" | "cross";
}

export const VERDICTS: Record<VerdictId, Verdict> = {
  correct: {
    id: "correct",
    label: "Correct",
    meaning: "This was the recommended response.",
    icon: "check",
  },
  "partly-correct": {
    id: "partly-correct",
    label: "Partly correct",
    meaning: "This helped, but important safeguards or actions were missing.",
    icon: "warning",
  },
  incorrect: {
    id: "incorrect",
    label: "Incorrect",
    meaning: "This increased the risk or failed to respond adequately.",
    icon: "cross",
  },
};

export function averageOptionScore(option: AnswerOption): number {
  const values = Object.values(option.scores);
  if (values.length === 0) {
    return 0;
  }
  return optionPoints(option.scores) / values.length;
}

export function classifyScore(average: number): VerdictId {
  const rounded = Math.round(average);
  if (rounded >= 3) {
    return "correct";
  }
  if (rounded === 2) {
    return "partly-correct";
  }
  return "incorrect";
}

export function classifyOption(option: AnswerOption): Verdict {
  return VERDICTS[classifyScore(averageOptionScore(option))];
}

export function outcomeSentence(score: PlayScore): string {
  if (score.overall >= 85) {
    return "The response stayed close to the recommended path across the mission.";
  }
  if (score.overall >= 70) {
    return "Several decisions held, but a few gaps still left avoidable risk.";
  }
  if (score.overall >= 50) {
    return "Some actions helped, yet the overall response left important exposure.";
  }
  return "Too many decisions increased risk or failed to contain the situation.";
}
