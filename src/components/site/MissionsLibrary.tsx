"use client";

import { MissionCard } from "@/components/site/MissionCard";
import { MissionFilter } from "@/components/site/MissionFilter";
import Link from "next/link";
import { useMemo, useState } from "react";
import { publishedMissions } from "@/lib/missions/catalog";
import type { DifficultyId } from "@/lib/missions/types";
import { ROLE_GROUPS, type RoleGroupId } from "@/lib/training/groups";
import { TRAINING_TOPICS } from "@/lib/training/topics";

export function MissionsLibrary() {
  const [group, setGroup] = useState<RoleGroupId | "all">("all");
  const [topicId, setTopicId] = useState("all");
  const [difficulty, setDifficulty] = useState<DifficultyId | "all">("all");

  const all = publishedMissions();
  const missions = useMemo(() => {
    return all.filter((mission) => {
      const groupOk =
        group === "all" ||
        mission.audienceMode === "general" ||
        ROLE_GROUPS.find((item) => item.id === group)?.roleIds.some((role) =>
          mission.intendedRoles.includes(role),
        );
      const topic = TRAINING_TOPICS.find((item) => item.id === topicId);
      const topicOk =
        topicId === "all" ||
        Boolean(
          topic &&
            (mission.id === topic.mapId ||
              (topic.id === "ransomware" && mission.id === "northstar-zero-hour")),
        );
      const difficultyOk = difficulty === "all" || mission.difficulty === difficulty;
      return Boolean(groupOk && topicOk && difficultyOk);
    });
  }, [all, group, topicId, difficulty]);

  const groupLabel =
    group === "all" ? "All groups" : ROLE_GROUPS.find((item) => item.id === group)?.name ?? "All groups";
  const topicLabel =
    topicId === "all" ? "All topics" : TRAINING_TOPICS.find((item) => item.id === topicId)?.label ?? "All topics";

  const clear = () => {
    setGroup("all");
    setTopicId("all");
    setDifficulty("all");
  };

  return (
    <div>
      <section className="lab-library" aria-labelledby="lab-library-heading">
        <p className="training-lede lab-library-intro">
          Architecture Defence Lab is a different exercise from the maps below. You build a secure
          architecture, then you watch one coherent attack move through the system you actually
          chose — stolen credentials and a poisoned document, not a walk across a workplace.
        </p>
        <article className="mission-card lab-library-card">
          <div className="mission-card__body">
            <div className="mission-card__content">
              <p className="mission-card__meta">ARCHITECTURE DEFENCE LAB · GUIDED OR CHALLENGE</p>
              <h2 id="lab-library-heading" className="mission-card__title">
                Architecture Defence Lab
              </h2>
              <p className="mission-card__destination">The Poisoned Claim</p>
              <p className="mission-card__description mission-card__description--four">
                Build a claims-handling architecture for fictional Nordic Shield Insurance, then watch
                one coherent attack — stolen credentials plus a poisoned document — move through the
                system you built.
              </p>
              <ul className="topic-chips">
                <li>AI security</li>
                <li>Secure architecture</li>
                <li>Defence in depth</li>
              </ul>
              <p className="mission-card__destination">Build it. Then let the attack loose.</p>
            </div>
            <div className="mission-card__footer">
              <Link className="btn-primary mission-card__action" href="/lab/">
                Enter the lab
              </Link>
            </div>
          </div>
        </article>
      </section>
      <section className="map-missions-block" aria-labelledby="map-missions-heading">
        <h2 id="map-missions-heading">Map missions</h2>
        <p className="training-lede missions-intro">
          These maps exist so you can practise the hard calls before they land on your desk. Each
          one is a different workplace under pressure — phishing, ransomware, a risky AI launch, a
          poisoned build, a lockout. Walking the route and deciding at each checkpoint is how the
          judgement sticks.
        </p>
        <section className="mission-filter-panel" aria-label="Mission filters">
          <div className="mission-filter-panel__meta">
            <p>
              Showing {missions.length} of {all.length} missions
            </p>
            <button type="button" className="btn-tertiary" onClick={clear}>
              Clear filters
            </button>
          </div>
          <div className="mission-filter-grid">
            <MissionFilter
              id="filter-role-group"
              label="Role group"
              value={group}
              displayValue={groupLabel}
              onChange={(event) => setGroup(event.target.value as RoleGroupId | "all")}
            >
              <option value="all">All groups</option>
              {ROLE_GROUPS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </MissionFilter>
            <MissionFilter
              id="filter-topic"
              label="Topic"
              value={topicId}
              displayValue={topicLabel}
              onChange={(event) => setTopicId(event.target.value)}
            >
              <option value="all">All topics</option>
              {TRAINING_TOPICS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </MissionFilter>
            <MissionFilter
              id="filter-difficulty"
              label="Difficulty"
              value={difficulty}
              displayValue={difficulty === "all" ? "All" : difficulty}
              onChange={(event) => setDifficulty(event.target.value as DifficultyId | "all")}
            >
              <option value="all">All</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
            </MissionFilter>
          </div>
        </section>
        <div className="mission-grid">
          {missions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} titleAs="h2" descriptionLines={4} />
          ))}
          {missions.length === 0 ? <p>No missions match those filters yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
