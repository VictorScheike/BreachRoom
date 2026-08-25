import { ENCOUNTER_FLAVOR } from "./encounters";
import type { DecisionOption } from "@/lib/simulation/types";

export type DecisionQuality = "strong" | "risky" | "incomplete";

export interface DecisionConsequence {
  happened: string;
  why: string;
  principle: string;
  effects: string;
  quality: DecisionQuality;
}

function impactTotal(option: DecisionOption): number {
  return Object.values(option.scoreImpacts).reduce(
    (sum, value) => sum + (value ?? 0),
    0,
  );
}

export function classifyDecision(option: DecisionOption): DecisionQuality {
  const total = impactTotal(option);
  if (total >= 8) {
    return "strong";
  }
  if (total <= -2) {
    return "incomplete";
  }
  return "risky";
}

function effectLine(option: DecisionOption): string {
  const parts: string[] = [];
  const containment = option.scoreImpacts.containment ?? 0;
  const continuity = option.scoreImpacts.continuity ?? 0;
  const communication = option.scoreImpacts.communication ?? 0;
  const governance = option.scoreImpacts.governance ?? 0;

  if (containment > 0) {
    parts.push("Containment improves.");
  } else if (containment < 0) {
    parts.push("Containment is weaker.");
  }
  if (continuity > 0) {
    parts.push("Operations stay more workable.");
  } else if (continuity < 0) {
    parts.push("Operations take a harder hit.");
  }
  if (communication + governance > 0) {
    parts.push("Trust in the response holds up better.");
  } else if (communication + governance < 0) {
    parts.push("Trust in the response is strained.");
  }
  if (parts.length === 0) {
    return "The immediate picture does not change much, but the choice still shapes what happens next.";
  }
  return parts.join(" ");
}

export function buildConsequence(
  option: DecisionOption,
  stageIndex: number,
): DecisionConsequence {
  const flavor = ENCOUNTER_FLAVOR[stageIndex];
  const quality = classifyDecision(option);
  const why =
    quality === "strong"
      ? option.strengths[0] ?? option.rationale
      : option.tradeOffs;

  return {
    happened: option.rationale,
    why,
    principle: flavor?.principle ?? option.rationale,
    effects: effectLine(option),
    quality,
  };
}
