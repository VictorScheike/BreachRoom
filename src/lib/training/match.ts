import type { DifficultyId, MissionId, RoleId } from "@/lib/missions/types";
import type { BankQuestion } from "@/lib/training/bank";
import { questionBank, topicAliases } from "@/lib/training/bank";
import type { RoleGroupId } from "@/lib/training/groups";
import { requireRoleGroup } from "@/lib/training/groups";

export interface MatchQuery {
  roleGroup: RoleGroupId;
  specificRole?: RoleId;
  topics: readonly string[];
  technologies?: readonly string[];
  contexts?: readonly string[];
  difficulty?: DifficultyId;
  mapId: MissionId;
  learningGoals?: readonly string[];
  frameworks?: readonly string[];
}

export interface ScoredQuestion {
  question: BankQuestion;
  score: number;
}

/**
 * Matching rules (topic is mandatory):
 * +5 selected topic family match
 * +4 specific role match
 * +1 all-role / general match
 * +2 per selected technology match
 * +2 per selected context match
 * +2 selected learning goal match
 * +1 framework match
 *
 * Technologies and context only rank. They never empty the pool.
 */
export function questionMatchesTopic(question: BankQuestion, topics: readonly string[]): boolean {
  if (topics.length === 0) {
    return false;
  }
  const aliases = new Set(topics.flatMap((topic) => [...topicAliases(topic), topic]));
  return question.topicIds.some((topic) => aliases.has(topic));
}

export function isEligibleQuestion(question: BankQuestion, query: MatchQuery): boolean {
  if (!questionMatchesTopic(question, query.topics)) {
    return false;
  }
  if (!question.compatibleMaps.includes(query.mapId)) {
    return false;
  }
  if (query.difficulty && question.difficulty !== query.difficulty) {
    const beginnerOnIntermediate = query.difficulty === "Intermediate" && question.difficulty === "Beginner";
    if (!beginnerOnIntermediate) {
      return false;
    }
  }
  const group = requireRoleGroup(query.roleGroup);
  const roleMatch = query.specificRole
    ? question.roleIds.includes(query.specificRole)
    : question.roleIds.some((role) => group.roleIds.includes(role));
  const groupMatch = question.roleGroups.includes(query.roleGroup);
  return question.allRoles || roleMatch || groupMatch;
}

export function scoreQuestion(question: BankQuestion, query: MatchQuery): number {
  let score = 0;
  if (questionMatchesTopic(question, query.topics)) {
    score += 5;
  }
  if (query.specificRole && question.roleIds.includes(query.specificRole)) {
    score += 4;
  } else if (question.allRoles) {
    score += 1;
  } else if (question.roleGroups.includes(query.roleGroup)) {
    score += 4;
  }
  for (const tech of query.technologies ?? []) {
    if (question.technologies.some((item) => item.toLowerCase() === tech.toLowerCase())) {
      score += 2;
    }
  }
  for (const context of query.contexts ?? []) {
    if (question.contexts.some((item) => item.toLowerCase() === context.toLowerCase())) {
      score += 2;
    }
  }
  for (const goal of query.learningGoals ?? []) {
    if (question.learningObjectiveIds?.includes(goal)) {
      score += 2;
    }
  }
  for (const framework of query.frameworks ?? []) {
    if (question.frameworks.some((item) => item.toLowerCase().includes(framework.toLowerCase()))) {
      score += 1;
    }
  }
  return score;
}

export function eligibleQuestions(query: MatchQuery, bank = questionBank()): BankQuestion[] {
  return bank.filter((question) => isEligibleQuestion(question, query));
}

export function rankQuestions(query: MatchQuery, bank = questionBank()): ScoredQuestion[] {
  return eligibleQuestions(query, bank)
    .map((question) => ({ question, score: scoreQuestion(question, query) }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.question.id.localeCompare(right.question.id);
    });
}
