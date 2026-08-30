import type { ControlStatus, LabDifficulty, StageOutcomeKind, SystemStatus } from "./types";

export const OUTCOME_LABELS: Record<StageOutcomeKind, string> = {
  succeeded: "SUCCEEDED",
  compromised: "COMPROMISED",
  limited: "LIMITED",
  blocked: "BLOCKED",
  detected: "DETECTED",
  contained: "CONTAINED",
  "not-reached": "NOT REACHED",
  "not-required": "NOT REQUIRED",
  recovered: "RECOVERED",
};

export const SYSTEM_STATUS_LABELS: Record<SystemStatus, string> = {
  normal: "NORMAL",
  reached: "REACHED",
  compromised: "COMPROMISED",
  protected: "PROTECTED",
  contained: "CONTAINED",
  impacted: "IMPACTED",
};

export const CONTROL_STATUS_LABELS: Record<ControlStatus, string> = {
  active: "ACTIVE",
  triggered: "TRIGGERED",
  effective: "EFFECTIVE",
  bypassed: "BYPASSED",
  failed: "FAILED",
};

export const DIFFICULTY_CAPTION = "Difficulty";

export function difficultyLabel(difficulty: LabDifficulty): string {
  return difficulty === "challenge" ? "Challenging" : "Beginner";
}

export const LAB_SETUP_BLURB =
  "Nordic Shield Insurance needs a claims system. You choose the controls. Then a stolen staff login tries to walk from the front door to the customer database.";
