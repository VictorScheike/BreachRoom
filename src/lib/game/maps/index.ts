import { buildWorld, type WorldMap } from "@/lib/game/world";
import type { MissionId } from "@/lib/missions/types";
import { blank, hline, joinLayouts, paintCell, paintRect, vline } from "@/lib/game/maps/paint";

const DESTINATION_META: Record<
  MissionId,
  { shortLabel: string; icon: "server" | "gate" | "launch" | "hub" | "coordination" }
> = {
  "locked-out": { shortLabel: "Core Server Room", icon: "server" },
  "ai-forge": { shortLabel: "Launch Gateway", icon: "launch" },
  "dependency-depths": { shortLabel: "Trusted Build Exit", icon: "gate" },
  "inbox-under-siege": { shortLabel: "Security Hub", icon: "hub" },
  "northstar-zero-hour": { shortLabel: "Coordination Room", icon: "coordination" },
};

function toWorld(
  id: MissionId,
  tiles: string[][],
  zones: string[][],
  start: { x: number; y: number },
  destination: { x: number; y: number },
  landmarkTiles: readonly { x: number; y: number }[],
  destinationLabel: string,
): WorldMap {
  const meta = DESTINATION_META[id];
  return buildWorld({
    id,
    tilesLayout: joinLayouts(tiles),
    zonesLayout: joinLayouts(zones),
    start,
    destination,
    landmarkTiles,
    destinationLabel,
    destinationShortLabel: meta.shortLabel,
    destinationIcon: meta.icon,
  });
}

