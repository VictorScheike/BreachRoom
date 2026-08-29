import type { TrainingConfig } from "@/lib/training/config";
import { isTrainingConfig, SEEN_QUESTIONS_KEY, TRAINING_SESSION_KEY } from "@/lib/training/config";
import { generateDeck } from "@/lib/training/deck";
import {
  parseTrainingSearchParams,
  playParamsFromConfig,
  searchParamsFromUnknown,
  trainingPlayHref,
} from "@/lib/training/params";

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
  return trainingPlayHref(playParamsFromConfig(config));
}

export function playUrlForMission(missionId: string, roleId?: string | null): string {
  if (roleId) {
    return `/play/?mission=${encodeURIComponent(missionId)}&role=${encodeURIComponent(roleId)}`;
  }
  return `/play/?mission=${encodeURIComponent(missionId)}`;
}

export function loadTrainingFromSearch(
  search: URLSearchParams | { toString(): string } | Record<string, string | null>,
): TrainingConfig | null {
  const parsed = parseTrainingSearchParams(searchParamsFromUnknown(search));
  if (!parsed.ok) {
    return null;
  }
  const params = parsed.params;
  const deck = generateDeck(
    {
      roleGroup: params.roleGroup,
      specificRole: params.roleId,
      topics: [params.topicId],
      technologies: params.technologies,
      contexts: params.contexts,
      difficulty: params.difficulty,
      mapId: params.missionId,
    },
    { seed: params.seed },
  );
  return deck.ok ? deck.config : null;
}
