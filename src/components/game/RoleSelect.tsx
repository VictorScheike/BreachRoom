import { requireMission } from "@/lib/missions/catalog";
import type { MissionId, RoleId } from "@/lib/missions/types";
import { PLAY_ROLES } from "@/lib/training/roles";

interface RoleSelectProps {
  missionId: MissionId;
  onConfirm: (roleId: RoleId | null) => void;
  onBack: () => void;
}

export function RoleSelect({ missionId, onConfirm, onBack }: RoleSelectProps) {
  const mission = requireMission(missionId);
  const preferred = PLAY_ROLES.filter((role) => mission.intendedRoles.includes(role.id));
  const others = PLAY_ROLES.filter((role) => !mission.intendedRoles.includes(role.id));

  return (
    <main id="main-content" className="game-page">
      <div className="game-shell mission-select">
        <p className="game-kicker">{mission.title}</p>
        <h1 className="game-panel-title">Choose a role</h1>
        <p className="game-panel-copy">
          The mission will prefer scenarios and questions that match the decisions this role
          actually faces. You can still play without a specific role.
        </p>
        <div className="mission-grid">
          {preferred.map((role) => (
            <article key={role.id} className="mission-card">
              <h2 className="mission-card-title">{role.label}</h2>
              <p className="game-panel-copy">A primary audience for this mission.</p>
              <button type="button" className="game-primary" onClick={() => onConfirm(role.id)}>
                Play as {role.label}
              </button>
            </article>
          ))}
          {others.map((role) => (
            <article key={role.id} className="mission-card">
              <h2 className="mission-card-title">{role.label}</h2>
              <p className="game-panel-copy">
                Compatible questions will be used where they exist; otherwise the mission stays
                coherent using the selected scenario pack.
              </p>
              <button type="button" className="hud-button" onClick={() => onConfirm(role.id)}>
                Play as {role.label}
              </button>
            </article>
          ))}
        </div>
        <p className="mission-meta">
          <button type="button" className="hud-button" onClick={() => onConfirm(null)}>
            Play without a specific role
          </button>
        </p>
        <p>
          <button type="button" className="hud-button" onClick={onBack}>
            Back to missions
          </button>
        </p>
      </div>
    </main>
  );
}
