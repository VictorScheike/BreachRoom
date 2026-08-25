import type { ScoreVector } from "@/lib/simulation/types";

export interface HudStatus {
  containment: number;
  operations: number;
  trust: number;
}

export function hudFromScores(scores: ScoreVector): HudStatus {
  return {
    containment: scores.containment,
    operations: scores.continuity,
    trust: Math.round((scores.communication + scores.governance) / 2),
  };
}

export type ContainmentOutcome = "strong" | "mixed" | "weak";

export function containmentOutcome(overallScore: number): ContainmentOutcome {
  if (overallScore >= 70) {
    return "strong";
  }
  if (overallScore >= 50) {
    return "mixed";
  }
  return "weak";
}

export const OUTCOME_COPY: Record<
  ContainmentOutcome,
  { title: string; body: string }
> = {
  strong: {
    title: "Ransomware core contained",
    body: "Isolation, evidence and recovery held together. The core goes dark with limited extra damage.",
  },
  mixed: {
    title: "Contained, with disruption",
    body: "The core is stopped, but operations and trust will take longer to repair.",
  },
  weak: {
    title: "Late containment",
    body: "The core is eventually stopped, after wider spread, delayed decisions and heavier consequences.",
  },
};
