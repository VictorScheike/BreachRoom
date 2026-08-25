import { PLAYTHROUGH_LENGTH, type Question } from "@/lib/missions/types";
import { createSeededRandom, shuffleInPlace } from "@/lib/missions/random";
import { requireMission } from "@/lib/missions/catalog";
import type { BankQuestion } from "@/lib/training/bank";
import { hashSeed, type TrainingConfig } from "@/lib/training/config";
import { requireRoleGroup, type RoleGroupId } from "@/lib/training/groups";
import { roleGroupLabel, topicLabel } from "@/lib/training/labels";
import { rankQuestions, type MatchQuery } from "@/lib/training/match";
import { requireTrainingTopic } from "@/lib/training/topics";
import type { TrainingPhase } from "@/lib/training/bank";

export interface DeckSuccess {
  ok: true;
  config: TrainingConfig;
  questions: BankQuestion[];
  matchCount: number;
}

export interface DeckFallback {
  ok: false;
  matchCount: number;
  message: string;
  broaderTopicId: string | null;
  closestRoleGroup: RoleGroupId | null;
}

export type DeckResult = DeckSuccess | DeckFallback;

const PHASE_ORDER: readonly TrainingPhase[] = [
  "recognise",
  "assess",
  "respond",
  "escalate",
  "recover",
  "reflect",
];

const PHASE_TARGETS: Record<TrainingPhase, number> = {
  recognise: 1,
  assess: 1,
  respond: 2,
  escalate: 2,
  recover: 1,
  reflect: 1,
};

function pickFromBucket(
  bucket: BankQuestion[],
  count: number,
  random: () => number,
  used: Set<string>,
): BankQuestion[] {
  const available = bucket.filter((question) => !used.has(question.id));
  const windowSize = Math.min(available.length, Math.max(count * 3, count));
  const window = available.slice(0, windowSize);
  shuffleInPlace(window, random);
  const picked = window.slice(0, count);
  for (const question of picked) {
    used.add(question.id);
  }
  return picked;
}

function buildOrderedDeck(
  ranked: BankQuestion[],
  seed: string,
  avoidIds: ReadonlySet<string>,
): BankQuestion[] {
  const random = createSeededRandom(hashSeed(seed));
  const unusedRecent = ranked.filter((question) => !avoidIds.has(question.id));
  const pool = unusedRecent.length >= PLAYTHROUGH_LENGTH ? unusedRecent : ranked;
  const used = new Set<string>();
  const selected: BankQuestion[] = [];

  for (const phase of PHASE_ORDER) {
    const target = PHASE_TARGETS[phase];
    const bucket = pool.filter((question) => question.trainingPhase === phase);
    selected.push(...pickFromBucket(bucket, target, random, used));
  }

  if (selected.length < PLAYTHROUGH_LENGTH) {
    const remaining = pool.filter((question) => !used.has(question.id));
    for (const question of remaining) {
      if (selected.length >= PLAYTHROUGH_LENGTH) {
        break;
      }
      selected.push(question);
      used.add(question.id);
    }
  }

  const byPhase = new Map<TrainingPhase, BankQuestion[]>();
  for (const phase of PHASE_ORDER) {
    byPhase.set(phase, []);
  }
  for (const question of selected.slice(0, PLAYTHROUGH_LENGTH)) {
    byPhase.get(question.trainingPhase)?.push(question);
  }
  return PHASE_ORDER.flatMap((phase) => byPhase.get(phase) ?? []).slice(0, PLAYTHROUGH_LENGTH);
}

function trainingTitle(query: MatchQuery): string {
  const group = roleGroupLabel(query.roleGroup);
  const topic = topicLabel(query.topics[0] ?? "phishing");
  const tech = query.technologies?.[0];
  if (tech) {
    return `${group} ${topic.toLowerCase()} in ${tech}`;
  }
  return `${group}: ${topic}`;
}

export function generateDeck(
  query: MatchQuery,
  options: { avoidQuestionIds?: readonly string[]; seed?: string } = {},
): DeckResult {
  const topic = requireTrainingTopic(query.topics[0] ?? "");
  const mapId = query.mapId || topic.mapId;
  const resolved: MatchQuery = { ...query, mapId, topics: query.topics };
  const ranked = rankQuestions(resolved);
  const matchCount = ranked.length;

  if (matchCount < PLAYTHROUGH_LENGTH) {
    return {
      ok: false,
      matchCount,
      message: "There are not yet enough reviewed questions for this exact combination.",
      broaderTopicId: topic.id === "data-privacy" || topic.id === "business-continuity"
        ? topic.mapId === "inbox-under-siege"
          ? "phishing"
          : "ransomware"
        : null,
      closestRoleGroup: query.roleGroup,
    };
  }

  const seed = options.seed ?? `deck-${query.roleGroup}-${query.topics.join("-")}-0`;
  const questions = buildOrderedDeck(
    ranked.map((item) => item.question),
    seed,
    new Set(options.avoidQuestionIds ?? []),
  );

  if (questions.length !== PLAYTHROUGH_LENGTH || new Set(questions.map((item) => item.id)).size !== PLAYTHROUGH_LENGTH) {
    return {
      ok: false,
      matchCount,
      message: "There are not yet enough reviewed questions for this exact combination.",
      broaderTopicId: null,
      closestRoleGroup: query.roleGroup,
    };
  }

  const group = requireRoleGroup(query.roleGroup);
  const config: TrainingConfig = {
    roleGroup: query.roleGroup,
    specificRole: query.specificRole ?? group.defaultRole,
    topics: [...query.topics],
    technologies: [...(query.technologies ?? [])],
    contexts: [...(query.contexts ?? [])],
    difficulty: query.difficulty ?? requireMission(mapId).difficulty,
    mapId,
    seed,
    questionIds: questions.map((question) => question.id),
    title: trainingTitle(resolved),
  };

  return { ok: true, config, questions, matchCount };
}

export function questionsFromConfig(config: TrainingConfig): Question[] {
  const mission = requireMission(config.mapId);
  return config.questionIds.map((id) => {
    const question = mission.questions.find((item) => item.id === id);
    if (!question) {
      throw new Error(`Training question ${id} is not in map ${config.mapId}`);
    }
    return question;
  });
}

export function phaseCoverage(questions: readonly BankQuestion[]): Record<TrainingPhase, number> {
  const counts: Record<TrainingPhase, number> = {
    recognise: 0,
    assess: 0,
    respond: 0,
    escalate: 0,
    recover: 0,
    reflect: 0,
  };
  for (const question of questions) {
    counts[question.trainingPhase] += 1;
  }
  return counts;
}

export function hasCoherentPhases(questions: readonly BankQuestion[]): boolean {
  const counts = phaseCoverage(questions);
  const opening = counts.recognise + counts.assess;
  const middle = counts.respond + counts.escalate;
  const closing = counts.recover + counts.reflect;
  return opening >= 1 && middle >= 2 && closing >= 1;
}
