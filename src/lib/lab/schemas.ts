import { z } from "zod";
import {
  ATTACK_TECHNIQUE_IDS,
  BOARD_ZONES,
  DECISION_IDS,
  EFFECT_LEVELS,
  FINAL_RESULTS,
  LAB_DIFFICULTIES,
  LAB_PHASES,
  MAP_NODE_IDS,
  NODE_KINDS,
} from "./types";

const nonEmpty = z.string().trim().min(1);
const effect = z.union([z.literal(EFFECT_LEVELS[0]), z.literal(EFFECT_LEVELS[1]), z.literal(EFFECT_LEVELS[2])]);

export const architectureOptionSchema = z
  .object({
    id: nonEmpty,
    decisionId: z.enum(DECISION_IDS),
    title: nonEmpty,
    description: nonEmpty,
    challengeDescription: nonEmpty,
    tradeOff: nonEmpty,
    confirmation: nonEmpty,
    architectureUpdate: nonEmpty,
    riskReduced: nonEmpty,
    residualRisk: nonEmpty,
    recommended: z.boolean(),
    strength: z.enum(["strong", "medium", "weak"]),
    icon: nonEmpty,
    mapTitle: nonEmpty,
    mapDetail: nonEmpty,
    addsNodes: z.array(z.enum(MAP_NODE_IDS)),
    highlightNodes: z.array(z.enum(MAP_NODE_IDS)).min(1),
    preventionEffect: effect,
    detectionEffect: effect,
    blastRadiusEffect: effect,
    recoveryEffect: effect,
    campaignStageIds: z.array(z.enum(ATTACK_TECHNIQUE_IDS)).min(1),
  })
  .strict();

export const architectureDecisionSchema = z
  .object({
    id: z.enum(DECISION_IDS),
    number: z.number().int().min(1).max(10),
    area: nonEmpty,
    question: nonEmpty,
    nodeId: z.enum(MAP_NODE_IDS),
    options: z.tuple([architectureOptionSchema, architectureOptionSchema, architectureOptionSchema]),
  })
  .strict();

export const mapNodeSchema = z
  .object({
    id: z.enum(MAP_NODE_IDS),
    name: nonEmpty,
    kind: z.enum(NODE_KINDS),
    decisionId: z.union([z.enum(DECISION_IDS), z.null()]),
    description: nonEmpty,
    icon: nonEmpty,
    zone: z.enum(BOARD_ZONES),
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    mobileX: z.number().min(0).max(100),
    mobileY: z.number().min(0).max(100),
  })
  .strict();

export const mapEdgeSchema = z
  .object({
    id: nonEmpty,
    from: z.enum(MAP_NODE_IDS),
    to: z.enum(MAP_NODE_IDS),
    hiddenWhen: z.array(z.enum(MAP_NODE_IDS)).optional(),
  })
  .strict();

export const attackTechniqueSchema = z
  .object({
    id: z.enum(ATTACK_TECHNIQUE_IDS),
    number: z.number().int().min(1).max(8),
    name: nonEmpty,
    summary: nonEmpty,
    entryNode: z.enum(MAP_NODE_IDS),
    path: z.array(z.enum(MAP_NODE_IDS)).min(2),
    primaryDecisionId: z.enum(DECISION_IDS),
    influencingDecisionIds: z.array(z.enum(DECISION_IDS)),
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
    nodes: z.array(mapNodeSchema).min(13).max(16),
    edges: z.array(mapEdgeSchema).min(10),
    techniques: z.array(attackTechniqueSchema).length(8),
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
      const strengths = new Set(decision.options.map((item) => item.strength));
      if (decision.options.some((item) => item.decisionId !== decision.id)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Option parent mismatch on ${decision.id}` });
      }
      if (!strengths.has("strong") || !strengths.has("medium") || !strengths.has("weak")) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${decision.id} needs a strong, medium and weak option` });
      }
      for (const option of decision.options) {
        if (optionIds.has(option.id)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Duplicate option ${option.id}` });
        }
        optionIds.add(option.id);
        for (const nodeId of option.addsNodes) {
          if (!mission.nodes.some((node) => node.id === nodeId)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Option ${option.id} adds unknown node ${nodeId}`,
            });
          }
        }
      }
    }
    const nodeIds = new Set(mission.nodes.map((item) => item.id));
    for (const technique of mission.techniques) {
      for (const nodeId of technique.path) {
        if (!nodeIds.has(nodeId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Technique ${technique.id} path includes unknown node ${nodeId}`,
          });
        }
      }
    }
    if (!FINAL_RESULTS.includes("prevented") || !LAB_DIFFICULTIES.includes("guided") || !LAB_PHASES.includes("decide")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Lab enums drifted" });
    }
  });
