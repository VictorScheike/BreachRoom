import { z } from "zod";
import {
  ATTACK_TECHNIQUE_IDS,
  DECISION_IDS,
  FINAL_RESULTS,
  LAB_DIFFICULTIES,
  LAB_PHASES,
  MAP_NODE_IDS,
  NODE_KINDS,
} from "./types";

const nonEmpty = z.string().trim().min(1);

export const architectureOptionSchema = z
  .object({
    id: nonEmpty,
    decisionId: z.enum(DECISION_IDS),
    title: nonEmpty,
    description: nonEmpty,
    challengeDescription: nonEmpty,
    tradeOff: nonEmpty,
    confirmation: nonEmpty,
    recommended: z.boolean(),
    strength: z.enum(["strong", "weak"]),
    icon: nonEmpty,
    mapTitle: nonEmpty,
    mapDetail: nonEmpty,
  })
  .strict();

export const architectureDecisionSchema = z
  .object({
    id: z.enum(DECISION_IDS),
    number: z.number().int().min(1).max(10),
    question: nonEmpty,
    nodeId: z.enum(MAP_NODE_IDS),
    options: z.tuple([architectureOptionSchema, architectureOptionSchema]),
  })
  .strict();

export const mapNodeSchema = z
  .object({
    id: z.enum(MAP_NODE_IDS),
    name: nonEmpty,
    kind: z.enum(NODE_KINDS),
    decisionId: z.union([z.enum(DECISION_IDS), z.null()]),
    description: nonEmpty,
    column: z.number().int().min(0).max(4),
    row: z.number().int().min(0).max(2),
  })
  .strict();

export const mapEdgeSchema = z
  .object({
    id: nonEmpty,
    from: z.enum(MAP_NODE_IDS),
    to: z.enum(MAP_NODE_IDS),
  })
  .strict();

export const techniqueCheckSchema = z
  .object({
    decisionId: z.enum(DECISION_IDS),
    strongOptionId: nonEmpty,
    stopNode: z.enum(MAP_NODE_IDS),
    outcome: z.enum(["blocked", "contained", "partial", "detected"]),
    attackerAction: nonEmpty,
    controlResponse: nonEmpty,
    explanation: nonEmpty,
    impact: nonEmpty,
  })
  .strict();

export const attackTechniqueSchema = z
  .object({
    id: z.enum(ATTACK_TECHNIQUE_IDS),
    number: z.number().int().min(1).max(7),
    name: nonEmpty,
    summary: nonEmpty,
    entryNode: z.enum(MAP_NODE_IDS),
    path: z.array(z.enum(MAP_NODE_IDS)).min(2),
    checks: z.array(techniqueCheckSchema).min(1),
    successAction: nonEmpty,
    successResponse: nonEmpty,
    successExplanation: nonEmpty,
    successImpact: nonEmpty,
  })
  .strict();

export const labMissionSchema = z
  .object({
    id: nonEmpty,
    title: nonEmpty,
    missionLabel: nonEmpty,
    company: nonEmpty,
    fictionalNote: nonEmpty,
    tagline: nonEmpty,
    scenario: nonEmpty,
    decisions: z.array(architectureDecisionSchema).length(10),
    nodes: z.array(mapNodeSchema).length(13),
    edges: z.array(mapEdgeSchema).min(10),
    techniques: z.array(attackTechniqueSchema).length(7),
  })
  .strict()
  .superRefine((mission, ctx) => {
    const decisionIds = new Set(mission.decisions.map((item) => item.id));
    for (const id of DECISION_IDS) {
      if (!decisionIds.has(id)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Missing decision ${id}` });
      }
    }
    const optionIds = new Set<string>();
    for (const decision of mission.decisions) {
      if (decision.options[0].decisionId !== decision.id || decision.options[1].decisionId !== decision.id) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Option parent mismatch on ${decision.id}` });
      }
      if (decision.options[0].strength === decision.options[1].strength) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${decision.id} needs one strong and one weak option` });
      }
      for (const option of decision.options) {
        if (optionIds.has(option.id)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Duplicate option ${option.id}` });
        }
        optionIds.add(option.id);
      }
    }
    for (const technique of mission.techniques) {
      for (const check of technique.checks) {
        if (!optionIds.has(check.strongOptionId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Technique ${technique.id} points at unknown option ${check.strongOptionId}`,
          });
        }
        if (!technique.path.includes(check.stopNode)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Technique ${technique.id} stop node ${check.stopNode} is not on its path`,
          });
        }
      }
    }
    if (!FINAL_RESULTS.includes("prevented") || !LAB_DIFFICULTIES.includes("guided") || !LAB_PHASES.includes("decide")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Lab enums drifted" });
    }
  });
