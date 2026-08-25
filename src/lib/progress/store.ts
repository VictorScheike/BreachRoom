import { findMission } from "@/lib/missions/catalog";
import type { MissionId } from "@/lib/missions/types";
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
  startedAt: number;
  updatedAt: number;
  roleGroupId: string | null;
  roleId: string | null;
  audienceMode: MissionPerspective["mode"];
  perspectiveLabel: string;
}

export interface ProgressStore {
  version: number;
  sessions: ProgressSession[];
}

export function createEmptyProgressStore(): ProgressStore {
  return {
    version: PROGRESS_SCHEMA_VERSION,
    sessions: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
    startedAt: typeof value.startedAt === "number" ? value.startedAt : Date.now(),
    updatedAt: typeof value.updatedAt === "number" ? value.updatedAt : Date.now(),
    roleGroupId: typeof value.roleGroupId === "string" ? value.roleGroupId : null,
    roleId: typeof value.roleId === "string" ? value.roleId : null,
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

export function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadProgress(): ProgressStore {
  if (!canUseBrowserStorage()) {
    return createEmptyProgressStore();
  }
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return createEmptyProgressStore();
    }
    return validateAndMigrateProgress(JSON.parse(raw));
  } catch (error) {
    console.error("Unable to load BreachRoom progress", error);
    return createEmptyProgressStore();
  }
}

export function saveProgress(store: ProgressStore): void {
  if (!canUseBrowserStorage()) {
    return;
  }
  try {
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ ...store, version: PROGRESS_SCHEMA_VERSION }),
    );
  } catch (error) {
    console.error("Unable to save BreachRoom progress", error);
  }
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
