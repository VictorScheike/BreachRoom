export const GRID_SIZE = 20;
export const ENCOUNTER_EVERY = 3;

export interface GridPoint {
  x: number;
  y: number;
}

export const START_TILE: GridPoint = { x: 0, y: GRID_SIZE - 1 };
export const GOAL_TILE: GridPoint = { x: GRID_SIZE - 1, y: 0 };

export type MoveDirection = "up" | "down" | "left" | "right";

export function isInsideGrid(point: GridPoint): boolean {
  return (
    point.x >= 0 &&
    point.y >= 0 &&
    point.x < GRID_SIZE &&
    point.y < GRID_SIZE
  );
}

export function pointsEqual(a: GridPoint, b: GridPoint): boolean {
  return a.x === b.x && a.y === b.y;
}

export function isGoalTile(point: GridPoint): boolean {
  return pointsEqual(point, GOAL_TILE);
}

export function stepFrom(point: GridPoint, direction: MoveDirection): GridPoint {
  switch (direction) {
    case "up":
      return { x: point.x, y: point.y - 1 };
    case "down":
      return { x: point.x, y: point.y + 1 };
    case "left":
      return { x: point.x - 1, y: point.y };
    case "right":
      return { x: point.x + 1, y: point.y };
    default: {
      const unhandled: never = direction;
      return unhandled;
    }
  }
}

export function tryMove(
  from: GridPoint,
  direction: MoveDirection,
  obstaclesCleared: number,
  totalObstacles: number,
): GridPoint | null {
  const next = stepFrom(from, direction);
  if (!isInsideGrid(next)) {
    return null;
  }
  if (isGoalTile(next) && obstaclesCleared < totalObstacles) {
    return null;
  }
  return next;
}

export function nextStepsUntilEncounter(stepsSinceEncounter: number): number {
  const remainder = stepsSinceEncounter % ENCOUNTER_EVERY;
  if (remainder === 0) {
    return ENCOUNTER_EVERY;
  }
  return ENCOUNTER_EVERY - remainder;
}

export function shouldTriggerEncounter(
  stepsSinceEncounter: number,
  remainingObstacles: number,
): boolean {
  if (remainingObstacles <= 0) {
    return false;
  }
  return stepsSinceEncounter > 0 && stepsSinceEncounter % ENCOUNTER_EVERY === 0;
}
