import { describe, expect, it } from "vitest";
import { ALL_MAPS } from "@/lib/game/maps";
import { destinationReachableAfterDecisions, floodWalkable, tileKey } from "@/lib/game/world";

describe("every valid route hits the required checkpoints", () => {
  it("can reach every checkpoint and the exit from spawn", () => {
    for (const world of ALL_MAPS) {
      expect(destinationReachableAfterDecisions(world)).toBe(true);
      const reached = floodWalkable(world, world.start);
      expect(reached.has(tileKey(world.start))).toBe(true);
      expect(reached.has(tileKey(world.destination))).toBe(true);
      for (const point of world.checkpoints) {
        expect(reached.has(tileKey(point))).toBe(true);
      }
    }
  });
});
