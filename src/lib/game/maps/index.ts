import {
  parseTiles,
  parseZones,
  type WorldMap,
} from "@/lib/game/world";

const ZONES = [
  "...56...9...",
  ".555667899..",
  ".44....899..",
  ".33444......",
  ".22.3.......",
  ".11.222.....",
  "000011......",
  "001.........",
] as const;

export const FOREST_MAP: WorldMap = {
  id: "locked-out",
  tiles: parseTiles([
    "TTTGGSSSYTTT",
    "TgggggPDKKTT",
    "TgPTTTTKKGTT",
    "TgPgggTTTTTT",
    "TgPTgTTTTTTT",
    "TgPTgggTTTTT",
    "RRPPggTTTTTT",
    "RRgTTTTTTTTT",
  ]),
  zones: parseZones(ZONES),
  start: { x: 1, y: 6 },
  destination: { x: 8, y: 1 },
  landmarkTiles: [
    { x: 5, y: 0 },
    { x: 6, y: 0 },
    { x: 7, y: 0 },
    { x: 8, y: 0 },
    { x: 7, y: 1 },
    { x: 8, y: 1 },
    { x: 9, y: 1 },
    { x: 7, y: 2 },
    { x: 8, y: 2 },
  ],
};

export const LAVA_MAP: WorldMap = {
  id: "ai-forge",
  tiles: parseTiles([
    "QQQggIIIXQQQ",
    "QgggggMEEEQQ",
    "QgMQQQQEEGQQ",
    "QgMgggQQQQQQ",
    "QgMQgQQQQQQQ",
    "QgMQgggQQQQQ",
    "XMMMggQQQQQQ",
    "XMgQQQQQQQQQ",
  ]),
  zones: parseZones(ZONES),
  start: { x: 1, y: 6 },
  destination: { x: 8, y: 1 },
  landmarkTiles: [
    { x: 5, y: 0 },
    { x: 6, y: 0 },
    { x: 7, y: 0 },
    { x: 8, y: 0 },
    { x: 7, y: 1 },
    { x: 8, y: 1 },
    { x: 9, y: 1 },
    { x: 7, y: 2 },
    { x: 8, y: 2 },
  ],
};

export const CAVE_MAP: WorldMap = {
  id: "dependency-depths",
  tiles: parseTiles([
    "TTTWWTTTVTTT",
    "TgggggUVVVTT",
    "TgUTTTTVVWTT",
    "TgUgggTTTTTT",
    "TgUTgTTTTTTT",
    "TgUTgggTTTTT",
    "WWUUggTTTTTT",
    "WWgTTTTTTTTT",
  ]),
  zones: parseZones(ZONES),
  start: { x: 1, y: 6 },
  destination: { x: 8, y: 1 },
  landmarkTiles: [
    { x: 5, y: 0 },
    { x: 6, y: 0 },
    { x: 7, y: 0 },
    { x: 8, y: 0 },
    { x: 7, y: 1 },
    { x: 8, y: 1 },
    { x: 9, y: 1 },
    { x: 7, y: 2 },
    { x: 8, y: 2 },
  ],
};

export function worldForMission(id: WorldMap["id"]): WorldMap {
  if (id === "locked-out") {
    return FOREST_MAP;
  }
  if (id === "ai-forge") {
    return LAVA_MAP;
  }
  return CAVE_MAP;
}
