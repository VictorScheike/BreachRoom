"use client";

import Link from "next/link";
import { PlayerSprite } from "@/components/game/PlayerSprite";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

export function FeaturedMissionPreview() {
  const reduced = usePrefersReducedMotion();

  return (
    <aside className="featured-preview" aria-label="Inbox Under Siege mission preview">
      <div className={`featured-map ${reduced ? "featured-map-still" : ""}`} aria-hidden="true">
        {Array.from({ length: 40 }, (_, index) => {
          const x = index % 8;
          const y = Math.floor(index / 8);
          const dest = x === 6 && y === 1;
          const desk = y === 4 && x > 1 && x < 6;
          const path = x === 2 || y === 2;
          return (
            <span
              key={`${x}-${y}`}
              className={`featured-tile ${dest ? "featured-dest" : desk ? "featured-desk" : path ? "featured-path" : "featured-floor"}`}
            />
          );
        })}
        <div className="featured-player">
          <PlayerSprite facing="right" walking={!reduced} />
        </div>
        <span className="featured-flag">Hub</span>
      </div>
      <div className="featured-copy">
        <p className="featured-kicker">Featured mission</p>
        <h2>Inbox Under Siege</h2>
        <p>
          Investigate suspicious mail and chat across the office, then return to the Security Hub
          with your incident assessment.
        </p>
        <Link className="btn-primary" href="/play/?mission=inbox-under-siege">
          Play mission
        </Link>
      </div>
    </aside>
  );
}
