export const SCORE_DIMENSIONS = [
  "containment",
  "governance",
  "communication",
  "continuity",
  "evidence",
] as const;

export type ScoreDimension = (typeof SCORE_DIMENSIONS)[number];

export type ScoreImpacts = Partial<Record<ScoreDimension, number>>;

export type ScoreVector = Record<ScoreDimension, number>;

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  scoreImpacts: ScoreImpacts;
  rationale: string;
  tradeOffs: string;
  strengths: string[];
  potentialGaps: string[];
  recommendedFollowUp: string[];
}

export const INCIDENT_EVENT_TYPES = [
  "System alert",
  "IT update",
  "Management request",
  "Media enquiry",
  "Attacker message",
  "Recovery update",
] as const;

export const DECISION_EVENT_TYPE = "Decision recorded";

export type IncidentEventType = (typeof INCIDENT_EVENT_TYPES)[number];
export type TimelineEventType = IncidentEventType | typeof DECISION_EVENT_TYPE;

export const INCIDENT_SEVERITIES = ["SEV-1", "SEV-2", "SEV-3"] as const;
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export interface ScenarioStage {
  id: string;
  timestamp: string;
  clockTime: string;
  severity: IncidentSeverity;
  eventType: IncidentEventType;
  title: string;
  incidentUpdate: string;
  availableFacts: string[];
  knownUnknowns: string[];
  options: DecisionOption[];
}

export interface TimelineEvent {
  id: string;
  kind: "incident" | "decision";
  eventType: TimelineEventType;
  timestamp: string;
  clockTime: string;
  title: string;
  detail: string;
  isCurrent: boolean;
}

export interface OrganisationProfile {
  name: string;
  fictionalLabel: string;
  description: string;
  employeeCount: number;
  geography: string;
  technologyEnvironment: string[];
  businessDependency: string;
}

export interface Scenario {
  id: string;
  title: string;
  estimatedDuration: string;
  organisation: OrganisationProfile;
  initialSituation: string;
  playerBrief: string;
  stages: ScenarioStage[];
}

export type AppScreen = "briefing" | "simulation" | "report";

export interface RecordedDecision {
  stageId: string;
  optionId: string;
}

export interface SimulationState {
  screen: AppScreen;
  currentStageIndex: number;
  selectedOptionId: string | null;
  decisions: RecordedDecision[];
}

export type ResultLabel =
  | "Strong response"
  | "Solid response with gaps"
  | "Developing response"
  | "Major readiness gaps";

export interface ResultBand {
  min: number;
  max: number;
  label: ResultLabel;
}

export interface DecisionReviewItem {
  stageId: string;
  stageTitle: string;
  timestamp: string;
  incidentUpdate: string;
  selectedOptionId: string;
  selectedTitle: string;
  selectedDescription: string;
  rationale: string;
  tradeOffs: string;
  strengths: string[];
  potentialGaps: string[];
  recommendedFollowUp: string[];
}

export interface AfterActionReport {
  overallScore: number;
  resultLabel: ResultLabel;
  scoreCaption: string;
  categoryScores: ScoreVector;
  categoryStrengths: ScoreDimension[];
  categoryGaps: ScoreDimension[];
  timeline: DecisionReviewItem[];
  strengths: string[];
  tradeOffs: string[];
  gaps: string[];
  recommendedFollowUp: string[];
  decisionsMade: number;
}
