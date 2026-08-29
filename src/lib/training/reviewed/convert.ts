import type {
  AnswerOption,
  DifficultyId,
  MissionId,
  Question,
  ScorePoints,
  StoryPhase,
} from "@/lib/missions/types";
import { STORY_PHASES } from "@/lib/missions/types";
import { requireMission } from "@/lib/missions/catalog";
import type { ReviewedQuestion } from "@/lib/training/reviewed/types";

function scoresFor(
  isCorrect: boolean,
  keys: readonly string[],
): Record<string, ScorePoints> {
  const record: Record<string, ScorePoints> = {};
  keys.forEach((key, index) => {
    if (isCorrect) {
      record[key] = 3;
      return;
    }
    record[key] = index === 1 ? 1 : 0;
  });
  return record;
}

export function toPlayableQuestion(
  reviewed: ReviewedQuestion,
  mapId: MissionId,
  index: number,
): Question {
  const mission = requireMission(mapId);
  const keys = mission.dimensions.map((item) => item.id);
  const options = reviewed.options.map((option) => {
    const isCorrect = option.id === reviewed.correctOptionId;
    const playable: AnswerOption = {
      id: option.id,
      title: option.text,
      summary: "",
      quality: isCorrect ? "strong" : "high-risk",
      scores: scoresFor(isCorrect, keys),
      consequence: isCorrect
        ? reviewed.consequence
        : "This choice leaves the risk in place or makes it harder to contain later.",
      explanation: reviewed.guidance,
      recommendedAction: reviewed.options.find((item) => item.id === reviewed.correctOptionId)?.text
        ?? option.text,
      whyRecommended: reviewed.guidance,
      learningPoint: reviewed.guidance,
      npcReaction: "",
    };
    return playable;
  });
  const first = options[0];
  const second = options[1];
  const third = options[2];
  if (!first || !second || !third) {
    throw new Error(`Question ${reviewed.id} must have three options`);
  }
  const phase: StoryPhase = STORY_PHASES[index % STORY_PHASES.length] ?? "assess";
  return {
    id: reviewed.id,
    missionId: mapId,
    scenarioIds: [mission.scenarios[0]?.id ?? mapId],
    phase,
    title: reviewed.title,
    situation: reviewed.situation,
    npcLine: "",
    frameworks: reviewed.frameworks,
    options: [first, second, third],
    roleIds: reviewed.eligiblePerspectives,
    topicIds: reviewed.topicTags,
    toolIds: reviewed.technologyTags,
    difficulty: reviewed.difficulty,
    prompt: reviewed.question,
    correctOptionId: reviewed.correctOptionId,
    guidance: reviewed.guidance,
    questionConsequence: reviewed.consequence,
    sourceUrls: reviewed.sourceUrls,
    topicTags: reviewed.topicTags,
    technologyTags: reviewed.technologyTags,
    contextTags: reviewed.contextTags,
    eligiblePerspectives: reviewed.eligiblePerspectives,
  };
}

export function displayDifficulty(difficulty: DifficultyId): string {
  return difficulty === "Intermediate" ? "Challenge" : "Beginner";
}
