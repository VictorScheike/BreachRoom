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
      "wall", "wall", "desk", "wall", "corridor", "exit", "corridor", "wall", "desk", "server-rack", "wall", "wall",
      "wall", "desk", "wall", "corridor", "corridor", "corridor", "corridor", "corridor", "wall", "desk", "wall", "wall",
      "wall", "wall", "wall", "wall", "corridor", "wall", "corridor", "wall", "wall", "server-rack", "desk", "wall",
      "corridor", "corridor", "corridor", "corridor", "corridor", "wall", "corridor", "corridor", "corridor", "wall", "wall", "wall",
      "wall", "start", "corridor", "wall", "corridor", "wall", "wall", "desk", "corridor", "wall", "desk", "wall",
    ],
    playerCol: 1,
    playerRow: 4,
    destCol: 5,
    destRow: 0,
  },
  "locked-out": {
    tiles: [
      "tree", "tree", "tree", "clearing", "path", "exit", "path", "clearing", "tree", "tree", "tree", "tree",
      "tree", "tree", "tree", "clearing", "path", "path", "path", "clearing", "tree", "tree", "tree", "tree",
      "tree", "clearing", "path", "path", "tree", "wood-bridge", "tree", "path", "path", "clearing", "tree", "tree",
      "tree", "clearing", "path", "tree", "tree", "tree", "tree", "tree", "path", "clearing", "tree", "tree",
      "tree", "start", "clearing", "tree", "tree", "tree", "tree", "tree", "path", "clearing", "tree", "tree",
    ],
    playerCol: 1,
    playerRow: 4,
    destCol: 5,
    destRow: 0,
  },
  "ai-forge": {
    tiles: [
      "lava", "lava", "lava", "stone-floor", "stone-bridge", "exit", "stone-bridge", "stone-floor", "lava", "lava", "lava", "lava",
      "lava", "lava", "lava", "stone-floor", "stone-bridge", "stone-bridge", "stone-bridge", "stone-floor", "lava", "rock", "lava", "lava",
      "lava", "stone-floor", "stone-bridge", "stone-bridge", "lava", "lava", "lava", "stone-bridge", "stone-bridge", "stone-floor", "lava", "lava",
      "lava", "stone-floor", "stone-bridge", "lava", "lava", "rock", "lava", "lava", "lava", "lava", "lava", "lava",
      "lava", "start", "stone-floor", "lava", "lava", "lava", "lava", "lava", "lava", "rock", "lava", "lava",
    ],
    playerCol: 1,
    playerRow: 4,
    destCol: 5,
    destRow: 0,
  },
  "dependency-depths": {
    tiles: [
      "chasm", "wall", "chasm", "cave-floor", "cave-bridge", "exit", "cave-bridge", "cave-floor", "chasm", "wall", "chasm", "chasm",
      "chasm", "wall", "chasm", "cave-floor", "cave-bridge", "cave-bridge", "cave-bridge", "cave-floor", "chasm", "wall", "chasm", "chasm",
      "chasm", "cave-floor", "cave-bridge", "cave-bridge", "chasm", "chasm", "chasm", "cave-bridge", "cave-bridge", "cave-floor", "wall", "chasm",
      "chasm", "cave-floor", "cave-bridge", "chasm", "wall", "chasm", "wall", "chasm", "chasm", "chasm", "chasm", "chasm",
      "chasm", "start", "cave-floor", "chasm", "chasm", "chasm", "chasm", "chasm", "chasm", "wall", "chasm", "chasm",
    ],
    playerCol: 1,
    playerRow: 4,
    destCol: 5,
    destRow: 0,
  },
  "northstar-zero-hour": {
    tiles: [
      "wall", "corridor", "corridor", "exit", "server-rack", "wall", "wall", "corridor", "path", "desk", "wall", "tree",
      "wall", "corridor", "corridor", "corridor", "corridor", "corridor", "corridor", "corridor", "path", "wall", "tree", "tree",
      "tree", "path", "path", "wall", "desk", "wall", "path", "path", "path", "clearing", "tree", "tree",
      "tree", "path", "clearing", "tree", "tree", "tree", "path", "tree", "path", "clearing", "tree", "tree",
      "tree", "start", "clearing", "tree", "tree", "tree", "path", "path", "clearing", "tree", "tree", "tree",
    ],
    playerCol: 1,
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
