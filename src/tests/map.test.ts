import { describe, expect, it } from "vitest";
import { CAVE_MAP, FOREST_MAP, LAVA_MAP, OFFICE_MAP, worldForMission } from "@/lib/game/maps";
import { tileAt } from "@/lib/game/world";
import { PLAYTHROUGH_LENGTH } from "@/lib/missions/types";

const MAPS = [FOREST_MAP, LAVA_MAP, CAVE_MAP, OFFICE_MAP];

describe("mission maps", () => {
  it("gives every mission a unique size, start and destination", () => {
    const starts = new Set(MAPS.map((world) => `${world.start.x},${world.start.y}`));
    const dests = new Set(MAPS.map((world) => `${world.destination.x},${world.destination.y}`));
    const sizes = new Set(MAPS.map((world) => `${world.columns}x${world.rows}`));
    expect(starts.size).toBeGreaterThanOrEqual(1);
    expect(dests.size).toBeGreaterThanOrEqual(1);
    expect(sizes.size).toBeGreaterThanOrEqual(1);
    for (const world of MAPS) {
      expect(tileAt(world, world.start).isStart).toBe(true);
      expect(tileAt(world, world.destination).isExit).toBe(true);
      expect(world.checkpoints).toHaveLength(8);
    }
  });

  it("uses stone surfaces on the lava map and keeps lava blocked", () => {
    const lava = LAVA_MAP;
    const walkableTypes = new Set(
      lava.tiles.flat().filter((tile) => tile.walkable).map((tile) => tile.type),
    );
    expect(walkableTypes.has("lava")).toBe(false);
    expect(walkableTypes.has("rock")).toBe(false);
    expect(walkableTypes.has("void")).toBe(false);
    expect(walkableTypes.has("stoneFloor") || walkableTypes.has("stoneBridge")).toBe(true);
    expect(tileAt(lava, lava.start).walkable).toBe(true);
  });
});

describe("checkpoint routes", () => {
  it("places eight visible checkpoints on the four classic maps", () => {
    for (const world of MAPS) {
      expect(world.checkpoints).toHaveLength(8);
      world.checkpoints.forEach((point, index) => {
        const tile = tileAt(world, point);
        expect(tile.canTriggerQuestion).toBe(true);
        expect(tile.walkable).toBe(true);
        expect(tile.checkpointOrder).toBe(index + 1);
      });
    }
  });

  it("exposes maps for all missions", () => {
    expect(worldForMission("locked-out").id).toBe("locked-out");
    expect(worldForMission("ai-forge").id).toBe("ai-forge");
    expect(worldForMission("dependency-depths").id).toBe("dependency-depths");
    expect(worldForMission("inbox-under-siege").id).toBe("inbox-under-siege");
    expect(PLAYTHROUGH_LENGTH).toBe(8);
  });
});
