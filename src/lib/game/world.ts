import { PLAYTHROUGH_LENGTH } from "@/lib/missions/types";
import type { MissionId } from "@/lib/missions/types";

export const MAP_COLUMNS = 12;
export const MAP_ROWS = 8;

export interface GridPoint {
  x: number;
  y: number;
}

export type MoveDirection = "up" | "down" | "left" | "right";

export type TileKind =
  | "tree"
  | "bush"
  | "fence"
  | "office"
  | "server"
  | "short-grass"
  | "tall-grass"
  | "path"
  | "reception"
  | "door"
  | "core"
  | "rack"
  | "beacon"
  | "lava"
  | "rock"
  | "bridge"
  | "crystal"
  | "pipe"
  | "forge"
  | "cave"
  | "rail"
  | "crate"
  | "portal"
  | "vault"
  | "glow";

const TILE_CHARS: Record<string, TileKind> = {
  T: "tree",
  B: "bush",
  F: "fence",
  O: "office",
  S: "server",
  g: "short-grass",
  G: "tall-grass",
  P: "path",
  R: "reception",
  D: "door",
  C: "core",
  K: "rack",
  Y: "beacon",
  L: "lava",
  Q: "rock",
  M: "bridge",
  X: "crystal",
  I: "pipe",
  E: "forge",
  A: "cave",
  U: "rail",
  N: "crate",
  H: "portal",
  V: "vault",
  W: "glow",
};

export interface WorldMap {
  id: MissionId;
  tiles: TileKind[][];
  zones: number[][];
  start: GridPoint;
  destination: GridPoint;
  landmarkTiles: readonly GridPoint[];
}

export function pointsEqual(a: GridPoint, b: GridPoint): boolean {
  return a.x === b.x && a.y === b.y;
}

export function tileKey(point: GridPoint): string {
  return `${point.x},${point.y}`;
}

export function isInsideMap(point: GridPoint): boolean {
  return (
    point.x >= 0 &&
    point.y >= 0 &&
    point.x < MAP_COLUMNS &&
    point.y < MAP_ROWS
  );
}

export function parseTiles(layout: readonly string[]): TileKind[][] {
  if (layout.length !== MAP_ROWS) {
    throw new Error("Map layout row count is invalid");
  }
  return layout.map((row, y) => {
    if (row.length !== MAP_COLUMNS) {
      throw new Error(`Map layout row ${y} is invalid`);
    }
    return [...row].map((char) => {
      const kind = TILE_CHARS[char];
      if (!kind) {
        throw new Error(`Unknown map tile "${char}"`);
      }
      return kind;
    });
  });
}

export function parseZones(layout: readonly string[]): number[][] {
  if (layout.length !== MAP_ROWS) {
    throw new Error("Zone layout row count is invalid");
  }
  return layout.map((row, y) => {
    if (row.length !== MAP_COLUMNS) {
      throw new Error(`Zone layout row ${y} is invalid`);
    }
    return [...row].map((char) => {
      if (char === ".") {
        return -1;
      }
      const zone = Number.parseInt(char, 10);
      if (Number.isNaN(zone)) {
        throw new Error(`Unknown zone "${char}"`);
      }
      return zone;
    });
  });
}

export function zoneAt(world: WorldMap, point: GridPoint): number {
  const row = world.zones[point.y];
  const zone = row?.[point.x];
  if (zone === undefined) {
    throw new Error(`No zone at ${point.x},${point.y}`);
  }
  return zone;
}

export function tileAt(world: WorldMap, point: GridPoint): TileKind {
  const row = world.tiles[point.y];
  const kind = row?.[point.x];
  if (!kind) {
    throw new Error(`No tile at ${point.x},${point.y}`);
  }
  return kind;
}

