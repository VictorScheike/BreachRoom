export const MAP_COLUMNS = 12;
export const MAP_ROWS = 8;
export const GRASS_STEPS_PER_ENCOUNTER = 2;
export const SERVER_ENCOUNTER_INDEX = 7;

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
  | "core";

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
};

const LAYOUT = [
  "TTTGGFSSCCTT",
  "TGggggggDSTT",
  "TgPgOOOgggGT",
  "TBGgggggBBGT",
  "FFPgggggggGT",
  "OOOgBGgggGgT",
  "RRPPggggGgGT",
  "RRggBBgggBTT",
] as const;

export const START_TILE: GridPoint = { x: 1, y: 6 };
export const DOOR_TILE: GridPoint = { x: 8, y: 1 };
export const CORE_TILE: GridPoint = { x: 8, y: 0 };

function parseLayout(): TileKind[][] {
  if (LAYOUT.length !== MAP_ROWS) {
    throw new Error("Map layout row count is invalid");
  }
  return LAYOUT.map((row, y) => {
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

export const MAP_TILES = parseLayout();

export function tileAt(point: GridPoint): TileKind {
  const row = MAP_TILES[point.y];
  const kind = row?.[point.x];
  if (!kind) {
    throw new Error(`No tile at ${point.x},${point.y}`);
  }
  return kind;
}

export function isInsideMap(point: GridPoint): boolean {
  return (
    point.x >= 0 &&
    point.y >= 0 &&
    point.x < MAP_COLUMNS &&
    point.y < MAP_ROWS
  );
}

export function pointsEqual(a: GridPoint, b: GridPoint): boolean {
  return a.x === b.x && a.y === b.y;
}

export function tileKey(point: GridPoint): string {
  return `${point.x},${point.y}`;
}

export function isGrassTile(kind: TileKind): boolean {
  return kind === "short-grass" || kind === "tall-grass";
}

export function isBlockedTile(
  kind: TileKind,
  decisionsMade: number,
  totalDecisions: number,
): boolean {
  if (
    kind === "tree" ||
    kind === "bush" ||
    kind === "fence" ||
    kind === "office" ||
    kind === "server"
  ) {
    return true;
  }
  if (kind === "door" && decisionsMade < totalDecisions - 1) {
    return true;
  }
  if (kind === "core" && decisionsMade < totalDecisions) {
    return true;
  }
  return false;
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
  decisionsMade: number,
  totalDecisions: number,
): GridPoint | null {
  const next = stepFrom(from, direction);
  if (!isInsideMap(next)) {
    return null;
  }
  if (isBlockedTile(tileAt(next), decisionsMade, totalDecisions)) {
    return null;
  }
  return next;
}

export function shouldTriggerGrassEncounter(
  unvisitedGrassSinceEncounter: number,
  decisionsMade: number,
  totalDecisions: number,
): boolean {
  const remainingFieldEncounters = Math.max(
    0,
    totalDecisions - 1 - decisionsMade,
  );
  return (
    remainingFieldEncounters > 0 &&
    unvisitedGrassSinceEncounter >= GRASS_STEPS_PER_ENCOUNTER
  );
}

export function isServerEntranceEncounter(
  point: GridPoint,
  decisionsMade: number,
  totalDecisions: number,
): boolean {
  return (
    pointsEqual(point, DOOR_TILE) && decisionsMade === totalDecisions - 1
  );
}

export function isCoreTile(point: GridPoint): boolean {
  return tileAt(point) === "core";
}
