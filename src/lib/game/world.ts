import type { MissionId } from "@/lib/missions/types";

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
  | "glow"
  | "hub"
  | "desk";

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
  J: "hub",
  Z: "desk",
};

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
  tiles: TileKind[][];
  zones: number[][];
  start: GridPoint;
  destination: MissionDestination;
  landmarkTiles: readonly GridPoint[];
  destinationLabel: string;
}

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

export function parseTiles(layout: readonly string[]): TileKind[][] {
  const columns = layout[0]?.length;
  if (!columns) {
    throw new Error("Map layout is empty");
  }
  return layout.map((row, y) => {
    if (row.length !== columns) {
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
  const columns = layout[0]?.length;
  if (!columns) {
    throw new Error("Zone layout is empty");
  }
  return layout.map((row, y) => {
    if (row.length !== columns) {
      throw new Error(`Zone layout row ${y} is invalid`);
    }
    return [...row].map((char) => {
      if (char === ".") {
        return -1;
      }
      const zone = Number.parseInt(char, 36);
      if (Number.isNaN(zone)) {
        throw new Error(`Unknown zone "${char}"`);
      }
      return zone;
    });
  });
}

export interface WorldSpec {
  id: MissionId;
  start: GridPoint;
  destination: GridPoint;
  tilesLayout: readonly string[];
  zonesLayout: readonly string[];
  landmarkTiles: readonly GridPoint[];
  destinationLabel: string;
  destinationShortLabel?: string;
  destinationIcon?: DestinationIcon;
}

export function buildWorld(spec: WorldSpec): WorldMap {
  const tiles = parseTiles(spec.tilesLayout);
  const zones = parseZones(spec.zonesLayout);
  if (tiles.length !== zones.length || tiles[0]?.length !== zones[0]?.length) {
    throw new Error(`Tile and zone grids do not match for ${spec.id}`);
  }
  const destination: MissionDestination = {
    x: spec.destination.x,
    y: spec.destination.y,
    label: spec.destinationLabel,
    shortLabel: spec.destinationShortLabel ?? spec.destinationLabel,
    icon: spec.destinationIcon ?? "server",
  };
  return {
    id: spec.id,
    columns: tiles[0]?.length ?? 0,
    rows: tiles.length,
    tiles,
    zones,
    start: spec.start,
    destination,
    landmarkTiles: spec.landmarkTiles,
    destinationLabel: destination.label,
  };
}

export function zoneAt(world: WorldMap, point: GridPoint): number {
  const zone = world.zones[point.y]?.[point.x];
  if (zone === undefined) {
    throw new Error(`No zone at ${point.x},${point.y}`);
  }
  return zone;
}

export function tileAt(world: WorldMap, point: GridPoint): TileKind {
  const kind = world.tiles[point.y]?.[point.x];
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

export function destinationZone(world: WorldMap): number {
  return zoneAt(world, world.destination);
}

export function requiredDecisions(world: WorldMap): number {
  return destinationZone(world) - 1;
}

export function canEnterZone(world: WorldMap, zone: number, decisionsMade: number): boolean {
  if (zone < 0) {
    return false;
  }
  const needed = requiredDecisions(world);
  const dest = destinationZone(world);
  if (zone === dest) {
    return decisionsMade >= needed;
  }
  if (zone >= 1 && zone <= needed) {
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
  if (!isInsideMap(world, next)) {
    return null;
  }
  if (isSolidTile(tileAt(world, next))) {
    return null;
  }
  if (!canEnterZone(world, zoneAt(world, next), decisionsMade)) {
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
  const needed = requiredDecisions(world);
  if (zone >= 1 && zone <= needed && zone === decisionsMade + 1) {
    return zone;
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
      if (!isInsideMap(world, nextPoint) || isSolidTile(tileAt(world, nextPoint))) {
        continue;
      }
      const zone = zoneAt(world, nextPoint);
      if (!canEnterZone(world, zone, current.progress)) {
        continue;
      }
      let progress = current.progress;
      const needed = requiredDecisions(world);
      if (zone >= 1 && zone <= needed && zone === current.progress + 1) {
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
  const needed = requiredDecisions(world);
  if (!states.has(`${dest.x},${dest.y},${needed}`)) {
    return false;
  }
  for (let progress = 0; progress < needed; progress += 1) {
    if (states.has(`${dest.x},${dest.y},${progress}`)) {
      return false;
    }
  }
  return true;
}

export function destinationReachableAfterDecisions(world: WorldMap): boolean {
  const needed = requiredDecisions(world);
  return reachableStates(world).has(
    `${world.destination.x},${world.destination.y},${needed}`,
  );
}

export function noZoneSkipAdjacency(world: WorldMap): boolean {
  for (let y = 0; y < world.rows; y += 1) {
    for (let x = 0; x < world.columns; x += 1) {
      const zone = zoneAt(world, { x, y });
      if (zone < 0 || isSolidTile(tileAt(world, { x, y }))) {
        continue;
      }
      for (const step of DIRECTIONS) {
        const next = { x: x + step.x, y: y + step.y };
        if (!isInsideMap(world, next) || isSolidTile(tileAt(world, next))) {
          continue;
        }
        const other = zoneAt(world, next);
        if (other < 0) {
          continue;
        }
        const needed = requiredDecisions(world);
        const dest = destinationZone(world);
        if (zone <= needed && other <= needed && Math.abs(zone - other) > 1) {
          return false;
        }
        if (zone === dest && other < needed - 1 && other !== dest) {
          return false;
        }
        if (other === dest && zone < needed - 1 && zone !== dest) {
          return false;
        }
      }
    }
  }
  return true;
}
