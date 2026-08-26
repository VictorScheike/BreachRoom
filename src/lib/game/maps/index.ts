import { put } from "@/lib/game/maps/paint";
import { buildWorld, type GridPoint, type WorldMap } from "@/lib/game/world";
import type { MissionId } from "@/lib/missions/types";

const DESTINATION_META: Record<
  MissionId,
  { label: string; shortLabel: string; icon: "server" | "gate" | "launch" | "hub" | "coordination" }
> = {
  "locked-out": { label: "Core Server Room", shortLabel: "Core Server Room", icon: "server" },
  "ai-forge": { label: "Model Launch Gateway", shortLabel: "Launch Gateway", icon: "launch" },
  "dependency-depths": { label: "Trusted Build Exit", shortLabel: "Trusted Build Exit", icon: "gate" },
  "inbox-under-siege": {
    label: "Security Hub — submit incident report",
    shortLabel: "Security Hub",
    icon: "hub",
  },
  "northstar-zero-hour": {
    label: "Incident Coordination Room",
    shortLabel: "Coordination Room",
    icon: "coordination",
  },
};

function grid(columns: number, rows: number, fill: string): string[][] {
  return Array.from({ length: rows }, () => Array.from({ length: columns }, () => fill));
}

function cell(tiles: string[][], x: number, y: number, value: string): void {
  put(tiles, x, y, value);
}

function hrun(tiles: string[][], y: number, x0: number, x1: number, value: string): void {
  const step = x0 <= x1 ? 1 : -1;
  for (let x = x0; x !== x1 + step; x += step) {
    cell(tiles, x, y, value);
  }
}

function vrun(tiles: string[][], x: number, y0: number, y1: number, value: string): void {
  const step = y0 <= y1 ? 1 : -1;
  for (let y = y0; y !== y1 + step; y += step) {
    cell(tiles, x, y, value);
  }
}

function platform(
  tiles: string[][],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  value: string,
): void {
  for (let y = y0; y <= y1; y += 1) {
    hrun(tiles, y, x0, x1, value);
  }
}

function decorateFill(
  tiles: string[][],
  fill: string,
  value: string,
  points: readonly GridPoint[],
): void {
  for (const point of points) {
    if (tiles[point.y]?.[point.x] === fill) {
      cell(tiles, point.x, point.y, value);
    }
  }
}

function decorateFillRect(
  tiles: string[][],
  fill: string,
  value: string,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): void {
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      if (tiles[y]?.[x] === fill) {
        cell(tiles, x, y, value);
      }
    }
  }
}

function join(tiles: string[][]): string[] {
  return tiles.map((row) => row.join(""));
}

function worldFrom(id: MissionId, tiles: string[][]): WorldMap {
  const meta = DESTINATION_META[id];
  return buildWorld({
    id,
    layout: join(tiles),
    destinationLabel: meta.label,
    destinationShortLabel: meta.shortLabel,
    destinationIcon: meta.icon,
  });
}

function stamp(
  tiles: string[][],
  start: GridPoint,
  exit: GridPoint,
  checks: readonly GridPoint[],
): void {
  cell(tiles, start.x, start.y, "@");
  cell(tiles, exit.x, exit.y, "E");
  checks.forEach((point, index) => {
    const mark = index < 9 ? String(index + 1) : String.fromCharCode("a".charCodeAt(0) + index - 9);
    cell(tiles, point.x, point.y, mark);
  });
}

function makeLava(): WorldMap {
  const tiles = grid(16, 12, "L");

  platform(tiles, 1, 9, 3, 11, "S");
  hrun(tiles, 10, 4, 6, "=");
  platform(tiles, 7, 9, 9, 11, "S");
  vrun(tiles, 8, 8, 8, "=");
  platform(tiles, 7, 5, 9, 7, "S");
  hrun(tiles, 6, 4, 6, "=");
  platform(tiles, 1, 5, 3, 7, "S");
  vrun(tiles, 2, 4, 4, "=");
  platform(tiles, 1, 1, 3, 3, "S");
  hrun(tiles, 2, 4, 6, "=");
  platform(tiles, 7, 1, 9, 3, "S");
  hrun(tiles, 2, 10, 11, "=");
  platform(tiles, 12, 0, 14, 3, "S");

  decorateFill(tiles, "L", "R", [
    { x: 6, y: 0 },
    { x: 11, y: 0 },
    { x: 15, y: 1 },
    { x: 0, y: 3 },
    { x: 6, y: 4 },
    { x: 11, y: 4 },
    { x: 15, y: 6 },
    { x: 0, y: 8 },
    { x: 5, y: 8 },
    { x: 12, y: 8 },
    { x: 15, y: 11 },
  ]);

  const start = { x: 1, y: 10 };
  const exit = { x: 14, y: 0 };
  const checks: GridPoint[] = [
    { x: 3, y: 9 },
    { x: 9, y: 9 },
    { x: 9, y: 6 },
    { x: 2, y: 6 },
    { x: 2, y: 2 },
    { x: 8, y: 2 },
    { x: 11, y: 2 },
    { x: 12, y: 2 },
  ];
  stamp(tiles, start, exit, checks);
  return worldFrom("ai-forge", tiles);
}

