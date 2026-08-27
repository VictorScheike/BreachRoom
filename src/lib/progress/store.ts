import { findMission } from "@/lib/missions/catalog";
import type { MissionId, RecordedChoice } from "@/lib/missions/types";
import type { MissionPerspective } from "@/lib/game/perspective";

export const PROGRESS_STORAGE_KEY = "breachroom.progress.v2";
export const PROGRESS_SCHEMA_VERSION = 2;

export interface ProgressSession {
  id: string;
  missionId: string;
  missionTitle: string;
  seed: number;
  questionIds: readonly string[];
  questionsCompleted: number;
  questionsRequired: number;
  phaseLabel: string | null;
  completed: boolean;
  endedEarly: boolean;
  overall: number | null;
  scenarioId: string | null;
  choices: readonly RecordedChoice[];
  startedAt: number;
  updatedAt: number;
  roleGroupId: string | null;
  roleId: string | null;
  topics: readonly string[];
  audienceMode: MissionPerspective["mode"];
  perspectiveLabel: string;
}

export interface ProgressStore {
  version: number;
  sessions: ProgressSession[];
}

export const EMPTY_PROGRESS_STORE: ProgressStore = {
  version: PROGRESS_SCHEMA_VERSION,
  sessions: [],
};

export function createEmptyProgressStore(): ProgressStore {
  return EMPTY_PROGRESS_STORE;
}

const PROGRESS_CHANGE_EVENT = "breachroom-progress";

let cachedRaw: string | null | undefined;
let cachedStore: ProgressStore = EMPTY_PROGRESS_STORE;

function notifyProgressListeners(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
}

export function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadProgress(): ProgressStore {
  if (!canUseBrowserStorage()) {
    return EMPTY_PROGRESS_STORE;
  }
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw === cachedRaw) {
      return cachedStore;
    }
    cachedRaw = raw;
    if (!raw) {
      cachedStore = EMPTY_PROGRESS_STORE;
      return cachedStore;
    }
    cachedStore = validateAndMigrateProgress(JSON.parse(raw));
    return cachedStore;
  } catch (error) {
    console.error("Unable to load BreachRoom progress", error);
    cachedRaw = null;
    cachedStore = EMPTY_PROGRESS_STORE;
    return cachedStore;
  }
}

export function saveProgress(store: ProgressStore): void {
  if (!canUseBrowserStorage()) {
    return;
  }
  try {
    const payload = JSON.stringify({ ...store, version: PROGRESS_SCHEMA_VERSION });
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, payload);
    cachedRaw = payload;
    cachedStore = store;
    notifyProgressListeners();
  } catch (error) {
    console.error("Unable to save BreachRoom progress", error);
  }
}

export function subscribeProgress(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PROGRESS_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PROGRESS_CHANGE_EVENT, onStoreChange);
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asChoice(value: unknown): RecordedChoice | null {
  if (!isRecord(value)) {
    return null;
  }
  if (typeof value.questionId !== "string" || typeof value.optionId !== "string") {
    return null;
  }
  if (value.displayLetter !== "A" && value.displayLetter !== "B" && value.displayLetter !== "C") {
    return null;
  }
  return {
    questionId: value.questionId,
    optionId: value.optionId,
    displayLetter: value.displayLetter,
  };
}

