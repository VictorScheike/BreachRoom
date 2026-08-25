import { describe, expect, it } from "vitest";
import { publishedMissions } from "@/lib/missions/catalog";
import { NAV_ITEMS } from "@/lib/site/copy";
import { ROLE_GROUPS } from "@/lib/training/groups";

describe("homepage polish data", () => {
  it("lists Start immediately before Missions and keeps the public nav order", () => {
    expect(NAV_ITEMS.map((item) => item.label)).toEqual([
      "Start",
      "Missions",
      "Training by role",
      "How it works",
      "My progress",
      "About",
      "Play free",
    ]);
    expect(NAV_ITEMS[0]).toEqual({ href: "/", label: "Start" });
  });

  it("exposes every published playable mission for the homepage grid", () => {
    const missions = publishedMissions();
    expect(missions.map((mission) => mission.id)).toEqual([
      "inbox-under-siege",
      "locked-out",
      "northstar-zero-hour",
      "ai-forge",
      "dependency-depths",
    ]);
    expect(missions.every((mission) => mission.published)).toBe(true);
    expect(missions.every((mission) => mission.summary.length > 0)).toBe(true);
  });

  it("keeps the five current role groups", () => {
    expect(ROLE_GROUPS.map((group) => group.name)).toEqual([
      "General employees",
      "Finance & HR",
      "Developers & DevOps",
      "IT & Security",
      "Leaders, Risk & Governance",
    ]);
  });
});
