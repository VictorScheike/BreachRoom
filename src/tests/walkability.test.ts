import { describe, expect, it } from "vitest";
import { worldForMission } from "@/lib/game/maps";
import { publishedMissions } from "@/lib/missions/catalog";
import {
  initialRouteHint,
  isGeometryWalkable,
  isSpawnAccessible,
} from "@/lib/game/walkability";
import { tryMove } from "@/lib/game/world";
import { validateWorld } from "@/lib/game/validateMap";
import { playthroughLength } from "@/lib/missions/types";

describe("map walkability", () => {
  it("lets the player reach every required destination from spawn", () => {
    for (const mission of publishedMissions()) {
      const world = worldForMission(mission.id);
      expect(validateWorld(world, playthroughLength(mission)).issues).toEqual([]);
      expect(isSpawnAccessible(world)).toBe(true);
      expect(isGeometryWalkable(world, world.start)).toBe(true);
      expect(isGeometryWalkable(world, world.destination)).toBe(true);
    }
  });

  it("uses the same movement rules as the game for the opening route hint", () => {
    for (const mission of publishedMissions()) {
      const world = worldForMission(mission.id);
      const hint = initialRouteHint(world);
      let cursor = world.start;
      for (const step of hint) {
        const options = [
          tryMove(world, cursor, "up"),
          tryMove(world, cursor, "down"),
          tryMove(world, cursor, "left"),
          tryMove(world, cursor, "right"),
        ].filter(Boolean);
        expect(options.some((point) => point && point.x === step.x && point.y === step.y)).toBe(true);
        cursor = step;
      }
    }
  });
});
