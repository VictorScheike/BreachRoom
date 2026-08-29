import type { DifficultyId, MissionId, Question, RoleId, StoryPhase } from "@/lib/missions/types";
import type { RoleGroupId } from "@/lib/training/groups";
import { toPlayableQuestion } from "@/lib/training/reviewed/convert";
import { reviewedQuestionBank } from "@/lib/training/reviewed";
import type { ReviewedQuestion } from "@/lib/training/reviewed/types";
import { TRAINING_TOPICS } from "@/lib/training/topics";

export type TrainingPhase =
  | "recognise"
  | "assess"
  | "respond"
  | "escalate"
  | "recover"
  | "reflect";

export interface BankQuestion extends Question {
  roleGroups: readonly RoleGroupId[];
  allRoles: boolean;
  technologies: readonly string[];
  contexts: readonly string[];
  compatibleMaps: readonly MissionId[];
  trainingPhase: TrainingPhase;
  topicIds: readonly string[];
  roleIds: readonly RoleId[];
  difficulty: DifficultyId;
}

const PHASE_MAP: Partial<Record<StoryPhase, TrainingPhase>> = {
  start: "recognise",
  assess: "assess",
  contain: "respond",
  control: "respond",
  evidence: "escalate",
  communicate: "escalate",
  recover: "recover",
  close: "reflect",
};

export function mapForQuestion(question: ReviewedQuestion): MissionId {
  for (const tag of question.topicTags) {
    const topic = TRAINING_TOPICS.find((item) => item.id === tag || item.aliases.includes(tag));
    if (topic) {
      return topic.mapId;
    }
  }
  return "inbox-under-siege";
}

export function toBankQuestion(question: ReviewedQuestion, mapId?: MissionId, index = 0): BankQuestion {
  const map = mapId ?? mapForQuestion(question);
  const playable = toPlayableQuestion(question, map, index);
  return {
    ...playable,
    roleGroups: [question.roleGroup],
    allRoles: false,
    technologies: question.technologyTags,
    contexts: question.contextTags,
    compatibleMaps: [map],
    trainingPhase: PHASE_MAP[playable.phase] ?? "assess",
    topicIds: question.topicTags,
    roleIds: question.eligiblePerspectives,
    difficulty: question.difficulty,
  };
}

export function enrichQuestion(question: Question): BankQuestion {
  const reviewed = reviewedQuestionBank().find((item) => item.id === question.id);
  if (reviewed) {
    return toBankQuestion(reviewed, question.missionId);
  }
  return {
    ...question,
    roleGroups: [],
    allRoles: false,
    technologies: question.technologyTags ?? question.toolIds ?? [],
    contexts: question.contextTags ?? [],
    compatibleMaps: [question.missionId],
    trainingPhase: PHASE_MAP[question.phase] ?? "assess",
    topicIds: question.topicTags ?? question.topicIds ?? [],
    roleIds: question.eligiblePerspectives ?? question.roleIds ?? [],
    difficulty: question.difficulty ?? "Beginner",
  };
}

export function questionBank(): BankQuestion[] {
  return reviewedQuestionBank().map((question) => toBankQuestion(question));
}

export function questionsForMap(mapId: MissionId): BankQuestion[] {
  return questionBank().filter((question) => question.compatibleMaps.includes(mapId));
}

export function topicAliases(topicId: string): readonly string[] {
  const topic = TRAINING_TOPICS.find((item) => item.id === topicId);
  return topic?.aliases ?? [topicId];
}

export function reviewedById(id: string): ReviewedQuestion | undefined {
  return reviewedQuestionBank().find((question) => question.id === id);
}
