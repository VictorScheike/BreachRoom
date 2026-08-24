import type {
  DecisionOption,
  RecordedDecision,
  Scenario,
  ScenarioStage,
} from "./types";

export function requireStage(
  scenario: Scenario,
  index: number,
): ScenarioStage {
  const stage = scenario.stages[index];
  if (!stage) {
    throw new Error(`No scenario stage at index ${index}`);
  }
  return stage;
}

export function findStage(scenario: Scenario, stageId: string): ScenarioStage {
  const stage = scenario.stages.find((item) => item.id === stageId);
  if (!stage) {
    throw new Error(`Unknown scenario stage: ${stageId}`);
  }
  return stage;
}

export function findOption(
  scenario: Scenario,
  stageId: string,
  optionId: string,
): DecisionOption {
  const stage = findStage(scenario, stageId);
  const option = stage.options.find((item) => item.id === optionId);
  if (!option) {
    throw new Error(`Unknown option ${optionId} for stage ${stageId}`);
  }
  return option;
}

export function findOptionInStage(
  stage: ScenarioStage,
  optionId: string,
): DecisionOption {
  const option = stage.options.find((item) => item.id === optionId);
  if (!option) {
    throw new Error(`Unknown option ${optionId} for stage ${stage.id}`);
  }
  return option;
}

export function isComplete(
  scenario: Scenario,
  decisions: readonly RecordedDecision[],
): boolean {
  return decisions.length === scenario.stages.length;
}

export function uniqueStrings(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (seen.has(value)) {
      continue;
    }
    seen.add(value);
    result.push(value);
  }

  return result;
}
