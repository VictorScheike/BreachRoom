import type { MissionId } from "@/lib/missions/types";

export type DoorTheme = "security" | "server" | "heat" | "stone" | "fence";
export type DoorOrientation = "ns" | "ew";

export interface GridCoord {
  x: number;
  y: number;
}

export interface DoorSpec {
  id: string;
  mapId: MissionId;
  requiredCheckpointOrder: number;
  blockedTiles: readonly GridCoord[];
  anchor: GridCoord;
  orientation: DoorOrientation;
  theme: DoorTheme;
}

function tile(x: number, y: number): GridCoord {
  return { x, y };
}

/** Two-tile-tall slice of a horizontal corridor (blocks east–west travel). */
function spanNS(x: number, y: number): GridCoord[] {
  return [tile(x, y), tile(x, y + 1)];
}

/** Two-tile-wide slice of a vertical corridor (blocks north–south travel). */
function spanEW(x: number, y: number): GridCoord[] {
  return [tile(x, y), tile(x + 1, y)];
}

function gate(
  id: string,
  mapId: MissionId,
  requiredCheckpointOrder: number,
  blockedTiles: readonly GridCoord[],
  orientation: DoorOrientation,
  theme: DoorTheme,
  anchorIndex = 0,
): DoorSpec {
  const anchor = blockedTiles[anchorIndex];
  if (!anchor) {
    throw new Error(`Door ${id} is missing blocked tiles`);
  }
  return {
    id,
    mapId,
    requiredCheckpointOrder,
    blockedTiles,
    anchor,
    orientation,
    theme,
  };
}

const FOREST_DOORS: readonly DoorSpec[] = [
  gate("forest-d1", "locked-out", 1, spanNS(5, 14), "ns", "fence"),
  gate("forest-d2", "locked-out", 2, spanNS(12, 14), "ns", "fence"),
  gate("forest-d3", "locked-out", 3, spanEW(15, 11), "ew", "fence"),
  gate("forest-d4", "locked-out", 4, spanNS(13, 8), "ns", "fence"),
  gate("forest-d5", "locked-out", 5, spanEW(1, 5), "ew", "fence"),
  gate("forest-d6", "locked-out", 6, spanNS(6, 2), "ns", "fence"),
  gate("forest-d7", "locked-out", 7, spanNS(13, 2), "ns", "fence"),
];

const LAVA_DOORS: readonly DoorSpec[] = [
  gate("lava-d1", "ai-forge", 1, spanNS(5, 14), "ns", "heat"),
  gate("lava-d2", "ai-forge", 2, spanEW(8, 11), "ew", "heat"),
  gate("lava-d3", "ai-forge", 3, spanNS(5, 8), "ns", "heat"),
  gate("lava-d4", "ai-forge", 4, spanEW(1, 5), "ew", "heat"),
  gate("lava-d5", "ai-forge", 5, spanNS(5, 2), "ns", "heat"),
  gate("lava-d6", "ai-forge", 6, spanNS(12, 2), "ns", "heat"),
  gate("lava-d7", "ai-forge", 7, spanEW(15, 5), "ew", "heat"),
];

const CAVE_DOORS: readonly DoorSpec[] = [
  gate("cave-d1", "dependency-depths", 1, spanNS(6, 13), "ns", "stone"),
  gate("cave-d2", "dependency-depths", 2, spanNS(13, 13), "ns", "stone"),
  gate("cave-d3", "dependency-depths", 3, spanEW(15, 10), "ew", "stone"),
  gate("cave-d4", "dependency-depths", 4, spanNS(13, 7), "ns", "stone"),
  gate("cave-d5", "dependency-depths", 5, spanEW(2, 4), "ew", "stone"),
  gate("cave-d6", "dependency-depths", 6, spanNS(6, 2), "ns", "stone"),
  gate("cave-d7", "dependency-depths", 7, spanNS(13, 2), "ns", "stone"),
];

