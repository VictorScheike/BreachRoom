import { PlayerSprite } from "@/components/game/PlayerSprite";
import type { MissionId } from "@/lib/missions/types";

type TileId =
  | "hub"
  | "desk"
  | "office"
  | "reception"
  | "server"
  | "door"
  | "short-grass"
  | "tall-grass"
  | "path"
  | "tree"
  | "core"
  | "rack"
  | "lava"
  | "pipe"
  | "rock"
  | "bridge"
  | "forge"
  | "cave"
  | "rail"
  | "glow"
  | "portal"
  | "crate";

const COLS = 12;
const ROWS = 5;

const LAYOUTS: Record<
  MissionId,
  { tiles: TileId[]; playerCol: number; playerRow: number }
> = {
  "inbox-under-siege": {
    tiles: [
      "office", "desk", "office", "hub", "hub", "hub", "hub", "desk", "office", "server", "office", "desk",
      "desk", "office", "office", "hub", "hub", "hub", "hub", "office", "desk", "office", "reception", "office",
      "office", "office", "door", "hub", "hub", "hub", "hub", "door", "office", "desk", "office", "office",
      "path", "path", "path", "hub", "hub", "hub", "hub", "office", "office", "server", "desk", "office",
      "path", "path", "path", "reception", "hub", "hub", "hub", "desk", "office", "office", "office", "desk",
    ],
    playerCol: 1,
    playerRow: 4,
  },
  "locked-out": {
    tiles: [
      "tree", "tall-grass", "short-grass", "path", "office", "office", "rack", "core", "core", "rack", "tree", "tree",
      "tree", "short-grass", "path", "path", "path", "door", "office", "rack", "core", "tree", "tall-grass", "tree",
      "short-grass", "path", "path", "short-grass", "tall-grass", "path", "path", "office", "rack", "short-grass", "tree", "tree",
      "path", "path", "short-grass", "tree", "tree", "short-grass", "path", "path", "path", "tall-grass", "tree", "tree",
      "path", "path", "short-grass", "tall-grass", "tree", "short-grass", "short-grass", "path", "tree", "tree", "tall-grass", "tree",
    ],
    playerCol: 0,
    playerRow: 4,
  },
  "ai-forge": {
    tiles: [
      "lava", "lava", "pipe", "rock", "lava", "bridge", "pipe", "forge", "forge", "pipe", "lava", "lava",
      "lava", "pipe", "pipe", "bridge", "bridge", "bridge", "pipe", "pipe", "forge", "lava", "lava", "pipe",
      "rock", "lava", "pipe", "lava", "bridge", "pipe", "pipe", "lava", "pipe", "pipe", "lava", "lava",
      "lava", "bridge", "bridge", "bridge", "pipe", "lava", "lava", "pipe", "rock", "lava", "pipe", "lava",
      "lava", "bridge", "lava", "lava", "pipe", "pipe", "lava", "lava", "lava", "pipe", "lava", "lava",
    ],
    playerCol: 1,
    playerRow: 4,
  },
  "dependency-depths": {
    tiles: [
      "cave", "cave", "glow", "rail", "cave", "crate", "cave", "rail", "portal", "portal", "cave", "cave",
      "cave", "rail", "rail", "rail", "cave", "glow", "rail", "rail", "portal", "cave", "crate", "cave",
      "cave", "cave", "rail", "cave", "cave", "rail", "rail", "cave", "glow", "cave", "cave", "cave",
      "glow", "rail", "rail", "rail", "crate", "cave", "rail", "rail", "rail", "cave", "cave", "cave",
      "cave", "rail", "cave", "glow", "cave", "cave", "cave", "rail", "cave", "cave", "crate", "cave",
    ],
    playerCol: 1,
    playerRow: 4,
  },
};

interface MissionThumbnailProps {
  missionId: MissionId;
  label: string;
}

export function MissionThumbnail({ missionId, label }: MissionThumbnailProps) {
  const layout = LAYOUTS[missionId];

  return (
    <div className={`mission-thumb mission-thumb-${missionId}`} aria-hidden="true">
      <div
        className="mission-thumb-grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {layout.tiles.map((tile, index) => (
          <span key={`${missionId}-${index}`} className={`rpg-tile-${tile}`} />
        ))}
      </div>
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
      <span className="mission-thumb-mark">{label}</span>
    </div>
  );
}
