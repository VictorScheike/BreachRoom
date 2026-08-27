import {
  bridgeH,
  bridgeV,
  decorateFill,
  decorateFillRect,
  grid,
  join,
  platform,
  ringLedge,
} from "@/lib/game/maps/layout";
import { placeRouteMarkers } from "@/lib/game/tiles";
import { assembleWorld, parseLayout, type GridPoint, type WorldMap } from "@/lib/game/world";
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

function worldFrom(
  id: MissionId,
  chars: string[][],
  start: GridPoint,
  exit: GridPoint,
  checks: readonly GridPoint[],
): WorldMap {
  const tiles = parseLayout(join(chars), id);
  placeRouteMarkers(tiles, start, exit, checks);
  const meta = DESTINATION_META[id];
  return assembleWorld(
    {
      id,
      destinationLabel: meta.label,
      destinationShortLabel: meta.shortLabel,
      destinationIcon: meta.icon,
    },
    tiles,
  );
}

/**
 * Lava reference layout: 3×3 stone islands, 2-wide bridges, lava everywhere else.
 * Route: bottom-left → bottom-mid → mid-mid → mid-left → top-left → top-mid →
 * top-right → mid-right (exit).
 */
function makeLava(): WorldMap {
  const tiles = grid(20, 16, "L");
  platform(tiles, 2, 14, "S");
  bridgeH(tiles, 14, 4, 7, "=");
  platform(tiles, 9, 14, "S");
  bridgeV(tiles, 8, 10, 12, "=");
  platform(tiles, 9, 8, "S");
  bridgeH(tiles, 8, 4, 7, "=");
  platform(tiles, 2, 8, "S");
  bridgeV(tiles, 1, 4, 6, "=");
  platform(tiles, 2, 2, "S");
  bridgeH(tiles, 2, 4, 7, "=");
  platform(tiles, 9, 2, "S");
  bridgeH(tiles, 2, 11, 14, "=");
  platform(tiles, 16, 2, "S");
  bridgeV(tiles, 15, 4, 6, "=");
  platform(tiles, 16, 8, "S");
  ringLedge(tiles, "L", "V");
  decorateFill(tiles, "L", "R", [
    { x: 5, y: 0 },
    { x: 12, y: 5 },
    { x: 19, y: 3 },
    { x: 6, y: 11 },
    { x: 19, y: 15 },
    { x: 0, y: 10 },
  ]);
  return worldFrom(
    "ai-forge",
    tiles,
    { x: 2, y: 14 },
    { x: 17, y: 8 },
    [
      { x: 2, y: 13 },
      { x: 9, y: 14 },
      { x: 9, y: 8 },
      { x: 2, y: 8 },
      { x: 2, y: 2 },
      { x: 9, y: 2 },
      { x: 16, y: 2 },
      { x: 16, y: 8 },
    ],
  );
}

/** Forest: dirt/clearing islands, trees and water blocked, wooden bridge over the river. */
function makeForest(): WorldMap {
  const tiles = grid(20, 16, "T");
  platform(tiles, 2, 14, "G");
  bridgeH(tiles, 14, 4, 7, "P");
  platform(tiles, 9, 14, "G");
  bridgeH(tiles, 14, 11, 14, "P");
  platform(tiles, 16, 14, "G");
  decorateFillRect(tiles, "T", "~", 0, 10, 19, 12);
  bridgeV(tiles, 15, 10, 12, "W");
  platform(tiles, 16, 8, "G");
  bridgeH(tiles, 8, 4, 14, "P");
  platform(tiles, 2, 8, "G");
  bridgeV(tiles, 1, 4, 6, "P");
  platform(tiles, 2, 2, "G");
  bridgeH(tiles, 2, 4, 8, "P");
  platform(tiles, 10, 2, "G");
  bridgeH(tiles, 2, 12, 14, "P");
  platform(tiles, 16, 2, "G");
  ringLedge(tiles, "T", "C");
  decorateFill(tiles, "T", "B", [
    { x: 6, y: 5 },
    { x: 12, y: 5 },
    { x: 19, y: 14 },
    { x: 0, y: 4 },
  ]);
  return worldFrom(
    "locked-out",
    tiles,
    { x: 2, y: 14 },
    { x: 16, y: 2 },
    [
      { x: 2, y: 13 },
      { x: 9, y: 14 },
      { x: 16, y: 14 },
      { x: 16, y: 8 },
      { x: 2, y: 8 },
      { x: 2, y: 2 },
      { x: 10, y: 2 },
      { x: 16, y: 3 },
    ],
  );
}