function makeForest(): WorldMap {
  const tiles = grid(16, 12, "T");

  platform(tiles, 1, 10, 4, 11, "G");
  hrun(tiles, 11, 5, 11, "P");
  vrun(tiles, 11, 8, 10, "P");
  platform(tiles, 9, 7, 12, 8, "G");
  hrun(tiles, 8, 4, 8, "P");
  vrun(tiles, 4, 7, 7, "P");
  cell(tiles, 4, 6, "W");
  decorateFillRect(tiles, "T", "~", 0, 6, 15, 6);
  vrun(tiles, 4, 4, 5, "P");
  platform(tiles, 3, 3, 7, 4, "G");
  hrun(tiles, 3, 8, 12, "P");
  vrun(tiles, 12, 1, 2, "P");
  platform(tiles, 10, 0, 13, 2, "G");

  decorateFill(tiles, "T", "B", [
    { x: 6, y: 0 },
    { x: 14, y: 0 },
    { x: 1, y: 2 },
    { x: 15, y: 4 },
    { x: 0, y: 8 },
    { x: 14, y: 9 },
    { x: 6, y: 9 },
    { x: 15, y: 11 },
  ]);

  const start = { x: 1, y: 11 };
  const exit = { x: 13, y: 0 };
  const checks: GridPoint[] = [
    { x: 3, y: 10 },
    { x: 8, y: 11 },
    { x: 11, y: 8 },
    { x: 4, y: 7 },
    { x: 4, y: 4 },
    { x: 10, y: 3 },
    { x: 12, y: 2 },
    { x: 10, y: 1 },
  ];
  stamp(tiles, start, exit, checks);
  return worldFrom("locked-out", tiles);
}

function makeCave(): WorldMap {
  const tiles = grid(16, 12, "#");

  platform(tiles, 1, 8, 5, 11, "A");
  vrun(tiles, 3, 6, 7, "A");
  platform(tiles, 1, 3, 5, 5, "A");
  hrun(tiles, 4, 6, 8, "U");
  platform(tiles, 9, 2, 13, 5, "A");
  vrun(tiles, 12, 6, 7, "U");
  platform(tiles, 9, 8, 14, 11, "A");
  vrun(tiles, 13, 1, 1, "A");
  platform(tiles, 12, 0, 14, 1, "A");
  hrun(tiles, 9, 6, 8, "A");

  decorateFillRect(tiles, "#", "H", 6, 0, 10, 1);
  decorateFillRect(tiles, "#", "H", 6, 6, 11, 7);
  decorateFillRect(tiles, "#", "H", 6, 8, 8, 11);
  decorateFillRect(tiles, "#", "H", 0, 6, 2, 7);
  decorateFillRect(tiles, "#", "H", 14, 3, 15, 6);

  const start = { x: 2, y: 10 };
  const exit = { x: 14, y: 0 };
  const checks: GridPoint[] = [
    { x: 4, y: 9 },
    { x: 3, y: 6 },
    { x: 2, y: 4 },
    { x: 8, y: 4 },
    { x: 11, y: 3 },
    { x: 12, y: 7 },
    { x: 10, y: 9 },
    { x: 12, y: 1 },
  ];
  stamp(tiles, start, exit, checks);
  return worldFrom("dependency-depths", tiles);
}

