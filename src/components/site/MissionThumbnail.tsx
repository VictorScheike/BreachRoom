import { PlayerSprite } from "@/components/game/PlayerSprite";
import type { MissionId } from "@/lib/missions/types";

type TileId =
  | "tree"
  | "path"
  | "clearing"
  | "wood-bridge"
  | "lava"
  | "rock"
  | "stone-floor"
  | "stone-bridge"
  | "wall"
  | "chasm"
  | "cave-floor"
  | "cave-bridge"
  | "corridor"
  | "desk"
  | "server-rack"
  | "exit"
  | "start";

const COLS = 12;
const ROWS = 5;

const LAYOUTS: Record<
  MissionId,
  { tiles: TileId[]; playerCol: number; playerRow: number; destCol: number; destRow: number }
> = {
  "inbox-under-siege": {
    tiles: [
      "wall", "desk", "wall", "corridor", "corridor", "exit", "corridor", "desk", "wall", "server-rack", "wall", "desk",
      "desk", "wall", "wall", "corridor", "corridor", "corridor", "corridor", "wall", "desk", "wall", "corridor", "wall",
      "wall", "wall", "corridor", "corridor", "corridor", "corridor", "corridor", "corridor", "wall", "desk", "wall", "wall",
      "corridor", "corridor", "corridor", "wall", "wall", "wall", "wall", "wall", "wall", "server-rack", "desk", "wall",
      "start", "corridor", "corridor", "corridor", "corridor", "corridor", "desk", "desk", "wall", "wall", "wall", "desk",
    ],
    playerCol: 0,
    playerRow: 4,
    destCol: 5,
    destRow: 0,
  },
  "locked-out": {
    tiles: [
      "tree", "tree", "clearing", "path", "path", "exit", "path", "tree", "tree", "tree", "tree", "tree",
      "tree", "clearing", "path", "path", "path", "wood-bridge", "path", "tree", "tree", "tree", "tree", "tree",
      "clearing", "path", "path", "tree", "tree", "path", "path", "tree", "tree", "clearing", "tree", "tree",
      "path", "path", "clearing", "tree", "tree", "clearing", "path", "path", "path", "tree", "tree", "tree",
      "start", "path", "clearing", "tree", "tree", "clearing", "clearing", "path", "tree", "tree", "tree", "tree",
    ],
    playerCol: 0,
    playerRow: 4,
    destCol: 5,
    destRow: 0,
  },
  "ai-forge": {
    tiles: [
      "lava", "lava", "rock", "stone-floor", "stone-floor", "exit", "stone-floor", "rock", "lava", "lava", "lava", "lava",
      "lava", "rock", "stone-floor", "stone-bridge", "stone-bridge", "stone-bridge", "stone-floor", "lava", "lava", "lava", "lava", "rock",
      "rock", "lava", "stone-floor", "lava", "stone-bridge", "lava", "stone-floor", "lava", "rock", "lava", "lava", "lava",
      "lava", "stone-bridge", "stone-bridge", "stone-bridge", "lava", "lava", "lava", "rock", "lava", "lava", "rock", "lava",
      "lava", "start", "stone-floor", "lava", "lava", "rock", "lava", "lava", "lava", "rock", "lava", "lava",
    ],
    playerCol: 1,
    playerRow: 4,
    destCol: 5,
    destRow: 0,
  },
  "dependency-depths": {
    tiles: [
      "wall", "wall", "chasm", "cave-floor", "cave-floor", "exit", "cave-floor", "chasm", "wall", "wall", "chasm", "wall",
      "wall", "cave-floor", "cave-bridge", "cave-bridge", "cave-floor", "chasm", "cave-bridge", "cave-floor", "wall", "chasm", "wall", "wall",
      "wall", "wall", "cave-floor", "chasm", "chasm", "cave-floor", "cave-floor", "wall", "chasm", "wall", "wall", "wall",
      "chasm", "cave-bridge", "cave-bridge", "cave-bridge", "wall", "chasm", "cave-floor", "cave-floor", "cave-floor", "wall", "wall", "wall",
      "wall", "start", "cave-floor", "chasm", "wall", "wall", "wall", "cave-floor", "wall", "wall", "wall", "wall",
    ],
    playerCol: 1,
    playerRow: 4,
    destCol: 5,
    destRow: 0,
  },
  "northstar-zero-hour": {
    tiles: [
      "tree", "wall", "corridor", "exit", "server-rack", "tree", "wall", "wall", "path", "desk", "wall", "tree",
      "tree", "path", "path", "path", "path", "path", "path", "path", "path", "corridor", "wall", "tree",
      "clearing", "path", "wall", "desk", "wall", "path", "server-rack", "server-rack", "path", "desk", "tree", "tree",
      "path", "path", "clearing", "path", "path", "path", "wall", "path", "path", "path", "tree", "tree",
      "start", "path", "tree", "tree", "clearing", "path", "path", "clearing", "desk", "tree", "tree", "tree",
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
      </div>
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
