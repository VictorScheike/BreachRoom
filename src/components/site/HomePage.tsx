"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MISSION_LIST } from "@/lib/missions/catalog";
import type { DifficultyId, RoleId } from "@/lib/missions/types";
import { TRAINING_FORMATS } from "@/lib/training/formats";
import { TRAINING_ROLES } from "@/lib/training/roles";
import "./home-page.css";

const ALL_TOPICS = [...new Set(MISSION_LIST.flatMap((mission) => mission.topics))];

export function HomePage() {
  const [role, setRole] = useState<RoleId | "all">("all");
  const [topic, setTopic] = useState("all");
  const [difficulty, setDifficulty] = useState<DifficultyId | "all">("all");

  const missions = useMemo(() => {
    return MISSION_LIST.filter((mission) => {
      const roleOk = role === "all" || mission.intendedRoles.includes(role);
      const topicOk = topic === "all" || mission.topics.includes(topic);
      const difficultyOk = difficulty === "all" || mission.difficulty === difficulty;
      return roleOk && topicOk && difficultyOk;
    });
  }, [role, topic, difficulty]);

  return (
    <div className="home-page">
      <main id="main-content" className="home-wrap">
        <section className="home-hero" id="product">
          <p className="home-eyebrow">ROLE-BASED CYBERSECURITY TRAINING</p>
          <h1>Learn security by making the decisions yourself.</h1>
          <p className="home-lede">
            BreachRoom turns realistic cybersecurity dilemmas into playable missions for the
            people making technology, risk and business decisions.
          </p>
          <p className="home-position">Role-based cybersecurity training through playable decisions.</p>
          <div className="home-actions">
            <Link className="home-btn-primary" href="/play/">
              Play a mission
            </Link>
            <Link className="home-btn-secondary" href="#roles">
              Explore training by role
            </Link>
            <Link className="home-btn-secondary" href="/create-training/">
              Create your training
            </Link>
          </div>
          <ul className="home-trust">
            <li>Free to play</li>
            <li>No account required</li>
            <li>Scenario-based learning</li>
          </ul>
          <div className="home-preview" aria-hidden="true">
            <div className="home-browser">
              <span>Inbox Under Siege · Security Hub</span>
              <div className="mission-preview mission-preview-inbox-under-siege home-map-preview" />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="home-section">
          <h2>How it works</h2>
          <div className="home-grid-3">
            <article>
              <p className="home-step">1</p>
              <h3>Choose your role or mission</h3>
              <p>Select training based on the decisions you face at work.</p>
            </article>
            <article>
              <p className="home-step">2</p>
              <h3>Enter the scenario</h3>
              <p>Explore the map, respond to realistic problems and experience the consequences.</p>
            </article>
            <article>
              <p className="home-step">3</p>
              <h3>Understand your decisions</h3>
              <p>Receive a clear debrief showing what worked, what created risk and what to do differently.</p>
            </article>
          </div>
        </section>

        <section id="missions" className="home-section">
          <h2>Mission library</h2>
          <p>
            Browse playable missions. Filters use the same mission metadata that the rest of the
            platform reads.
          </p>
          <div className="home-filters">
            <label>
              Role
              <select value={role} onChange={(event) => setRole(event.target.value as RoleId | "all")}>
                <option value="all">All roles</option>
                {TRAINING_ROLES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Topic
              <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                <option value="all">All topics</option>
                {ALL_TOPICS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Difficulty
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as DifficultyId | "all")}
              >
                <option value="all">All</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
              </select>
            </label>
          </div>
          <div className="home-mission-grid">
            {missions.map((mission) => (
              <article key={mission.id} className="home-card">
                <div className={`mission-preview mission-preview-${mission.id}`} />
                <h3>{mission.title}</h3>
                <p>{mission.story}</p>
                <p>
                  <strong>Intended roles:</strong> {mission.intendedRoles.join(", ")}
                </p>
                <p>
                  <strong>Topics:</strong> {mission.topics.join(" · ")}
                </p>
                <p>
                  <strong>Difficulty:</strong> {mission.difficulty} · ~{mission.estimatedMinutes} min
                </p>
                <p>
                  <strong>Frameworks:</strong> {mission.frameworks.join(" · ")}
                </p>
                <Link className="home-btn-primary" href="/play/">
                  Play free
                </Link>
              </article>
            ))}
            {missions.length === 0 ? <p>No missions match those filters yet.</p> : null}
          </div>
        </section>

        <section id="roles" className="home-section">
          <h2>Training by role</h2>
          <div className="home-mission-grid">
            {TRAINING_ROLES.map((item) => (
              <article key={item.id} className="home-card">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p>
                  <strong>Topics:</strong> {item.topicIds.join(" · ")}
                </p>
                <p>
                  <strong>Available missions:</strong>{" "}
                  {item.missionIds.length > 0
                    ? item.missionIds
                        .map((id) => MISSION_LIST.find((mission) => mission.id === id)?.title)
                        .join(" · ")
                    : item.fallbackNote}
                </p>
                <Link className="home-btn-secondary" href="/create-training/">
                  Explore training
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="approach" className="home-section">
          <h2>More than right or wrong.</h2>
          <p>
            Security decisions involve technology, business needs, people and risk. BreachRoom
            shows not only which response was strongest, but what each decision changed and why.
          </p>
          <p className="home-flow">Situation → Decision → Consequence → Debrief</p>
          <p>
            Scenarios draw on recognised guidance such as NIST, DORA and OWASP. BreachRoom is an
            educational experience, not a compliance certification.
          </p>
        </section>

        <section id="formats" className="home-section">
          <h2>Built for more than one type of training.</h2>
          <p>
            BreachRoom is designed to grow into a broader library of games, quizzes and structured
            learning paths.
          </p>
          <div className="home-grid-3">
            {TRAINING_FORMATS.map((format) => (
              <article key={format.id} className="home-card">
                <h3>{format.title}</h3>
                <p>
                  {format.status === "available" ? "Available" : "Not in the library yet"}
                </p>
                <p>{format.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="context" className="home-section">
          <h2>Your role. Your tools. Your security decisions.</h2>
          <p>
            Tell Scout who the training is for, what your organisation works with and which risks
            matter. BreachRoom will recommend a relevant mission or build a structured training
            outline from its cybersecurity curriculum.
          </p>
          <p>From phishing and password security to AI, cloud and secure software development.</p>
          <p>Tell Scout what your team works with, and it will help shape the right training.</p>
          <Link className="home-btn-primary" href="/create-training/">
            Create your training
          </Link>
        </section>

        <section id="organisations" className="home-section">
          <h2>Training that reflects the decisions people actually make.</h2>
          <ul>
            <li>Training organised by role</li>
            <li>Different scenarios for different teams</li>
            <li>Practical rather than purely theoretical learning</li>
            <li>Repeatable randomised missions</li>
            <li>Clear individual debriefs</li>
            <li>
              A content structure capable of supporting additional company-specific scenarios
            </li>
          </ul>
          <Link className="home-btn-secondary" href="#missions">
            Explore the missions
          </Link>
        </section>

        <section className="home-cta" id="play">
          <h2>Step into the breach.</h2>
          <p>Choose a role, enter a mission and see how your decisions change the outcome.</p>
          <Link className="home-btn-primary" href="/play/">
            Play free
          </Link>
          <p>No account required.</p>
        </section>

        <section id="about" className="home-section">
          <h2>About</h2>
          <p>
            BreachRoom is an educational tabletop built by Victor Scheike. It exists to put more
            focus on what cybersecurity actually means in decisions, not as a product you buy or a
            certificate you hang on a wall.
          </p>
          <Link href="/about/">Read more</Link>
        </section>
      </main>
    </div>
  );
}
