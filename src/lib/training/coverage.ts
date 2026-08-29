import { PLAYTHROUGH_LENGTH } from "@/lib/missions/types";
import type { DifficultyId, MissionId } from "@/lib/missions/types";
import { ROLE_GROUPS, type RoleGroupId } from "@/lib/training/groups";
import { technologiesForRole } from "@/lib/training/availability";
import { CONTEXT_IDS, type ContextId, type TechnologyId } from "@/lib/training/ids";
import { reviewedQuestionBank } from "@/lib/training/reviewed";
import { canFulfillCoverage } from "@/lib/training/selector";
import { TRAINING_TOPICS, type TrainingTopicDefinition } from "@/lib/training/topics";

export const PUBLIC_COVERAGE_MINIMUM = 8;

export interface CoverageRow {
  roleGroup: RoleGroupId;
  topicId: string;
  topicLabel: string;
  difficulty: DifficultyId;
  technologies: readonly TechnologyId[];
  contexts: readonly ContextId[];
  ready: boolean;
}

export function combinationReady(input: {
  roleGroup: RoleGroupId;
  topicId: string;
  difficulty: DifficultyId;
  technologies?: readonly TechnologyId[];
  contexts?: readonly ContextId[];
}): boolean {
  return canFulfillCoverage({
    roleGroup: input.roleGroup,
    topics: [input.topicId],
    difficulty: input.difficulty,
    technologies: input.technologies ?? [],
    contexts: input.contexts ?? [],
  });
}

export function publicTopicsForGroup(
  roleGroup: RoleGroupId,
  difficulty: DifficultyId = "Beginner",
): TrainingTopicDefinition[] {
  const suggested = TRAINING_TOPICS.filter((topic) => topic.suggestedFor.includes(roleGroup));
  const extras = TRAINING_TOPICS.filter((topic) => !topic.suggestedFor.includes(roleGroup));
  return [...suggested, ...extras].filter((topic) =>
    combinationReady({ roleGroup, topicId: topic.id, difficulty }),
  );
}

export function availableTechnologies(
  roleGroup: RoleGroupId,
  topicId: string,
  difficulty: DifficultyId,
): TechnologyId[] {
  return technologiesForRole(roleGroup).filter((technology) =>
    combinationReady({
      roleGroup,
      topicId,
      difficulty,
      technologies: [technology],
    }),
  );
}

export function availableContexts(
  roleGroup: RoleGroupId,
  topicId: string,
  difficulty: DifficultyId,
  technologies: readonly TechnologyId[] = [],
): ContextId[] {
  return CONTEXT_IDS.filter((context) =>
    combinationReady({
      roleGroup,
      topicId,
      difficulty,
      technologies,
      contexts: [context],
    }),
  );
}

export function buildCoverageMatrix(): CoverageRow[] {
  const difficulties: DifficultyId[] = ["Beginner", "Intermediate"];
  return ROLE_GROUPS.flatMap((group) =>
    TRAINING_TOPICS.flatMap((topic) =>
      difficulties.map((difficulty) => ({
        roleGroup: group.id,
        topicId: topic.id,
        topicLabel: topic.label,
        difficulty,
        technologies: availableTechnologies(group.id, topic.id, difficulty),
        contexts: availableContexts(group.id, topic.id, difficulty),
        ready: combinationReady({ roleGroup: group.id, topicId: topic.id, difficulty }),
      })),
    ),
  );
}

export function publicCombinations(): CoverageRow[] {
  return buildCoverageMatrix().filter((row) => row.ready);
}

export function topicFamilyCounts(): Record<string, number> {
  const bank = reviewedQuestionBank();
  const counts: Record<string, number> = {};
  for (const topic of TRAINING_TOPICS) {
    counts[topic.id] = bank.filter((question) =>
      question.topicTags.some((item) => topic.aliases.includes(item) || item === topic.id),
    ).length;
  }
  return counts;
}

export function assertPublicCoverage(): void {
  for (const row of publicCombinations()) {
    if (!combinationReady(row)) {
      throw new Error(`${row.roleGroup} / ${row.topicId} / ${row.difficulty} is public but cannot fill ${PLAYTHROUGH_LENGTH}`);
    }
  }
}

export function formatCoverageMatrix(rows = buildCoverageMatrix()): string {
  const header = ["Role group", "Topic", "Level", "Public", "Technologies"].join(" | ");
  const lines = rows.map((row) =>
    [
      row.roleGroup,
      row.topicLabel,
      row.difficulty === "Intermediate" ? "Challenge" : "Beginner",
      row.ready ? "yes" : "no",
      row.technologies.join(", ") || "—",
    ].join(" | "),
  );
  return [header, ...lines].join("\n");
}

export function mapIdForTopic(topicId: string): MissionId {
  const topic = TRAINING_TOPICS.find((item) => item.id === topicId);
  if (!topic) {
    throw new Error(`Unknown training topic: ${topicId}`);
  }
  return topic.mapId;
}

export interface ShownTrainingCombination {
  roleGroup: RoleGroupId;
  topicId: string;
  difficulty: DifficultyId;
  technologies: readonly TechnologyId[];
  contexts: readonly ContextId[];
}

export function shownTrainingCombinations(): ShownTrainingCombination[] {
  const rows: ShownTrainingCombination[] = [];
  for (const group of ROLE_GROUPS) {
    const difficulties: DifficultyId[] = ["Beginner", "Intermediate"];
    for (const difficulty of difficulties) {
      for (const topic of publicTopicsForGroup(group.id, difficulty)) {
        rows.push({
          roleGroup: group.id,
          topicId: topic.id,
          difficulty,
          technologies: [],
          contexts: [],
        });
        const technologies = availableTechnologies(group.id, topic.id, difficulty);
        const contexts = availableContexts(group.id, topic.id, difficulty);
        for (const technology of technologies) {
          rows.push({
            roleGroup: group.id,
            topicId: topic.id,
            difficulty,
            technologies: [technology],
            contexts: [],
          });
          const withTech = availableContexts(group.id, topic.id, difficulty, [technology]);
          for (const context of withTech) {
            rows.push({
              roleGroup: group.id,
              topicId: topic.id,
              difficulty,
              technologies: [technology],
              contexts: [context],
            });
          }
        }
        for (const context of contexts) {
          rows.push({
            roleGroup: group.id,
            topicId: topic.id,
            difficulty,
            technologies: [],
            contexts: [context],
          });
        }
      }
    }
  }
  return rows;
}
