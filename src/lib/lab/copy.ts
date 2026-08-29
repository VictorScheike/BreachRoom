import type { StageOutcomeKind } from "./types";

export const OUTCOME_LABELS: Record<StageOutcomeKind, string> = {
  blocked: "BLOCKED",
  contained: "BLOCKED",
  partial: "PARTIAL",
  detected: "BLOCKED",
  successful: "EXPOSED",
};

export const DIFFICULTY_CAPTION = "Difficulty";
