import { TILE_DEFS, looksLikePath, unknownTileWarnings, type TileType } from "@/lib/game/tiles";
import {
  closedMapAccess,
  floodWalkable,
  geometryAccess,
  isInsideMap,
  playAccess,
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
  "ledge",
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
      if (tile.walkable === true && !looksLikePath(tile)) {
        issues.push(issue(world, `walkable ${tile.type} at ${x},${y} does not look like a path`));
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

  const geometry = floodWalkable(world, world.start, geometryAccess(world));
  if (!geometry.has(tileKey(world.start))) {
    issues.push(issue(world, "start is not reachable (start is not walkable)"));
  }
  world.checkpoints.forEach((point, index) => {
    if (!geometry.has(tileKey(point))) {
      issues.push(issue(world, `checkpoint ${index + 1} is not on the walkable route`));
    }
  });
  if (!geometry.has(tileKey(world.destination))) {
    issues.push(issue(world, "exit is not on the walkable route"));
  }

  for (const key of geometry) {
    const [xText, yText] = key.split(",");
    const point = { x: Number(xText), y: Number(yText) };
    const tile = tileAt(world, point);
    if (tile.walkable !== true) {
      issues.push(issue(world, `flood fill reached non-walkable tile ${key}`));
    }
  }

  issues.push(...validateDoorProgression(world));

  return { worldId: world.id, issues };
}

function checkpointPoint(world: WorldMap, order: number) {
  return world.checkpoints[order - 1] ?? null;
}

function accessAfter(world: WorldMap, unlockedOrders: readonly number[]) {
  const openDoorIds = world.doors
    .filter((door) => unlockedOrders.includes(door.requiredCheckpointOrder))
    .map((door) => door.id);
  return playAccess(openDoorIds, unlockedOrders.length, world.checkpoints.length);
}

function occupiedByRouteMarker(world: WorldMap, point: { x: number; y: number }): string | null {
  if (point.x === world.start.x && point.y === world.start.y) {
    return "player spawn";
  }
  if (point.x === world.destination.x && point.y === world.destination.y) {
    return "exit";
  }
  const checkpoint = world.checkpoints.findIndex((item) => item.x === point.x && item.y === point.y);
  if (checkpoint >= 0) {
    return `checkpoint ${checkpoint + 1}`;
  }
  return null;
}

export function validateDoorProgression(world: WorldMap): string[] {
  const issues: string[] = [];
  const seenTiles = new Set<string>();
  const seenOrders = new Set<number>();

  if (world.doors.length === 0) {
    issues.push(issue(world, "walking map must define at least one progression door"));
  }

  for (const door of world.doors) {
    if (door.mapId !== world.id) {
      issues.push(issue(world, `door ${door.id} belongs to ${door.mapId}`));
    }
    if (door.blockedTiles.length === 0) {
      issues.push(issue(world, `door ${door.id} blocks no tiles`));
    }
    if (
      door.requiredCheckpointOrder < 1 ||
      door.requiredCheckpointOrder > world.checkpoints.length
    ) {
      issues.push(
        issue(world, `door ${door.id} requires checkpoint ${door.requiredCheckpointOrder}`),
      );
    }
    if (seenOrders.has(door.requiredCheckpointOrder)) {
      issues.push(
        issue(world, `checkpoint ${door.requiredCheckpointOrder} unlocks more than one door`),
      );
    }
    seenOrders.add(door.requiredCheckpointOrder);

    for (const point of door.blockedTiles) {
      const key = tileKey(point);
      if (seenTiles.has(key)) {
        issues.push(issue(world, `door ${door.id} overlaps another door at ${key}`));
      }
      seenTiles.add(key);
      if (!isInsideMap(world, point)) {
        issues.push(issue(world, `door ${door.id} is outside the map at ${key}`));
      }
      const tile = tileAt(world, point);
      if (tile.walkable !== true) {
        issues.push(issue(world, `door ${door.id} overlaps a wall at ${key}`));
      }
      const occupant = occupiedByRouteMarker(world, point);
      if (occupant) {
        issues.push(issue(world, `door ${door.id} overlaps ${occupant} at ${key}`));
      }
    }
  }

  const closed = floodWalkable(world, world.start, closedMapAccess());
  const first = checkpointPoint(world, 1);
  if (first && !closed.has(tileKey(first))) {
    issues.push(issue(world, "the first required question is not reachable from spawn"));
  }
  if (closed.has(tileKey(world.destination))) {
    issues.push(issue(world, "the exit is reachable before any doors open"));
  }

  for (const door of world.doors) {
    const required = checkpointPoint(world, door.requiredCheckpointOrder);
    if (!required) {
      continue;
    }
    const beforeOwnDoor = floodWalkable(
      world,
      world.start,
      accessAfter(
        world,
        Array.from({ length: door.requiredCheckpointOrder - 1 }, (_, index) => index + 1),
      ),
    );
    if (!beforeOwnDoor.has(tileKey(required))) {
      issues.push(
        issue(
          world,
          `door ${door.id} blocks access to its own checkpoint ${door.requiredCheckpointOrder}`,
        ),
      );
    }
    if (beforeOwnDoor.has(tileKey(world.destination))) {
      issues.push(
        issue(world, `exit is reachable before door ${door.id} opens`),
      );
    }
  }

  let unlocked: number[] = [];
  for (let order = 1; order <= world.checkpoints.length; order += 1) {
    const point = checkpointPoint(world, order);
    if (!point) {
      continue;
    }
    const reached = floodWalkable(world, world.start, accessAfter(world, unlocked));
    if (!reached.has(tileKey(point))) {
      issues.push(
        issue(world, `checkpoint ${order} is not reachable after unlocking ${unlocked.join(", ") || "nothing"}`),
      );
      break;
    }
    unlocked = [...unlocked, order];
  }

  const beforeExit = floodWalkable(
    world,
    world.start,
    accessAfter(world, Array.from({ length: world.checkpoints.length - 1 }, (_, index) => index + 1)),
  );
  if (beforeExit.has(tileKey(world.destination))) {
    issues.push(issue(world, "the exit is reachable before every mandatory question is completed"));
  }

  const afterAll = floodWalkable(
    world,
    world.start,
    accessAfter(
      world,
      world.checkpoints.map((_, index) => index + 1),
    ),
  );
  if (!afterAll.has(tileKey(world.destination))) {
    issues.push(issue(world, "the exit is not reachable after every required door opens"));
  }

  for (let order = 1; order <= world.checkpoints.length; order += 1) {
    const unlocked = Array.from({ length: order - 1 }, (_, index) => index + 1);
    const reached = floodWalkable(world, world.start, accessAfter(world, unlocked));
    const current = checkpointPoint(world, order);
    if (current && !reached.has(tileKey(current))) {
      issues.push(
        issue(
          world,
          `checkpoint ${order} is not reachable after unlocking ${unlocked.join(", ") || "nothing"}`,
        ),
      );
    }
    for (let later = order + 1; later <= world.checkpoints.length; later += 1) {
      const doorBetween = world.doors.some(
        (door) => door.requiredCheckpointOrder >= order && door.requiredCheckpointOrder < later,
      );
      const laterPoint = checkpointPoint(world, later);
      if (!laterPoint) {
        continue;
      }
      if (doorBetween && reached.has(tileKey(laterPoint))) {
        issues.push(
          issue(
            world,
            `checkpoint ${later} is reachable while door for checkpoint ${order} is still closed`,
          ),
        );
      }
    }
    if (reached.has(tileKey(world.destination))) {
      issues.push(issue(world, `exit is reachable before checkpoint ${order} is completed`));
    }
  }

  return issues;
}

export function assertWorldValid(world: WorldMap, expectedCheckpoints?: number): void {
  const result = validateWorld(world, expectedCheckpoints);
  if (result.issues.length > 0) {
    throw new Error(result.issues.join("\n"));
  }
}
