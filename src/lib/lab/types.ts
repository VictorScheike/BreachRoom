export const LAB_DIFFICULTIES = ["guided", "challenge"] as const;
export type LabDifficulty = (typeof LAB_DIFFICULTIES)[number];

export const LAB_PHASES = ["setup", "decide", "review", "attack", "result"] as const;
export type LabPhase = (typeof LAB_PHASES)[number];

export const DECISION_IDS = [
  "identity",
  "input",
  "model",
  "retrieval",
  "secrets",
  "data-access",
  "oversight",
  "network",
  "supply-chain",
  "detection",
] as const;
export type DecisionId = (typeof DECISION_IDS)[number];

export const MAP_NODE_IDS = [
  "portal",
  "identity",
  "input",
  "network",
  "model",
  "app",
  "supply-chain",
  "retrieval",
  "secrets",
  "detection",
  "data-access",
  "database",
  "oversight",
] as const;
export type MapNodeId = (typeof MAP_NODE_IDS)[number];

export const NODE_KINDS = ["core", "control", "asset"] as const;
export type NodeKind = (typeof NODE_KINDS)[number];

export const BOARD_ZONES = ["user-input", "ai-services", "protected", "secops"] as const;
export type BoardZoneId = (typeof BOARD_ZONES)[number];

export const ATTACK_BEAT_KINDS = ["pivot", "entry", "travel", "result"] as const;
export type AttackBeatKind = (typeof ATTACK_BEAT_KINDS)[number];

export const ATTACK_TECHNIQUE_IDS = [
  "stolen-credentials",
  "poisoned-document",
  "prompt-injection",
  "lateral-movement",
  "api-abuse",
  "payout-manipulation",
  "detection",
] as const;
export type AttackTechniqueId = (typeof ATTACK_TECHNIQUE_IDS)[number];

export const STAGE_OUTCOMES = ["blocked", "contained", "partial", "detected", "successful"] as const;
export type StageOutcomeKind = (typeof STAGE_OUTCOMES)[number];

export const FINAL_RESULTS = ["prevented", "contained", "breached"] as const;
export type FinalResultKind = (typeof FINAL_RESULTS)[number];

export type OptionId = string;

export type LabChoices = Partial<Record<DecisionId, OptionId>>;

export interface ArchitectureOption {
  id: OptionId;
  decisionId: DecisionId;
  title: string;
  description: string;
  challengeDescription: string;
  tradeOff: string;
  confirmation: string;
  recommended: boolean;
  strength: "strong" | "medium" | "weak";
  icon: string;
  mapTitle: string;
  mapDetail: string;
}

export interface ArchitectureDecision {
  id: DecisionId;
  number: number;
  question: string;
  nodeId: MapNodeId;
  options: readonly [ArchitectureOption, ArchitectureOption, ArchitectureOption];
}

export interface MapNodeDefinition {
  id: MapNodeId;
  name: string;
  kind: NodeKind;
  decisionId: DecisionId | null;
  description: string;
  icon: string;
  zone: BoardZoneId;
  x: number;
  y: number;
  mobileX: number;
  mobileY: number;
}

export interface MapEdgeDefinition {
  id: string;
  from: MapNodeId;
  to: MapNodeId;
}

export interface TechniqueCheck {
  decisionId: DecisionId;
  strongOptionId: OptionId;
  stopNode: MapNodeId;
  outcome: Extract<StageOutcomeKind, "blocked" | "contained" | "partial" | "detected">;
  attackerAction: string;
  controlResponse: string;
  explanation: string;
  impact: string;
}

export interface AttackTechniqueDefinition {
  id: AttackTechniqueId;
  number: number;
  name: string;
  summary: string;
  entryNode: MapNodeId;
  path: readonly MapNodeId[];
  checks: readonly TechniqueCheck[];
  successAction: string;
  successResponse: string;
  successExplanation: string;
  successImpact: string;
}

export interface LabMissionDefinition {
  id: string;
  title: string;
  missionLabel: string;
  company: string;
  fictionalNote: string;
  tagline: string;
  scenario: string;
  decisions: readonly ArchitectureDecision[];
  nodes: readonly MapNodeDefinition[];
  edges: readonly MapEdgeDefinition[];
  techniques: readonly AttackTechniqueDefinition[];
}

export interface ResolvedStage {
  id: AttackTechniqueId;
  number: number;
  name: string;
  outcome: StageOutcomeKind;
  attackerAction: string;
  controlResponse: string;
  explanation: string;
  impact: string;
  entryNode: MapNodeId;
  stopNode: MapNodeId;
  travelledPath: readonly MapNodeId[];
  blocked: boolean;
  isPivot: boolean;
  pivotLabel: string | null;
  testedDecisionId: DecisionId;
  choiceId: OptionId;
  choiceTitle: string;
}

export interface ArchitectureReview {
  protectedItems: readonly string[];
  exposedItems: readonly string[];
  greatestImpact: string;
  defenceInDepth: string;
  recommendedImprovement: string;
  recommendedDecisionId: DecisionId;
  dataExposed: string;
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
  choices: LabChoices;
  currentDecisionIndex: number;
  pendingOptionId: OptionId | null;
  phase: LabPhase;
  revealedStageCount: number;
  attackBeat: number;
  paused: boolean;
  showingDecisionFeedback: boolean;
  attempts: number;
  lastResult: FinalResultKind | null;
  bestResult: FinalResultKind | null;
  bestScore: number | null;
}
