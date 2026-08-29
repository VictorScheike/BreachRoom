export const LAB_DIFFICULTIES = ["guided", "architect"] as const;
export type LabDifficulty = (typeof LAB_DIFFICULTIES)[number];

export const LAB_PHASES = ["build", "attack", "review"] as const;
export type LabPhase = (typeof LAB_PHASES)[number];

export const SLOT_IDS = [
  "identity",
  "model",
  "guardrails",
  "data-access",
  "agency",
  "monitoring",
  "secrets",
  "supply-chain",
] as const;
export type SlotId = (typeof SLOT_IDS)[number];

export const FIXED_NODE_IDS = [
  "claims-handler",
  "claims-portal",
  "uploaded-document",
  "ai-application",
  "claims-database",
  "external-network",
] as const;
export type FixedNodeId = (typeof FIXED_NODE_IDS)[number];

export type ArchitectureNodeId = SlotId | FixedNodeId;

export const TRUST_ZONES = ["user-input", "ai-application", "protected-systems"] as const;
export type TrustZoneId = (typeof TRUST_ZONES)[number];

export const CONTROL_AREAS = [
  "identity",
  "ai-security",
  "data-protection",
  "oversight",
  "detection",
  "supply-chain",
] as const;
export type ControlArea = (typeof CONTROL_AREAS)[number];

export const READINESS_PILLARS = ["prevention", "dataProtection", "containment", "detection"] as const;
export type ReadinessPillar = (typeof READINESS_PILLARS)[number];

export const STAGE_OUTCOMES = ["blocked", "contained", "detected", "successful"] as const;
export type StageOutcomeKind = (typeof STAGE_OUTCOMES)[number];

export const FINAL_RESULTS = [
  "architecture-holds",
  "attack-contained",
  "partial-breach",
  "architecture-breached",
] as const;
export type FinalResultKind = (typeof FINAL_RESULTS)[number];

export const ATTACK_STAGE_IDS = [
  "initial-access",
  "poisoned-document",
  "prompt-injection",
  "model-data",
  "unsafe-action",
  "detection",
] as const;
export type AttackStageId = (typeof ATTACK_STAGE_IDS)[number];

export type ComponentId = string;

export interface ReadinessVector {
  prevention: number;
  dataProtection: number;
  containment: number;
  detection: number;
}

export interface ComponentReaction {
  outcome: StageOutcomeKind;
  attackerAction: string;
  controlReaction: string;
  explanation: string;
  architectDetail: string;
}

export interface ArchitectureComponent {
  id: ComponentId;
  slotId: SlotId;
  name: string;
  icon: string;
  area: ControlArea;
  description: string;
  architectDescription: string;
  tradeOff: string;
  architectTradeOff: string;
  hint: string;
  recommended: boolean;
  difficulties: readonly LabDifficulty[];
  readiness: ReadinessVector;
  reactions: Partial<Record<AttackStageId, ComponentReaction>>;
}

export interface ArchitectureSlot {
  id: SlotId;
  name: string;
  zone: TrustZoneId;
  purpose: string;
  architectPurpose: string;
}

export interface FixedNode {
  id: FixedNodeId;
  name: string;
  zone: TrustZoneId;
  description: string;
}

export interface AttackStageDefinition {
  id: AttackStageId;
  number: number;
  name: string;
  summary: string;
  guidedDetail: string;
  architectPrompt: string;
  highlight: readonly ArchitectureNodeId[];
  controllingSlots: readonly SlotId[];
  requiresAttackerInside: boolean;
  legitimateActivity?: boolean;
}

export interface AttackDefinition {
  id: string;
  name: string;
  company: string;
  fictionalNote: string;
  tagline: string;
  scenario: string;
  stages: readonly AttackStageDefinition[];
}

export interface LabMissionDefinition {
  id: string;
  title: string;
  missionLabel: string;
  attack: AttackDefinition;
  slots: readonly ArchitectureSlot[];
  components: readonly ArchitectureComponent[];
  fixedNodes: readonly FixedNode[];
}

export type LabPlacements = Partial<Record<SlotId, ComponentId>>;

export interface ResolvedStage {
  id: AttackStageId;
  number: number;
  name: string;
  outcome: StageOutcomeKind;
  attackerAction: string;
  controlReaction: string;
  explanation: string;
  architectDetail: string;
  highlight: readonly ArchitectureNodeId[];
  chainReached: boolean;
  legitimateActivity: boolean;
  systemHealth: number;
  dataExposure: "none" | "internal" | "external";
  attackerProgress: number;
}

export interface ArchitectureReview {
  strengths: readonly string[];
  weaknesses: readonly string[];
  dataExposed: string;
  blockedControls: readonly string[];
  failedControls: readonly string[];
  bestDecision: string;
  mostImportantImprovement: string;
  residualRisk: string;
  businessTradeOffs: string;
  defenceInDepth: string;
  nextSteps: readonly string[];
  mappings: readonly { label: string; note: string }[];
}

export interface AttackSimulation {
  stages: readonly ResolvedStage[];
  result: FinalResultKind;
  resultLabel: string;
  resultSummary: string;
  review: ArchitectureReview;
  score: number;
}

export interface LabPersistedState {
  version: number;
  missionId: string;
  difficulty: LabDifficulty;
  placements: LabPlacements;
  phase: LabPhase;
  revealedStageCount: number;
  attempts: number;
  lastResult: FinalResultKind | null;
  bestResult: FinalResultKind | null;
  bestScore: number | null;
}
