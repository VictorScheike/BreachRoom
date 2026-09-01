import { z } from "zod";
import { BUILDER_CATEGORY_IDS, BUILDER_MISSION_ID, BUILDER_VISUAL_KINDS } from "./types";

const nonEmpty = z.string().trim().min(1);
const letter = z.enum(["A", "B", "C"]);

export const builderVisualNodeSchema = z
  .object({
    id: nonEmpty,
    label: nonEmpty,
    detail: z.string().trim().min(1).optional(),
    highlight: z.boolean().optional(),
    warning: z.boolean().optional(),
    blocked: z.boolean().optional(),
  })
  .strict();

export const builderVisualSchema = z
  .object({
    kind: z.enum(BUILDER_VISUAL_KINDS),
    title: nonEmpty,
    nodes: z.array(builderVisualNodeSchema).min(2).max(8),
  })
  .strict();

export const builderOptionSchema = z
  .object({
    letter,
    text: nonEmpty,
    feedback: nonEmpty,
  })
  .strict();

export const builderQuestionSchema = z
  .object({
    id: nonEmpty,
    number: z.number().int().min(1).max(15),
    categoryId: z.enum(BUILDER_CATEGORY_IDS),
    tags: z.array(nonEmpty).min(1).max(4),
    prompt: nonEmpty,
    options: z.tuple([builderOptionSchema, builderOptionSchema, builderOptionSchema]),
    correctLetter: letter,
    mainPoint: nonEmpty,
    architectCorrect: nonEmpty,
    architectWrong: nonEmpty,
    visual: builderVisualSchema,
    resultRecommendation: nonEmpty,
  })
  .strict()
  .superRefine((question, ctx) => {
    const letters = question.options.map((option) => option.letter);
    if (new Set(letters).size !== 3 || letters.join("") !== "ABC") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${question.id} must have options A, B and C in order`,
      });
    }
    const correct = question.options.find((option) => option.letter === question.correctLetter);
    if (!correct) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${question.id} is missing the correct option`,
      });
    }
    if (!question.architectCorrect.startsWith("Correct —")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${question.id} correct architect feedback must start with “Correct —”`,
      });
    }
    if (!question.architectWrong.startsWith("Not quite —")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${question.id} incorrect architect feedback must start with “Not quite —”`,
      });
    }
  });

export const builderMissionSchema = z
  .object({
    id: z.literal(BUILDER_MISSION_ID),
    title: nonEmpty,
    subtitle: nonEmpty,
    summary: nonEmpty,
    cardDescription: nonEmpty,
    questions: z.array(builderQuestionSchema).length(15),
  })
  .strict();
