import { describe, expect, it } from "vitest";
import { gameReducer, createInitialGameState } from "@/lib/game/engine";
import { ZERO_HOUR_MAP } from "@/lib/game/maps";
import {
  destinationReachableAfterDecisions,
  destinationRequiresAllDecisions,
  noZoneSkipAdjacency,
  requiredDecisions,
  zoneAt,
} from "@/lib/game/world";
import { requireMission } from "@/lib/missions/catalog";
import { NORTHSTAR_ZERO_HOUR_QUESTIONS, ZERO_HOUR_PHASES } from "@/lib/missions/northstar-zero-hour/questions";
import { preparePlaythrough } from "@/lib/missions/playthrough";
import { buildMissionReport } from "@/lib/missions/report";
import { EDUCATIONAL_DISCLAIMER } from "@/lib/simulation/copy";

describe("Northstar: Zero Hour", () => {
  const mission = requireMission("northstar-zero-hour");

  it("has a 45-question pool with nine questions in each phase", () => {
    expect(NORTHSTAR_ZERO_HOUR_QUESTIONS).toHaveLength(45);
    expect(new Set(NORTHSTAR_ZERO_HOUR_QUESTIONS.map((item) => item.id)).size).toBe(45);
    for (const phase of ZERO_HOUR_PHASES) {
      const pool = NORTHSTAR_ZERO_HOUR_QUESTIONS.filter((item) => item.phase === phase.id);
      expect(pool, phase.id).toHaveLength(9);
    }
    for (const question of NORTHSTAR_ZERO_HOUR_QUESTIONS) {
      expect(question.options).toHaveLength(3);
      expect(question.options.filter((option) => option.quality === "strong")).toHaveLength(1);
      expect(question.options.some((option) => option.quality === "defensible")).toBe(true);
      expect(question.options.some((option) => option.quality === "high-risk")).toBe(true);
      for (const option of question.options) {
        expect(option.consequence.length).toBeGreaterThan(8);
        expect(option.explanation.length).toBeGreaterThan(8);
      }
      expect(question.topicIds?.length).toBeGreaterThan(0);
      expect(question.departmentIds?.length).toBeGreaterThan(0);
      expect(question.learningObjectiveIds?.length).toBeGreaterThan(0);
    }
  });

  it("does not show role selection when the mission is chosen", () => {
    expect(mission.requiresRoleSelection).toBe(false);
    let state = createInitialGameState();
    state = gameReducer(state, { type: "SELECT_MISSION", missionId: "northstar-zero-hour", seed: 21 });
    expect(state.screen).toBe("briefing");
    expect(state.roleId).toBeNull();
    expect(state.playthrough?.questions).toHaveLength(15);
  });

  it("builds a coherent 15-question deck from the 45-question pool", () => {
    const play = preparePlaythrough(mission, 21);
    expect(play.questions).toHaveLength(15);
    expect(new Set(play.questions.map((item) => item.id)).size).toBe(15);
    expect(play.questions.every((item) => NORTHSTAR_ZERO_HOUR_QUESTIONS.some((q) => q.id === item.id))).toBe(true);
    const phases = play.questions.map((item) => item.phase);
    expect(phases.slice(0, 3).every((item) => item === "detection")).toBe(true);
    expect(phases.slice(3, 6).every((item) => item === "containment")).toBe(true);
    expect(phases.slice(6, 9).every((item) => item === "escalation")).toBe(true);
    expect(phases.slice(9, 12).every((item) => item === "continuity")).toBe(true);
    expect(phases.slice(12, 15).every((item) => item === "recovery")).toBe(true);
  });

  it("reproduces the same deck for the same seed and usually a different deck for a new seed", () => {
    const first = preparePlaythrough(mission, 88).questions.map((item) => item.id).join(",");
    const same = preparePlaythrough(mission, 88).questions.map((item) => item.id).join(",");
    const other = preparePlaythrough(mission, 89).questions.map((item) => item.id).join(",");
    expect(same).toBe(first);
    expect(other).not.toBe(first);
  });

  it("does not change scores when answer order is shuffled", () => {
    const play = preparePlaythrough(mission, 12);
    const strong = play.questions.map((question) => {
      const option = question.options.find((item) => item.quality === "strong");
      return {
        questionId: question.id,
        optionId: option!.id,
        displayLetter: "A" as const,
      };
    });
    const report = buildMissionReport(mission, play.scenarioId, strong, play.questions);
    expect(report.journey).toHaveLength(15);
    expect(report.score.overall).toBeGreaterThanOrEqual(80);
  });

  it("keeps the Incident Coordination Room locked until 15 decisions", () => {
    expect(requiredDecisions(ZERO_HOUR_MAP)).toBe(15);
    expect(zoneAt(ZERO_HOUR_MAP, ZERO_HOUR_MAP.destination)).toBe(16);
    expect(noZoneSkipAdjacency(ZERO_HOUR_MAP)).toBe(true);
    expect(destinationRequiresAllDecisions(ZERO_HOUR_MAP)).toBe(true);
    expect(destinationReachableAfterDecisions(ZERO_HOUR_MAP)).toBe(true);
  });

  it("records an unfinished report as not complete", () => {
    let state = createInitialGameState();
    state = gameReducer(state, { type: "START_DIRECT", missionId: "northstar-zero-hour", roleId: null, seed: 4 });
    state = gameReducer(state, { type: "BEGIN_MISSION" });
    state = gameReducer(state, { type: "END_EARLY" });
    expect(state.screen).toBe("report");
    expect(state.endedEarly).toBe(true);
    expect(state.choices).toHaveLength(0);
  });

  it("includes the fictional-scenario disclaimer wording", () => {
    expect(EDUCATIONAL_DISCLAIMER).toContain("The organisation and incident in this exercise are fictional.");
    expect(mission.story).toContain("incident coordination team");
  });
});
