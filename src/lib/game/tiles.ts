export type TileType =
  | "lava"
  | "void"
  | "wall"
  | "water"
  | "obstacle"
  | "tree"
  | "bush"
  | "cliff"
  | "chasm"
  | "furniture"
  | "desk"
  | "serverRack"
  | "rock"
  | "ledge"
  | "stoneFloor"
  | "stoneBridge"
  | "path"
  | "clearing"
  | "woodBridge"
  | "caveFloor"
  | "caveBridge"
  | "corridor"
  | "doorway"
  | "checkpoint"
  | "start"
  | "exit";

export interface TileDefinition {
  type: TileType;
  walkable: boolean;
  visual: string;
  canTriggerQuestion: boolean;
  isStart: boolean;
  isExit: boolean;
  label?: string;
}

export interface MapTile extends TileDefinition {
  checkpointOrder?: number;
}

export const TILE_DEFS: Record<TileType, TileDefinition> = {
  lava: {
    type: "lava",
    walkable: false,
    visual: "lava",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Lava",
  },
  void: {
    type: "void",
    walkable: false,
    visual: "void",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Void",
  },
  wall: {
    type: "wall",
    walkable: false,
    visual: "wall",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Wall",
  },
  water: {
    type: "water",
    walkable: false,
    visual: "water",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Water",
  },
  obstacle: {
    type: "obstacle",
    walkable: false,
    visual: "obstacle",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Obstacle",
  },
  tree: {
    type: "tree",
    walkable: false,
    visual: "tree",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Tree",
  },
  bush: {
    type: "bush",
    walkable: false,
    visual: "bush",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Bush",
  },
  cliff: {
    type: "cliff",
    walkable: false,
    visual: "cliff",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Cliff",
  },
  chasm: {
    type: "chasm",
    walkable: false,
    visual: "chasm",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Chasm",
  },
  furniture: {
    type: "furniture",
    walkable: false,
    visual: "furniture",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Furniture",
  },
  desk: {
    type: "desk",
    walkable: false,
    visual: "desk",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Desk",
  },
  serverRack: {
    type: "serverRack",
    walkable: false,
    visual: "server-rack",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Server rack",
  },
  rock: {
    type: "rock",
    walkable: false,
    visual: "rock",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Rock",
  },
  ledge: {
    type: "ledge",
    walkable: false,
    visual: "ledge",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Stone edge",
  },
  stoneFloor: {
    type: "stoneFloor",
    walkable: true,
    visual: "stone-floor",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Stone floor",
  },
  stoneBridge: {
    type: "stoneBridge",
    walkable: true,
    visual: "stone-bridge",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Stone bridge",
  },
  path: {
    type: "path",
    walkable: true,
    visual: "path",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Path",
  },
  clearing: {
    type: "clearing",
    walkable: true,
    visual: "clearing",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Clearing",
  },
  woodBridge: {
    type: "woodBridge",
    walkable: true,
    visual: "wood-bridge",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Wooden bridge",
  },
  caveFloor: {
    type: "caveFloor",
    walkable: true,
    visual: "cave-floor",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Cave floor",
  },
  caveBridge: {
    type: "caveBridge",
    walkable: true,
    visual: "cave-bridge",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Cave bridge",
  },
  corridor: {
    type: "corridor",
    walkable: true,
    visual: "corridor",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Corridor",
  },
  doorway: {
    type: "doorway",
    walkable: true,
    visual: "doorway",
    canTriggerQuestion: false,
    isStart: false,
    isExit: false,
    label: "Doorway",
  },
  checkpoint: {
    type: "checkpoint",
    walkable: true,
    visual: "checkpoint",
    canTriggerQuestion: true,
    isStart: false,
    isExit: false,
    label: "Question checkpoint",
  },
  start: {
    type: "start",
    walkable: true,
    visual: "start",
    canTriggerQuestion: false,
    isStart: true,
    isExit: false,
    label: "Start",
  },
  exit: {
    type: "exit",
    walkable: true,
    visual: "exit",
    canTriggerQuestion: false,
    isStart: false,
    isExit: true,
    label: "Exit",
  },
};

