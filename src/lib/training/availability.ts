import type { RoleGroupId } from "@/lib/training/groups";
import {
  CONTEXT_IDS,
  CONTEXT_LABELS,
  TECHNOLOGY_IDS,
  TECHNOLOGY_LABELS,
  type ContextId,
  type TechnologyId,
} from "@/lib/training/ids";

export const MAX_TECHNOLOGIES = 3;
export const MAX_CONTEXTS = 1;
export const SESSION_LENGTH = 8;
export const CONTEXT_QUOTA = 2;

export const TECHNOLOGY_ROLE_MATRIX: Record<TechnologyId, readonly RoleGroupId[]> = {
  "microsoft-365": ["general-employees", "finance-hr", "it-security", "leaders-risk"],
  azure: ["developers-devops", "it-security", "leaders-risk"],
  aws: ["developers-devops", "it-security", "leaders-risk"],
  github: ["developers-devops", "it-security", "leaders-risk"],
  cicd: ["developers-devops", "it-security", "leaders-risk"],
  "ai-assistants": [
    "general-employees",
    "finance-hr",
    "developers-devops",
    "it-security",
    "leaders-risk",
  ],
};

export interface TrainingChip {
  id: TechnologyId | ContextId;
  kind: "technology" | "context";
  label: string;
  description: string;
}

export const TECHNOLOGY_CHIPS: readonly TrainingChip[] = TECHNOLOGY_IDS.map((id) => ({
  id,
  kind: "technology" as const,
  label: TECHNOLOGY_LABELS[id],
  description: "At least 4 of your 8 questions will use this technology.",
}));

export const CONTEXT_CHIPS: readonly { id: ContextId; kind: "context"; label: string; description: string }[] =
  CONTEXT_IDS.map((id) => ({
    id,
    kind: "context" as const,
    label: CONTEXT_LABELS[id],
    description: "At least 2 of your 8 questions will use this operating context.",
  }));

export const TRAINING_CHIPS: readonly TrainingChip[] = [...TECHNOLOGY_CHIPS, ...CONTEXT_CHIPS];

export function technologiesForRole(roleGroup: RoleGroupId): readonly TechnologyId[] {
  return TECHNOLOGY_IDS.filter((id) => TECHNOLOGY_ROLE_MATRIX[id].includes(roleGroup));
}

export function technologyQuotas(selectedCount: number): readonly number[] {
  if (selectedCount <= 0) {
    return [];
  }
  if (selectedCount === 1) {
    return [4];
  }
  if (selectedCount === 2) {
    return [3, 3];
  }
  return [2, 2, 2];
}

export function technologyCoverageLine(selectedCount: number): string {
  if (selectedCount <= 1) {
    return "At least 4 of your 8 questions will use this technology.";
  }
  if (selectedCount === 2) {
    return "With two technologies selected, at least 3 of your 8 questions will use each.";
  }
  return "With three technologies selected, at least 2 of your 8 questions will use each.";
}

export function contextCoverageLine(): string {
  return "At least 2 of your 8 questions will use this operating context.";
}

export function selectionLimitCopy(): string {
  return "You can include at most three technologies and one operating context. Extra selections are blocked so the session can keep the coverage it promises.";
}
