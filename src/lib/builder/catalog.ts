import { BUILDER_QUESTIONS } from "./questions";
import { builderMissionSchema } from "./schemas";
import type { BuilderOption, BuilderOptionLetter, BuilderQuestion } from "./types";
import { BUILDER_MISSION_ID, BUILDER_QUESTION_COUNT } from "./types";
import { BUILDER_CARD_DESCRIPTION, BUILDER_SUBTITLE, BUILDER_SUMMARY, BUILDER_TITLE } from "./copy";

const rawMission = {
  id: BUILDER_MISSION_ID,
  title: BUILDER_TITLE,
  subtitle: BUILDER_SUBTITLE,
  summary: BUILDER_SUMMARY,
  cardDescription: BUILDER_CARD_DESCRIPTION,
  questions: BUILDER_QUESTIONS,
};

export const BUILDER_MISSION = builderMissionSchema.parse(rawMission);
export const BUILDER_DECISIONS: readonly BuilderQuestion[] = BUILDER_MISSION.questions;

export function builderQuestionById(id: string): BuilderQuestion {
  const found = BUILDER_DECISIONS.find((item) => item.id === id);
  if (!found) {
    throw new Error(`Unknown Secure Solution Builder question: ${id}`);
  }
  return found;
}

export function builderQuestionAt(index: number): BuilderQuestion {
  const question = BUILDER_DECISIONS[index];
  if (!question) {
    throw new Error(`Secure Solution Builder has no question at index ${index}`);
  }
  return question;
}

export function optionByLetter(question: BuilderQuestion, letter: BuilderOptionLetter): BuilderOption {
  const found = question.options.find((item) => item.letter === letter);
  if (!found) {
    throw new Error(`Question ${question.id} has no option ${letter}`);
  }
  return found;
}

export function isLastBuilderQuestion(index: number): boolean {
  return index >= BUILDER_QUESTION_COUNT - 1;
}
