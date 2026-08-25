import Link from "next/link";
import { publishedMissions } from "@/lib/missions/catalog";
import type { MissionId } from "@/lib/missions/types";

interface MissionSelectProps {
  onSelect: (missionId: MissionId) => void;
}

export function MissionSelect({ onSelect }: MissionSelectProps) {
  return (
    <main id="main-content" className="game-page">
      <div className="game-shell mission-select">
        <p className="game-kicker">Try the exercise</p>
        <h1 className="game-panel-title">Choose a mission</h1>
        <p className="game-panel-copy">
          Four playable maps. After you pick one, you choose a relevant role or the standard
          version. You can also browse the full library first.
        </p>
        <p>
          <Link className="back-link" href="/missions/">
            Browse all missions
          </Link>
        </p>
        <div className="mission-grid">
          {publishedMissions().map((mission) => (
            <article
              key={mission.id}
              className={`mission-card mission-card-${mission.id}`}
            >
              <div
                className={`mission-preview mission-preview-${mission.id}`}
                aria-hidden="true"
              />
              <p className="game-kicker">{mission.difficulty}</p>
              <h2 className="mission-card-title">{mission.title}</h2>
              <p className="game-panel-copy">{mission.story}</p>
              <p className="mission-meta">
                <strong>Learning:</strong> {mission.learningAreas.join(" · ")}
              </p>
              <p className="mission-meta">
                <strong>Destination:</strong> {mission.destination}
              </p>
              <p className="mission-meta">
                <strong>Frameworks:</strong> {mission.frameworks.join(" · ")}
              </p>
              <button
                type="button"
                className="game-primary"
                onClick={() => onSelect(mission.id)}
              >
                Start mission
              </button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
