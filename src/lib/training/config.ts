import type { DifficultyId, MissionId, RoleId } from "@/lib/missions/types";
import type { RoleGroupId } from "@/lib/training/groups";

export interface TrainingConfig {
  roleGroup: RoleGroupId;
  specificRole?: RoleId;
  topics: readonly string[];
  technologies: readonly string[];
  contexts: readonly string[];
  difficulty: DifficultyId;
  mapId: MissionId;
  seed: string;
  questionIds: readonly string[];
  title: string;
}

export const TRAINING_SESSION_KEY = "breachroom.training-session.v1";
export const SEEN_QUESTIONS_KEY = "breachroom.seen-questions.v1";

export function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createTrainingSeed(): string {
  const randomPart = Math.floor(Math.random() * 1_000_000_000).toString(16);
  return `tr-${Date.now().toString(16)}-${randomPart}`;
}

export function isTrainingConfig(value: unknown): value is TrainingConfig {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.roleGroup === "string" &&
    Array.isArray(record.topics) &&
    Array.isArray(record.technologies) &&
    Array.isArray(record.contexts) &&
    typeof record.difficulty === "string" &&
    typeof record.mapId === "string" &&
    typeof record.seed === "string" &&
    Array.isArray(record.questionIds) &&
    typeof record.title === "string"
  );
}
