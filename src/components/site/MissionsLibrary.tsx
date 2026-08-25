"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MISSION_LIST } from "@/lib/missions/catalog";
import type { DifficultyId } from "@/lib/missions/types";
import { ROLE_GROUPS, type RoleGroupId } from "@/lib/training/groups";
import { humanRoleList } from "@/lib/training/labels";
import { TRAINING_TOPICS } from "@/lib/training/topics";
import { playUrlForMission } from "@/lib/training/session";

export function MissionsLibrary() {
  const [group, setGroup] = useState<RoleGroupId | "all">("all");
  const [topicId, setTopicId] = useState("all");
  const [difficulty, setDifficulty] = useState<DifficultyId | "all">("all");

  const missions = useMemo(() => {
    return MISSION_LIST.filter((mission) => {
      const groupOk =
        group === "all" ||
        ROLE_GROUPS.find((item) => item.id === group)?.roleIds.some((role) =>
          mission.intendedRoles.includes(role),
        );
      const topic = TRAINING_TOPICS.find((item) => item.id === topicId);
      const topicOk = topicId === "all" || (topic ? mission.id === topic.mapId : true);
      const difficultyOk = difficulty === "all" || mission.difficulty === difficulty;
      return Boolean(groupOk && topicOk && difficultyOk);
    });
  }, [group, topicId, difficulty]);

  return (
    <div>
      <div className="home-filters">
        <label>
          Role group
          <select
            value={group}
            onChange={(event) => setGroup(event.target.value as RoleGroupId | "all")}
          >
            <option value="all">All groups</option>
            {ROLE_GROUPS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Topic
          <select value={topicId} onChange={(event) => setTopicId(event.target.value)}>
            <option value="all">All topics</option>
            {TRAINING_TOPICS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
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
            <div className={`mission-preview mission-preview-${mission.id}`} aria-hidden="true" />
            <h2>{mission.title}</h2>
            <p>{mission.story}</p>
            <p>
              <strong>Roles:</strong> {humanRoleList(mission.intendedRoles)}
            </p>
            <p>
              <strong>Topics:</strong> {mission.learningAreas.join(" · ")}
            </p>
            <p>
              <strong>Difficulty:</strong> {mission.difficulty} · about {mission.estimatedMinutes}{" "}
              minutes
            </p>
            <p>
              <strong>Destination:</strong> {mission.destination}
            </p>
            <Link className="home-btn-primary" href={playUrlForMission(mission.id)}>
              View mission
            </Link>
          </article>
        ))}
        {missions.length === 0 ? <p>No missions match those filters yet.</p> : null}
      </div>
    </div>
  );
}
