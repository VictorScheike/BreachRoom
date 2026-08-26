import { isWalkableTile } from "@/lib/game/tiles";
import {
  isInsideMap,
  stepFrom,
  tileAt,
  tileKey,
  tryMove,
  type GridPoint,
  type MoveDirection,
  type WorldMap,
} from "@/lib/game/world";

const CARDINALS: readonly MoveDirection[] = ["up", "down", "left", "right"];

export function isGeometryWalkable(world: WorldMap, point: GridPoint): boolean {
  return isInsideMap(world, point) && isWalkableTile(tileAt(world, point));
}

export function isSpawnAccessible(world: WorldMap): boolean {
  return isGeometryWalkable(world, world.start) && tileAt(world, world.start).isStart === true;
}

export function isCheckpointTile(world: WorldMap, point: GridPoint): boolean {
  const tile = tileAt(world, point);
  return tile.canTriggerQuestion === true && tile.walkable === true;
}

export function isCompletedCheckpoint(
  world: WorldMap,
  point: GridPoint,
  decisionsMade: number,
): boolean {
  const tile = tileAt(world, point);
  return (
    isCheckpointTile(world, point) &&
    tile.checkpointOrder !== undefined &&
    tile.checkpointOrder <= decisionsMade
  );
}

export function initialRouteHint(world: WorldMap, maxSteps = 6): GridPoint[] {
  if (!isSpawnAccessible(world)) {
    return [];
  }
  const first = world.checkpoints[0];
  if (!first) {
    return [];
  }
  const startKey = tileKey(world.start);
  const parent = new Map<string, string | null>([[startKey, null]]);
  const queue: GridPoint[] = [world.start];
  let goal: GridPoint | null = null;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    if (current.x === first.x && current.y === first.y) {
      goal = current;
      break;
    }
    for (const direction of CARDINALS) {
      const next = tryMove(world, current, direction);
      if (!next) {
        continue;
      }
      const key = tileKey(next);
      if (parent.has(key)) {
        continue;
      }
      parent.set(key, tileKey(current));
      queue.push(next);
    }
  }

  if (!goal) {
    return [];
  }

  const path: GridPoint[] = [];
  let cursor: string | null = tileKey(goal);
  while (cursor) {
    const [xText, yText] = cursor.split(",");
    path.push({ x: Number(xText), y: Number(yText) });
    cursor = parent.get(cursor) ?? null;
  }
  path.reverse();
  return path.slice(1, maxSteps + 1);
}

export function adjacentMove(from: GridPoint, to: GridPoint): MoveDirection | null {
  for (const direction of CARDINALS) {
    const stepped = stepFrom(from, direction);
    if (stepped.x === to.x && stepped.y === to.y) {
      return direction;
    }
  }
  return null;
}
