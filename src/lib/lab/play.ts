import { beatsForStage } from "./animation";
import { DECISION_COUNT, LAB_MISSION, TECHNIQUE_COUNT, isComplete, optionById } from "./catalog";
import { simulateAttack } from "./engine";
import { saveLabState, withAttemptResult } from "./store";
import { syncLabProgress } from "./progress";
import { DECISION_IDS, type DecisionId, type LabDifficulty, type LabPersistedState, type OptionId } from "./types";

function pendingForIndex(choices: LabPersistedState["choices"], index: number): OptionId | null {
  const decision = LAB_MISSION.decisions[index];
  if (!decision) {
    return null;
  }
  return choices[decision.id] ?? null;
}

export function beginLab(state: LabPersistedState, difficulty: LabDifficulty): LabPersistedState {
  return {
    ...state,
    difficulty,
    phase: "decide",
    currentDecisionIndex: 0,
    pendingOptionId: pendingForIndex(state.choices, 0),
    revealedStageCount: 0,
    attackBeat: 0,
    paused: false,
  };
}

export function changeDifficulty(state: LabPersistedState, difficulty: LabDifficulty): LabPersistedState {
  if (state.phase === "attack" || state.phase === "result") {
    return state;
  }
  return { ...state, difficulty };
}

export function selectOption(state: LabPersistedState, optionId: OptionId): LabPersistedState {
  if (state.phase !== "decide") {
    return state;
  }
  try {
    const option = optionById(optionId);
    const current = LAB_MISSION.decisions[state.currentDecisionIndex];
    if (!current || option.decisionId !== current.id) {
      return state;
    }
    return { ...state, pendingOptionId: optionId };
  } catch {
    return state;
  }
}

export function confirmDecision(state: LabPersistedState): LabPersistedState {
  if (state.phase !== "decide" || !state.pendingOptionId) {
    return state;
  }
  const option = optionById(state.pendingOptionId);
  const current = LAB_MISSION.decisions[state.currentDecisionIndex];
  if (!current || option.decisionId !== current.id) {
    return state;
  }
  const choices = { ...state.choices, [option.decisionId]: option.id };
  const nextIndex = state.currentDecisionIndex + 1;
  if (nextIndex >= DECISION_COUNT) {
    return {
      ...state,
      choices,
      pendingOptionId: null,
      currentDecisionIndex: DECISION_COUNT - 1,
      phase: "review",
    };
  }
  return {
    ...state,
    choices,
    currentDecisionIndex: nextIndex,
    pendingOptionId: pendingForIndex(choices, nextIndex),
  };
}

export function goToDecision(state: LabPersistedState, index: number): LabPersistedState {
  if (state.phase !== "decide" && state.phase !== "review") {
    return state;
  }
  const bounded = Math.max(0, Math.min(DECISION_COUNT - 1, index));
  return {
    ...state,
    phase: "decide",
    currentDecisionIndex: bounded,
    pendingOptionId: pendingForIndex(state.choices, bounded),
  };
}

export function launchAttack(state: LabPersistedState): { state: LabPersistedState; error: string | null } {
  if (!isComplete(state.choices)) {
    return { state, error: "Make all 10 architecture decisions before running the Red Team." };
  }
  return {
    state: {
      ...state,
      phase: "attack",
      revealedStageCount: 1,
      attackBeat: 0,
      paused: false,
    },
    error: null,
  };
}

export function nextAttackStep(state: LabPersistedState): LabPersistedState {
  if (state.phase !== "attack") {
    return state;
  }
  const simulation = simulateAttack(state.choices);
  const stage = simulation.stages[state.revealedStageCount - 1];
  if (!stage) {
    return withAttemptResult(
      {
        ...state,
        phase: "result",
        revealedStageCount: TECHNIQUE_COUNT,
        attackBeat: 0,
        paused: false,
      },
      simulation.result,
      simulation.score,
    );
  }
  const beats = beatsForStage(stage);
  const beat = Math.max(0, state.attackBeat);
  if (beat < beats.length - 1) {
    return { ...state, attackBeat: beat + 1, paused: false };
  }
  if (state.revealedStageCount < TECHNIQUE_COUNT) {
    return {
      ...state,
      revealedStageCount: state.revealedStageCount + 1,
      attackBeat: 0,
      paused: false,
    };
  }
  return withAttemptResult(
    {
      ...state,
      phase: "result",
      revealedStageCount: TECHNIQUE_COUNT,
      attackBeat: beats.length - 1,
      paused: false,
    },
    simulation.result,
    simulation.score,
  );
}

export function previousAttackStep(state: LabPersistedState): LabPersistedState {
  if (state.phase === "result") {
    const simulation = simulateAttack(state.choices);
    const last = simulation.stages[TECHNIQUE_COUNT - 1];
    const beats = last ? beatsForStage(last) : [];
    return {
      ...state,
      phase: "attack",
      revealedStageCount: TECHNIQUE_COUNT,
      attackBeat: Math.max(0, beats.length - 1),
      paused: true,
    };
  }
  if (state.phase !== "attack") {
    return state;
  }
  if (state.attackBeat > 0) {
    return { ...state, attackBeat: state.attackBeat - 1, paused: true };
  }
  if (state.revealedStageCount > 1) {
    const simulation = simulateAttack(state.choices);
    const previous = simulation.stages[state.revealedStageCount - 2];
    const beats = previous ? beatsForStage(previous) : [];
    return {
      ...state,
      revealedStageCount: state.revealedStageCount - 1,
      attackBeat: Math.max(0, beats.length - 1),
      paused: true,
    };
  }
  return { ...state, paused: true };
}

export function pauseAttack(state: LabPersistedState, paused: boolean): LabPersistedState {
  if (state.phase !== "attack") {
    return state;
  }
  return { ...state, paused };
}

export function replayAttack(state: LabPersistedState): LabPersistedState {
  if (!isComplete(state.choices)) {
    return state;
  }
  return {
    ...state,
    phase: "attack",
    revealedStageCount: 1,
    attackBeat: 0,
    paused: false,
  };
}

export function resetArchitecture(state: LabPersistedState): LabPersistedState {
  return {
    ...state,
    choices: {},
    currentDecisionIndex: 0,
    pendingOptionId: null,
    phase: "setup",
    revealedStageCount: 0,
    attackBeat: 0,
    paused: false,
  };
}

export function improveAndRetry(state: LabPersistedState, decisionId?: DecisionId): LabPersistedState {
  const index = decisionId ? Math.max(0, DECISION_IDS.indexOf(decisionId)) : 0;
  return {
    ...state,
    phase: "decide",
    currentDecisionIndex: index,
    pendingOptionId: pendingForIndex(state.choices, index),
    revealedStageCount: 0,
    attackBeat: 0,
    paused: false,
  };
}

export function persistLab(state: LabPersistedState): void {
  saveLabState(state);
  syncLabProgress(state, state.lastResult, state.bestScore);
}

export function currentDecisionId(state: LabPersistedState): DecisionId {
  return DECISION_IDS[state.currentDecisionIndex] ?? "identity";
}
