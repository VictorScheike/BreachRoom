import { describe, expect, it } from "vitest";
import { CAVE_MAP, FOREST_MAP, LAVA_MAP, OFFICE_MAP, worldForMission } from "@/lib/game/maps";
import {
  destinationReachableAfterDecisions,
  destinationRequiresAllDecisions,
  isSolidTile,
  noZoneSkipAdjacency,
  tileAt,
  zoneAt,
} from "@/lib/game/world";
import { PLAYTHROUGH_LENGTH } from "@/lib/missions/types";

const MAPS = [FOREST_MAP, LAVA_MAP, CAVE_MAP, OFFICE_MAP];

describe("mission maps", () => {
  it("gives every mission a unique size, start and destination", () => {
    const starts = new Set(MAPS.map((world) => `${world.start.x},${world.start.y}`));
    const dests = new Set(MAPS.map((world) => `${world.destination.x},${world.destination.y}`));
    const sizes = new Set(MAPS.map((world) => `${world.columns}x${world.rows}`));
    expect(starts.size).toBe(4);
    expect(dests.size).toBe(4);
    expect(sizes.size).toBeGreaterThanOrEqual(3);
    for (const world of MAPS) {
      expect(tileAt(world, world.start)).toBeTruthy();
      expect(zoneAt(world, world.destination)).toBe(9);
    }
  });

  it("keeps neighbouring walkable zones within one step", () => {
    for (const world of MAPS) {
      expect(noZoneSkipAdjacency(world)).toBe(true);
      expect(isSolidTile("tree")).toBe(true);
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

  it("exposes maps for all four missions", () => {
    expect(worldForMission("locked-out").id).toBe("locked-out");
    expect(worldForMission("ai-forge").id).toBe("ai-forge");
    expect(worldForMission("dependency-depths").id).toBe("dependency-depths");
    expect(worldForMission("inbox-under-siege").id).toBe("inbox-under-siege");
    expect(PLAYTHROUGH_LENGTH).toBe(8);
  });
});
