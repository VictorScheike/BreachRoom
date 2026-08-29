import { LAB_MISSION, LAB_MISSION_ID } from "./catalog";
import { compareResults, simulateAttack } from "./engine";
import type {
  FinalResultKind,
  LabDifficulty,
  LabPersistedState,
  LabPhase,
  LabPlacements,
} from "./types";

export const LAB_STORAGE_KEY = "breachroom.lab.v1";
export const LAB_SCHEMA_VERSION = 1;
const LAB_CHANGE_EVENT = "breachroom-lab";

export const EMPTY_LAB_STATE: LabPersistedState = {
  version: LAB_SCHEMA_VERSION,
  missionId: LAB_MISSION_ID,
  difficulty: "guided",
  placements: {},
  phase: "build",
  revealedStageCount: 0,
  attempts: 0,
  lastResult: null,
  bestResult: null,
  bestScore: null,
};

let cachedRaw: string | null | undefined;
let cachedState: LabPersistedState = EMPTY_LAB_STATE;

function notifyLabListeners(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(LAB_CHANGE_EVENT));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asPlacements(value: unknown): LabPlacements {
  if (!isRecord(value)) {
    return {};
  }
  const next: LabPlacements = {};
  for (const slot of LAB_MISSION.slots) {
    const id = value[slot.id];
    if (typeof id === "string") {
      next[slot.id] = id;
    }
  }
  return next;
}

export function parseLabState(raw: unknown): LabPersistedState {
  if (!isRecord(raw)) {
    return { ...EMPTY_LAB_STATE };
  }
  const difficulty: LabDifficulty = raw.difficulty === "architect" ? "architect" : "guided";
  const phase: LabPhase =
    raw.phase === "attack" || raw.phase === "review" || raw.phase === "build" ? raw.phase : "build";
  const lastResult = asResult(raw.lastResult);
  const bestResult = asResult(raw.bestResult);
  return {
    version: LAB_SCHEMA_VERSION,
    missionId: LAB_MISSION_ID,
    difficulty,
    placements: asPlacements(raw.placements),
    phase,
    revealedStageCount: typeof raw.revealedStageCount === "number" ? Math.max(0, raw.revealedStageCount) : 0,
    attempts: typeof raw.attempts === "number" ? Math.max(0, raw.attempts) : 0,
    lastResult,
    bestResult,
    bestScore: typeof raw.bestScore === "number" ? raw.bestScore : null,
  };
}

function asResult(value: unknown): FinalResultKind | null {
  if (
    value === "architecture-holds" ||
    value === "attack-contained" ||
    value === "partial-breach" ||
    value === "architecture-breached"
  ) {
    return value;
  }
  return null;
}

export function loadLabState(): LabPersistedState {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return EMPTY_LAB_STATE;
  }
  try {
    const raw = window.localStorage.getItem(LAB_STORAGE_KEY);
    if (raw === cachedRaw) {
      return cachedState;
    }
    cachedRaw = raw;
    if (!raw) {
      cachedState = EMPTY_LAB_STATE;
      return cachedState;
    }
    cachedState = parseLabState(JSON.parse(raw));
    return cachedState;
  } catch (error) {
    console.error("Unable to load Architecture Defence Lab state", error);
    cachedRaw = null;
    cachedState = EMPTY_LAB_STATE;
    return cachedState;
  }
}

export function saveLabState(state: LabPersistedState): void {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return;
  }
  try {
    const payload = JSON.stringify({ ...state, version: LAB_SCHEMA_VERSION });
    window.localStorage.setItem(LAB_STORAGE_KEY, payload);
    cachedRaw = payload;
    cachedState = state;
    notifyLabListeners();
  } catch (error) {
    console.error("Unable to save Architecture Defence Lab state", error);
  }
}

export function subscribeLab(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LAB_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LAB_CHANGE_EVENT, onStoreChange);
  };
}

export function withAttemptResult(
  state: LabPersistedState,
  result: FinalResultKind,
  score: number,
): LabPersistedState {
  const bestResult = compareResults(state.bestResult, result);
  const bestScore = state.bestScore === null ? score : Math.max(state.bestScore, score);
  return {
    ...state,
    attempts: state.attempts + 1,
    lastResult: result,
    bestResult,
    bestScore,
  };
}

export function simulationFromState(state: LabPersistedState) {
  return simulateAttack(state.placements);
}
