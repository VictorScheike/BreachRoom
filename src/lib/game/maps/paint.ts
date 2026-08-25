import type { GridPoint } from "@/lib/game/world";

export function blank(columns: number, rows: number, fill: string): string[][] {
  return Array.from({ length: rows }, () => Array.from({ length: columns }, () => fill));
}

export function put(
  grid: string[][],
  x: number,
  y: number,
  value: string,
): void {
  const row = grid[y];
  if (!row || row[x] === undefined) {
    throw new Error(`Out of bounds ${x},${y}`);
  }
  row[x] = value;
}

export function paintCell(
  tiles: string[][],
  zones: string[][],
  x: number,
  y: number,
  tile: string,
  zone: number | ".",
): void {
  put(tiles, x, y, tile);
  put(zones, x, y, zone === "." ? "." : String(zone));
}

export function paintRect(
  tiles: string[][],
  zones: string[][],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  tile: string,
  zone: number | ".",
): void {
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      paintCell(tiles, zones, x, y, tile, zone);
    }
  }
}

export function paintLine(
  tiles: string[][],
  zones: string[][],
  from: GridPoint,
  to: GridPoint,
  tile: string,
  zone: number,
): void {
  let x = from.x;
  let y = from.y;
  paintCell(tiles, zones, x, y, tile, zone);
  while (x !== to.x || y !== to.y) {
    if (x !== to.x) {
      x += x < to.x ? 1 : -1;
    } else if (y !== to.y) {
      y += y < to.y ? 1 : -1;
    }
    paintCell(tiles, zones, x, y, tile, zone);
  }
}

export function joinLayouts(grid: string[][]): string[] {
  return grid.map((row) => row.join(""));
}

export function hline(fromX: number, toX: number, y: number): GridPoint[] {
  const points: GridPoint[] = [];
  const step = fromX <= toX ? 1 : -1;
  for (let x = fromX; x !== toX + step; x += step) {
    points.push({ x, y });
  }
  return points;
}

export function vline(x: number, fromY: number, toY: number): GridPoint[] {
  const points: GridPoint[] = [];
  const step = fromY <= toY ? 1 : -1;
  for (let y = fromY; y !== toY + step; y += step) {
    points.push({ x, y });
  }
  return points;
}
