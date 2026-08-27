import { describe, expect, it } from "vitest";
import { ALL_MAPS, LAVA_MAP, worldForMission } from "@/lib/game/maps";
import { TILE_DEFS, isWalkableTile, looksLikePath, tileFromChar } from "@/lib/game/tiles";
import { assertWorldValid, validateWorld } from "@/lib/game/validateMap";
import { tryMove } from "@/lib/game/world";
import { publishedMissions } from "@/lib/missions/catalog";
import { playthroughLength } from "@/lib/missions/types";

describe("shared tile registry", () => {
  it("only treats explicitly walkable tiles as walkable", () => {
    expect(TILE_DEFS.lava.walkable).toBe(false);
    expect(TILE_DEFS.void.walkable).toBe(false);
    expect(TILE_DEFS.wall.walkable).toBe(false);
    expect(TILE_DEFS.water.walkable).toBe(false);
    expect(TILE_DEFS.rock.walkable).toBe(false);
    expect(TILE_DEFS.ledge.walkable).toBe(false);
    expect(TILE_DEFS.stoneFloor.walkable).toBe(true);
    expect(TILE_DEFS.stoneBridge.walkable).toBe(true);
    expect(TILE_DEFS.path.walkable).toBe(true);
    expect(TILE_DEFS.checkpoint.walkable).toBe(true);
    expect(TILE_DEFS.start.walkable).toBe(true);
    expect(TILE_DEFS.exit.walkable).toBe(true);
    expect(isWalkableTile(undefined)).toBe(false);
    expect(isWalkableTile(null)).toBe(false);
  });

  it("treats unknown tile characters as blocked void", () => {
    const warn = console.warn;
    const messages: string[] = [];
    console.warn = (message: string) => {
      messages.push(message);
    };
    const tile = tileFromChar("?", 3, 4, "test-map");
    console.warn = warn;
    expect(tile.type).toBe("void");
    expect(tile.walkable).toBe(false);
    expect(messages.some((entry) => entry.includes('Unknown tile type "?"'))).toBe(true);
  });
});

describe("map validation", () => {
  it("validates every published mission map against real movement rules", () => {
    for (const mission of publishedMissions()) {
      const world = worldForMission(mission.id);
      const expected = playthroughLength(mission);
      const result = validateWorld(world, expected);
      expect(result.issues, result.issues.join("\n")).toEqual([]);
      assertWorldValid(world, expected);
    }
  });

  it("keeps the rendered grid and movement grid the same size", () => {
    for (const world of ALL_MAPS) {
      expect(world.tiles).toHaveLength(world.rows);
      for (const row of world.tiles) {
        expect(row).toHaveLength(world.columns);
      }
    }
  });

  it("refuses movement into lava, void, walls and scenery", () => {
    const lava = worldForMission("ai-forge");
    const from = lava.start;
    const blocked = ["up", "down", "left", "right"] as const;
    const movedOntoBlocked = blocked.some((direction) => {
      const next = tryMove(lava, from, direction);
      if (!next) {
        return false;
      }
      return lava.tiles[next.y]?.[next.x]?.walkable !== true;
    });
    expect(movedOntoBlocked).toBe(false);
    expect(lava.tiles[0]?.[0]?.walkable).toBe(false);
    expect(tryMove(lava, { x: 0, y: 0 }, "right")).toBeNull();
    expect(tryMove(lava, { x: 0, y: 0 }, "down")).toBeNull();
  });

  it("gives every mission a distinct walkable route", () => {
    const fingerprints = ALL_MAPS.map((world) =>
      world.tiles
        .map((row) => row.map((tile) => (tile.walkable ? "1" : "0")).join(""))
        .join("/"),
    );
    expect(new Set(fingerprints).size).toBe(ALL_MAPS.length);
  });

  it("does not hide checkpoints under the exit label", () => {
    for (const world of ALL_MAPS) {
      const covered =
        world.destination.y <= 1
          ? [
              { x: world.destination.x, y: world.destination.y + 1 },
              { x: world.destination.x - 1, y: world.destination.y + 1 },
              { x: world.destination.x + 1, y: world.destination.y + 1 },
            ]
          : [
              { x: world.destination.x, y: world.destination.y - 1 },
              { x: world.destination.x - 1, y: world.destination.y - 1 },
              { x: world.destination.x + 1, y: world.destination.y - 1 },
            ];
      for (const point of covered) {
        const hidden = world.checkpoints.some(
          (checkpoint) => checkpoint.x === point.x && checkpoint.y === point.y,
        );
        expect(hidden, `${world.id} checkpoint hidden at ${point.x},${point.y}`).toBe(false);
      }
    }
  });

  it("keeps lava as the blocked background with a minority stone route", () => {
    const tiles = LAVA_MAP.tiles.flat();
    const lavaCount = tiles.filter((tile) => tile.type === "lava").length;
    const walkableCount = tiles.filter((tile) => tile.walkable).length;
    const blockedCount = tiles.length - walkableCount;
    expect(lavaCount).toBeGreaterThan(40);
    expect(blockedCount).toBeGreaterThan(walkableCount);
    expect(walkableCount / tiles.length).toBeLessThan(0.45);
    expect(tiles.some((tile) => tile.type === "stoneBridge")).toBe(true);
    expect(tiles.some((tile) => tile.type === "ledge")).toBe(true);
    expect(looksLikePath(LAVA_MAP.tiles[LAVA_MAP.start.y]?.[LAVA_MAP.start.x])).toBe(true);
  });

  it("never places the player or a question on a tile that looks blocked", () => {
    for (const world of ALL_MAPS) {
      const start = world.tiles[world.start.y]?.[world.start.x];
      expect(looksLikePath(start), `${world.id} start looks blocked`).toBe(true);
      const walkableNeighbors = [
        { x: world.start.x + 1, y: world.start.y },
        { x: world.start.x - 1, y: world.start.y },
        { x: world.start.x, y: world.start.y + 1 },
        { x: world.start.x, y: world.start.y - 1 },
      ].filter((point) => world.tiles[point.y]?.[point.x]?.walkable === true);
      expect(walkableNeighbors.length, `${world.id} start is not on an interior path tile`).toBeGreaterThanOrEqual(2);
      for (const point of world.checkpoints) {
        expect(
          looksLikePath(world.tiles[point.y]?.[point.x]),
          `${world.id} checkpoint at ${point.x},${point.y} does not look like a path`,
        ).toBe(true);
      }
      expect(looksLikePath(world.tiles[world.destination.y]?.[world.destination.x])).toBe(true);
      for (const row of world.tiles) {
        for (const tile of row) {
          if (tile.walkable) {
            expect(looksLikePath(tile)).toBe(true);
          }
        }
      }
    }
  });
});