function asSession(value: unknown): ProgressSession | null {
  if (!isRecord(value)) {
    return null;
  }
  if (typeof value.missionId !== "string") {
    return null;
  }
  const mission = findMission(value.missionId);
  const title =
    typeof value.missionTitle === "string" && value.missionTitle.length > 0
      ? value.missionTitle
      : (mission?.title ?? "Previous mission");
  const questionIds = Array.isArray(value.questionIds)
    ? value.questionIds.filter((item): item is string => typeof item === "string")
    : [];
  const questionsRequired =
    typeof value.questionsRequired === "number" && value.questionsRequired > 0
      ? value.questionsRequired
      : Math.max(questionIds.length, 1);
  const questionsCompleted =
    typeof value.questionsCompleted === "number" ? Math.max(0, value.questionsCompleted) : 0;
  const completed = value.completed === true && value.endedEarly !== true;
  return {
    id: typeof value.id === "string" ? value.id : `${value.missionId}-${value.seed ?? "unknown"}`,
    missionId: value.missionId,
    missionTitle: title,
    seed: typeof value.seed === "number" ? value.seed : 0,
    questionIds,
    questionsCompleted,
    questionsRequired,
    phaseLabel: typeof value.phaseLabel === "string" ? value.phaseLabel : null,
    completed,
    endedEarly: value.endedEarly === true,
    overall: typeof value.overall === "number" ? value.overall : null,
    scenarioId: typeof value.scenarioId === "string" ? value.scenarioId : null,
    choices: Array.isArray(value.choices)
      ? value.choices.map(asChoice).filter((item): item is RecordedChoice => item !== null)
      : [],
    startedAt: typeof value.startedAt === "number" ? value.startedAt : Date.now(),
    updatedAt: typeof value.updatedAt === "number" ? value.updatedAt : Date.now(),
    roleGroupId: typeof value.roleGroupId === "string" ? value.roleGroupId : null,
    roleId: typeof value.roleId === "string" ? value.roleId : null,
    topics: Array.isArray(value.topics) ? value.topics.filter((item): item is string => typeof item === "string") : [],
    audienceMode:
      value.audienceMode === "general" || value.audienceMode === "role" || value.audienceMode === "standard"
        ? value.audienceMode
        : "standard",
    perspectiveLabel:
      typeof value.perspectiveLabel === "string" ? value.perspectiveLabel : "Standard mission",
  };
}

export function validateAndMigrateProgress(raw: unknown): ProgressStore {
  if (!isRecord(raw)) {
    return createEmptyProgressStore();
  }
  const sessionsRaw = Array.isArray(raw.sessions)
    ? raw.sessions
    : Array.isArray(raw.history)
      ? raw.history
      : [];
  const sessions = sessionsRaw
    .map(asSession)
    .filter((item): item is ProgressSession => item !== null)
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .slice(0, 40);
  return {
    version: PROGRESS_SCHEMA_VERSION,
    sessions,
  };
}

export function upsertProgressSession(next: ProgressSession): ProgressStore {
  const store = loadProgress();
  const existing = store.sessions.find((item) => item.id === next.id);
  const merged: ProgressSession = {
    ...next,
    startedAt: existing?.startedAt ?? next.startedAt,
  };
  const remaining = store.sessions.filter((item) => item.id !== next.id);
  const updated: ProgressStore = {
    version: PROGRESS_SCHEMA_VERSION,
    sessions: [merged, ...remaining].slice(0, 40),
  };
  saveProgress(updated);
  return updated;
}

export function progressSummary(store: ProgressStore): {
  missionsCompleted: number;
  questionsAnswered: number;
  overallCompletion: number;
  practiceScore: number | null;
} {
  const completed = store.sessions.filter((item) => item.completed);
  const questionsAnswered = store.sessions.reduce((sum, item) => sum + item.questionsCompleted, 0);
  const scored = completed.filter((item) => typeof item.overall === "number");
  const practiceScore =
    scored.length === 0
      ? null
      : Math.round(scored.reduce((sum, item) => sum + (item.overall ?? 0), 0) / scored.length);
  const knownMissions: MissionId[] = [
    "inbox-under-siege",
    "locked-out",
    "northstar-zero-hour",
    "ai-forge",
    "dependency-depths",
  ];
  const completedIds = new Set(completed.map((item) => item.missionId));
  const overallCompletion = Math.round((completedIds.size / knownMissions.length) * 100);
  return {
    missionsCompleted: completed.length,
    questionsAnswered,
    overallCompletion,
    practiceScore,
  };
}

export function sessionIdFor(missionId: string, seed: number): string {
  return `${missionId}:${seed}`;
}

export function progressReportUrl(sessionId: string): string {
  return `/progress/report/?session=${encodeURIComponent(sessionId)}`;
}
