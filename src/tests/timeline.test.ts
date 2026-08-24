import { describe, expect, it } from "vitest";
import { requireStage } from "@/lib/simulation/lookups";
import {
  createInitialState,
  simulationReducer,
} from "@/lib/simulation/reducer";
import { scenario } from "@/lib/simulation/scenario";
import { buildTimelineEvents } from "@/lib/simulation/timeline";

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

describe("incident timeline", () => {
  it("shows the opening system alert before any decision is made", () => {
    const firstStage = requireStage(scenario, 0);
    const events = buildTimelineEvents(scenario, [], firstStage.id, "live");

    expect(events).toHaveLength(1);
    expect(events[0]?.eventType).toBe("System alert");
    expect(events[0]?.kind).toBe("incident");
    expect(events[0]?.isCurrent).toBe(true);
    expect(events[0]?.clockTime).toBe("08:15");
  });

  it("adds a decision-recorded event after confirmation and keeps the next incident distinct", () => {
    const state = playThrough([0]);
    const current = requireStage(scenario, state.currentStageIndex);
    const events = buildTimelineEvents(
      scenario,
      state.decisions,
      current.id,
      "live",
    );

    expect(events.map((event) => event.eventType)).toEqual([
      "System alert",
      "Decision recorded",
      "IT update",
    ]);
    expect(events.filter((event) => event.kind === "decision")).toHaveLength(1);
    expect(events[2]?.isCurrent).toBe(true);
  });

  it("builds a complete incident-and-decision log after eight choices", () => {
    const state = playThrough([0, 0, 0, 0, 0, 0, 0, 0]);
    const lastStage = requireStage(scenario, scenario.stages.length - 1);
    const events = buildTimelineEvents(
      scenario,
      state.decisions,
      lastStage.id,
      "report",
    );

    expect(events).toHaveLength(16);
    expect(events.filter((event) => event.kind === "incident")).toHaveLength(8);
    expect(events.filter((event) => event.kind === "decision")).toHaveLength(8);
    expect(events.map((event) => event.eventType)).toContain("Management request");
    expect(events.map((event) => event.eventType)).toContain("Attacker message");
    expect(events.map((event) => event.eventType)).toContain("Media enquiry");
    expect(events.map((event) => event.eventType)).toContain("Recovery update");
  });

  it("keeps fictional severity tied to the stage, not the hidden score", () => {
    const firstPath = playThrough([0, 0, 0]);
    const secondPath = playThrough([2, 2, 2]);
    const stage = requireStage(scenario, 3);

    expect(stage.severity).toBe("SEV-1");
    expect(firstPath.currentStageIndex).toBe(secondPath.currentStageIndex);
    expect(requireStage(scenario, firstPath.currentStageIndex).severity).toBe(
      requireStage(scenario, secondPath.currentStageIndex).severity,
    );
  });
});
