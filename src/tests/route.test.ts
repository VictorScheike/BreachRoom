import { describe, expect, it } from "vitest";
import { FOREST_MAP, LAVA_MAP, CAVE_MAP } from "@/lib/game/maps";
import {
  destinationReachableAfterDecisions,
  destinationRequiresAllDecisions,
  noZoneSkipAdjacency,
} from "@/lib/game/world";

describe("every valid route hits eight decisions", () => {
  it("cannot reach a destination without completing all checkpoints", () => {
    for (const world of [FOREST_MAP, LAVA_MAP, CAVE_MAP]) {
      expect(noZoneSkipAdjacency(world)).toBe(true);
      expect(destinationRequiresAllDecisions(world)).toBe(true);
      expect(destinationReachableAfterDecisions(world)).toBe(true);
    }
  });
});
