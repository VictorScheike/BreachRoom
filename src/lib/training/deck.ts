import { PLAYTHROUGH_LENGTH, type Question } from "@/lib/missions/types";
import { requireMission } from "@/lib/missions/catalog";
import { toBankQuestion, type BankQuestion, type TrainingPhase, reviewedById } from "@/lib/training/bank";
import { hashSeed, type TrainingConfig } from "@/lib/training/config";
import { requireRoleGroup, type RoleGroupId } from "@/lib/training/groups";
import { isContextId, isTechnologyId, type ContextId, type TechnologyId } from "@/lib/training/ids";
import { roleGroupLabel, topicLabel } from "@/lib/training/labels";
import type { MatchQuery } from "@/lib/training/match";
import { toPlayableQuestion } from "@/lib/training/reviewed/convert";
import { selectReviewedQuestions } from "@/lib/training/selector";
import { requireTrainingTopic } from "@/lib/training/topics";
import { technologyQuotas } from "@/lib/training/availability";
import { technologyLabel, contextLabel } from "@/lib/training/ids";

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

function asTechnologies(values: readonly string[] | undefined): TechnologyId[] {
  return (values ?? []).filter(isTechnologyId);
}

function asContexts(values: readonly string[] | undefined): ContextId[] {
  return (values ?? []).filter(isContextId);
}

export function coverageSummary(config: TrainingConfig): string {
  const quotas = technologyQuotas(config.technologies.length);
  const tech = config.technologies.map((id, index) => {
    const quota = quotas[index] ?? 4;
    return `${technologyLabel(id)}: at least ${quota} questions`;
  });
  const ctx = config.contexts.map((id) => `${contextLabel(id)}: at least 2 questions`);
  return [...tech, ...ctx].join(" · ");
}

function trainingTitle(query: MatchQuery): string {
  const group = roleGroupLabel(query.roleGroup);
  const topic = topicLabel(query.topics[0] ?? "phishing");
  const tech = query.technologies?.[0];
  if (tech) {
    return `${group}: ${topic} · ${technologyLabel(tech)}`;
  }
  return `${group}: ${topic}`;
}

export function generateDeck(
  query: MatchQuery,
  options: { avoidQuestionIds?: readonly string[]; seed?: string } = {},
): DeckResult {
  const topic = requireTrainingTopic(query.topics[0] ?? "");
  const mapId = query.mapId ?? topic.mapId;
  const difficulty = query.difficulty ?? "Beginner";
  const technologies = asTechnologies(query.technologies);
  const contexts = asContexts(query.contexts);
  const seed = options.seed ?? `deck-${query.roleGroup}-${query.topics.join("-")}-0`;
  const selected = selectReviewedQuestions(
    {
      roleGroup: query.roleGroup,
      topics: query.topics,
      technologies,
      contexts,
      difficulty,
    },
    seed,
  );

  if (!selected.ok) {
    return {
      ok: false,
      matchCount: selected.matchCount,
      message: selected.message,
      broaderTopicId:
        topic.id === "data-privacy" || topic.id === "business-continuity"
          ? topic.mapId === "inbox-under-siege"
            ? "phishing"
            : "ransomware"
          : null,
      closestRoleGroup: query.roleGroup,
    };
  }

  const questions = selected.questions.map((item, index) => toBankQuestion(item, mapId, index));
  if (questions.length !== PLAYTHROUGH_LENGTH || new Set(questions.map((item) => item.id)).size !== PLAYTHROUGH_LENGTH) {
    return {
      ok: false,
      matchCount: selected.matchCount,
      message: "Not enough reviewed questions yet",
      broaderTopicId: null,
      closestRoleGroup: query.roleGroup,
    };
  }

  const group = requireRoleGroup(query.roleGroup);
  const config: TrainingConfig = {
    roleGroup: query.roleGroup,
    specificRole: query.specificRole ?? group.defaultRole,
    topics: [...query.topics],
    technologies,
    contexts,
    difficulty,
    mapId,
    seed,
    questionIds: questions.map((question) => question.id),
    title: trainingTitle({ ...query, mapId, technologies, difficulty }),
  };

  return { ok: true, config, questions, matchCount: selected.matchCount };
}

export function questionsFromConfig(config: TrainingConfig): Question[] {
  return config.questionIds.map((id, index) => {
    const reviewed = reviewedById(id);
    if (!reviewed) {
      throw new Error(`Training question ${id} is not in the reviewed bank`);
    }
    return toPlayableQuestion(reviewed, config.mapId, index);
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
  return questions.length === PLAYTHROUGH_LENGTH;
}

export function requireMap(config: TrainingConfig) {
  return requireMission(config.mapId);
}

export { hashSeed };
