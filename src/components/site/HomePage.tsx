"use client";

import Link from "next/link";
import { FeaturedMissionPreview } from "@/components/site/FeaturedMissionPreview";
import { MISSION_LIST } from "@/lib/missions/catalog";
import { ROLE_GROUPS } from "@/lib/training/groups";
import { publicTopicsForGroup } from "@/lib/training/coverage";
import { playUrlForMission } from "@/lib/training/session";
import "./home-page.css";

const FEATURED_IDS = ["inbox-under-siege", "locked-out", "dependency-depths"] as const;

export function HomePage() {
  const featured = FEATURED_IDS.map(
    (id) => MISSION_LIST.find((mission) => mission.id === id),
  ).filter((mission): mission is NonNullable<typeof mission> => Boolean(mission));

  return (
    <div className="home-page">
      <main id="main-content" className="home-wrap">
        <section className="home-hero">
          <p className="home-eyebrow">ROLE-BASED CYBERSECURITY TRAINING</p>
          <h1>Learn security by making the decisions yourself.</h1>
          <p className="home-lede">
            BreachRoom turns realistic cybersecurity dilemmas into playable missions for the people
            making technology, risk and business decisions.
          </p>
          <div className="home-actions">
            <Link className="home-btn-primary" href="/play/">
              Play free
            </Link>
            <Link className="home-btn-secondary" href="/training/">
              Find training for my role
            </Link>
          </div>
          <ul className="home-trust">
            <li>Free to play</li>
            <li>No account required</li>
            <li>Reviewed questions, not generated answers</li>
          </ul>
          <FeaturedMissionPreview />
        </section>

        <section id="how-it-works" className="home-section">
          <h2>How it works</h2>
          <div className="home-grid-3">
            <article>
              <p className="home-step">1</p>
              <h3>Choose a mission or get a recommendation</h3>
              <p>Play a mission you already know, or answer three short questions about your role.</p>
            </article>
            <article>
              <p className="home-step">2</p>
              <h3>Enter the scenario</h3>
              <p>Walk the map, face eight realistic decisions, and see the consequences immediately.</p>
            </article>
            <article>
              <p className="home-step">3</p>
              <h3>Read the debrief</h3>
              <p>See what was strong, what created risk, and which guidance the session practised.</p>
            </article>
          </div>
        </section>

        <section className="home-section">
          <h2>Featured missions</h2>
          <p>Short playable incidents. The full library lives on the missions page.</p>
          <div className="home-mission-grid">
            {featured.map((mission) => (
              <article key={mission.id} className="home-card">
                <div className={`mission-preview mission-preview-${mission.id}`} aria-hidden="true" />
                <h3>{mission.title}</h3>
                <p>{mission.tagline}</p>
                <p>
                  {mission.difficulty} · about {mission.estimatedMinutes} minutes
                </p>
                <Link className="home-btn-primary" href={playUrlForMission(mission.id)}>
                  View mission
                </Link>
              </article>
            ))}
          </div>
          <p>
            <Link href="/missions/">Browse all missions</Link>
          </p>
        </section>

        <section className="home-section">
          <h2>Training by role</h2>
          <p>Start from the decisions your team actually makes. Scout then matches reviewed content.</p>
          <div className="home-mission-grid">
            {ROLE_GROUPS.map((group) => (
              <article key={group.id} className="home-card">
                <h3>{group.name}</h3>
                <p>{group.sentence}</p>
                <p>
                  {publicTopicsForGroup(group.id)
                    .slice(0, 3)
                    .map((topic) => topic.label)
                    .join(" · ")}
                </p>
                <Link className="home-btn-secondary" href="/training/">
                  Find my training
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="home-cta">
          <h2>Play a free mission</h2>
          <p>No account. Eight decisions. A written debrief at the end.</p>
          <Link className="home-btn-primary" href="/play/">
            Play free
          </Link>
        </section>
      </main>
    </div>
  );
}
