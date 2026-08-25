import { createSeededRandom, pickRandom, shuffleInPlace } from "./random";
import { PLAYTHROUGH_LENGTH, STORY_PHASES, type MissionDefinition, type Question } from "./types";

export interface PreparedPlaythrough {
  scenarioId: string;
  questions: Question[];
  optionOrder: Record<string, readonly string[]>;
}

export function preparePlaythrough(
  mission: MissionDefinition,
  seed: number,
): PreparedPlaythrough {
  const random = createSeededRandom(seed);

  const scenario = pickRandom(mission.scenarios, random);
  const questions: Question[] = [];

  for (const phase of STORY_PHASES) {
    const pool = mission.questions.filter(
      (question) =>
        question.phase === phase && question.scenarioIds.includes(scenario.id),
    );
    if (pool.length === 0) {
      throw new Error(
        `Mission ${mission.id} has no ${phase} question for ${scenario.id}`,
      );
    }
    questions.push(pickRandom(pool, random));
  }

  if (questions.length !== PLAYTHROUGH_LENGTH) {
    throw new Error("Playthrough must contain eight questions");
  }

  const ids = new Set(questions.map((question) => question.id));
  if (ids.size !== PLAYTHROUGH_LENGTH) {
    throw new Error("Playthrough questions must be unique");
  }

  const optionOrder: Record<string, readonly string[]> = {};
  for (const question of questions) {
    const order = shuffleInPlace(
      question.options.map((option) => option.id),
      random,
    );
    optionOrder[question.id] = order;
  }

  return {
    scenarioId: scenario.id,
    questions,
    optionOrder,
  };
}
