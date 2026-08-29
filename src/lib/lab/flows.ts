import type { ArchitectureNodeId, TrustZoneId } from "./types";

export const ZONE_NODES: Record<TrustZoneId, readonly ArchitectureNodeId[]> = {
  "user-input": ["claims-handler", "claims-portal", "identity", "uploaded-document"],
  "ai-application": ["ai-application", "model", "guardrails", "agency", "secrets", "supply-chain"],
  "protected-systems": ["data-access", "claims-database", "monitoring", "external-network"],
};

export interface DataflowEdge {
  from: ArchitectureNodeId;
  to: ArchitectureNodeId;
  label: string;
}

export const DATAFLOWS: readonly DataflowEdge[] = [
  { from: "claims-handler", to: "claims-portal", label: "Uses" },
  { from: "claims-portal", to: "identity", label: "Authenticates" },
  { from: "claims-portal", to: "uploaded-document", label: "Upload" },
  { from: "identity", to: "ai-application", label: "Session" },
  { from: "uploaded-document", to: "guardrails", label: "Retrieved file" },
  { from: "guardrails", to: "ai-application", label: "Filtered context" },
  { from: "ai-application", to: "model", label: "Prompt" },
  { from: "ai-application", to: "secrets", label: "App identity" },
  { from: "ai-application", to: "data-access", label: "Query" },
  { from: "data-access", to: "claims-database", label: "Records" },
  { from: "ai-application", to: "agency", label: "Tool call" },
  { from: "agency", to: "external-network", label: "Export" },
  { from: "ai-application", to: "monitoring", label: "Telemetry" },
  { from: "supply-chain", to: "ai-application", label: "Release" },
];

export const NODE_LAYOUT: Record<ArchitectureNodeId, { x: number; y: number }> = {
  "claims-handler": { x: 16, y: 12 },
  "claims-portal": { x: 16, y: 34 },
  identity: { x: 16, y: 56 },
  "uploaded-document": { x: 16, y: 80 },
  "ai-application": { x: 50, y: 10 },
  model: { x: 50, y: 26 },
  guardrails: { x: 50, y: 42 },
  agency: { x: 50, y: 58 },
  secrets: { x: 50, y: 74 },
  "supply-chain": { x: 50, y: 90 },
  "data-access": { x: 84, y: 18 },
  "claims-database": { x: 84, y: 40 },
  monitoring: { x: 84, y: 62 },
  "external-network": { x: 84, y: 84 },
};
