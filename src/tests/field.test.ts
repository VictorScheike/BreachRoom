import { describe, expect, it } from "vitest";
import {
  ENCOUNTER_EVERY,
  GOAL_TILE,
  GRID_SIZE,
  START_TILE,
  shouldTriggerEncounter,
  stepFrom,
  tryMove,
} from "@/lib/simulation/field";

describe("field movement", () => {
  it("starts in the bottom-left and aims for the top-right", () => {
    expect(START_TILE).toEqual({ x: 0, y: GRID_SIZE - 1 });
    expect(GOAL_TILE).toEqual({ x: GRID_SIZE - 1, y: 0 });
  });

  it("blocks movement off the grid", () => {
    expect(tryMove(START_TILE, "down", 0, 8)).toBeNull();
    expect(tryMove(START_TILE, "left", 0, 8)).toBeNull();
  });

  it("allows ordinary grass steps", () => {
    expect(tryMove(START_TILE, "right", 0, 8)).toEqual({ x: 1, y: GRID_SIZE - 1 });
    expect(tryMove(START_TILE, "up", 0, 8)).toEqual({ x: 0, y: GRID_SIZE - 2 });
  });

  it("keeps the far side closed until every obstacle is cleared", () => {
    const besideGoal = stepFrom(GOAL_TILE, "left");
    expect(tryMove(besideGoal, "right", 7, 8)).toBeNull();
    expect(tryMove(besideGoal, "right", 8, 8)).toEqual(GOAL_TILE);
  });

  it("triggers an obstacle every three steps, not on every tile", () => {
    expect(shouldTriggerEncounter(1, 8)).toBe(false);
    expect(shouldTriggerEncounter(2, 8)).toBe(false);
    expect(shouldTriggerEncounter(ENCOUNTER_EVERY, 8)).toBe(true);
    expect(shouldTriggerEncounter(ENCOUNTER_EVERY * 2, 8)).toBe(true);
    expect(shouldTriggerEncounter(ENCOUNTER_EVERY, 0)).toBe(false);
  });
});
