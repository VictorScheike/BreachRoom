import { z } from "zod";
import { SCORE_DIMENSIONS } from "./types";

const nonEmptyString = z.string().trim().min(1);
const nonEmptyStringList = z.array(nonEmptyString).min(1);

export const scoreImpactsSchema = z
  .object({
    containment: z.number().int().optional(),
    governance: z.number().int().optional(),
    communication: z.number().int().optional(),
    continuity: z.number().int().optional(),
    evidence: z.number().int().optional(),
  })
  .strict();

export const decisionOptionSchema = z
  .object({
    id: nonEmptyString,
    title: nonEmptyString,
    description: nonEmptyString,
    scoreImpacts: scoreImpactsSchema,
    rationale: nonEmptyString,
    tradeOffs: nonEmptyString,
    strengths: nonEmptyStringList,
    potentialGaps: nonEmptyStringList,
    recommendedFollowUp: nonEmptyStringList,
  })
  .strict();

export const incidentEventTypeSchema = z.enum([
  "System alert",
  "IT update",
  "Management request",
  "Media enquiry",
  "Attacker message",
  "Recovery update",
]);

export const incidentSeveritySchema = z.enum(["SEV-1", "SEV-2", "SEV-3"]);

export const scenarioStageSchema = z
  .object({
    id: nonEmptyString,
    timestamp: nonEmptyString,
    clockTime: z.string().regex(/^\d{2}:\d{2}$/),
    severity: incidentSeveritySchema,
    eventType: incidentEventTypeSchema,
    title: nonEmptyString,
    incidentUpdate: nonEmptyString,
    availableFacts: nonEmptyStringList,
    knownUnknowns: nonEmptyStringList,
    options: z.array(decisionOptionSchema).length(3),
  })
  .strict();

export const organisationProfileSchema = z
  .object({
    name: nonEmptyString,
    fictionalLabel: nonEmptyString,
    description: nonEmptyString,
    employeeCount: z.number().int().positive(),
    geography: nonEmptyString,
    technologyEnvironment: nonEmptyStringList,
    businessDependency: nonEmptyString,
  })
  .strict();

export const scenarioSchema = z
  .object({
    id: nonEmptyString,
    title: nonEmptyString,
    estimatedDuration: nonEmptyString,
    organisation: organisationProfileSchema,
    initialSituation: nonEmptyString,
    playerBrief: nonEmptyString,
    stages: z.array(scenarioStageSchema).length(8),
  })
  .strict()
  .superRefine((scenario, ctx) => {
    const stageIds = new Set<string>();
    const optionIds = new Set<string>();

    for (const [stageIndex, stage] of scenario.stages.entries()) {
      if (stageIds.has(stage.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate stage id: ${stage.id}`,
          path: ["stages", stageIndex, "id"],
        });
      }
      stageIds.add(stage.id);

      for (const [optionIndex, option] of stage.options.entries()) {
        if (optionIds.has(option.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate option id: ${option.id}`,
            path: ["stages", stageIndex, "options", optionIndex, "id"],
          });
        }
        optionIds.add(option.id);

        const hasImpact = SCORE_DIMENSIONS.some(
          (dimension) => option.scoreImpacts[dimension] !== undefined,
        );
        if (!hasImpact) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Option ${option.id} must affect at least one scoring dimension`,
            path: ["stages", stageIndex, "options", optionIndex, "scoreImpacts"],
          });
        }
      }
    }
  });

export type ParsedScenario = z.infer<typeof scenarioSchema>;

export function parseScenario(data: unknown): ParsedScenario {
  return scenarioSchema.parse(data);
}

export function safeParseScenario(data: unknown) {
  return scenarioSchema.safeParse(data);
}
