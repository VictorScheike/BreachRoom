import { TILE_DEFS, unknownTileWarnings, type TileType } from "@/lib/game/tiles";
import {
  floodWalkable,
  isInsideMap,
  requiredDecisions,
  tileAt,
  tileKey,
  type WorldMap,
} from "@/lib/game/world";

const MUST_STAY_BLOCKED: readonly TileType[] = [
  "lava",
  "void",
  "wall",
  "water",
  "obstacle",
  "tree",
  "bush",
  "cliff",
  "chasm",
  "furniture",
  "desk",
  "serverRack",
  "rock",
];

export interface MapValidation {
  worldId: string;
  issues: string[];
}

function issue(world: WorldMap, message: string): string {
  return `${world.id}: ${message}`;
}

export function validateWorld(world: WorldMap, expectedCheckpoints?: number): MapValidation {
  const issues: string[] = [];
  const expected = expectedCheckpoints ?? requiredDecisions(world);

  if (world.tiles.length !== world.rows) {
    issues.push(issue(world, `tile rows ${world.tiles.length} do not match map rows ${world.rows}`));
  }
  for (const row of world.tiles) {
    if (row.length !== world.columns) {
      issues.push(issue(world, `a tile row is ${row.length} wide, expected ${world.columns}`));
    }
  }

  const startTile = tileAt(world, world.start);
  if (startTile.walkable !== true || startTile.isStart !== true) {
    issues.push(issue(world, "start tile must be a walkable start"));
  }

  const exitTile = tileAt(world, world.destination);
  if (exitTile.walkable !== true || exitTile.isExit !== true) {
    issues.push(issue(world, "exit tile must be a walkable exit"));
  }

  if (world.checkpoints.length !== expected) {
    issues.push(
      issue(world, `expected ${expected} checkpoints, found ${world.checkpoints.length}`),
    );
  }

  world.checkpoints.forEach((point, index) => {
    const tile = tileAt(world, point);
    if (tile.walkable !== true) {
      issues.push(issue(world, `checkpoint ${index + 1} is not walkable`));
    }
    if (tile.canTriggerQuestion !== true) {
      issues.push(issue(world, `checkpoint ${index + 1} cannot trigger a question`));
    }
    if (tile.checkpointOrder !== index + 1) {
      issues.push(
        issue(world, `checkpoint at ${point.x},${point.y} has order ${tile.checkpointOrder}, expected ${index + 1}`),
      );
    }
    if (!isInsideMap(world, point)) {
      issues.push(issue(world, `checkpoint ${index + 1} is outside the map`));
    }
  });

  for (let y = 0; y < world.rows; y += 1) {
    for (let x = 0; x < world.columns; x += 1) {
      const tile = tileAt(world, { x, y });
      if (MUST_STAY_BLOCKED.includes(tile.type) && tile.walkable === true) {
        issues.push(issue(world, `${tile.type} at ${x},${y} is walkable`));
      }
      if (TILE_DEFS[tile.type] === undefined) {
        issues.push(issue(world, `unknown tile type at ${x},${y}`));
      }
    }
  }

  const mapWarnings = unknownTileWarnings.filter((entry) => entry.includes(`on ${world.id}`));
  for (const warning of mapWarnings) {
    issues.push(warning);
  }

  const reached = floodWalkable(world, world.start);
  if (!reached.has(tileKey(world.start))) {
    issues.push(issue(world, "start is not reachable (start is not walkable)"));
  }
  world.checkpoints.forEach((point, index) => {
    if (!reached.has(tileKey(point))) {
      issues.push(issue(world, `checkpoint ${index + 1} cannot be reached from start`));
    }
  });
  if (!reached.has(tileKey(world.destination))) {
    issues.push(issue(world, "exit cannot be reached from start after walking the route"));
  }

  for (const key of reached) {
    const [xText, yText] = key.split(",");
    const point = { x: Number(xText), y: Number(yText) };
    const tile = tileAt(world, point);
    if (tile.walkable !== true) {
      issues.push(issue(world, `flood fill reached non-walkable tile ${key}`));
    }
  }

  return { worldId: world.id, issues };
}

export function assertWorldValid(world: WorldMap, expectedCheckpoints?: number): void {
  const result = validateWorld(world, expectedCheckpoints);
  if (result.issues.length > 0) {
    throw new Error(result.issues.join("\n"));
  }
}