function makeOffice(): WorldMap {
  const tiles = grid(16, 12, "#");

  platform(tiles, 1, 10, 14, 11, "O");
  vrun(tiles, 1, 2, 9, "O");
  vrun(tiles, 7, 2, 9, "O");
  vrun(tiles, 14, 2, 9, "O");
  hrun(tiles, 8, 1, 14, "O");
  hrun(tiles, 5, 1, 14, "O");
  hrun(tiles, 2, 1, 14, "O");
  cell(tiles, 1, 9, "N");
  cell(tiles, 7, 9, "N");
  cell(tiles, 14, 9, "N");
  cell(tiles, 1, 6, "N");
  cell(tiles, 7, 6, "N");
  cell(tiles, 14, 6, "N");
  cell(tiles, 4, 2, "N");
  cell(tiles, 11, 2, "N");
  cell(tiles, 14, 1, "O");

  decorateFillRect(tiles, "#", "D", 2, 3, 6, 4);
  decorateFillRect(tiles, "#", "D", 8, 3, 13, 4);
  decorateFillRect(tiles, "#", "K", 2, 6, 6, 7);
  decorateFillRect(tiles, "#", "K", 8, 6, 13, 7);
  decorateFillRect(tiles, "#", "F", 2, 0, 6, 1);
  decorateFillRect(tiles, "#", "F", 8, 0, 13, 1);

  const start = { x: 1, y: 11 };
  const exit = { x: 14, y: 1 };
  const checks: GridPoint[] = [
    { x: 5, y: 11 },
    { x: 12, y: 10 },
    { x: 14, y: 8 },
    { x: 7, y: 8 },
    { x: 1, y: 5 },
    { x: 7, y: 5 },
    { x: 14, y: 5 },
    { x: 11, y: 2 },
  ];
  stamp(tiles, start, exit, checks);
  return worldFrom("inbox-under-siege", tiles);
}

function makeCampus(): WorldMap {
  const tiles = grid(18, 14, "T");

  platform(tiles, 1, 12, 4, 13, "G");
  hrun(tiles, 13, 5, 16, "P");
  vrun(tiles, 16, 11, 12, "P");
  hrun(tiles, 11, 4, 16, "P");
  vrun(tiles, 4, 9, 10, "P");
  hrun(tiles, 9, 4, 9, "P");
  cell(tiles, 9, 8, "N");

  decorateFillRect(tiles, "T", "~", 10, 12, 14, 12);
  cell(tiles, 12, 12, "W");
  hrun(tiles, 13, 10, 14, "P");

  decorateFillRect(tiles, "T", "#", 0, 0, 17, 8);

  vrun(tiles, 9, 6, 7, "O");
  hrun(tiles, 6, 2, 15, "O");
  vrun(tiles, 2, 3, 5, "O");
  vrun(tiles, 15, 3, 5, "O");
  hrun(tiles, 3, 2, 15, "O");
  vrun(tiles, 2, 1, 2, "O");
  hrun(tiles, 1, 2, 5, "O");
  cell(tiles, 9, 7, "N");
  cell(tiles, 2, 5, "N");
  cell(tiles, 15, 5, "N");

  decorateFillRect(tiles, "#", "D", 3, 4, 8, 5);
  decorateFillRect(tiles, "#", "K", 10, 4, 14, 5);
  decorateFillRect(tiles, "#", "F", 3, 7, 8, 7);
  decorateFill(tiles, "T", "B", [
    { x: 0, y: 10 },
    { x: 7, y: 10 },
    { x: 17, y: 13 },
  ]);

  const start = { x: 1, y: 13 };
  const exit = { x: 2, y: 1 };
  const checks: GridPoint[] = [
    { x: 3, y: 12 },
    { x: 8, y: 13 },
    { x: 16, y: 13 },
    { x: 16, y: 11 },
    { x: 10, y: 11 },
    { x: 4, y: 11 },
    { x: 4, y: 9 },
    { x: 9, y: 8 },
    { x: 9, y: 6 },
    { x: 2, y: 6 },
    { x: 15, y: 6 },
    { x: 15, y: 3 },
    { x: 8, y: 3 },
    { x: 2, y: 3 },
    { x: 4, y: 1 },
  ];
  stamp(tiles, start, exit, checks);
  return worldFrom("northstar-zero-hour", tiles);
}

export const LAVA_MAP = makeLava();
export const FOREST_MAP = makeForest();
export const CAVE_MAP = makeCave();
export const OFFICE_MAP = makeOffice();
export const ZERO_HOUR_MAP = makeCampus();

const MAPS: Record<MissionId, WorldMap> = {
  "locked-out": FOREST_MAP,
  "ai-forge": LAVA_MAP,
  "dependency-depths": CAVE_MAP,
  "inbox-under-siege": OFFICE_MAP,
  "northstar-zero-hour": ZERO_HOUR_MAP,
};

export function worldForMission(id: MissionId): WorldMap {
  return MAPS[id];
}

export const ALL_MAPS: readonly WorldMap[] = [
  FOREST_MAP,
  LAVA_MAP,
  CAVE_MAP,
  OFFICE_MAP,
  ZERO_HOUR_MAP,
];
