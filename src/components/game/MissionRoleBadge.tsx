import type { MissionPerspective } from "@/lib/game/perspective";

interface MissionRoleBadgeProps {
  perspective: MissionPerspective;
}

export function MissionRoleBadge({ perspective }: MissionRoleBadgeProps) {
  return (
    <div className="mission-role">
      <span className="mission-role__icon" aria-hidden="true">
        ◉
      </span>
      <div>
        <span className="mission-role__label">
          {perspective.mode === "role" ? "You’re playing as" : "Exercise type"}
        </span>
        <strong className="mission-role__value">{perspective.playingAs}</strong>
        <span className="mission-role__focus">{perspective.focus}</span>
      </div>
    </div>
  );
}
