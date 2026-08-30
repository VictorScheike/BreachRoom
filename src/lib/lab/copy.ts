import type { StageOutcomeKind } from "./types";

export const OUTCOME_LABELS: Record<StageOutcomeKind, string> = {
  blocked: "BLOCKED",
  detected: "DETECTED",
  limited: "LIMITED",
  compromised: "EXPOSED",
  recovered: "RECOVERED",
};

export const DIFFICULTY_CAPTION = "Difficulty";
