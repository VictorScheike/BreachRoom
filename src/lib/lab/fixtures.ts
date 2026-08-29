import type { LabChoices } from "./types";

export const STRONG_ARCHITECTURE: LabChoices = {
  identity: "identity-mfa",
  input: "input-sandbox",
  model: "model-private",
  retrieval: "retrieval-case",
  secrets: "secrets-vault",
  "data-access": "api-restricted",
  oversight: "oversight-human",
  network: "network-segmented",
  "supply-chain": "supply-signed",
  detection: "detection-siem",
};

export const MIXED_ARCHITECTURE: LabChoices = {
  identity: "identity-password",
  input: "input-typecheck",
  model: "model-private",
  retrieval: "retrieval-case",
  secrets: "secrets-vault",
  "data-access": "api-restricted",
  oversight: "oversight-human",
  network: "network-segmented",
  "supply-chain": "supply-signed",
  detection: "detection-siem",
};

export const WEAK_ARCHITECTURE: LabChoices = {
  identity: "identity-password",
  input: "input-typecheck",
  model: "model-public",
  retrieval: "retrieval-index",
  secrets: "secrets-key",
  "data-access": "api-broad",
  oversight: "oversight-auto",
  network: "network-flat",
  "supply-chain": "supply-latest",
  detection: "detection-logs",
};

export const STRONG_PREVENTION_WEAK_DETECTION: LabChoices = {
  ...STRONG_ARCHITECTURE,
  detection: "detection-logs",
};

export const WEAK_PREVENTION_STRONG_CONTAINMENT: LabChoices = {
  ...WEAK_ARCHITECTURE,
  oversight: "oversight-human",
  "data-access": "api-restricted",
  secrets: "secrets-vault",
  detection: "detection-siem",
};
