import { describe, expect, it } from "vitest";
import { requireStage } from "@/lib/simulation/lookups";
import {
  createInitialState,
  simulationReducer,
} from "@/lib/simulation/reducer";
import { generateReport } from "@/lib/simulation/report";
import { scenario } from "@/lib/simulation/scenario";
import {
  identifyCategoryGaps,
  identifyCategoryStrengths,
} from "@/lib/simulation/scoring";
import type { ScoreVector } from "@/lib/simulation/types";

function playThrough(optionIndexes: number[]) {
  let state = simulationReducer(createInitialState(), { type: "BEGIN_INCIDENT" });

  for (const optionIndex of optionIndexes) {
    const stage = requireStage(scenario, state.currentStageIndex);
    const option = stage.options[optionIndex];
    if (!option) {
      throw new Error(`Missing option ${optionIndex} on ${stage.id}`);
    }
    state = simulationReducer(state, {
      type: "SELECT_OPTION",
      optionId: option.id,
    });
    state = simulationReducer(state, { type: "CONFIRM_DECISION" });
  }

  return state;
}

function finishRoute(optionIndexes: number[]) {
  const state = playThrough(optionIndexes);
  return simulationReducer(state, { type: "REACH_EXIT" });
}

describe("report generation", () => {
  it("does not generate a report before the simulation is complete", () => {
    const state = playThrough([0, 0, 0]);
    expect(state.screen).toBe("simulation");
    expect(() => generateReport(scenario, state.decisions)).toThrow(
      /Cannot generate a report/,
    );
  });

  it("completes after all eight decisions and reaching the far side", () => {
    const walking = playThrough([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(walking.screen).toBe("simulation");
    expect(walking.decisions).toHaveLength(8);

    const state = finishRoute([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(state.screen).toBe("report");

    const report = generateReport(scenario, state.decisions);
    expect(report.scoreCaption).toBe("BreachRoom simulation score");
    expect(report.timeline).toHaveLength(8);
    expect(report.decisionsMade).toBe(8);
    expect(report.tradeOffs.length).toBeGreaterThan(0);
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
    expect(report.resultLabel).toBe("Strong response");
    expect(report.timeline[0]?.selectedTitle).toBe(
      "Isolate the two devices and start structured triage",
    );
  });

  it("identifies category strengths and gaps from thresholds", () => {
    const scores: ScoreVector = {
      containment: 82,
      governance: 70,
      communication: 69,
      continuity: 50,
      evidence: 49,
    };

    expect(identifyCategoryStrengths(scores)).toEqual([
      "containment",
      "governance",
    ]);
    expect(identifyCategoryGaps(scores)).toEqual(["evidence"]);
  });

  it("includes selected-option strengths, gaps and follow-up in the report", () => {
    const state = finishRoute([0, 0, 0, 0, 0, 0, 0, 0]);
    const report = generateReport(scenario, state.decisions);
    const firstOption = requireStage(scenario, 0).options[0];
    if (!firstOption) {
      throw new Error("Missing first option");
    }

    expect(report.strengths).toEqual(
      expect.arrayContaining(firstOption.strengths),
    );
    expect(report.gaps).toEqual(
      expect.arrayContaining(firstOption.potentialGaps),
    );
    expect(report.recommendedFollowUp).toEqual(
      expect.arrayContaining(firstOption.recommendedFollowUp),
    );
    expect(report.categoryStrengths).toEqual(
      expect.arrayContaining(["containment", "governance", "evidence"]),
    );
  });

  it("produces a lower, still constructive result for a weaker path", () => {
    const state = finishRoute([1, 2, 2, 1, 2, 1, 1, 1]);
    const report = generateReport(scenario, state.decisions);
    expect(report.overallScore).toBeLessThan(50);
    expect(report.resultLabel).toMatch(/Developing response|Major readiness gaps/);
    expect(report.gaps.length).toBeGreaterThan(0);
    expect(report.recommendedFollowUp.length).toBeGreaterThan(0);
  });

  it("does not allow earlier decisions to be changed once confirmed", () => {
    const state = playThrough([0, 1]);
    const firstOption = requireStage(scenario, 0).options[0];
    const secondOption = requireStage(scenario, 1).options[1];
    if (!firstOption || !secondOption) {
      throw new Error("Expected recorded options");
    }

    expect(state.currentStageIndex).toBe(2);
    expect(state.decisions).toEqual([
      { stageId: requireStage(scenario, 0).id, optionId: firstOption.id },
      { stageId: requireStage(scenario, 1).id, optionId: secondOption.id },
    ]);
    expect(simulationReducer(state, { type: "CONFIRM_DECISION" }).decisions).toEqual(
      state.decisions,
    );
  });
});
