export const BUILDER_MISSION_ID = "secure-solution-builder" as const;
export const BUILDER_QUESTION_COUNT = 15;

export const BUILDER_CATEGORY_IDS = [
  "security-by-design",
  "data-protection",
  "identity-access",
  "cloud-application",
  "ai-security",
  "secure-delivery",
] as const;

export type BuilderCategoryId = (typeof BUILDER_CATEGORY_IDS)[number];
export type BuilderOptionLetter = "A" | "B" | "C";
export type BuilderPhase = "intro" | "quiz" | "result" | "review";

export const BUILDER_VISUAL_KINDS = [
  "timeline",
  "context-cards",
  "classification",
  "funnel",
  "dataflow",
  "role-matrix",
  "secrets",
  "cloud-storage",
  "network",
  "api-layers",
  "rag-access",
  "human-review",
  "cicd",
  "supply-chain",
  "lifecycle",
] as const;

export type BuilderVisualKind = (typeof BUILDER_VISUAL_KINDS)[number];

export interface BuilderCategory {
  id: BuilderCategoryId;
  label: string;
  recommendation: string;
  questionIds: readonly string[];
}

export interface BuilderVisualNode {
  id: string;
  label: string;
  detail?: string;
  highlight?: boolean;
  warning?: boolean;
  blocked?: boolean;
}

export interface BuilderVisual {
  kind: BuilderVisualKind;
  title: string;
  nodes: readonly BuilderVisualNode[];
}

export interface BuilderOption {
  letter: BuilderOptionLetter;
  text: string;
  feedback: string;
}

export interface BuilderQuestion {
  id: string;
  number: number;
  categoryId: BuilderCategoryId;
  tags: readonly string[];
  prompt: string;
  options: readonly [BuilderOption, BuilderOption, BuilderOption];
  correctLetter: BuilderOptionLetter;
  mainPoint: string;
  architectCorrect: string;
  architectWrong: string;
  visual: BuilderVisual;
  resultRecommendation: string;
}

export interface BuilderAnswer {
  questionId: string;
  letter: BuilderOptionLetter;
}

export interface BuilderPersistedState {
  version: number;
  missionId: typeof BUILDER_MISSION_ID;
  phase: BuilderPhase;
  currentIndex: number;
  pendingLetter: BuilderOptionLetter | null;
  answers: readonly BuilderAnswer[];
  lastScore: number | null;
  bestScore: number | null;
  lastPercent: number | null;
  bestPercent: number | null;
  completed: boolean;
  completedAt: number | null;
  categoryScores: readonly BuilderCategoryScore[];
}

export interface BuilderCategoryScore {
  categoryId: BuilderCategoryId;
  correct: number;
  total: number;
}

export interface BuilderResultLevel {
  id: "foundations" | "gaps" | "strong" | "ready";
  minCorrect: number;
  maxCorrect: number;
  title: string;
  text: string;
}

export interface BuilderMissedDecision {
  question: BuilderQuestion;
  selected: BuilderOption;
  correct: BuilderOption;
  recommendation: string;
}

export interface BuilderScore {
  correct: number;
  total: number;
  percent: number;
  level: BuilderResultLevel;
  categoryScores: readonly BuilderCategoryScore[];
  recommendations: readonly string[];
  missed: readonly BuilderMissedDecision[];
}
