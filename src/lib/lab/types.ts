export const LAB_DIFFICULTIES = ["guided", "challenge"] as const;
export type LabDifficulty = (typeof LAB_DIFFICULTIES)[number];

export const LAB_PHASES = ["setup", "decide", "review", "attack", "result"] as const;
export type LabPhase = (typeof LAB_PHASES)[number];

export const DECISION_IDS = [
  "exposure",
  "identity",
  "network",
  "gateway",
  "secrets",
  "data-access",
  "retrieval",
  "input",
  "detection",
  "recovery",
] as const;
export type DecisionId = (typeof DECISION_IDS)[number];

export const MAP_NODE_IDS = [
  "employee",
  "portal",
  "identity",
  "waf",
  "gateway",
  "app",
  "scanner",
  "retrieval",
  "secrets",
  "api",
  "network",
  "detection",
  "database",
  "backup",
] as const;
export type MapNodeId = (typeof MAP_NODE_IDS)[number];

export const NODE_KINDS = ["actor", "system", "control", "asset"] as const;
export type NodeKind = (typeof NODE_KINDS)[number];

export const BOARD_ZONES = ["external", "application", "protected", "secops"] as const;
export type BoardZoneId = (typeof BOARD_ZONES)[number];

export const ATTACK_BEAT_KINDS = ["entry", "travel", "result"] as const;
export type AttackBeatKind = (typeof ATTACK_BEAT_KINDS)[number];

export const ATTACK_TECHNIQUE_IDS = [
  "initial-foothold",
  "claims-portal",
  "poisoned-document",
  "ai-manipulation",
  "api-call",
  "unrelated-claims",
  "extract-modify",
  "payout-manipulation",
  "monitoring",
  "contain-recover",
] as const;
export type AttackTechniqueId = (typeof ATTACK_TECHNIQUE_IDS)[number];

export const STAGE_OUTCOMES = [
  "succeeded",
  "compromised",
  "limited",
  "blocked",
  "detected",
  "contained",
  "not-reached",
  "not-required",
  "recovered",
] as const;
export type StageOutcomeKind = (typeof STAGE_OUTCOMES)[number];

export const SYSTEM_STATUSES = ["normal", "reached", "compromised", "protected", "contained", "impacted"] as const;
export type SystemStatus = (typeof SYSTEM_STATUSES)[number];

export const CONTROL_STATUSES = ["active", "triggered", "effective", "bypassed", "failed"] as const;
export type ControlStatus = (typeof CONTROL_STATUSES)[number];

export const STAGE_ROLES = ["offensive", "detection", "response"] as const;
export type StageRole = (typeof STAGE_ROLES)[number];

export const FINAL_RESULTS = ["prevented", "contained", "breached"] as const;
export type FinalResultKind = (typeof FINAL_RESULTS)[number];

export const EFFECT_LEVELS = [0, 1, 2] as const;
export type EffectLevel = (typeof EFFECT_LEVELS)[number];

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
  architectureUpdate: string;
  riskReduced: string;
  residualRisk: string;
  recommended: boolean;
  strength: "strong" | "medium" | "weak";
  icon: string;
  mapTitle: string;
  mapDetail: string;
  addsNodes: readonly MapNodeId[];
  highlightNodes: readonly MapNodeId[];
  preventionEffect: EffectLevel;
  detectionEffect: EffectLevel;
  blastRadiusEffect: EffectLevel;
  recoveryEffect: EffectLevel;
  campaignStageIds: readonly AttackTechniqueId[];
}

export interface ArchitectureDecision {
  id: DecisionId;
  number: number;
  area: string;
  question: string;
  lookingAt: string;
  affects: string;
  layer: BoardZoneId | "all";
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
  hiddenWhen?: readonly MapNodeId[];
}

export interface AttackTechniqueDefinition {
  id: AttackTechniqueId;
  number: number;
  name: string;
  summary: string;
  role: StageRole;
  requiredAccess: string;
  target: string;
  attemptedAction: string;
  controlTested: string;
  accessIfSuccessful: string;
  nextStageIds: readonly AttackTechniqueId[];
  entryNode: MapNodeId;
  path: readonly MapNodeId[];
  primaryDecisionId: DecisionId;
  influencingDecisionIds: readonly DecisionId[];
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
  role: StageRole;
  outcome: StageOutcomeKind;
  requiredAccess: string;
  target: string;
  attemptedAction: string;
  controlTested: string;
  accessIfSuccessful: string;
  nextStageIds: readonly AttackTechniqueId[];
  attackerAction: string;
  controlResponse: string;
  explanation: string;
  impact: string;
  entryNode: MapNodeId;
  stopNode: MapNodeId;
  responsibleNode: MapNodeId;
  travelledPath: readonly MapNodeId[];
  blocked: boolean;
  isPivot: boolean;
  pivotLabel: string | null;
  testedDecisionId: DecisionId;
  influencingDecisionIds: readonly DecisionId[];
  choiceId: OptionId;
  choiceTitle: string;
  controlStatus: ControlStatus | null;
}

export interface ArchitectureImprovement {
  decisionId: DecisionId;
  title: string;
  why: string;
}

export interface DefencePillar {
  id: "prevention" | "limitation" | "detection" | "recovery";
  label: string;
  summary: string;
  worked: readonly string[];
  failed: readonly string[];
  score: number;
}

export interface ArchitectureReview {
  pillars: readonly DefencePillar[];
  protectedItems: readonly string[];
  exposedItems: readonly string[];
  greatestImpact: string;
  defenceInDepth: string;
  recommendedImprovement: string;
  recommendedDecisionId: DecisionId;
  dataExposed: string;
  assetReached: string;
  remainingRisks: readonly string[];
  improvements: readonly ArchitectureImprovement[];
  compromisedSystems: readonly string[];
  neverReached: readonly string[];
  stoppingControl: string;
  endedAt: string;
  detectionOccurred: boolean;
  recoveryRequired: boolean;
  recoveryReadiness: string;
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
