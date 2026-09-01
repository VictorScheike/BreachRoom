"use client";

import Link from "next/link";
import { BuilderMissionCard } from "@/components/site/BuilderMissionCard";
import { HowItWorks } from "@/components/site/HowItWorks";
import { LabMissionCard } from "@/components/site/LabMissionCard";
import { MissionCard } from "@/components/site/MissionCard";
import { RoleTrainingCard } from "@/components/site/RoleTrainingCard";
import { RoleTrainingGrid } from "@/components/site/RoleTrainingGrid";
import { LAB_HOME_INTRO } from "@/lib/lab/copy";
import { publishedMissions } from "@/lib/missions/catalog";
import { ROLE_GROUPS } from "@/lib/training/groups";
import "./home-page.css";

export function HomePage() {
  const missions = publishedMissions();

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
            <Link className="btn-primary" href="/play/">
              Play free
            </Link>
            <Link className="btn-secondary btn-secondary-on-dark" href="/training/">
              Find training for my role
            </Link>
          </div>
          <ul className="home-trust">
            <li>Free to play</li>
            <li>No account required</li>
            <li>Reviewed questions, not generated answers</li>
          </ul>
          <HowItWorks className="how-section--in-hero" />
        </section>

        <section className="home-section" aria-labelledby="playable-missions-heading">
          <h2 id="playable-missions-heading">Playable missions</h2>
          <p className="section-lede missions-intro">{LAB_HOME_INTRO}</p>
          <div className="decision-exercises">
            <div className="mission-grid">
              <LabMissionCard />
              <BuilderMissionCard />
            </div>
          </div>
          <div className="map-missions-block">
            <h3 id="map-missions-home-heading">Map missions</h3>
            <div className="mission-grid">
              {missions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          </div>
          <p>
            <Link className="btn-tertiary" href="/missions/">
              Explore the mission library
              <span className="btn-arrow" aria-hidden="true" />
            </Link>
          </p>
        </section>

        <section className="home-section" aria-labelledby="training-by-role-heading">
          <div className="section-intro">
            <div>
              <p className="home-eyebrow">TRAINING BY ROLE</p>
              <h2 id="training-by-role-heading">
                Security decisions are different across the organisation.
              </h2>
            </div>
            <Link className="btn-tertiary" href="/training/">
              Explore training by role
              <span className="btn-arrow" aria-hidden="true" />
            </Link>
          </div>
          <p className="section-lede">
            Choose the group that best matches your work. BreachRoom will assemble training from
            reviewed questions that fit the role, topic and context.
          </p>
          <RoleTrainingGrid>
            {ROLE_GROUPS.map((group) => (
              <RoleTrainingCard key={group.id} group={group} href="/training/" />
            ))}
          </RoleTrainingGrid>
        </section>

        <section className="home-cta">
          <h2>Play a free mission</h2>
          <p>No account. Eight decisions. A written debrief at the end.</p>
          <Link className="btn-primary" href="/play/">
            Play free
          </Link>
        </section>
      </main>
    </div>
  );
}
