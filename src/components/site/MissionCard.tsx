import Link from "next/link";
import { MissionThumbnail } from "@/components/site/MissionThumbnail";
import type { MissionDefinition } from "@/lib/missions/types";
import { playUrlForMission } from "@/lib/training/session";

interface MissionCardProps {
  mission: MissionDefinition;
  titleAs?: "h2" | "h3";
  descriptionLines?: 3 | 4;
}

function destinationLabel(mission: MissionDefinition): string {
  return mission.destination.split("—")[0]?.trim() ?? mission.destination;
}

function thumbnailMark(mission: MissionDefinition): string {
  switch (mission.id) {
    case "inbox-under-siege":
      return "Hub";
    case "locked-out":
      return "Core";
    case "ai-forge":
      return "Launch";
    case "dependency-depths":
      return "Exit";
    case "northstar-zero-hour":
      return "ICR";
    default:
      return "Map";
  }
}

function topicChips(mission: MissionDefinition): string[] {
  if (mission.id === "inbox-under-siege") {
    return ["Phishing", "Social engineering", "Safe reporting"];
  }
  if (mission.id === "northstar-zero-hour") {
    return ["Ransomware", "Coordination", "Continuity"];
  }
  return mission.learningAreas.slice(0, 3);
}

export function MissionCard({ mission, titleAs = "h3", descriptionLines = 3 }: MissionCardProps) {
  const Title = titleAs;
  const topics = topicChips(mission);
  const audience =
    mission.audienceMode === "general"
      ? mission.audienceLabel ?? "Organisation-wide"
      : null;

  return (
    <article className="mission-card">
      <div className="mission-card__media">
        <MissionThumbnail missionId={mission.id} label={thumbnailMark(mission)} />
      </div>
      <div className="mission-card__body">
        <div className="mission-card__content">
          <p className="mission-card__meta">
            {mission.difficulty.toUpperCase()} · {mission.estimatedMinutes} MIN
            {mission.decisionsPerSession ? ` · ${mission.decisionsPerSession} DECISIONS` : ""}
          </p>
          <Title className="mission-card__title">{mission.title}</Title>
          {mission.subtitle ? <p className="mission-card__subtitle">{mission.subtitle}</p> : null}
          <p
            className={
              descriptionLines === 4
                ? "mission-card__description mission-card__description--four"
                : "mission-card__description"
            }
          >
            {mission.summary}
          </p>
          <ul className="topic-chips">
            {topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
          <p className="mission-card__destination">
            Destination: {destinationLabel(mission)}
          </p>
          {audience ? <p className="mission-card__audience">Audience: Everyone</p> : null}
        </div>
        <div className="mission-card__footer">
          <Link className="btn-primary mission-card__action" href={playUrlForMission(mission.id)}>
            View mission
          </Link>
        </div>
      </div>
    </article>
  );
}
