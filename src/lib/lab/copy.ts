import type { ControlStatus, StageOutcomeKind, SystemStatus } from "./types";

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
