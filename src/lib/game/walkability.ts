import {
  destinationReachableAfterDecisions,
  isInsideMap,
  isSolidTile,
  requiredDecisions,
  stepFrom,
  tileAt,
  tileKey,
  tryMove,
  zoneAt,
  type GridPoint,
  type MoveDirection,
  type WorldMap,
} from "@/lib/game/world";

const CARDINALS: readonly MoveDirection[] = ["up", "down", "left", "right"];

export function isGeometryWalkable(world: WorldMap, point: GridPoint): boolean {
  return isInsideMap(world, point) && !isSolidTile(tileAt(world, point)) && zoneAt(world, point) >= 0;
}

export function isSpawnAccessible(world: WorldMap): boolean {
  return isGeometryWalkable(world, world.start);
}

export function checkpointZones(world: WorldMap): number[] {
  const needed = requiredDecisions(world);
  return Array.from({ length: needed }, (_, index) => index + 1);
}

export function isCheckpointTile(world: WorldMap, point: GridPoint): boolean {
  if (!isGeometryWalkable(world, point)) {
    return false;
  }
  if (point.x === world.destination.x && point.y === world.destination.y) {
    return false;
  }
  const zone = zoneAt(world, point);
  return zone >= 1 && zone <= requiredDecisions(world);
}

function reachableWithProgress(world: WorldMap): Set<string> {
  const start = { ...world.start, progress: 0 };
  const seen = new Set<string>([`${tileKey(start)}:${start.progress}`]);
  const queue = [start];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    for (const direction of CARDINALS) {
      const nextPoint = tryMove(world, current, direction, current.progress);
      if (!nextPoint) {
        continue;
      }
      const zone = zoneAt(world, nextPoint);
      const needed = requiredDecisions(world);
      let progress = current.progress;
      if (zone >= 1 && zone <= needed && zone === current.progress + 1) {
        progress = current.progress + 1;
      }
      const key = `${tileKey(nextPoint)}:${progress}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      queue.push({ ...nextPoint, progress });
    }
  }
  return seen;
}

export function walkabilityIssues(world: WorldMap): string[] {
  const issues: string[] = [];
  if (!isSpawnAccessible(world)) {
    issues.push(`${world.id}: spawn is blocked or inaccessible`);
  }
  if (isSolidTile(tileAt(world, world.destination)) || zoneAt(world, world.destination) < 0) {
    issues.push(`${world.id}: destination is blocked`);
  }
  if (!destinationReachableAfterDecisions(world)) {
    issues.push(`${world.id}: destination is not reachable from spawn under game movement rules`);
  }

  const reached = reachableWithProgress(world);
  const needed = requiredDecisions(world);
  for (const zone of checkpointZones(world)) {
    let found = false;
    for (let y = 0; y < world.rows; y += 1) {
      for (let x = 0; x < world.columns; x += 1) {
        if (zoneAt(world, { x, y }) !== zone || isSolidTile(tileAt(world, { x, y }))) {
          continue;
        }
        if (reached.has(`${x},${y}:${zone}`)) {
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
    if (!found) {
      issues.push(`${world.id}: checkpoint zone ${zone} is not reachable`);
    }
  }

  const destKey = `${world.destination.x},${world.destination.y}:${needed}`;
  if (!reached.has(destKey)) {
    issues.push(`${world.id}: final objective is not reachable after required decisions`);
  }
  return issues;
}

function directionBetween(from: GridPoint, to: GridPoint): MoveDirection | null {
  for (const direction of CARDINALS) {
    const stepped = stepFrom(from, direction);
    if (stepped.x === to.x && stepped.y === to.y) {
      return direction;
    }
  }
  return null;
}

export function initialRouteHint(world: WorldMap, maxSteps = 6): GridPoint[] {
  if (!isSpawnAccessible(world)) {
    return [];
  }
  const needed = requiredDecisions(world);
  const startKey = tileKey(world.start);
  const parent = new Map<string, string | null>([[startKey, null]]);
  const queue: GridPoint[] = [world.start];
  let goal: GridPoint | null = null;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    const zone = zoneAt(world, current);
    if (zone === 1 || (needed === 0 && current.x === world.destination.x && current.y === world.destination.y)) {
      if (!(current.x === world.start.x && current.y === world.start.y)) {
        goal = current;
        break;
      }
    }
    for (const direction of CARDINALS) {
      const next = tryMove(world, current, direction, 0);
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

export function adjacentMove(
  from: GridPoint,
  to: GridPoint,
): MoveDirection | null {
  if (Math.abs(from.x - to.x) + Math.abs(from.y - to.y) !== 1) {
    return null;
  }
  return directionBetween(from, to);
}
