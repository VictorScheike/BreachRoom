import type { LabPlacements } from "./types";

export const STRONG_ARCHITECTURE: LabPlacements = {
  identity: "identity-mfa-rbac",
  model: "model-private",
  guardrails: "guard-full",
  "data-access": "data-api",
  agency: "agency-human",
  monitoring: "monitor-siem",
  secrets: "secrets-vault",
  "supply-chain": "supply-protected",
};

export const MIXED_ARCHITECTURE: LabPlacements = {
  identity: "identity-password",
  model: "model-private",
  guardrails: "guard-prompt-only",
  "data-access": "data-api",
  agency: "agency-human",
  monitoring: "monitor-siem",
  secrets: "secrets-vault",
  "supply-chain": "supply-protected",
};

export const WEAK_ARCHITECTURE: LabPlacements = {
  identity: "identity-password",
  model: "model-public",
  guardrails: "guard-prompt-only",
  "data-access": "data-direct",
  agency: "agency-auto",
  monitoring: "monitor-logs",
  secrets: "secrets-config",
  "supply-chain": "supply-open",
};

export const STRONG_PREVENTION_WEAK_DETECTION: LabPlacements = {
  identity: "identity-mfa-rbac",
  model: "model-private",
  guardrails: "guard-full",
  "data-access": "data-api",
  agency: "agency-human",
  monitoring: "monitor-logs",
  secrets: "secrets-vault",
  "supply-chain": "supply-protected",
};

export const WEAK_PREVENTION_STRONG_CONTAINMENT: LabPlacements = {
  identity: "identity-password",
  model: "model-public",
  guardrails: "guard-prompt-only",
  "data-access": "data-api",
  agency: "agency-human",
  monitoring: "monitor-siem",
  secrets: "secrets-vault",
  "supply-chain": "supply-protected",
};
