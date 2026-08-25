import { createSeededRandom, pickRandom, shuffleInPlace } from "./random";
import {
  PLAYTHROUGH_LENGTH,
  STORY_PHASES,
  type MissionDefinition,
  type Question,
  type RoleId,
} from "./types";

export interface PreparedPlaythrough {
  scenarioId: string;
  questions: Question[];
  optionOrder: Record<string, readonly string[]>;
  roleId: RoleId | null;
}

export interface PlaythroughOptions {
  roleId?: RoleId | null;
  avoidScenarioId?: string | null;
}

function scenarioFitsRole(
  mission: MissionDefinition,
  scenarioId: string,
  roleId: RoleId | null | undefined,
): boolean {
  if (!roleId) {
    return true;
  }
  return mission.questions.some(
    (question) =>
      question.scenarioIds.includes(scenarioId) &&
      (question.roleIds?.includes(roleId) ?? true),
  );
}

function pickQuestion(
  pool: Question[],
  fallback: Question[],
  random: () => number,
): Question {
  if (pool.length > 0) {
    return pickRandom(pool, random);
  }
  if (fallback.length > 0) {
    return pickRandom(fallback, random);
  }
  throw new Error("No question available for this phase");
}

export function preparePlaythrough(
  mission: MissionDefinition,
  seed: number,
  options: PlaythroughOptions = {},
): PreparedPlaythrough {
  const random = createSeededRandom(seed);
  const roleId = options.roleId ?? null;

  const scenarioPool = mission.scenarios.filter((scenario) => {
    if (options.avoidScenarioId && scenario.id === options.avoidScenarioId && mission.scenarios.length > 1) {
      return false;
    }
    return scenarioFitsRole(mission, scenario.id, roleId);
  });
  const usable = scenarioPool.length > 0 ? scenarioPool : [...mission.scenarios];
  const scenario = pickRandom(usable, random);
  const questions: Question[] = [];

  for (const phase of STORY_PHASES) {
    const byPhase = mission.questions.filter(
      (question) =>
        question.phase === phase && question.scenarioIds.includes(scenario.id),
    );
    const byRole = roleId
      ? byPhase.filter((question) => question.roleIds?.includes(roleId))
      : byPhase;
    questions.push(pickQuestion(byRole, byPhase, random));
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
    roleId,
  };
}