export const VOID_TILE: MapTile = { ...TILE_DEFS.void };

const SURFACE_CHARS: Record<string, TileType> = {
  L: "lava",
  ".": "void",
  "#": "wall",
  "~": "water",
  X: "obstacle",
  T: "tree",
  B: "bush",
  C: "cliff",
  H: "chasm",
  F: "furniture",
  D: "desk",
  K: "serverRack",
  R: "rock",
  V: "ledge",
  S: "stoneFloor",
  "=": "stoneBridge",
  P: "path",
  G: "clearing",
  W: "woodBridge",
  A: "caveFloor",
  U: "caveBridge",
  O: "corridor",
  N: "doorway",
  "@": "start",
  E: "exit",
};

export const unknownTileWarnings: string[] = [];

export function cloneTile(type: TileType, extra: Partial<MapTile> = {}): MapTile {
  return { ...TILE_DEFS[type], ...extra };
}

export function checkpointOrderFromChar(char: string): number | null {
  if (char >= "1" && char <= "9") {
    return Number(char);
  }
  if (char >= "a" && char <= "f") {
    return 10 + (char.charCodeAt(0) - "a".charCodeAt(0));
  }
  return null;
}

export function tileFromChar(char: string, x: number, y: number, mapId: string): MapTile {
  const order = checkpointOrderFromChar(char);
  if (order !== null) {
    return cloneTile("checkpoint", { checkpointOrder: order, label: `Checkpoint ${order}` });
  }
  const type = SURFACE_CHARS[char];
  if (!type) {
    const message = `Unknown tile type "${char}" at ${x},${y} on ${mapId}`;
    unknownTileWarnings.push(message);
    if (typeof console !== "undefined") {
      console.warn(message);
    }
    return cloneTile("void", { label: "Unknown (blocked)" });
  }
  return cloneTile(type);
}

export const PATH_VISUALS: readonly string[] = [
  "stone-floor",
  "stone-bridge",
  "path",
  "clearing",
  "wood-bridge",
  "cave-floor",
  "cave-bridge",
  "corridor",
  "doorway",
];

export function overlayMarker(
  surface: MapTile,
  marker: "start" | "exit" | "checkpoint",
  extra: Partial<MapTile> = {},
): MapTile {
  if (surface.walkable !== true) {
    throw new Error(`Cannot place ${marker} on blocked ${surface.type}`);
  }
  return {
    ...TILE_DEFS[marker],
    visual: surface.visual,
    ...extra,
  };
}

export function isWalkableTile(tile: MapTile | null | undefined): boolean {
  return tile?.walkable === true;
}

export function looksLikePath(tile: MapTile | null | undefined): boolean {
  return tile?.walkable === true && PATH_VISUALS.includes(tile.visual);
}

export function placeRouteMarkers(
  tiles: MapTile[][],
  start: { x: number; y: number },
  exit: { x: number; y: number },
  checkpoints: readonly { x: number; y: number }[],
): void {
  const at = (point: { x: number; y: number }, label: string): MapTile => {
    const tile = tiles[point.y]?.[point.x];
    if (!tile) {
      throw new Error(`${label} is outside the map at ${point.x},${point.y}`);
    }
    return tile;
  };
  tiles[start.y]![start.x] = overlayMarker(at(start, "start"), "start");
  tiles[exit.y]![exit.x] = overlayMarker(at(exit, "exit"), "exit");
  checkpoints.forEach((point, index) => {
    tiles[point.y]![point.x] = overlayMarker(at(point, `checkpoint ${index + 1}`), "checkpoint", {
      checkpointOrder: index + 1,
      label: `Checkpoint ${index + 1}`,
    });
  });
}

export function isBlockedEnvironment(type: TileType): boolean {
  return TILE_DEFS[type].walkable === false;
}
