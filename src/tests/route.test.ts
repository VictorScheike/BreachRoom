import { describe, expect, it } from "vitest";
import { CAVE_MAP, FOREST_MAP, LAVA_MAP, OFFICE_MAP, ZERO_HOUR_MAP } from "@/lib/game/maps";
import {
  destinationReachableAfterDecisions,
  destinationRequiresAllDecisions,
  noZoneSkipAdjacency,
} from "@/lib/game/world";

describe("every valid route hits eight decisions", () => {
  it("cannot reach a destination without completing all checkpoints", () => {
    for (const world of [FOREST_MAP, LAVA_MAP, CAVE_MAP, OFFICE_MAP, ZERO_HOUR_MAP]) {
      expect(noZoneSkipAdjacency(world)).toBe(true);
      expect(destinationRequiresAllDecisions(world)).toBe(true);
      expect(destinationReachableAfterDecisions(world)).toBe(true);
    }
  });
});
