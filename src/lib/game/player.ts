import type { MoveDirection } from "@/lib/game/world";

const DIRECTION_KEYS: Record<string, MoveDirection> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  W: "up",
  S: "down",
  A: "left",
  D: "right",
};

export function isMissionMapVisible(screen: string): boolean {
  return (
    screen === "briefing" ||
    screen === "exploring" ||
    screen === "encounter" ||
    screen === "consequence" ||
    screen === "finalEncounter"
  );
}

export function hasActiveDecision(screen: string): boolean {
  return screen === "encounter";
}

export function hasDecisionFeedback(screen: string): boolean {
  return screen === "consequence";
}

export function isMovementLocked(screen: string): boolean {
  return hasActiveDecision(screen) || hasDecisionFeedback(screen) || screen !== "exploring";
}

export function acceptsMovementInput(screen: string): boolean {
  return !isMovementLocked(screen);
}

export function directionFromInput(key: string): MoveDirection | null {
  return DIRECTION_KEYS[key] ?? null;
}

export function movementFromControl(
  screen: string,
  source: "keyboard" | "touch",
  keyOrDirection: string,
): MoveDirection | null {
  void source;
  if (!acceptsMovementInput(screen)) {
    return null;
  }
  if (keyOrDirection === "up" || keyOrDirection === "down" || keyOrDirection === "left" || keyOrDirection === "right") {
    return keyOrDirection;
  }
  return directionFromInput(keyOrDirection);
}
