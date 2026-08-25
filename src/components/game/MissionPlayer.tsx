import type { GridPoint, MoveDirection } from "@/lib/game/world";
import { PlayerSprite } from "@/components/game/PlayerSprite";

interface MissionPlayerProps {
  position: GridPoint;
  direction: MoveDirection;
  paused: boolean;
  walking?: boolean;
  showDecisionIndicator: boolean;
  columns: number;
  rows: number;
}

export function MissionPlayer({
  position,
  direction,
  paused,
  walking = false,
  showDecisionIndicator,
  columns,
  rows,
}: MissionPlayerProps) {
  return (
    <div
      className={`player-layer ${paused ? "player-layer-paused" : ""}`}
      data-testid="mission-player"
      data-player-x={position.x}
      data-player-y={position.y}
      data-paused={paused ? "true" : "false"}
      data-decision-indicator={showDecisionIndicator ? "true" : "false"}
      style={{
        width: `${100 / columns}%`,
        height: `${100 / rows}%`,
        transform: `translate(${position.x * 100}%, ${position.y * 100}%)`,
      }}
    >
      {showDecisionIndicator ? (
        <span className="player-decision-mark" aria-hidden="true">
          ?
        </span>
      ) : null}
      <PlayerSprite facing={direction} walking={walking && !paused} paused={paused} />
    </div>
  );
}
