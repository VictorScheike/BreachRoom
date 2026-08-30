import { LAB_MISSION, LAB_MISSION_ID, optionById } from "./catalog";
import { compareResults, simulateAttack } from "./engine";
import type {
  DecisionId,
  FinalResultKind,
  LabChoices,
  LabDifficulty,
  LabPersistedState,
  LabPhase,
  OptionId,
} from "./types";
import { DECISION_IDS } from "./types";

export const LAB_STORAGE_KEY = "breachroom.lab.v2";
export const LAB_SCHEMA_VERSION = 2;
const LAB_CHANGE_EVENT = "breachroom-lab";

export const EMPTY_LAB_STATE: LabPersistedState = {
  version: LAB_SCHEMA_VERSION,
  missionId: LAB_MISSION_ID,
  difficulty: "guided",
  choices: {},
  currentDecisionIndex: 0,
  pendingOptionId: null,
  phase: "setup",
  revealedStageCount: 0,
    attackBeat: 0,
    paused: false,
    showingDecisionFeedback: false,
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

function asChoices(value: unknown): LabChoices {
  if (!isRecord(value)) {
    return {};
  }
  const source = isRecord(value.choices) ? value.choices : isRecord(value.placements) ? value.placements : value;
  const next: LabChoices = {};
  for (const decisionId of DECISION_IDS) {
    const id = source[decisionId];
    if (typeof id !== "string") {
      continue;
    }
    try {
      const option = optionById(id);
      if (option.decisionId === decisionId) {
        next[decisionId] = option.id;
      }
    } catch {
      const mapped = LEGACY_OPTION_MAP[id];
      if (mapped) {
        next[decisionId] = mapped;
      }
    }
  }
  return next;
}

const LEGACY_OPTION_MAP: Record<string, OptionId> = {
  "identity-mfa-rbac": "identity-mfa",
  "identity-password": "identity-password",
  "guard-full": "input-sandbox",
  "guard-prompt-only": "input-typecheck",
  "model-private": "model-private",
  "model-public": "model-public",
  "data-api": "api-restricted",
  "data-direct": "api-broad",
  "agency-human": "oversight-human",
  "agency-auto": "oversight-auto",
  "secrets-vault": "secrets-vault",
  "secrets-config": "secrets-key",
  "supply-protected": "supply-signed",
  "supply-open": "supply-latest",
  "monitor-siem": "detection-siem",
  "monitor-logs": "detection-logs",
};

export function parseLabState(raw: unknown): LabPersistedState {
  if (!isRecord(raw)) {
    return { ...EMPTY_LAB_STATE };
  }
  const difficulty: LabDifficulty =
    raw.difficulty === "challenge" || raw.difficulty === "architect" ? "challenge" : "guided";
  const phase = asPhase(raw.phase);
  return {
    version: LAB_SCHEMA_VERSION,
    missionId: LAB_MISSION_ID,
    difficulty,
    choices: asChoices(raw),
    currentDecisionIndex: clampIndex(raw.currentDecisionIndex),
    pendingOptionId: typeof raw.pendingOptionId === "string" ? raw.pendingOptionId : null,
    phase,
    revealedStageCount: typeof raw.revealedStageCount === "number" ? Math.max(0, raw.revealedStageCount) : 0,
    attackBeat: typeof raw.attackBeat === "number" ? Math.max(0, Math.floor(raw.attackBeat)) : 0,
    paused: raw.paused === true,
    showingDecisionFeedback: raw.showingDecisionFeedback === true,
    attempts: typeof raw.attempts === "number" ? Math.max(0, raw.attempts) : 0,
    lastResult: asResult(raw.lastResult),
    bestResult: asResult(raw.bestResult),
    bestScore: typeof raw.bestScore === "number" ? raw.bestScore : null,
  };
}

function clampIndex(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(LAB_MISSION.decisions.length - 1, Math.floor(value)));
}

function asPhase(value: unknown): LabPhase {
  if (value === "decide" || value === "review" || value === "attack" || value === "result" || value === "setup") {
    return value;
  }
  if (value === "build") {
    return "decide";
  }
  return "setup";
}

function asResult(value: unknown): FinalResultKind | null {
  if (value === "prevented" || value === "architecture-holds") {
    return "prevented";
  }
  if (value === "contained" || value === "attack-contained" || value === "partial-breach") {
    return "contained";
  }
  if (value === "breached" || value === "architecture-breached") {
    return "breached";
  }
  return null;
}

export function loadLabState(): LabPersistedState {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return EMPTY_LAB_STATE;
  }
  try {
    const raw = window.localStorage.getItem(LAB_STORAGE_KEY) ?? window.localStorage.getItem("breachroom.lab.v1");
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
  return simulateAttack(state.choices);
}

export function decisionIdAt(index: number): DecisionId {
  const decision = LAB_MISSION.decisions[index];
  if (!decision) {
    throw new Error("Decision index out of range");
  }
  return decision.id;
}
