import {
  closedDoorAt,
  doorsForMap,
  type DoorSpec,
} from "@/lib/game/doors";
import {
  isWalkableTile,
  tileFromChar,
  VOID_TILE,
  type MapTile,
} from "@/lib/game/tiles";
import type { MissionId } from "@/lib/missions/types";

export interface GridPoint {
  x: number;
  y: number;
}

export type MoveDirection = "up" | "down" | "left" | "right";

export type DestinationIcon = "server" | "gate" | "launch" | "hub" | "coordination";

export interface MissionDestination extends GridPoint {
  label: string;
  shortLabel: string;
  icon: DestinationIcon;
}

export interface WorldMap {
  id: MissionId;
  columns: number;
  rows: number;
  tiles: MapTile[][];
  start: GridPoint;
  destination: MissionDestination;
  checkpoints: GridPoint[];
  landmarkTiles: readonly GridPoint[];
  destinationLabel: string;
  doors: readonly DoorSpec[];
}

export interface MovementAccess {
  openDoorIds: ReadonlySet<string>;
  exitUnlocked: boolean;
}

export function geometryAccess(world: WorldMap): MovementAccess {
  return {
    openDoorIds: new Set(world.doors.map((door) => door.id)),
    exitUnlocked: true,
  };
}

export function closedMapAccess(): MovementAccess {
  return {
    openDoorIds: new Set(),
    exitUnlocked: false,
  };
}

export function playAccess(
  openDoorIds: readonly string[],
  unlockedCheckpointCount: number,
  requiredCheckpoints: number,
): MovementAccess {
  return {
    openDoorIds: new Set(openDoorIds),
    exitUnlocked: unlockedCheckpointCount >= requiredCheckpoints && requiredCheckpoints > 0,
  };
}

