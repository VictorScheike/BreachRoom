import Link from "next/link";
import { MissionThumbnail } from "@/components/site/MissionThumbnail";
import type { MissionDefinition } from "@/lib/missions/types";
import { playUrlForMission } from "@/lib/training/session";

interface MissionCardProps {
  mission: MissionDefinition;
  titleAs?: "h2" | "h3";
}

function destinationLabel(mission: MissionDefinition): string {
  return mission.destination.split("—")[0]?.trim() ?? mission.destination;
}

export function MissionCard({ mission, titleAs = "h3" }: MissionCardProps) {
  const Title = titleAs;
  const topics =
    mission.id === "inbox-under-siege"
      ? ["Phishing", "Social engineering", "Safe reporting"]
      : mission.learningAreas.slice(0, 3);
  const mark =
    mission.id === "inbox-under-siege"
      ? "Hub"
      : mission.id === "locked-out"
        ? "Core"
        : mission.id === "ai-forge"
          ? "Launch"
          : "Exit";

  return (
    <article className="mission-card">
      <div className="mission-card__media">
        <MissionThumbnail missionId={mission.id} label={mark} />
      </div>
      <div className="mission-card__body">
        <p className="mission-card__meta">
          {mission.difficulty.toUpperCase()} · {mission.estimatedMinutes} MIN
        </p>
        <Title className="mission-card__title">{mission.title}</Title>
        <p className="mission-card__description">{mission.summary}</p>
        <ul className="topic-chips">
          {topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
        <p className="mission-card__destination">
          Destination: {destinationLabel(mission)}
        </p>
        <Link className="btn-primary mission-card__action" href={playUrlForMission(mission.id)}>
          View mission
        </Link>
      </div>
    </article>
  );
}
