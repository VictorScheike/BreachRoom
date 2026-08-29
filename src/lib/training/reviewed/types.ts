import type { DifficultyId, RoleId } from "@/lib/missions/types";
import type { ContextId, TechnologyId } from "@/lib/training/ids";
import type { RoleGroupId } from "@/lib/training/groups";

export interface ReviewedOption {
  id: string;
  text: string;
}

export interface ReviewedQuestion {
  id: string;
  roleGroup: RoleGroupId;
  eligiblePerspectives: readonly RoleId[];
  difficulty: DifficultyId;
  topicTags: readonly string[];
  technologyTags: readonly TechnologyId[];
  contextTags: readonly ContextId[];
  frameworks: readonly string[];
  title: string;
  situation: string;
  question: string;
  options: readonly [ReviewedOption, ReviewedOption, ReviewedOption];
  correctOptionId: string;
  guidance: string;
  consequence: string;
  sourceUrls: readonly string[];
}
