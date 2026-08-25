export const PLAYTHROUGH_LENGTH = 8;
export const POINTS_PER_ANSWER_MAX = 3;
export const DIMENSION_MAX_POINTS = PLAYTHROUGH_LENGTH * POINTS_PER_ANSWER_MAX;

export type MissionId = "locked-out" | "ai-forge" | "dependency-depths";

export type StoryPhase =
  | "start"
  | "assess"
  | "contain"
  | "control"
  | "evidence"
  | "communicate"
  | "recover"
  | "close";

export const STORY_PHASES: readonly StoryPhase[] = [
  "start",
  "assess",
  "contain",
  "control",
  "evidence",
  "communicate",
  "recover",
  "close",
] as const;

export type AnswerQuality = "strong" | "defensible" | "weak" | "high-risk";

export type ScorePoints = 0 | 1 | 2 | 3;

export interface MissionDimension {
  id: string;
  label: string;
}

export interface AnswerOption {
  id: string;
  title: string;
  summary: string;
  quality: AnswerQuality;
  scores: Record<string, ScorePoints>;
  consequence: string;
  explanation: string;
  recommendedAction: string;
  whyRecommended: string;
  learningPoint: string;
  npcReaction: string;
}

export interface Question {
  id: string;
  missionId: MissionId;
  scenarioIds: readonly string[];
  phase: StoryPhase;
  title: string;
  situation: string;
  npcLine: string;
  frameworks: readonly string[];
  options: readonly [AnswerOption, AnswerOption, AnswerOption];
}

export interface ScenarioVariant {
  id: string;
  title: string;
  setup: string;
}

export interface MissionDefinition {
  id: MissionId;
  title: string;
  tagline: string;
  story: string;
  learningAreas: readonly string[];
  frameworks: readonly string[];
  difficulty: "Beginner" | "Intermediate";
  environment: string;
  destination: string;
  objective: string;
  dimensions: readonly [MissionDimension, MissionDimension, MissionDimension];
  scenarios: readonly ScenarioVariant[];
  questions: readonly Question[];
}

export interface RecordedChoice {
  questionId: string;
  optionId: string;
  displayLetter: "A" | "B" | "C";
}

export type OutcomeLevel =
  | "Resilient response"
  | "Strong response with gaps"
  | "Developing response"
  | "High-risk response";
