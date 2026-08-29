import { z } from "zod";
import { MISSION_LIST } from "@/lib/missions/catalog";
import type { DifficultyId, MissionId, RoleId } from "@/lib/missions/types";
import type { TrainingConfig } from "@/lib/training/config";
import { ROLE_GROUPS, requireRoleGroup, roleGroupForRole, type RoleGroupId } from "@/lib/training/groups";
import { isContextId, isTechnologyId, type ContextId, type TechnologyId } from "@/lib/training/ids";
import { TRAINING_TOPICS } from "@/lib/training/topics";
import { MAX_CONTEXTS, MAX_TECHNOLOGIES } from "@/lib/training/availability";

const MISSION_IDS = MISSION_LIST.map((item) => item.id) as [MissionId, ...MissionId[]];
const ROLE_IDS = ROLE_GROUPS.flatMap((group) => group.roleIds) as [RoleId, ...RoleId[]];
const ROLE_GROUP_IDS = ROLE_GROUPS.map((group) => group.id) as [RoleGroupId, ...RoleGroupId[]];
const TOPIC_IDS = TRAINING_TOPICS.map((item) => item.id) as [string, ...string[]];

export const difficultyParamSchema = z.enum([
  "beginner",
  "Beginner",
  "challenge",
  "Challenge",
  "intermediate",
  "Intermediate",
]);

export function parseDifficultyParam(value: string): DifficultyId {
  const parsed = difficultyParamSchema.parse(value);
  return parsed.toLowerCase() === "beginner" ? "Beginner" : "Intermediate";
}

export function difficultyParam(difficulty: DifficultyId): "beginner" | "challenge" {
  return difficulty === "Beginner" ? "beginner" : "challenge";
}

export const trainingSearchSchema = z.object({
  mission: z.enum(MISSION_IDS),
  role: z.enum(ROLE_IDS),
  training: z.literal("1"),
  topic: z.enum(TOPIC_IDS),
  tech: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    )
    .refine((items) => items.every(isTechnologyId), "Unknown technology")
    .refine((items) => items.length <= MAX_TECHNOLOGIES, "Too many technologies"),
  context: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    )
    .refine((items) => items.every(isContextId), "Unknown context")
    .refine((items) => items.length <= MAX_CONTEXTS, "Too many contexts"),
  difficulty: difficultyParamSchema,
  seed: z.string().min(1).max(80),
  group: z.enum(ROLE_GROUP_IDS).optional(),
});

export interface TrainingPlayParams {
  missionId: MissionId;
  roleId: RoleId;
  roleGroup: RoleGroupId;
  topicId: string;
  technologies: TechnologyId[];
  contexts: ContextId[];
  difficulty: DifficultyId;
  seed: string;
}

export type TrainingParamsResult =
  | { ok: true; params: TrainingPlayParams }
  | { ok: false; message: string };

export function parseTrainingSearchParams(
  search: URLSearchParams | Record<string, string | null>,
): TrainingParamsResult {
  const record =
    search instanceof URLSearchParams
      ? Object.fromEntries(search.entries())
      : Object.fromEntries(
          Object.entries(search).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
        );
  const parsed = trainingSearchSchema.safeParse(record);
  if (!parsed.success) {
    return { ok: false, message: "Unknown or incomplete training parameters." };
  }
  const roleId = parsed.data.role;
  const roleGroup = parsed.data.group ?? roleGroupForRole(roleId);
  if (parsed.data.group && parsed.data.group !== roleGroupForRole(roleId)) {
    return { ok: false, message: "Role does not belong to the selected role group." };
  }
  return {
    ok: true,
    params: {
      missionId: parsed.data.mission,
      roleId,
      roleGroup,
      topicId: parsed.data.topic,
      technologies: parsed.data.tech as TechnologyId[],
      contexts: parsed.data.context as ContextId[],
      difficulty: parseDifficultyParam(parsed.data.difficulty),
      seed: parsed.data.seed,
    },
  };
}

export function playParamsFromConfig(config: TrainingConfig): TrainingPlayParams {
  const topicId = config.topics[0];
  if (!topicId) {
    throw new Error("Training config is missing a topic");
  }
  return {
    missionId: config.mapId,
    roleId: config.specificRole ?? requireRoleGroup(config.roleGroup).defaultRole,
    roleGroup: config.roleGroup,
    topicId,
    technologies: config.technologies.filter(isTechnologyId),
    contexts: config.contexts.filter(isContextId),
    difficulty: config.difficulty,
    seed: config.seed,
  };
}

export function trainingPlayHref(params: TrainingPlayParams): string {
  const search = new URLSearchParams({
    mission: params.missionId,
    role: params.roleId,
    training: "1",
    topic: params.topicId,
    difficulty: difficultyParam(params.difficulty),
    seed: params.seed,
    group: params.roleGroup,
  });
  if (params.technologies.length > 0) {
    search.set("tech", params.technologies.join(","));
  }
  if (params.contexts.length > 0) {
    search.set("context", params.contexts.join(","));
  }
  return `/play/?${search.toString().replace(/%2C/gi, ",")}`;
}

export function searchParamsFromUnknown(
  search: URLSearchParams | { toString(): string } | Record<string, string | null>,
): URLSearchParams {
  if (search instanceof URLSearchParams) {
    return search;
  }
  if (typeof (search as { toString?: () => string }).toString === "function" && !("mission" in search)) {
    return new URLSearchParams(search.toString());
  }
  const record = search as Record<string, string | null>;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    if (value) {
      params.set(key, value);
    }
  }
  return params;
}
