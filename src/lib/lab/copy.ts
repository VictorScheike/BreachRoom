import type { StageOutcomeKind } from "./types";

export const OUTCOME_LABELS: Record<StageOutcomeKind, string> = {
  blocked: "Blocked",
  contained: "Contained",
  partial: "Partial",
  detected: "Detected",
  successful: "Reached",
};

export const DIFFICULTY_CAPTION = "Difficulty";