export const CARDINAL_STEPS: readonly GridPoint[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

export function pointsEqual(a: GridPoint, b: GridPoint): boolean {
  return a.x === b.x && a.y === b.y;
}

export function tileKey(point: GridPoint): string {
  return `${point.x},${point.y}`;
}

export function mapSize(world: WorldMap): { columns: number; rows: number } {
  return { columns: world.columns, rows: world.rows };
}

export function isInsideMap(world: WorldMap, point: GridPoint): boolean {
  return (
    point.x >= 0 &&
    point.y >= 0 &&
    point.x < world.columns &&
    point.y < world.rows
  );
}

export function tileAt(world: WorldMap, point: GridPoint): MapTile {
  if (!isInsideMap(world, point)) {
    return VOID_TILE;
  }
  return world.tiles[point.y]?.[point.x] ?? VOID_TILE;
}

export function isTileWalkable(world: WorldMap, point: GridPoint): boolean {
  return isInsideMap(world, point) && isWalkableTile(tileAt(world, point));
}

export function isTilePassable(
  world: WorldMap,
  point: GridPoint,
  access: MovementAccess,
): boolean {
  if (!isTileWalkable(world, point)) {
    return false;
  }
  if (closedDoorAt(world.doors, point, access.openDoorIds)) {
    return false;
  }
  if (!access.exitUnlocked && pointsEqual(point, world.destination)) {
    return false;
  }
  return true;
}

export function doorBlockingTile(
  world: WorldMap,
  point: GridPoint,
  access: MovementAccess,
): DoorSpec | null {
  return closedDoorAt(world.doors, point, access.openDoorIds);
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
  world: WorldMap,
  from: GridPoint,
  direction: MoveDirection,
  access: MovementAccess = geometryAccess(world),
): GridPoint | null {
  const next = stepFrom(from, direction);
  if (!isInsideMap(world, next)) {
    return null;
  }
  if (!isTilePassable(world, next, access)) {
    return null;
  }
  return next;
}

export function requiredDecisions(world: WorldMap): number {
  return world.checkpoints.length;
}

export function checkpointAt(world: WorldMap, point: GridPoint): number | null {
  const tile = tileAt(world, point);
  if (tile.canTriggerQuestion !== true || tile.checkpointOrder === undefined) {
    return null;
  }
  return tile.checkpointOrder;
}

export function nextCheckpointOrder(
  world: WorldMap,
  unlockedCheckpointOrders: readonly number[],
): number | null {
  const unlocked = new Set(unlockedCheckpointOrders);
  for (const point of world.checkpoints) {
    const order = tileAt(world, point).checkpointOrder;
    if (order !== undefined && !unlocked.has(order)) {
      return order;
    }
  }
  return null;
}

export function encounterForTile(
  world: WorldMap,
  point: GridPoint,
  unlockedCheckpointOrders: readonly number[],
): number | null {
  const order = checkpointAt(world, point);
  if (order === null) {
    return null;
  }
  if (unlockedCheckpointOrders.includes(order)) {
    return null;
  }
  return order === nextCheckpointOrder(world, unlockedCheckpointOrders) ? order : null;
}

export function findPath(
  world: WorldMap,
  from: GridPoint,
  to: GridPoint,
  access: MovementAccess,
): GridPoint[] | null {
  if (pointsEqual(from, to)) {
    return [];
  }
  if (!isTilePassable(world, to, access) && !pointsEqual(to, from)) {
    return null;
  }
  const parent = new Map<string, string | null>([[tileKey(from), null]]);
  const queue: GridPoint[] = [from];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    if (pointsEqual(current, to)) {
      const path: GridPoint[] = [];
      let cursor: string | null = tileKey(to);
      while (cursor && cursor !== tileKey(from)) {
        const [xText, yText] = cursor.split(",");
        path.push({ x: Number(xText), y: Number(yText) });
        cursor = parent.get(cursor) ?? null;
      }
      path.reverse();
      return path;
    }
    for (const direction of ["up", "down", "left", "right"] as const) {
      const next = tryMove(world, current, direction, access);
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
  return null;
}

export function firstClosedDoorOnApproach(
  world: WorldMap,
  from: GridPoint,
  to: GridPoint,
  access: MovementAccess,
): DoorSpec | null {
  const openPath = findPath(world, from, to, geometryAccess(world));
  if (!openPath) {
    return doorBlockingTile(world, to, access);
  }
  for (const point of openPath) {
    const door = doorBlockingTile(world, point, access);
    if (door) {
      return door;
    }
  }
  return null;
}

export function manhattan(a: GridPoint, b: GridPoint): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function bearingTo(
  from: GridPoint,
  to: GridPoint,
): MoveDirection | "here" {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) {
    return "here";
  }
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
}

export interface WorldSpec {
  id: MissionId;
  layout: readonly string[];
  destinationLabel: string;
  destinationShortLabel?: string;
  destinationIcon?: DestinationIcon;
}

function findPoints(tiles: MapTile[][], match: (tile: MapTile) => boolean): GridPoint[] {
  const points: GridPoint[] = [];
  for (let y = 0; y < tiles.length; y += 1) {
    const row = tiles[y];
    if (!row) {
      continue;
    }
    for (let x = 0; x < row.length; x += 1) {
      const tile = row[x];
      if (tile && match(tile)) {
        points.push({ x, y });
      }
    }
  }
  return points;
}

export function parseLayout(layout: readonly string[], mapId: string): MapTile[][] {
  const columns = layout[0]?.length;
  if (!columns) {
    throw new Error(`Map layout is empty for ${mapId}`);
  }
  return layout.map((row, y) => {
    if (row.length !== columns) {
      throw new Error(`Map layout row ${y} on ${mapId} is ${row.length} wide, expected ${columns}`);
    }
    return [...row].map((char, x) => tileFromChar(char, x, y, mapId));
  });
}

export function assembleWorld(
  spec: Omit<WorldSpec, "layout">,
  tiles: MapTile[][],
): WorldMap {
  const columns = tiles[0]?.length ?? 0;
  const rows = tiles.length;
  const starts = findPoints(tiles, (tile) => tile.isStart);
  if (starts.length !== 1) {
    throw new Error(`${spec.id} must have exactly one start tile, found ${starts.length}`);
  }
  const exits = findPoints(tiles, (tile) => tile.isExit);
  if (exits.length !== 1) {
    throw new Error(`${spec.id} must have exactly one exit tile, found ${exits.length}`);
  }
  const start = starts[0];
  const exit = exits[0];
  if (!start || !exit) {
    throw new Error(`${spec.id} is missing start or exit`);
  }

  const checkpointPoints = findPoints(tiles, (tile) => tile.canTriggerQuestion);
  const checkpoints = [...checkpointPoints].sort((a, b) => {
    const left = tiles[a.y]?.[a.x]?.checkpointOrder ?? 0;
    const right = tiles[b.y]?.[b.x]?.checkpointOrder ?? 0;
    return left - right;
  });

  const destination: MissionDestination = {
    x: exit.x,
    y: exit.y,
    label: spec.destinationLabel,
    shortLabel: spec.destinationShortLabel ?? spec.destinationLabel,
    icon: spec.destinationIcon ?? "server",
  };

  return {
    id: spec.id,
    columns,
    rows,
    tiles,
    start,
    destination,
    checkpoints,
    landmarkTiles: [exit],
    destinationLabel: destination.label,
    doors: doorsForMap(spec.id),
  };
}

export function buildWorld(spec: WorldSpec): WorldMap {
  return assembleWorld(spec, parseLayout(spec.layout, spec.id));
}

export function floodWalkable(
  world: WorldMap,
  origin: GridPoint,
  access: MovementAccess = geometryAccess(world),
): Set<string> {
  const seen = new Set<string>();
  if (!isTilePassable(world, origin, access) && !pointsEqual(origin, world.start)) {
    return seen;
  }
  if (!isTileWalkable(world, origin)) {
    return seen;
  }
  const queue = [origin];
  seen.add(tileKey(origin));
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    for (const step of CARDINAL_STEPS) {
      const next = { x: current.x + step.x, y: current.y + step.y };
      const key = tileKey(next);
      if (seen.has(key) || !isTilePassable(world, next, access)) {
        continue;
      }
      seen.add(key);
      queue.push(next);
    }
  }
  return seen;
}

export function destinationReachableAfterDecisions(world: WorldMap): boolean {
  const reached = floodWalkable(world, world.start, geometryAccess(world));
  return world.checkpoints.every((point) => reached.has(tileKey(point)))
    && reached.has(tileKey(world.destination));
}