function makeForest(): WorldMap {
  const cols = 16;
  const rows = 12;
  const tiles = blank(cols, rows, "T");
  const zones = blank(cols, rows, ".");

  paintRect(tiles, zones, 6, 10, 10, 11, "R", 0);
  paintRect(tiles, zones, 4, 8, 12, 9, "g", 1);
  paintRect(tiles, zones, 2, 6, 13, 7, "g", 2);
  paintRect(tiles, zones, 2, 5, 13, 5, "g", 3);
  paintRect(tiles, zones, 2, 4, 13, 4, "g", 4);
  paintRect(tiles, zones, 2, 3, 13, 3, "g", 5);
  paintRect(tiles, zones, 5, 2, 13, 2, "g", 6);
  paintRect(tiles, zones, 5, 1, 10, 1, "g", 7);
  paintRect(tiles, zones, 3, 1, 4, 1, "g", 8);
  paintRect(tiles, zones, 1, 1, 2, 1, "K", 9);

  for (const x of [3, 8, 12]) {
    for (let y = 2; y <= 11; y += 1) {
      const zoneChar = zones[y]?.[x];
      if (zoneChar && zoneChar !== ".") {
        paintCell(tiles, zones, x, y, "P", Number(zoneChar));
      }
    }
  }
  paintCell(tiles, zones, 8, 11, "R", 0);
  paintCell(tiles, zones, 1, 1, "K", 9);
  paintCell(tiles, zones, 2, 1, "K", 9);

  paintRect(tiles, zones, 5, 6, 6, 7, "T", ".");
  paintRect(tiles, zones, 10, 4, 11, 5, "T", ".");

  return toWorld(
    "locked-out",
    tiles,
    zones,
    { x: 8, y: 11 },
    { x: 1, y: 1 },
    [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    "Core Server Room",
  );
}

function makeLava(): WorldMap {
  const cols = 13;
  const rows = 13;
  const tiles = blank(cols, rows, "Q");
  const zones = blank(cols, rows, ".");
  const path: { x: number; y: number }[] = [
    ...hline(11, 1, 1),
    ...vline(1, 2, 11),
    ...hline(2, 11, 11),
    ...vline(11, 10, 4),
    { x: 10, y: 4 },
    { x: 9, y: 4 },
    ...hline(8, 3, 4),
    ...vline(3, 5, 8),
    ...hline(4, 8, 8),
    ...vline(8, 7, 6),
    { x: 7, y: 6 },
    { x: 6, y: 6 },
  ];

  const unique: { x: number; y: number }[] = [];
  const seen = new Set<string>();
  for (const point of path) {
    const key = `${point.x},${point.y}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(point);
  }

  const dest = unique[unique.length - 1];
  if (!dest) {
    throw new Error("Lava spiral is empty");
  }
  const approach = unique.slice(0, -1);
  approach.forEach((point, index) => {
    const zone = Math.min(8, Math.floor((index / approach.length) * 9));
    let tile = "g";
    if (index === 0) {
      tile = "X";
    } else if (point.y === 11) {
      tile = "M";
    }
    paintCell(tiles, zones, point.x, point.y, tile, zone);
  });
  paintCell(tiles, zones, dest.x, dest.y, "E", 9);

  return toWorld(
    "ai-forge",
    tiles,
    zones,
    { x: 11, y: 1 },
    dest,
    [dest],
    "Model Launch Gateway",
  );
}

function paintPath(
  tiles: string[][],
  zones: string[][],
  points: readonly { x: number; y: number }[],
  tile: string,
  zone: number,
): void {
  for (const point of points) {
    paintCell(tiles, zones, point.x, point.y, tile, zone);
  }
}

function makeCave(): WorldMap {
  const cols = 16;
  const rows = 12;
  const tiles = blank(cols, rows, "T");
  const zones = blank(cols, rows, ".");

  paintPath(tiles, zones, [
    { x: 13, y: 10 },
    { x: 14, y: 10 },
    { x: 14, y: 11 },
  ], "g", 0);
  paintPath(tiles, zones, [
    { x: 12, y: 10 },
    { x: 11, y: 10 },
    { x: 11, y: 11 },
    { x: 10, y: 10 },
  ], "U", 1);
  paintPath(tiles, zones, [
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 8, y: 11 },
    { x: 8, y: 9 },
    { x: 7, y: 10 },
  ], "g", 2);
  paintPath(tiles, zones, [
    { x: 7, y: 9 },
    { x: 7, y: 8 },
    { x: 6, y: 8 },
    { x: 8, y: 8 },
  ], "U", 3);
  paintPath(tiles, zones, [
    { x: 6, y: 7 },
    { x: 5, y: 7 },
    { x: 5, y: 8 },
    { x: 5, y: 6 },
    { x: 4, y: 7 },
  ], "g", 4);
  paintPath(tiles, zones, [
    { x: 4, y: 6 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
    { x: 5, y: 5 },
    { x: 6, y: 5 },
  ], "U", 5);
  paintPath(tiles, zones, [
    { x: 3, y: 4 },
    { x: 3, y: 3 },
    { x: 2, y: 3 },
    { x: 4, y: 3 },
    { x: 5, y: 3 },
  ], "g", 6);
  paintPath(tiles, zones, [
    { x: 2, y: 2 },
    { x: 3, y: 2 },
    { x: 4, y: 2 },
  ], "U", 7);
  paintPath(tiles, zones, [
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 4, y: 1 },
  ], "g", 8);
  paintPath(tiles, zones, [
    { x: 1, y: 1 },
    { x: 1, y: 0 },
  ], "V", 9);

  paintCell(tiles, zones, 13, 11, "g", 0);
  paintCell(tiles, zones, 14, 11, "W", 0);

  return toWorld(
    "dependency-depths",
    tiles,
    zones,
    { x: 13, y: 11 },
    { x: 1, y: 0 },
    [
      { x: 1, y: 1 },
      { x: 1, y: 0 },
    ],
    "Trusted Build Exit",
  );
}

function makeOffice(): WorldMap {
  const cols = 15;
  const rows = 15;
  const tiles = blank(cols, rows, "W");
  const zones = blank(cols, rows, ".");

  paintRect(tiles, zones, 6, 6, 8, 8, "J", 0);
  paintPath(tiles, zones, [
    { x: 7, y: 5 },
    { x: 7, y: 4 },
    { x: 6, y: 4 },
    { x: 5, y: 4 },
    { x: 4, y: 4 },
    { x: 3, y: 4 },
    { x: 2, y: 4 },
    { x: 2, y: 3 },
    { x: 2, y: 2 },
  ], "g", 1);
  paintPath(tiles, zones, [
    { x: 3, y: 2 },
    { x: 4, y: 2 },
    { x: 5, y: 2 },
    { x: 6, y: 2 },
    { x: 7, y: 2 },
    { x: 8, y: 2 },
    { x: 9, y: 2 },
  ], "P", 2);
  paintPath(tiles, zones, [
    { x: 10, y: 2 },
    { x: 11, y: 2 },
    { x: 12, y: 2 },
    { x: 12, y: 3 },
    { x: 12, y: 4 },
    { x: 12, y: 5 },
  ], "g", 3);
  paintPath(tiles, zones, [
    { x: 12, y: 6 },
    { x: 12, y: 7 },
    { x: 12, y: 8 },
    { x: 12, y: 9 },
    { x: 11, y: 9 },
  ], "P", 4);
  paintPath(tiles, zones, [
    { x: 12, y: 10 },
    { x: 12, y: 11 },
    { x: 12, y: 12 },
    { x: 11, y: 12 },
    { x: 10, y: 12 },
  ], "g", 5);
  paintPath(tiles, zones, [
    { x: 9, y: 12 },
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
    { x: 5, y: 12 },
  ], "P", 6);
  paintPath(tiles, zones, [
    { x: 4, y: 12 },
    { x: 3, y: 12 },
    { x: 2, y: 12 },
    { x: 2, y: 11 },
    { x: 2, y: 10 },
  ], "g", 7);
  paintPath(tiles, zones, [
    { x: 2, y: 9 },
    { x: 2, y: 8 },
    { x: 2, y: 7 },
    { x: 3, y: 7 },
    { x: 4, y: 7 },
    { x: 4, y: 8 },
  ], "P", 8);
  paintCell(tiles, zones, 4, 6, "C", 9);
  paintCell(tiles, zones, 2, 2, "Z", 1);
  paintCell(tiles, zones, 12, 2, "Z", 3);
  paintCell(tiles, zones, 12, 12, "Z", 5);
  paintCell(tiles, zones, 2, 12, "Z", 7);
  paintCell(tiles, zones, 7, 7, "J", 0);

  return toWorld(
    "inbox-under-siege",
    tiles,
    zones,
    { x: 7, y: 7 },
    { x: 4, y: 6 },
    [
      { x: 4, y: 6 },
      { x: 4, y: 7 },
    ],
    "Security Hub — submit incident report",
  );
}

function makeZeroHour(): WorldMap {
  const cols = 18;
  const rows = 12;
  const tiles = blank(cols, rows, "T");
  const zones = blank(cols, rows, ".");

  paintRect(tiles, zones, 1, 1, 16, 10, "g", ".");

  const route: { x: number; y: number }[] = [
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 4, y: 9 },
    { x: 4, y: 8 },
    { x: 5, y: 8 },
    { x: 6, y: 8 },
    { x: 7, y: 8 },
    { x: 8, y: 8 },
    { x: 9, y: 8 },
    { x: 10, y: 8 },
    { x: 11, y: 8 },
    { x: 12, y: 8 },
    { x: 13, y: 8 },
    { x: 13, y: 7 },
    { x: 13, y: 6 },
    { x: 12, y: 6 },
    { x: 11, y: 6 },
    { x: 10, y: 6 },
    { x: 9, y: 6 },
    { x: 8, y: 6 },
    { x: 7, y: 6 },
    { x: 6, y: 6 },
    { x: 5, y: 6 },
    { x: 5, y: 5 },
    { x: 5, y: 4 },
    { x: 6, y: 4 },
    { x: 7, y: 4 },
    { x: 8, y: 4 },
    { x: 9, y: 4 },
    { x: 10, y: 4 },
    { x: 11, y: 4 },
    { x: 12, y: 4 },
    { x: 13, y: 4 },
    { x: 14, y: 4 },
    { x: 14, y: 3 },
    { x: 14, y: 2 },
    { x: 13, y: 2 },
    { x: 12, y: 2 },
    { x: 11, y: 2 },
    { x: 10, y: 2 },
    { x: 9, y: 2 },
    { x: 8, y: 2 },
    { x: 7, y: 2 },
    { x: 6, y: 2 },
    { x: 5, y: 2 },
    { x: 4, y: 2 },
    { x: 3, y: 2 },
    { x: 2, y: 2 },
    { x: 2, y: 1 },
  ];

  const lastIndex = route.length - 1;
  const innerCount = lastIndex - 1;
  route.forEach((point, index) => {
    let zone = 0;
    if (index === 0) {
      zone = 0;
    } else if (index === lastIndex) {
      zone = 16;
    } else {
      zone = Math.min(15, 1 + Math.floor(((index - 1) * 15) / innerCount));
    }
    let tile = "P";
    if (index === 0) {
      tile = "R";
    } else if (index < 8) {
      tile = "g";
    } else if (index < 16) {
      tile = "P";
    } else if (index < 24) {
      tile = "Y";
    } else if (index < 32) {
      tile = "Z";
    } else if (index < 40) {
      tile = "K";
    } else if (index === lastIndex) {
      tile = "C";
    } else {
      tile = "D";
    }
    paintCell(tiles, zones, point.x, point.y, tile, zone);
  });

  const dest = route[route.length - 1];
  if (!dest) {
    throw new Error("Zero Hour route is empty");
  }
  paintCell(tiles, zones, dest.x, dest.y, "C", 16);
  paintRect(tiles, zones, 1, 1, 3, 1, "K", 16);

  return toWorld(
    "northstar-zero-hour",
    tiles,
    zones,
    { x: 9, y: 10 },
    dest,
    [
      dest,
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
    ],
    "Incident Coordination Room",
  );
}

export const FOREST_MAP = makeForest();
export const LAVA_MAP = makeLava();
export const CAVE_MAP = makeCave();
export const OFFICE_MAP = makeOffice();
export const ZERO_HOUR_MAP = makeZeroHour();

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
