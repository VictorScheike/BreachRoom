import Link from "next/link";
import { MissionThumbnail } from "@/components/site/MissionThumbnail";
import { publishedMissions } from "@/lib/missions/catalog";
import type { MissionDefinition, MissionId } from "@/lib/missions/types";

interface MissionSelectProps {
  onSelect: (missionId: MissionId) => void;
}

function destinationLabel(mission: MissionDefinition): string {
  return mission.destination.split("—")[0]?.trim() ?? mission.destination;
}

function learningLabel(mission: MissionDefinition): string {
  return mission.learningAreas.slice(0, 2).join(" · ");
}

function frameworksLabel(mission: MissionDefinition): string {
  return mission.frameworks.slice(0, 2).join(" · ");
}

export function MissionSelect({ onSelect }: MissionSelectProps) {
  return (
    <main id="main-content" className="game-page">
      <div className="game-shell mission-select">
        <p className="game-kicker">Try the exercise</p>
        <h1 className="game-panel-title">Choose a mission</h1>
        <p className="game-panel-copy">
          These maps exist so you can practise the hard calls before they land on your desk. Each
          one is a different workplace under pressure — after you pick a map, you choose a relevant
          role or the standard version.
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
              className={`mission-card mission-select-card mission-card-${mission.id}`}
            >
              <div className="mission-select-thumb">
                <MissionThumbnail missionId={mission.id} label={destinationLabel(mission)} />
              </div>
              <p className="game-kicker">{mission.difficulty}</p>
              <h2 className="mission-card-title">{mission.title}</h2>
              <p className="mission-card-blurb">{mission.summary}</p>
              <ul className="mission-card-facts">
                <li>
                  <strong>Learning:</strong> {learningLabel(mission)}
                </li>
                <li>
                  <strong>Destination:</strong> {destinationLabel(mission)}
                </li>
                <li>
                  <strong>Frameworks:</strong> {frameworksLabel(mission)}
                </li>
              </ul>
              <button
                type="button"
                className="game-primary mission-card-cta"
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
