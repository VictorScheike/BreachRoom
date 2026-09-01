import { BUILDER_DECISIONS } from "./catalog";
import { BUILDER_SCHEMA_VERSION, BUILDER_STORAGE_KEY } from "./copy";
import { uniqueAnswers } from "./scoring";
import type { BuilderAnswer, BuilderCategoryScore, BuilderOptionLetter, BuilderPersistedState, BuilderPhase } from "./types";
import { BUILDER_CATEGORY_IDS, BUILDER_MISSION_ID, BUILDER_QUESTION_COUNT } from "./types";

export const EMPTY_BUILDER_STATE: BuilderPersistedState = {
  version: BUILDER_SCHEMA_VERSION,
  missionId: BUILDER_MISSION_ID,
  phase: "intro",
  currentIndex: 0,
  pendingLetter: null,
  answers: [],
  lastScore: null,
  bestScore: null,
  lastPercent: null,
  bestPercent: null,
  completed: false,
  completedAt: null,
  categoryScores: [],
};

const BUILDER_CHANGE_EVENT = "breachroom-builder";
const PHASES: readonly BuilderPhase[] = ["intro", "quiz", "result", "review"];
const LETTERS: readonly BuilderOptionLetter[] = ["A", "B", "C"];

let cachedRaw: string | null | undefined;
let cachedState: BuilderPersistedState = EMPTY_BUILDER_STATE;

function notifyBuilderListeners(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(BUILDER_CHANGE_EVENT));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asLetter(value: unknown): BuilderOptionLetter | null {
  return typeof value === "string" && LETTERS.includes(value as BuilderOptionLetter)
    ? (value as BuilderOptionLetter)
    : null;
}

function asAnswers(value: unknown): BuilderAnswer[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const next: BuilderAnswer[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.questionId !== "string") {
      continue;
    }
    const letter = asLetter(item.letter);
    const known = BUILDER_DECISIONS.some((question) => question.id === item.questionId);
    if (!letter || !known) {
      continue;
    }
    next.push({ questionId: item.questionId, letter });
  }
  return uniqueAnswers(next);
}

function asCategoryScores(value: unknown): BuilderCategoryScore[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.categoryId !== "string") {
      return [];
    }
    if (!BUILDER_CATEGORY_IDS.includes(item.categoryId as BuilderCategoryScore["categoryId"])) {
      return [];
    }
    const correct = typeof item.correct === "number" ? Math.max(0, item.correct) : 0;
    const total = typeof item.total === "number" && item.total > 0 ? item.total : 1;
    return [
      {
        categoryId: item.categoryId as BuilderCategoryScore["categoryId"],
        correct: Math.min(correct, total),
        total,
      },
    ];
  });
}

export function parseBuilderState(raw: unknown): BuilderPersistedState {
  if (!isRecord(raw)) {
    return EMPTY_BUILDER_STATE;
  }
  const answers = asAnswers(raw.answers);
  const currentIndex =
    typeof raw.currentIndex === "number"
      ? Math.min(BUILDER_QUESTION_COUNT - 1, Math.max(0, Math.floor(raw.currentIndex)))
      : 0;
  const phase = PHASES.includes(raw.phase as BuilderPhase) ? (raw.phase as BuilderPhase) : "intro";
  return {
    version: BUILDER_SCHEMA_VERSION,
    missionId: BUILDER_MISSION_ID,
    phase,
    currentIndex,
    pendingLetter: asLetter(raw.pendingLetter),
    answers,
    lastScore: typeof raw.lastScore === "number" ? raw.lastScore : null,
    bestScore: typeof raw.bestScore === "number" ? raw.bestScore : null,
    lastPercent: typeof raw.lastPercent === "number" ? raw.lastPercent : null,
    bestPercent: typeof raw.bestPercent === "number" ? raw.bestPercent : null,
    completed: raw.completed === true,
    completedAt: typeof raw.completedAt === "number" ? raw.completedAt : null,
    categoryScores: asCategoryScores(raw.categoryScores),
  };
}

export function canUseBuilderStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadBuilderState(): BuilderPersistedState {
  if (!canUseBuilderStorage()) {
    return EMPTY_BUILDER_STATE;
  }
  try {
    const raw = window.localStorage.getItem(BUILDER_STORAGE_KEY);
    if (raw === cachedRaw) {
      return cachedState;
    }
    cachedRaw = raw;
    cachedState = raw ? parseBuilderState(JSON.parse(raw)) : EMPTY_BUILDER_STATE;
    return cachedState;
  } catch (error) {
    console.error("Unable to load Secure Solution Builder progress", error);
    cachedRaw = null;
    cachedState = EMPTY_BUILDER_STATE;
    return cachedState;
  }
}

export function saveBuilderState(state: BuilderPersistedState): void {
  if (!canUseBuilderStorage()) {
    return;
  }
  try {
    const payload = JSON.stringify({ ...state, version: BUILDER_SCHEMA_VERSION });
    window.localStorage.setItem(BUILDER_STORAGE_KEY, payload);
    cachedRaw = payload;
    cachedState = state;
    notifyBuilderListeners();
  } catch (error) {
    console.error("Unable to save Secure Solution Builder progress", error);
  }
}

export function subscribeBuilder(onChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  window.addEventListener("storage", onChange);
  window.addEventListener(BUILDER_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(BUILDER_CHANGE_EVENT, onChange);
  };
}

export { BUILDER_STORAGE_KEY };