/** Cave: lit stone islands in dark chasm, cave walls as the raised rim. */
function makeCave(): WorldMap {
  const tiles = grid(20, 16, "H");
  platform(tiles, 3, 13, "A");
  bridgeH(tiles, 13, 5, 8, "U");
  platform(tiles, 10, 13, "A");
  bridgeH(tiles, 13, 12, 14, "U");
  platform(tiles, 16, 13, "A");
  bridgeV(tiles, 15, 9, 11, "U");
  platform(tiles, 16, 7, "A");
  bridgeH(tiles, 7, 5, 14, "U");
  platform(tiles, 3, 7, "A");
  bridgeV(tiles, 2, 4, 5, "U");
  platform(tiles, 3, 2, "A");
  bridgeH(tiles, 2, 5, 8, "U");
  platform(tiles, 10, 2, "A");
  bridgeH(tiles, 2, 12, 14, "U");
  platform(tiles, 16, 2, "A");
  ringLedge(tiles, "H", "#");
  return worldFrom(
    "dependency-depths",
    tiles,
    { x: 3, y: 13 },
    { x: 16, y: 2 },
    [
      { x: 3, y: 12 },
      { x: 10, y: 13 },
      { x: 16, y: 13 },
      { x: 16, y: 7 },
      { x: 3, y: 7 },
      { x: 3, y: 2 },
      { x: 10, y: 2 },
      { x: 16, y: 3 },
    ],
  );
}

/**
 * Office: corridor islands around a desk/server core.
 * Start on the bottom-mid floor; Security Hub is the connected bottom-left island.
 */
function makeOffice(): WorldMap {
  const tiles = grid(20, 16, "#");
  platform(tiles, 9, 14, "O");
  bridgeH(tiles, 14, 11, 14, "O");
  platform(tiles, 16, 14, "O");
  bridgeV(tiles, 15, 10, 12, "O");
  platform(tiles, 16, 8, "O");
  bridgeV(tiles, 15, 4, 6, "O");
  platform(tiles, 16, 2, "O");
  bridgeH(tiles, 2, 11, 14, "O");
  platform(tiles, 9, 2, "O");
  bridgeH(tiles, 2, 4, 7, "O");
  platform(tiles, 2, 2, "O");
  bridgeV(tiles, 1, 4, 6, "O");
  platform(tiles, 2, 8, "O");
  bridgeV(tiles, 1, 10, 12, "O");
  platform(tiles, 2, 14, "O");
  decorateFillRect(tiles, "#", "D", 6, 6, 13, 10);
  decorateFillRect(tiles, "#", "K", 6, 1, 13, 1);
  decorateFill(tiles, "#", "F", [
    { x: 6, y: 4 },
    { x: 13, y: 4 },
    { x: 10, y: 12 },
  ]);
  return worldFrom(
    "inbox-under-siege",
    tiles,
    { x: 9, y: 14 },
    { x: 2, y: 14 },
    [
      { x: 9, y: 13 },
      { x: 16, y: 14 },
      { x: 16, y: 8 },
      { x: 16, y: 2 },
      { x: 9, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: 8 },
      { x: 3, y: 14 },
    ],
  );
}

/** Campus: outdoor dirt islands, then indoor corridor islands, 15 checkpoints. */
function makeCampus(): WorldMap {
  const tiles = grid(22, 16, "T");
  platform(tiles, 2, 14, "G");
  bridgeH(tiles, 14, 4, 6, "P");
  platform(tiles, 8, 14, "G");
  bridgeH(tiles, 14, 10, 11, "P");
  platform(tiles, 13, 14, "G");
  bridgeH(tiles, 14, 15, 17, "P");
  platform(tiles, 19, 14, "G");
  decorateFillRect(tiles, "T", "~", 8, 12, 16, 12);
  bridgeH(tiles, 12, 12, 13, "W");
  bridgeV(tiles, 18, 11, 12, "P");
  platform(tiles, 19, 9, "G");
  bridgeH(tiles, 9, 14, 17, "P");
  platform(tiles, 12, 9, "G");
  bridgeH(tiles, 9, 7, 10, "P");
  platform(tiles, 5, 9, "G");
  decorateFillRect(tiles, "T", "#", 0, 0, 21, 7);
  bridgeV(tiles, 4, 7, 7, "N");
  platform(tiles, 5, 6, "O");
  bridgeH(tiles, 6, 7, 9, "O");
  platform(tiles, 11, 6, "O");
  bridgeH(tiles, 6, 13, 17, "O");
  platform(tiles, 19, 6, "O");
  bridgeV(tiles, 18, 3, 4, "O");
  platform(tiles, 19, 2, "O");
  bridgeH(tiles, 2, 14, 17, "O");
  platform(tiles, 12, 2, "O");
  bridgeH(tiles, 2, 10, 10, "O");
  platform(tiles, 8, 2, "O");
  bridgeH(tiles, 2, 4, 6, "O");
  platform(tiles, 2, 2, "O");
  decorateFillRect(tiles, "#", "D", 8, 4, 16, 4);
  decorateFillRect(tiles, "#", "K", 8, 0, 16, 0);
  ringLedge(tiles, "T", "C");
  return worldFrom(
    "northstar-zero-hour",
    tiles,
    { x: 2, y: 14 },
    { x: 2, y: 1 },
    [
      { x: 2, y: 13 },
      { x: 8, y: 14 },
      { x: 13, y: 14 },
      { x: 19, y: 14 },
      { x: 19, y: 9 },
      { x: 12, y: 9 },
      { x: 5, y: 9 },
      { x: 5, y: 6 },
      { x: 11, y: 6 },
      { x: 19, y: 6 },
      { x: 19, y: 2 },
      { x: 12, y: 2 },
      { x: 8, y: 2 },
      { x: 8, y: 1 },
      { x: 2, y: 3 },
    ],
  );
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
