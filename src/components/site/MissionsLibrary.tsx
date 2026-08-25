"use client";

import { MissionCard } from "@/components/site/MissionCard";
import { MissionFilter } from "@/components/site/MissionFilter";
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
    </div>
  );
}