const OFFICE_DOORS: readonly DoorSpec[] = [
  gate("office-d1", "inbox-under-siege", 1, spanNS(12, 14), "ns", "security"),
  gate("office-d2", "inbox-under-siege", 2, spanEW(15, 11), "ew", "security"),
  gate("office-d3", "inbox-under-siege", 3, spanEW(15, 5), "ew", "security"),
  gate("office-d4", "inbox-under-siege", 4, spanNS(12, 2), "ns", "security"),
  gate("office-d5", "inbox-under-siege", 5, spanNS(5, 2), "ns", "security"),
  gate("office-d6", "inbox-under-siege", 6, spanEW(1, 5), "ew", "security"),
  gate("office-d7", "inbox-under-siege", 7, spanEW(1, 11), "ew", "security"),
];

const CAMPUS_DOORS: readonly DoorSpec[] = [
  gate("campus-d1", "northstar-zero-hour", 1, spanNS(5, 14), "ns", "fence"),
  gate("campus-d2", "northstar-zero-hour", 2, spanNS(10, 14), "ns", "fence"),
  gate("campus-d3", "northstar-zero-hour", 3, spanNS(16, 14), "ns", "fence"),
  gate("campus-d4", "northstar-zero-hour", 4, spanEW(18, 11), "ew", "fence"),
  gate("campus-d5", "northstar-zero-hour", 5, spanNS(16, 9), "ns", "fence"),
  gate("campus-d6", "northstar-zero-hour", 6, spanNS(8, 9), "ns", "fence"),
  gate("campus-d7", "northstar-zero-hour", 7, spanEW(4, 7), "ew", "security"),
  gate("campus-d8", "northstar-zero-hour", 8, spanNS(8, 6), "ns", "security"),
  gate("campus-d9", "northstar-zero-hour", 9, spanNS(15, 6), "ns", "server"),
  gate("campus-d10", "northstar-zero-hour", 10, spanEW(18, 3), "ew", "server"),
  gate("campus-d11", "northstar-zero-hour", 11, spanNS(16, 2), "ns", "security"),
  gate("campus-d12", "northstar-zero-hour", 12, spanNS(10, 2), "ns", "security"),
  gate("campus-d14", "northstar-zero-hour", 14, spanNS(5, 2), "ns", "security"),
];

const DOORS_BY_MAP: Record<MissionId, readonly DoorSpec[]> = {
  "locked-out": FOREST_DOORS,
  "ai-forge": LAVA_DOORS,
  "dependency-depths": CAVE_DOORS,
  "inbox-under-siege": OFFICE_DOORS,
  "northstar-zero-hour": CAMPUS_DOORS,
};

export function doorsForMap(mapId: MissionId): readonly DoorSpec[] {
  return DOORS_BY_MAP[mapId] ?? [];
}

export function doorById(mapId: MissionId, doorId: string): DoorSpec | null {
  return doorsForMap(mapId).find((door) => door.id === doorId) ?? null;
}

export function doorUnlockedByCheckpoint(
  mapId: MissionId,
  checkpointOrder: number,
): DoorSpec | null {
  return (
    doorsForMap(mapId).find((door) => door.requiredCheckpointOrder === checkpointOrder) ?? null
  );
}

export function coordsEqual(a: GridCoord, b: GridCoord): boolean {
  return a.x === b.x && a.y === b.y;
}

export function doorCoversTile(door: DoorSpec, point: GridCoord): boolean {
  return door.blockedTiles.some((tilePoint) => coordsEqual(tilePoint, point));
}

export function closedDoorAt(
  doors: readonly DoorSpec[],
  point: GridCoord,
  openDoorIds: ReadonlySet<string>,
): DoorSpec | null {
  return (
    doors.find((door) => !openDoorIds.has(door.id) && doorCoversTile(door, point)) ?? null
  );
}

export function openDoorIdsForUnlocks(
  mapId: MissionId,
  unlockedCheckpointOrders: readonly number[],
): string[] {
  const unlocked = new Set(unlockedCheckpointOrders);
  return doorsForMap(mapId)
    .filter((door) => unlocked.has(door.requiredCheckpointOrder))
    .map((door) => door.id);
}

export const DOOR_UNLOCK_MESSAGE = "Correct — security door unlocked.";
export const EXIT_UNLOCK_MESSAGE = "All security checkpoints completed — exit unlocked.";
export const DOOR_LOCKED_BUMP = "Door locked — complete the nearby security checkpoint.";
export const DOOR_LOCKED_NOTICE_MS = 5000;
export const CHECKPOINT_HINT =
  "Answer the nearby security question correctly to unlock the next area.";
