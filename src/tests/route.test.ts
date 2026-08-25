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
  tileAt,
  type GridPoint,
} from "@/lib/game/map";

const DIRECTIONS: GridPoint[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

function reachable(from: GridPoint, to: GridPoint, decisionsMade: number): boolean {
  const seen = new Set<string>([`${from.x},${from.y}`]);
  const queue = [from];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    if (current.x === to.x && current.y === to.y) {
      return true;
    }
    for (const step of DIRECTIONS) {
      const next = { x: current.x + step.x, y: current.y + step.y };
      if (
        next.x < 0 ||
        next.y < 0 ||
        next.x >= MAP_COLUMNS ||
        next.y >= MAP_ROWS
      ) {
        continue;
      }
      const key = `${next.x},${next.y}`;
      if (seen.has(key)) {
        continue;
      }
      if (isBlockedTile(tileAt(next), decisionsMade, 8)) {
        continue;
      }
      seen.add(key);
      queue.push(next);
    }
  }
  return false;
}

describe("campus route", () => {
  it("has enough unused grass for seven field encounters", () => {
    let grass = 0;
    for (let y = 0; y < MAP_ROWS; y += 1) {
      for (let x = 0; x < MAP_COLUMNS; x += 1) {
        if (isGrassTile(tileAt({ x, y }))) {
          grass += 1;
        }
      }
    }
    expect(grass).toBeGreaterThanOrEqual(GRASS_STEPS_PER_ENCOUNTER * 7);
  });

  it("can walk from reception to the server door after seven decisions", () => {
    expect(reachable(START_TILE, DOOR_TILE, 7)).toBe(true);
  });

  it("can enter the ransomware core after eight decisions", () => {
    expect(reachable(DOOR_TILE, CORE_TILE, 8)).toBe(true);
  });
});
