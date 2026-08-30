import Link from "next/link";
import { LabMissionThumbnail } from "@/components/site/LabMissionThumbnail";
import { MissionThumbnail } from "@/components/site/MissionThumbnail";
import { DECISION_COUNT } from "@/lib/lab/catalog";
import {
  LAB_CARD_CTA,
  LAB_CARD_DESTINATION,
  LAB_CARD_FRAMEWORKS,
  LAB_CARD_HREF,
  LAB_CARD_KICKER,
  LAB_CARD_LEARNING,
  LAB_CARD_SUMMARY,
  LAB_CARD_TITLE,
  LAB_PLAY_INTRO,
} from "@/lib/lab/copy";
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
        <p className="game-panel-copy">{LAB_PLAY_INTRO}</p>
        <p>
          <Link className="back-link" href="/missions/">
            Browse all missions
          </Link>
        </p>
        <div className="mission-grid">
          <article className="mission-card mission-select-card mission-card-lab">
            <div className="mission-select-thumb">
              <LabMissionThumbnail label={LAB_CARD_DESTINATION} />
            </div>
            <p className="game-kicker">
              {LAB_CARD_KICKER} · {DECISION_COUNT} decisions
            </p>
            <h2 className="mission-card-title">{LAB_CARD_TITLE}</h2>
            <p className="mission-card-blurb">{LAB_CARD_SUMMARY}</p>
            <ul className="mission-card-facts">
              <li>
                <strong>Learning:</strong> {LAB_CARD_LEARNING}
              </li>
              <li>
                <strong>Destination:</strong> {LAB_CARD_DESTINATION}
              </li>
              <li>
                <strong>Frameworks:</strong> {LAB_CARD_FRAMEWORKS}
              </li>
            </ul>
            <Link className="game-primary mission-card-cta" href={LAB_CARD_HREF}>
              {LAB_CARD_CTA}
            </Link>
          </article>
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
