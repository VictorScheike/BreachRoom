import type { MissionPerspective } from "@/lib/game/perspective";

interface MissionRoleBadgeProps {
  perspective: MissionPerspective;
}

export function MissionRoleBadge({ perspective }: MissionRoleBadgeProps) {
  return (
    <div className={`mission-role mission-role--${perspective.mode}`}>
      <span className="mission-role__icon" aria-hidden="true">
        ◉
      </span>
      <div className="mission-role__text">
        {perspective.mode === "role" ? (
          <span className="mission-role__label">You’re playing as</span>
        ) : (
          <span className="mission-role__label">Mission perspective</span>
        )}
        <strong className="mission-role__value">{perspective.playingAs}</strong>
        <span className="mission-role__focus">{perspective.focus}</span>
      </div>
    </div>
  );
}
