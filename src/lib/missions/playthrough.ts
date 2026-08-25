import { createSeededRandom, pickRandom, shuffleInPlace } from "./random";
import {
  PLAYTHROUGH_LENGTH,
  STORY_PHASES,
  playthroughLength,
  type MissionDefinition,
  type Question,
  type RoleId,
  type StoryPhase,
} from "./types";

export interface PreparedPlaythrough {
  scenarioId: string;
  questions: Question[];
  optionOrder: Record<string, readonly string[]>;
  roleId: RoleId | null;
  seed: number;
}

export interface PlaythroughOptions {
  roleId?: RoleId | null;
  avoidScenarioId?: string | null;
  questionIds?: readonly string[];
  avoidQuestionIds?: readonly string[];
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

function orderedQuestions(
  mission: MissionDefinition,
  questionIds: readonly string[],
): Question[] {
  return questionIds.map((id) => {
    const question = mission.questions.find((item) => item.id === id);
    if (!question) {
      throw new Error(`Unknown question ${id} for ${mission.id}`);
    }
    return question;
  });
}

function optionOrders(
  questions: readonly Question[],
  random: () => number,
): Record<string, readonly string[]> {
  const optionOrder: Record<string, readonly string[]> = {};
  for (const question of questions) {
    optionOrder[question.id] = shuffleInPlace(
      question.options.map((option) => option.id),
      random,
    );
  }
  return optionOrder;
}

function pickUniqueFromPhase(
  pool: Question[],
  count: number,
  random: () => number,
  avoidQuestionIds: ReadonlySet<string>,
): Question[] {
  const unused = pool.filter((item) => !avoidQuestionIds.has(item.id));
  const source = unused.length >= count ? unused : [...pool];
  const shuffled = shuffleInPlace([...source], random);
  const selected: Question[] = [];
  const usedObjectives = new Set<string>();
  for (const question of shuffled) {
    if (selected.length >= count) {
      break;
    }
    const objective = question.learningObjectiveIds?.[0];
    if (objective && usedObjectives.has(objective) && shuffled.length > count) {
      continue;
    }
    if (selected.some((item) => item.id === question.id)) {
      continue;
    }
    selected.push(question);
    if (objective) {
      usedObjectives.add(objective);
    }
  }
  for (const question of shuffled) {
    if (selected.length >= count) {
      break;
    }
    if (!selected.some((item) => item.id === question.id)) {
      selected.push(question);
    }
  }
  if (selected.length < count) {
    throw new Error(`Could not pick ${count} questions from phase pool of ${pool.length}`);
  }
  return shuffleInPlace(selected.slice(0, count), random);
}

function pickPhasedSession(
  mission: MissionDefinition,
  random: () => number,
  avoidQuestionIds: readonly string[],
): Question[] {
  const phases = mission.sessionPhases;
  if (!phases) {
    throw new Error(`${mission.id} is missing sessionPhases`);
  }
  const avoid = new Set(avoidQuestionIds);
  const questions: Question[] = [];
  for (const phase of phases) {
    const pool = mission.questions.filter((question) => question.phase === phase.id);
    questions.push(...pickUniqueFromPhase(pool, phase.pick, random, avoid));
  }
  return questions;
}

function pickClassicSession(
  mission: MissionDefinition,
  seedRandom: () => number,
  roleId: RoleId | null,
  avoidScenarioId?: string | null,
): { scenarioId: string; questions: Question[] } {
  const scenarioPool = mission.scenarios.filter((scenario) => {
    if (avoidScenarioId && scenario.id === avoidScenarioId && mission.scenarios.length > 1) {
      return false;
    }
    return scenarioFitsRole(mission, scenario.id, roleId);
  });
  const usable = scenarioPool.length > 0 ? scenarioPool : [...mission.scenarios];
  const scenario = pickRandom(usable, seedRandom);
  const questions: Question[] = [];

  for (const phase of STORY_PHASES) {
    const byPhase = mission.questions.filter(
      (question) =>
        question.phase === phase && question.scenarioIds.includes(scenario.id),
    );
    const byRole = roleId
      ? byPhase.filter((question) => question.roleIds?.includes(roleId))
      : byPhase;
    questions.push(pickQuestion(byRole, byPhase, seedRandom));
  }
  return { scenarioId: scenario.id, questions };
}

export function preparePlaythrough(
  mission: MissionDefinition,
  seed: number,
  options: PlaythroughOptions = {},
): PreparedPlaythrough {
  const random = createSeededRandom(seed);
  const roleId = options.roleId ?? null;
  const needed = playthroughLength(mission);

  if (options.questionIds && options.questionIds.length > 0) {
    const questions = orderedQuestions(mission, options.questionIds);
    if (questions.length !== needed) {
      throw new Error(`Playthrough must contain ${needed} questions`);
    }
    const ids = new Set(questions.map((question) => question.id));
    if (ids.size !== needed) {
      throw new Error("Playthrough questions must be unique");
    }
    return {
      scenarioId: questions[0]?.scenarioIds[0] ?? mission.scenarios[0]!.id,
      questions,
      optionOrder: optionOrders(questions, random),
      roleId,
      seed,
    };
  }

  const picked = mission.sessionPhases
    ? {
        scenarioId: mission.scenarios[0]?.id ?? mission.id,
        questions: pickPhasedSession(mission, random, options.avoidQuestionIds ?? []),
      }
    : pickClassicSession(mission, random, roleId, options.avoidScenarioId);

  if (picked.questions.length !== needed) {
    throw new Error(`Playthrough must contain ${needed} questions`);
  }
  const ids = new Set(picked.questions.map((question) => question.id));
  if (ids.size !== needed) {
    throw new Error("Playthrough questions must be unique");
  }

  return {
    scenarioId: picked.scenarioId,
    questions: picked.questions,
    optionOrder: optionOrders(picked.questions, random),
    roleId,
    seed,
  };
}

export function phaseOrderFor(questions: readonly Question[]): StoryPhase[] {
  return questions.map((question) => question.phase);
}

export { PLAYTHROUGH_LENGTH };
