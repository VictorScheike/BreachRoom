"use client";

import Link from "next/link";
import { MissionThumbnail } from "@/components/site/MissionThumbnail";

export function FeaturedMissionPreview() {
  return (
    <aside className="featured-preview" aria-label="Inbox Under Siege mission preview">
      <div className="featured-map featured-map--thumb">
        <MissionThumbnail missionId="inbox-under-siege" label="Security Hub" />
      </div>
      <div className="featured-copy featured-mission__content">
        <p className="featured-kicker">Featured mission</p>
        <h2>Inbox Under Siege</h2>
        <p className="featured-mission__description">
          Investigate suspicious mail and chat across the office, then return to the Security Hub
          with your incident assessment.
        </p>
        <Link className="btn-primary featured-mission__action" href="/play/?mission=inbox-under-siege">
          Play mission
        </Link>
      </div>
    </aside>
  );
}
