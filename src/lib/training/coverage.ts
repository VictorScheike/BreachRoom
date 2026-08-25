import { PLAYTHROUGH_LENGTH } from "@/lib/missions/types";
import { questionBank } from "@/lib/training/bank";
import { ROLE_GROUPS, type RoleGroupId } from "@/lib/training/groups";
import { eligibleQuestions, type MatchQuery } from "@/lib/training/match";
import { TRAINING_TOPICS, type TrainingTopicDefinition } from "@/lib/training/topics";

export const PUBLIC_COVERAGE_MINIMUM = 16;
export const TOPIC_FAMILY_MINIMUM = 32;

export interface CoverageRow {
  roleGroup: RoleGroupId;
  topicId: string;
  topicLabel: string;
  eligible: number;
  technologies: readonly string[];
  phases: readonly string[];
  maps: readonly string[];
  ready: boolean;
}

export function coverageQuery(roleGroup: RoleGroupId, topic: TrainingTopicDefinition): MatchQuery {
  return {
    roleGroup,
    topics: [topic.id],
    mapId: topic.mapId,
  };
}

export function buildCoverageMatrix(): CoverageRow[] {
  const bank = questionBank();
  return ROLE_GROUPS.flatMap((group) =>
    TRAINING_TOPICS.map((topic) => {
      const eligible = eligibleQuestions(coverageQuery(group.id, topic), bank);
      const technologies = [...new Set(eligible.flatMap((question) => question.technologies))];
      const phases = [...new Set(eligible.map((question) => question.trainingPhase))];
      const maps = [...new Set(eligible.flatMap((question) => question.compatibleMaps))];
      return {
        roleGroup: group.id,
        topicId: topic.id,
        topicLabel: topic.label,
        eligible: eligible.length,
        technologies,
        phases,
        maps,
        ready: eligible.length >= PUBLIC_COVERAGE_MINIMUM,
      };
    }),
  );
}

export function publicCombinations(): CoverageRow[] {
  return buildCoverageMatrix().filter((row) => row.ready);
}

export function publicTopicsForGroup(roleGroup: RoleGroupId): TrainingTopicDefinition[] {
  const ready = new Set(
    publicCombinations()
      .filter((row) => row.roleGroup === roleGroup)
      .map((row) => row.topicId),
  );
  const suggested = TRAINING_TOPICS.filter(
    (topic) => topic.suggestedFor.includes(roleGroup) && ready.has(topic.id),
  );
  const extras = TRAINING_TOPICS.filter(
    (topic) => !topic.suggestedFor.includes(roleGroup) && ready.has(topic.id),
  );
  return [...suggested, ...extras];
}

export function topicFamilyCounts(): Record<string, number> {
  const bank = questionBank();
  const counts: Record<string, number> = {};
  for (const topic of TRAINING_TOPICS) {
    const ids = new Set(
      bank
        .filter((question) =>
          question.topicIds.some((item) => topic.aliases.includes(item) || item === topic.id),
        )
        .map((question) => question.id),
    );
    counts[topic.id] = ids.size;
  }
  return counts;
}

export function assertPublicCoverage(): void {
  const families = topicFamilyCounts();
  for (const [topicId, count] of Object.entries(families)) {
    if (["phishing", "ransomware", "ai-security", "supply-chain", "secure-development"].includes(topicId)) {
      if (count < TOPIC_FAMILY_MINIMUM) {
        throw new Error(`Topic family ${topicId} has ${count} questions; need ${TOPIC_FAMILY_MINIMUM}`);
      }
    }
  }
  for (const row of publicCombinations()) {
    if (row.eligible < PLAYTHROUGH_LENGTH) {
      throw new Error(`${row.roleGroup} / ${row.topicId} is public with only ${row.eligible} questions`);
    }
  }
}

export function formatCoverageMatrix(rows = buildCoverageMatrix()): string {
  const header = [
    "Role group",
    "Topic",
    "Eligible",
    "Technologies",
    "Phases",
    "Maps",
    "Public",
  ].join(" | ");
  const lines = rows.map((row) =>
    [
      row.roleGroup,
      row.topicLabel,
      String(row.eligible),
      row.technologies.slice(0, 4).join(", ") || "—",
      row.phases.join(", "),
      row.maps.join(", "),
      row.ready ? "yes" : "no",
    ].join(" | "),
  );
  return [header, ...lines].join("\n");
}
