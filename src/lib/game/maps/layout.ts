import { put } from "@/lib/game/maps/paint";
import type { GridPoint } from "@/lib/game/world";

export function grid(columns: number, rows: number, fill: string): string[][] {
  return Array.from({ length: rows }, () => Array.from({ length: columns }, () => fill));
}

export function cell(tiles: string[][], x: number, y: number, value: string): void {
  put(tiles, x, y, value);
}

export function hrun(tiles: string[][], y: number, x0: number, x1: number, value: string): void {
  const step = x0 <= x1 ? 1 : -1;
  for (let x = x0; x !== x1 + step; x += step) {
    cell(tiles, x, y, value);
  }
}

export function vrun(tiles: string[][], x: number, y0: number, y1: number, value: string): void {
  const step = y0 <= y1 ? 1 : -1;
  for (let y = y0; y !== y1 + step; y += step) {
    cell(tiles, x, y, value);
  }
}

export function room(
  tiles: string[][],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  floor: string,
): void {
  for (let y = y0; y <= y1; y += 1) {
    hrun(tiles, y, x0, x1, floor);
  }
}

/** Square platform centred on a tile. Size 3 matches the lava reference islands. */
export function platform(
  tiles: string[][],
  cx: number,
  cy: number,
  floor: string,
  size = 3,
): void {
  const half = Math.floor(size / 2);
  room(tiles, cx - half, cy - half, cx + half, cy + half, floor);
}

export function bridgeH(
  tiles: string[][],
  y: number,
  x0: number,
  x1: number,
  floor: string,
  width = 2,
): void {
  for (let offset = 0; offset < width; offset += 1) {
    hrun(tiles, y + offset, x0, x1, floor);
  }
}

export function bridgeV(
  tiles: string[][],
  x: number,
  y0: number,
  y1: number,
  floor: string,
  width = 2,
): void {
  for (let offset = 0; offset < width; offset += 1) {
    vrun(tiles, x + offset, y0, y1, floor);
  }
}

const WALK_CHARS = new Set(["S", "=", "P", "G", "W", "A", "U", "O", "N"]);

export function ringLedge(tiles: string[][], fill: string, ledge: string): void {
  const rows = tiles.length;
  const columns = tiles[0]?.length ?? 0;
  const next = tiles.map((row) => [...row]);
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      if (tiles[y]?.[x] !== fill) {
        continue;
      }
      const touchesPath = dirs.some(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        const neighbour = tiles[ny]?.[nx];
        return neighbour !== undefined && WALK_CHARS.has(neighbour);
      });
      if (touchesPath) {
        next[y]![x] = ledge;
      }
    }
  }
  for (let y = 0; y < rows; y += 1) {
    tiles[y] = next[y]!;
  }
}

export function decorateFill(
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

export function decorateFillRect(
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

export function join(tiles: string[][]): string[] {
  return tiles.map((row) => row.join(""));
}