export function isSolidTile(kind: TileKind): boolean {
  return (
    kind === "tree" ||
    kind === "bush" ||
    kind === "fence" ||
    kind === "office" ||
    kind === "server" ||
    kind === "lava" ||
    kind === "rock" ||
    kind === "pipe" ||
    kind === "crate"
  );
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

export function canEnterZone(zone: number, decisionsMade: number): boolean {
  if (zone < 0) {
    return false;
  }
  if (zone === 9) {
    return decisionsMade >= PLAYTHROUGH_LENGTH;
  }
  if (zone >= 1 && zone <= PLAYTHROUGH_LENGTH) {
    return zone <= decisionsMade + 1;
  }
  return true;
}

export function tryMove(
  world: WorldMap,
  from: GridPoint,
  direction: MoveDirection,
  decisionsMade: number,
): GridPoint | null {
  const next = stepFrom(from, direction);
  if (!isInsideMap(next)) {
    return null;
  }
  if (isSolidTile(tileAt(world, next))) {
    return null;
  }
  if (!canEnterZone(zoneAt(world, next), decisionsMade)) {
    return null;
  }
  return next;
}

export function encounterZoneForTile(
  world: WorldMap,
  point: GridPoint,
  decisionsMade: number,
): number | null {
  const zone = zoneAt(world, point);
  if (zone >= 1 && zone <= PLAYTHROUGH_LENGTH && zone === decisionsMade + 1) {
    return zone;
  }
  return null;
}

const DIRECTIONS: GridPoint[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

interface RouteState {
  x: number;
  y: number;
  progress: number;
}

function stateKey(state: RouteState): string {
  return `${state.x},${state.y},${state.progress}`;
}

export function reachableStates(world: WorldMap): Set<string> {
  const start: RouteState = {
    x: world.start.x,
    y: world.start.y,
    progress: 0,
  };
  const seen = new Set<string>([stateKey(start)]);
  const queue = [start];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    for (const step of DIRECTIONS) {
      const nextPoint = { x: current.x + step.x, y: current.y + step.y };
      if (!isInsideMap(nextPoint) || isSolidTile(tileAt(world, nextPoint))) {
        continue;
      }
      const zone = zoneAt(world, nextPoint);
      if (!canEnterZone(zone, current.progress)) {
        continue;
      }
      let progress = current.progress;
      if (zone >= 1 && zone <= PLAYTHROUGH_LENGTH && zone === current.progress + 1) {
        progress = current.progress + 1;
      }
      const next = { x: nextPoint.x, y: nextPoint.y, progress };
      const key = stateKey(next);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      queue.push(next);
    }
  }

  return seen;
}

export function destinationRequiresAllDecisions(world: WorldMap): boolean {
  const states = reachableStates(world);
  const dest = world.destination;
  if (!states.has(`${dest.x},${dest.y},${PLAYTHROUGH_LENGTH}`)) {
    return false;
  }
  for (let progress = 0; progress < PLAYTHROUGH_LENGTH; progress += 1) {
    if (states.has(`${dest.x},${dest.y},${progress}`)) {
      return false;
    }
  }
  return true;
}

export function destinationReachableAfterDecisions(world: WorldMap): boolean {
  return reachableStates(world).has(
    `${world.destination.x},${world.destination.y},${PLAYTHROUGH_LENGTH}`,
  );
}

export function noZoneSkipAdjacency(world: WorldMap): boolean {
  for (let y = 0; y < MAP_ROWS; y += 1) {
    for (let x = 0; x < MAP_COLUMNS; x += 1) {
      const zone = zoneAt(world, { x, y });
      if (zone < 0 || isSolidTile(tileAt(world, { x, y }))) {
        continue;
      }
      for (const step of DIRECTIONS) {
        const next = { x: x + step.x, y: y + step.y };
        if (!isInsideMap(next) || isSolidTile(tileAt(world, next))) {
          continue;
        }
        const other = zoneAt(world, next);
        if (other < 0) {
          continue;
        }
        if (zone <= 8 && other <= 8 && Math.abs(zone - other) > 1) {
          return false;
        }
        if (zone === 9 && other < 8 && other !== 9) {
          return false;
        }
        if (other === 9 && zone < 8 && zone !== 9) {
          return false;
        }
      }
    }
  }
  return true;
}
