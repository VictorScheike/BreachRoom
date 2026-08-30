import type { GameState } from "@/lib/game/engine";

export const LIVE_SESSION_KEY = "breachroom.live-mission.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function saveLiveSession(state: GameState): void {
  if (typeof window === "undefined" || typeof window.sessionStorage === "undefined") {
    return;
  }
  if (
    !state.missionId ||
    state.screen === "missionSelection" ||
    state.screen === "roleSelect" ||
    state.screen === "report"
  ) {
    window.sessionStorage.removeItem(LIVE_SESSION_KEY);
    return;
  }
  try {
    window.sessionStorage.setItem(LIVE_SESSION_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Unable to save live mission session", error);
  }
}

export function clearLiveSession(): void {
  if (typeof window === "undefined" || typeof window.sessionStorage === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(LIVE_SESSION_KEY);
}

export function loadLiveSession(): GameState | null {
  if (typeof window === "undefined" || typeof window.sessionStorage === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(LIVE_SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || typeof parsed.missionId !== "string") {
      return null;
    }
    if (!Array.isArray(parsed.unlockedCheckpointOrders) || !Array.isArray(parsed.openDoorIds)) {
      return null;
    }
    return parsed as unknown as GameState;
  } catch (error) {
    console.error("Unable to restore live mission session", error);
    return null;
  }
}
