import type {
  AnswerOption,
  AnswerQuality,
  MissionId,
  Question,
  ScorePoints,
  StoryPhase,
} from "./types";

export function option(
  id: string,
  quality: AnswerQuality,
  title: string,
  summary: string,
  scores: Record<string, ScorePoints>,
  consequence: string,
  explanation: string,
  recommendedAction: string,
  whyRecommended: string,
  learningPoint: string,
  npcReaction: string,
): AnswerOption {
  return {
    id,
    title,
    summary,
    quality,
    scores,
    consequence,
    explanation,
    recommendedAction,
    whyRecommended,
    learningPoint,
    npcReaction,
  };
}

export function question(
  missionId: MissionId,
  id: string,
  phase: StoryPhase,
  scenarioIds: readonly string[],
  title: string,
  situation: string,
  npcLine: string,
  frameworks: readonly string[],
  options: readonly [AnswerOption, AnswerOption, AnswerOption],
  tags?: Partial<
    Pick<
      Question,
      | "roleIds"
      | "departmentIds"
      | "topicIds"
      | "toolIds"
      | "learningObjectiveIds"
      | "difficulty"
    >
  >,
): Question {
  return {
    id,
    missionId,
    scenarioIds,
    phase,
    title,
    situation,
    npcLine,
    frameworks,
    options,
    ...tags,
  };
}

export function scoreTriple(
  first: ScorePoints,
  second: ScorePoints,
  third: ScorePoints,
  keys: readonly [string, string, string],
): Record<string, ScorePoints> {
  return {
    [keys[0]]: first,
    [keys[1]]: second,
    [keys[2]]: third,
  };
}
