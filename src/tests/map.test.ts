import { describe, expect, it } from "vitest";
import {
  CORE_TILE,
  DOOR_TILE,
  GRASS_STEPS_PER_ENCOUNTER,
  MAP_COLUMNS,
  MAP_ROWS,
  START_TILE,
  isBlockedTile,
  isGrassTile,
  isServerEntranceEncounter,
  shouldTriggerGrassEncounter,
  tileAt,
  tryMove,
} from "@/lib/game/map";

describe("Northstar map", () => {
  it("is a compact 12 by 8 field", () => {
    expect(MAP_COLUMNS).toBe(12);
    expect(MAP_ROWS).toBe(8);
    expect(START_TILE).toEqual({ x: 1, y: 6 });
    expect(tileAt(START_TILE)).toBe("reception");
    expect(tileAt(DOOR_TILE)).toBe("door");
    expect(tileAt(CORE_TILE)).toBe("core");
  });

  it("blocks trees, fences and offices", () => {
    expect(tryMove({ x: 3, y: 2 }, "right", 0, 8)).toBeNull();
    expect(isBlockedTile("tree", 0, 8)).toBe(true);
    expect(isBlockedTile("office", 0, 8)).toBe(true);
  });

  it("keeps the server door closed until seven decisions are done", () => {
    expect(isBlockedTile("door", 6, 8)).toBe(true);
    expect(isBlockedTile("door", 7, 8)).toBe(false);
    expect(isBlockedTile("core", 7, 8)).toBe(true);
    expect(isBlockedTile("core", 8, 8)).toBe(false);
  });

  it("counts only unvisited grass toward encounters", () => {
    expect(isGrassTile("short-grass")).toBe(true);
    expect(isGrassTile("path")).toBe(false);
    expect(shouldTriggerGrassEncounter(1, 0, 8)).toBe(false);
    expect(
      shouldTriggerGrassEncounter(GRASS_STEPS_PER_ENCOUNTER, 0, 8),
    ).toBe(true);
    expect(
      shouldTriggerGrassEncounter(GRASS_STEPS_PER_ENCOUNTER, 7, 8),
    ).toBe(false);
  });

  it("uses the server door for the eighth encounter", () => {
    expect(isServerEntranceEncounter(DOOR_TILE, 7, 8)).toBe(true);
    expect(isServerEntranceEncounter(DOOR_TILE, 6, 8)).toBe(false);
    expect(isServerEntranceEncounter(START_TILE, 7, 8)).toBe(false);
  });
});
