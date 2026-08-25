import type { TrainingConfig } from "@/lib/training/config";
import { isTrainingConfig, SEEN_QUESTIONS_KEY, TRAINING_SESSION_KEY } from "@/lib/training/config";

export function saveTrainingSession(config: TrainingConfig): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(TRAINING_SESSION_KEY, JSON.stringify(config));
}

export function loadTrainingSession(): TrainingConfig | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.sessionStorage.getItem(TRAINING_SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return isTrainingConfig(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearTrainingSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(TRAINING_SESSION_KEY);
}

export function loadSeenQuestionIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(SEEN_QUESTIONS_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function rememberQuestionIds(ids: readonly string[]): void {
  if (typeof window === "undefined") {
    return;
  }
  const merged = [...new Set([...loadSeenQuestionIds(), ...ids])].slice(-240);
  window.localStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(merged));
}

export function playUrlForConfig(config: TrainingConfig): string {
  const role = config.specificRole ?? "";
  return `/play/?mission=${encodeURIComponent(config.mapId)}&role=${encodeURIComponent(role)}&training=1`;
}

export function playUrlForMission(missionId: string, roleId?: string | null): string {
  if (roleId) {
    return `/play/?mission=${encodeURIComponent(missionId)}&role=${encodeURIComponent(roleId)}`;
  }
  return `/play/?mission=${encodeURIComponent(missionId)}`;
}
