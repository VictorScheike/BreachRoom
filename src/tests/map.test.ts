import { describe, expect, it } from "vitest";
import { CAVE_MAP, FOREST_MAP, LAVA_MAP, worldForMission } from "@/lib/game/maps";
import {
  destinationReachableAfterDecisions,
  destinationRequiresAllDecisions,
  isSolidTile,
  noZoneSkipAdjacency,
  tileAt,
  tryMove,
  zoneAt,
} from "@/lib/game/world";
import { PLAYTHROUGH_LENGTH } from "@/lib/missions/types";

const MAPS = [FOREST_MAP, LAVA_MAP, CAVE_MAP];

describe("mission maps", () => {
  it("uses a 12 by 8 field with a visible destination landmark", () => {
    for (const world of MAPS) {
      expect(world.tiles).toHaveLength(8);
      expect(world.tiles[0]).toHaveLength(12);
      expect(world.landmarkTiles.length).toBeGreaterThanOrEqual(6);
      expect(tileAt(world, world.start)).toBeTruthy();
      expect(zoneAt(world, world.destination)).toBe(9);
    }
  });

  it("blocks solid tiles and the destination until eight decisions", () => {
    expect(tryMove(FOREST_MAP, { x: 3, y: 6 }, "up", 0)).toBeNull();
    expect(isSolidTile("tree")).toBe(true);
    expect(tryMove(FOREST_MAP, { x: 7, y: 1 }, "right", 7)).toBeNull();
    expect(tryMove(FOREST_MAP, { x: 7, y: 1 }, "right", 8)).toEqual({ x: 8, y: 1 });
  });

  it("keeps neighbouring walkable zones within one step", () => {
    for (const world of MAPS) {
      expect(noZoneSkipAdjacency(world)).toBe(true);
    }
  });
});

describe("checkpoint routes", () => {
  it("requires all eight decisions on every path to the destination", () => {
    for (const world of MAPS) {
      expect(destinationRequiresAllDecisions(world)).toBe(true);
      expect(destinationReachableAfterDecisions(world)).toBe(true);
    }
  });

  it("exposes maps for all three missions", () => {
    expect(worldForMission("locked-out").id).toBe("locked-out");
    expect(worldForMission("ai-forge").id).toBe("ai-forge");
    expect(worldForMission("dependency-depths").id).toBe("dependency-depths");
    expect(PLAYTHROUGH_LENGTH).toBe(8);
  });
});
