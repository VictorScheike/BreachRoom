import { createSeededRandom, shuffleInPlace } from "@/lib/missions/random";
import { PLAYTHROUGH_LENGTH } from "@/lib/missions/types";
import {
  CONTEXT_QUOTA,
  SESSION_LENGTH,
  technologyQuotas,
} from "@/lib/training/availability";
import { hashSeed } from "@/lib/training/config";
import type { ContextId, TechnologyId } from "@/lib/training/ids";
import type { RoleGroupId } from "@/lib/training/groups";
import type { DifficultyId } from "@/lib/missions/types";
import { reviewedQuestionBank } from "@/lib/training/reviewed";
import type { ReviewedQuestion } from "@/lib/training/reviewed/types";
import { TRAINING_TOPICS } from "@/lib/training/topics";

export interface SelectionQuery {
  roleGroup: RoleGroupId;
  topics: readonly string[];
  technologies?: readonly TechnologyId[];
  contexts?: readonly ContextId[];
  difficulty: DifficultyId;
}

export interface SelectionSuccess {
  ok: true;
  questions: ReviewedQuestion[];
  matchCount: number;
}

export interface SelectionFailure {
  ok: false;
  matchCount: number;
  message: string;
  reason: "insufficient-pool" | "insufficient-technology" | "insufficient-context";
}

export type SelectionResult = SelectionSuccess | SelectionFailure;

function topicAliases(topicId: string): readonly string[] {
  const topic = TRAINING_TOPICS.find((item) => item.id === topicId);
  return topic ? [...topic.aliases, topic.id] : [topicId];
}

export function matchesTopic(question: ReviewedQuestion, topics: readonly string[]): boolean {
  if (topics.length === 0) {
    return false;
  }
  const aliases = new Set(topics.flatMap((topic) => topicAliases(topic)));
  return question.topicTags.some((tag) => aliases.has(tag) || topics.includes(tag));
}

export function roleDifficultyPool(
  query: Pick<SelectionQuery, "roleGroup" | "difficulty">,
  bank = reviewedQuestionBank(),
): ReviewedQuestion[] {
  return bank.filter(
    (question) =>
      question.roleGroup === query.roleGroup && question.difficulty === query.difficulty,
  );
}

function takeUnique(
  pool: ReviewedQuestion[],
  count: number,
  used: Set<string>,
): ReviewedQuestion[] {
  const selected: ReviewedQuestion[] = [];
  for (const question of pool) {
    if (selected.length >= count) {
      break;
    }
    if (used.has(question.id)) {
      continue;
    }
    selected.push(question);
    used.add(question.id);
  }
  return selected;
}

export function canFulfillCoverage(query: SelectionQuery, bank = reviewedQuestionBank()): boolean {
  return selectReviewedQuestions(query, "coverage-check", { bank }).ok;
}

export function selectReviewedQuestions(
  query: SelectionQuery,
  seed: string,
  options: { bank?: readonly ReviewedQuestion[] } = {},
): SelectionResult {
  const bank = options.bank ?? reviewedQuestionBank();
  const random = createSeededRandom(hashSeed(seed));
  const roleDiff = shuffleInPlace([...roleDifficultyPool(query, bank)], random);
  const technologies = [...(query.technologies ?? [])];
  const context = query.contexts?.[0];
  const used = new Set<string>();
  const selected: ReviewedQuestion[] = [];

  const quotas = technologyQuotas(technologies.length);
  for (let index = 0; index < technologies.length; index += 1) {
    const technology = technologies[index];
    const quota = quotas[index] ?? 0;
    if (!technology || quota <= 0) {
      continue;
    }
    const pool = roleDiff.filter((question) => question.technologyTags.includes(technology));
    const picked = takeUnique(pool, quota, used);
    if (picked.length < quota) {
      return {
        ok: false,
        matchCount: pool.length,
        message: "Not enough reviewed questions yet",
        reason: "insufficient-technology",
      };
    }
    selected.push(...picked);
  }

  const fillNeeded = SESSION_LENGTH - selected.length;
  const topicPool = roleDiff.filter((question) => matchesTopic(question, query.topics));
  const unusedTopic = topicPool.filter((question) => !used.has(question.id));

  if (context) {
    const already = selected.filter((question) => question.contextTags.includes(context)).length;
    const stillNeed = Math.max(0, CONTEXT_QUOTA - already);
    const contextPool = unusedTopic.filter((question) => question.contextTags.includes(context));
    const contextPicked = takeUnique(contextPool, stillNeed, used);
    if (contextPicked.length < stillNeed) {
      const broader = roleDiff.filter(
        (question) => question.contextTags.includes(context) && !used.has(question.id),
      );
      const extra = takeUnique(broader, stillNeed - contextPicked.length, used);
      selected.push(...contextPicked, ...extra);
      if (selected.filter((question) => question.contextTags.includes(context)).length < CONTEXT_QUOTA) {
        return {
          ok: false,
          matchCount: contextPool.length,
          message: "Not enough reviewed questions yet",
          reason: "insufficient-context",
        };
      }
    } else {
      selected.push(...contextPicked);
    }
  }

  const remaining = SESSION_LENGTH - selected.length;
  const fill = takeUnique(
    unusedTopic.filter((question) => !used.has(question.id)),
    remaining > 0 ? remaining : 0,
    used,
  );
  selected.push(...fill);

  if (selected.length < fillNeeded && selected.length < SESSION_LENGTH) {
    const leftover = roleDiff.filter(
      (question) => matchesTopic(question, query.topics) && !used.has(question.id),
    );
    selected.push(...takeUnique(leftover, SESSION_LENGTH - selected.length, used));
  }

  if (selected.length < PLAYTHROUGH_LENGTH || new Set(selected.map((item) => item.id)).size !== PLAYTHROUGH_LENGTH) {
    return {
      ok: false,
      matchCount: topicPool.length,
      message: "Not enough reviewed questions yet",
      reason: "insufficient-pool",
    };
  }

  const ordered = shuffleInPlace(selected.slice(0, PLAYTHROUGH_LENGTH), random);
  return {
    ok: true,
    questions: ordered,
    matchCount: topicPool.length + roleDiff.filter((question) =>
      technologies.some((tech) => question.technologyTags.includes(tech)),
    ).length,
  };
}
