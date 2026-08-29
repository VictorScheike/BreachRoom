import type { DifficultyId } from "@/lib/missions/types";
import type { ContextId, TechnologyId } from "@/lib/training/ids";
import { ROLE_GROUPS, type RoleGroupId } from "@/lib/training/groups";
import { sourceUrlsFor } from "@/lib/training/reviewed/sources";
import type { ReviewedQuestion } from "@/lib/training/reviewed/types";

export interface ReviewedDraft {
  id: string;
  roleGroup: RoleGroupId;
  difficulty: DifficultyId;
  topicTags: readonly string[];
  technologyTags?: readonly TechnologyId[];
  contextTags?: readonly ContextId[];
  frameworks: readonly string[];
  title: string;
  situation: string;
  question: string;
  options: readonly [string, string, string];
  correct: "a" | "b" | "c";
  guidance: string;
  consequence: string;
  sourceUrls?: readonly string[];
}

export function reviewed(draft: ReviewedDraft): ReviewedQuestion {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(draft.id)) {
    throw new Error(`Invalid question id: ${draft.id}`);
  }
  const group = ROLE_GROUPS.find((item) => item.id === draft.roleGroup);
  if (!group) {
    throw new Error(`Unknown role group: ${draft.roleGroup}`);
  }
  const letters = ["a", "b", "c"] as const;
  const options = letters.map((letter, index) => ({
    id: `${draft.id}-${letter}`,
    text: draft.options[index] ?? "",
  }));
  const first = options[0];
  const second = options[1];
  const third = options[2];
  if (!first || !second || !third) {
    throw new Error(`Question ${draft.id} must have three options`);
  }
  if (new Set(options.map((item) => item.text)).size !== 3) {
    throw new Error(`Question ${draft.id} has duplicate option text`);
  }
  const technologyTags = draft.technologyTags ?? [];
  const frameworks = draft.frameworks;
  if (frameworks.length === 0) {
    throw new Error(`Question ${draft.id} needs at least one framework`);
  }
  return {
    id: draft.id,
    roleGroup: draft.roleGroup,
    eligiblePerspectives: group.roleIds,
    difficulty: draft.difficulty,
    topicTags: draft.topicTags,
    technologyTags,
    contextTags: draft.contextTags ?? [],
    frameworks,
    title: draft.title,
    situation: draft.situation,
    question: draft.question,
    options: [first, second, third],
    correctOptionId: `${draft.id}-${draft.correct}`,
    guidance: draft.guidance,
    consequence: draft.consequence,
    sourceUrls: draft.sourceUrls ?? sourceUrlsFor(frameworks, technologyTags),
  };
}

export function reviewedBank(items: readonly ReviewedQuestion[]): ReviewedQuestion[] {
  return [...items];
}
