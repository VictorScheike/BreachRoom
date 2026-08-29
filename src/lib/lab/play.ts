import { slotById } from "./catalog";
import { canPlace, missingSlots, placeComponent, simulateAttack } from "./engine";
import { saveLabState, withAttemptResult } from "./store";
import { syncLabProgress } from "./progress";
import { SLOT_IDS, type LabDifficulty, type LabPersistedState, type LabPlacements, type SlotId } from "./types";

export function placementsForDifficulty(
  placements: LabPlacements,
  difficulty: LabDifficulty,
): LabPlacements {
  const next: LabPlacements = {};
  for (const slotId of SLOT_IDS) {
    const id = placements[slotId];
    if (id && canPlace(id, slotId, difficulty)) {
      next[slotId] = id;
    }
  }
  return next;
}

export function changeDifficulty(state: LabPersistedState, difficulty: LabDifficulty): LabPersistedState {
  if (state.phase !== "build") {
    return state;
  }
  return {
    ...state,
    difficulty,
    placements: placementsForDifficulty(state.placements, difficulty),
  };
}

export function placeOnSlot(
  state: LabPersistedState,
  componentId: string,
  slotId: SlotId,
): LabPersistedState {
  if (state.phase !== "build") {
    return state;
  }
  return {
    ...state,
    placements: placeComponent(state.placements, componentId, slotId, state.difficulty),
  };
}

export function missingSlotMessage(missing: readonly SlotId[]): string {
  const names = missing.map((id) => slotById(id).name);
  if (names.length === 1) {
    return `Place a component in ${names[0]} before launching the attack.`;
  }
  return `Fill every architecture slot before launching. Still empty: ${names.join(", ")}.`;
}

export function launchAttack(state: LabPersistedState): { state: LabPersistedState; error: string | null } {
  const missing = missingSlots(state.placements, state.difficulty);
  if (missing.length > 0) {
    return { state, error: missingSlotMessage(missing) };
  }
  return {
    state: {
      ...state,
      phase: "attack",
      revealedStageCount: 1,
    },
    error: null,
  };
}

export function nextAttackStep(state: LabPersistedState): LabPersistedState {
  if (state.phase !== "attack") {
    return state;
  }
  if (state.revealedStageCount < 6) {
    return { ...state, revealedStageCount: state.revealedStageCount + 1 };
  }
  const simulation = simulateAttack(state.placements);
  return withAttemptResult(
    {
      ...state,
      phase: "review",
      revealedStageCount: 6,
    },
    simulation.result,
    simulation.score,
  );
}

export function improveAndRetry(state: LabPersistedState): LabPersistedState {
  return {
    ...state,
    phase: "build",
    revealedStageCount: 0,
  };
}

export function persistLab(state: LabPersistedState): void {
  saveLabState(state);
  syncLabProgress(state, state.lastResult, state.bestScore);
}
