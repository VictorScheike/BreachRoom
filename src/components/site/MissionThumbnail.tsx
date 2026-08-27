import { PlayerSprite } from "@/components/game/PlayerSprite";
import { worldForMission } from "@/lib/game/maps";
import type { MissionId } from "@/lib/missions/types";

const COLS = 16;
const ROWS = 6;

function sampleIndex(value: number, sourceSize: number, targetSize: number): number {
  if (sourceSize <= 1 || targetSize <= 1) {
    return 0;
  }
  return Math.max(
    0,
    Math.min(targetSize - 1, Math.round((value / (sourceSize - 1)) * (targetSize - 1))),
  );
}

function sourceCoord(index: number, sourceSize: number, targetSize: number): number {
  if (targetSize <= 1) {
    return 0;
  }
  return Math.max(
    0,
    Math.min(sourceSize - 1, Math.round((index / (targetSize - 1)) * (sourceSize - 1))),
  );
}

function layoutForMission(missionId: MissionId) {
  const world = worldForMission(missionId);
  const tiles: string[] = [];
  for (let row = 0; row < ROWS; row += 1) {
    const y = sourceCoord(row, world.rows, ROWS);
    for (let col = 0; col < COLS; col += 1) {
      const x = sourceCoord(col, world.columns, COLS);
      tiles.push(world.tiles[y]?.[x]?.visual ?? "void");
    }
  }
  return {
    tiles,
    playerCol: sampleIndex(world.start.x, world.columns, COLS),
    playerRow: sampleIndex(world.start.y, world.rows, ROWS),
    destCol: sampleIndex(world.destination.x, world.columns, COLS),
    destRow: sampleIndex(world.destination.y, world.rows, ROWS),
  };
}

interface MissionThumbnailProps {
  missionId: MissionId;
  label: string;
  showLabel?: boolean;
}

export function MissionThumbnail({
  missionId,
  label,
  showLabel = true,
}: MissionThumbnailProps) {
  const layout = layoutForMission(missionId);
  const placement = [
    "mission-thumb-hotspot",
    layout.destRow <= 1 ? "mission-thumb-hotspot--below" : "mission-thumb-hotspot--above",
    layout.destCol <= 1 ? "mission-thumb-hotspot--end" : "",
    layout.destCol >= COLS - 4 ? "mission-thumb-hotspot--start" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`mission-thumb mission-thumb-${missionId} world-${missionId}`} aria-hidden="true">
      <div
        className="mission-thumb-grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
        }}
      >
        {layout.tiles.map((tile, index) => (
          <span key={`${missionId}-${index}`} className={`rpg-tile-${tile}`} />
        ))}
      </div>
      {showLabel ? (
        <span
          className={placement}
          style={{
            left: `${(layout.destCol / COLS) * 100}%`,
            top: `${(layout.destRow / ROWS) * 100}%`,
            width: `${(1 / COLS) * 100}%`,
            height: `${(1 / ROWS) * 100}%`,
          }}
        >
          <span className="mission-thumb-mark">
            <span className="mission-thumb-mark__kicker">Destination</span>
            {label}
          </span>
        </span>
      ) : null}
      <div
        className="mission-thumb-player"
        style={{
          left: `${((layout.playerCol + 0.15) / COLS) * 100}%`,
          top: `${((layout.playerRow + 0.05) / ROWS) * 100}%`,
          width: `${(0.7 / COLS) * 100}%`,
          height: `${(0.9 / ROWS) * 100}%`,
        }}
      >
        <PlayerSprite facing="right" walking={false} />
      </div>
    </div>
  );
}
