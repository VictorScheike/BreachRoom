import type { LabChoices } from "./types";

export const STRONG_ARCHITECTURE: LabChoices = {
  exposure: "exposure-private",
  identity: "identity-mfa",
  network: "network-segmented",
  gateway: "gateway-private",
  secrets: "secrets-vault",
  "data-access": "api-restricted",
  retrieval: "retrieval-case",
  input: "input-sandbox",
  detection: "detection-siem",
  recovery: "recovery-tested",
};

export const MIXED_ARCHITECTURE: LabChoices = {
  exposure: "exposure-direct",
  identity: "identity-password",
  network: "network-segmented",
  gateway: "gateway-private",
  secrets: "secrets-vault",
  "data-access": "api-restricted",
  retrieval: "retrieval-case",
  input: "input-typecheck",
  detection: "detection-siem",
  recovery: "recovery-tested",
};

export const WEAK_ARCHITECTURE: LabChoices = {
  exposure: "exposure-direct",
  identity: "identity-password",
  network: "network-flat",
  gateway: "gateway-token",
  secrets: "secrets-key",
  "data-access": "api-broad",
  retrieval: "retrieval-index",
  input: "input-typecheck",
  detection: "detection-logs",
  recovery: "recovery-live",
};

export const STRONG_PREVENTION_WEAK_DETECTION: LabChoices = {
  ...STRONG_ARCHITECTURE,
  detection: "detection-logs",
};

export const WEAK_PREVENTION_STRONG_CONTAINMENT: LabChoices = {
  ...WEAK_ARCHITECTURE,
  "data-access": "api-restricted",
  secrets: "secrets-vault",
  network: "network-segmented",
  detection: "detection-siem",
  recovery: "recovery-tested",
};

export const MEDIUM_ARCHITECTURE: LabChoices = {
  exposure: "exposure-waf",
  identity: "identity-device-mfa",
  network: "network-ai-only",
  gateway: "gateway-public",
  secrets: "secrets-rotated",
  "data-access": "api-active-write",
  retrieval: "retrieval-related",
  input: "input-malware",
  detection: "detection-central",
  recovery: "recovery-backups",
};
