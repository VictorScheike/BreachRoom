import Link from "next/link";
import { requireMission } from "@/lib/missions/catalog";
import type { MissionId, RoleId } from "@/lib/missions/types";
import { PLAY_ROLES } from "@/lib/training/roles";

interface RoleSelectProps {
  missionId: MissionId;
  onConfirm: (roleId: RoleId | null) => void;
}

export function RoleSelect({ missionId, onConfirm }: RoleSelectProps) {
  const mission = requireMission(missionId);
  const roles = PLAY_ROLES.filter((role) => mission.intendedRoles.includes(role.id)).slice(0, 5);

  return (
    <main id="main-content" className="game-page">
      <div className="game-shell mission-select">
        <p>
          <Link href="/missions/" className="back-link">
            Back to missions
          </Link>
        </p>
        <p className="game-kicker">{mission.title}</p>
        <h1 className="game-panel-title">Choose a relevant role</h1>
        <p className="game-panel-copy">
          These are the roles this mission is built for. Select a card to play as that role.
        </p>
        <div className="role-grid">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              className="role-card"
              onClick={() => onConfirm(role.id)}
            >
              <h2 className="mission-card-title">{role.label}</h2>
              <p className="game-panel-copy">A primary audience for this mission.</p>
              <span className="role-card-cta">Play as {role.label}</span>
            </button>
          ))}
        </div>
        <section className="role-standard">
          <h2>Not sure which role to choose?</h2>
          <p className="game-panel-copy">
            Play the standard version of the mission. Questions still follow the story, without a
            specific job title.
          </p>
          <button type="button" className="game-primary" onClick={() => onConfirm(null)}>
            Play the standard mission
          </button>
        </section>
      </div>
    </main>
  );
}
