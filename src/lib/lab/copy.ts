import type { ControlArea, StageOutcomeKind, TrustZoneId } from "./types";

export const AREA_LABELS: Record<ControlArea, string> = {
  identity: "Identity",
  "ai-security": "AI security",
  "data-protection": "Data protection",
  oversight: "Oversight",
  detection: "Detection",
  "supply-chain": "Supply chain",
};

export const ZONE_LABELS: Record<TrustZoneId, string> = {
  "user-input": "User and Input Zone",
  "ai-application": "AI Application Zone",
  "protected-systems": "Protected Systems Zone",
};

export const OUTCOME_LABELS: Record<StageOutcomeKind, string> = {
  blocked: "Blocked",
  contained: "Contained",
  detected: "Detected",
  successful: "Successful",
};

export const HARDNESS_CAPTION = "Hardness lvl";
