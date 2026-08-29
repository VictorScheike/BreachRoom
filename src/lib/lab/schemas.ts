import { z } from "zod";
import {
  ATTACK_STAGE_IDS,
  CONTROL_AREAS,
  FIXED_NODE_IDS,
  LAB_DIFFICULTIES,
  READINESS_PILLARS,
  SLOT_IDS,
  STAGE_OUTCOMES,
  TRUST_ZONES,
} from "./types";

const NODE_IDS = [...SLOT_IDS, ...FIXED_NODE_IDS] as const;

const nonEmpty = z.string().trim().min(1);

export const readinessVectorSchema = z
  .object({
    prevention: z.number().int().min(0).max(4),
    dataProtection: z.number().int().min(0).max(4),
    containment: z.number().int().min(0).max(4),
    detection: z.number().int().min(0).max(4),
  })
  .strict();

export const componentReactionSchema = z
  .object({
    outcome: z.enum(STAGE_OUTCOMES),
    attackerAction: nonEmpty,
    controlReaction: nonEmpty,
    explanation: nonEmpty,
    architectDetail: nonEmpty,
  })
  .strict();

export const architectureComponentSchema = z
  .object({
    id: nonEmpty,
    slotId: z.enum(SLOT_IDS),
    name: nonEmpty,
    icon: nonEmpty,
    area: z.enum(CONTROL_AREAS),
    description: nonEmpty,
    architectDescription: nonEmpty,
    tradeOff: nonEmpty,
    architectTradeOff: nonEmpty,
    hint: nonEmpty,
    recommended: z.boolean(),
    difficulties: z.array(z.enum(LAB_DIFFICULTIES)).min(1),
    readiness: readinessVectorSchema,
    reactions: z.record(z.enum(ATTACK_STAGE_IDS), componentReactionSchema),
  })
  .strict();

export const architectureSlotSchema = z
  .object({
    id: z.enum(SLOT_IDS),
    name: nonEmpty,
    zone: z.enum(TRUST_ZONES),
    purpose: nonEmpty,
    architectPurpose: nonEmpty,
  })
  .strict();

export const fixedNodeSchema = z
  .object({
    id: z.enum([
      "claims-handler",
      "claims-portal",
      "uploaded-document",
      "ai-application",
      "claims-database",
      "external-network",
    ]),
    name: nonEmpty,
    zone: z.enum(TRUST_ZONES),
    description: nonEmpty,
  })
  .strict();

export const attackStageSchema = z
  .object({
    id: z.enum(ATTACK_STAGE_IDS),
    number: z.number().int().min(1).max(6),
    name: nonEmpty,
    summary: nonEmpty,
    guidedDetail: nonEmpty,
    architectPrompt: nonEmpty,
    highlight: z.array(z.enum(NODE_IDS)).min(1),
    controllingSlots: z.array(z.enum(SLOT_IDS)),
    requiresAttackerInside: z.boolean(),
    legitimateActivity: z.boolean().optional(),
  })
  .strict();

export const labMissionSchema = z
  .object({
    id: nonEmpty,
    title: nonEmpty,
    missionLabel: nonEmpty,
    attack: z
      .object({
        id: nonEmpty,
        name: nonEmpty,
        company: nonEmpty,
        fictionalNote: nonEmpty,
        tagline: nonEmpty,
        scenario: nonEmpty,
        stages: z.array(attackStageSchema).length(6),
      })
      .strict(),
    slots: z.array(architectureSlotSchema).length(8),
    components: z.array(architectureComponentSchema).min(16),
    fixedNodes: z.array(fixedNodeSchema).length(6),
  })
  .strict()
  .superRefine((mission, ctx) => {
    const slotIds = new Set(mission.slots.map((slot) => slot.id));
    for (const slotId of SLOT_IDS) {
      if (!slotIds.has(slotId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Missing slot ${slotId}` });
      }
    }
    const componentIds = new Set<string>();
    for (const component of mission.components) {
      if (componentIds.has(component.id)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Duplicate component ${component.id}` });
      }
      componentIds.add(component.id);
      if (!slotIds.has(component.slotId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Component ${component.id} points at unknown slot`,
        });
      }
    }
    for (const pillar of READINESS_PILLARS) {
      if (mission.components.every((component) => component.readiness[pillar] === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `No component contributes to ${pillar}`,
        });
      }
    }
  });
