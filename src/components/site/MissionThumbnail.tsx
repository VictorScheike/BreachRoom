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
  { tiles: TileId[]; playerCol: number; playerRow: number; destCol: number; destRow: number }
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
    destCol: 5,
    destRow: 1,
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
    destCol: 8,
    destRow: 0,
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
    destCol: 8,
    destRow: 0,
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
    destCol: 9,
    destRow: 0,
  },
  "northstar-zero-hour": {
    tiles: [
      "tree", "rack", "core", "core", "rack", "tree", "office", "office", "path", "desk", "office", "tree",
      "tree", "path", "path", "path", "path", "path", "path", "path", "path", "reception", "office", "tree",
      "short-grass", "path", "office", "desk", "office", "path", "server", "server", "path", "desk", "tree", "tree",
      "path", "path", "short-grass", "path", "path", "path", "office", "path", "path", "path", "tall-grass", "tree",
      "path", "path", "tall-grass", "tree", "short-grass", "path", "path", "reception", "desk", "tree", "tree", "tree",
    ],
    playerCol: 0,
    playerRow: 4,
    destCol: 3,
    destRow: 0,
  },
};

interface MissionThumbnailProps {
  missionId: MissionId;
  label: string;
}

export function MissionThumbnail({ missionId, label }: MissionThumbnailProps) {
  const layout = LAYOUTS[missionId];
  const placement = [
    "mission-thumb-hotspot",
    layout.destRow <= 1 ? "mission-thumb-hotspot--below" : "mission-thumb-hotspot--above",
    layout.destCol <= 1 ? "mission-thumb-hotspot--end" : "",
    layout.destCol >= COLS - 4 ? "mission-thumb-hotspot--start" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`mission-thumb mission-thumb-${missionId}`} aria-hidden="true">
      <div
        className="mission-thumb-grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {layout.tiles.map((tile, index) => (
          <span key={`${missionId}-${index}`} className={`rpg-tile-${tile}`} />
        ))}
        <span
          className={placement}
          style={{
            gridColumn: layout.destCol + 1,
            gridRow: layout.destRow + 1,
          }}
        >
          <span className="mission-thumb-mark">
            <span className="mission-thumb-mark__kicker">Destination</span>
            {label}
          </span>
        </span>
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
    </div>
  );
}
