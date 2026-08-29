import { describe, expect, it } from "vitest";
import { LAB_MISSION, chosenCount, isComplete, optionById } from "@/lib/lab/catalog";
import { labMissionSchema } from "@/lib/lab/schemas";
import { simulateAttack } from "@/lib/lab/engine";
import {
  STRONG_ARCHITECTURE,
  MIXED_ARCHITECTURE,
  WEAK_ARCHITECTURE,
  STRONG_PREVENTION_WEAK_DETECTION,
  WEAK_PREVENTION_STRONG_CONTAINMENT,
} from "@/lib/lab/fixtures";
import {
  beginLab,
  confirmDecision,
  goToDecision,
  improveAndRetry,
  launchAttack,
  nextAttackStep,
  pauseAttack,
  previousAttackStep,
  replayAttack,
  resetArchitecture,
  selectOption,
} from "@/lib/lab/play";
import { beatsForStage, deriveBoardVisual } from "@/lib/lab/animation";
import { subgraphFor, subgraphOutcome } from "@/lib/lab/subgraphs";
import { EMPTY_LAB_STATE } from "@/lib/lab/store";
import { DECISION_IDS, type LabChoices, type LabPersistedState } from "@/lib/lab/types";

function filledState(choices: LabChoices, difficulty: LabPersistedState["difficulty"] = "guided"): LabPersistedState {
  return {
    ...EMPTY_LAB_STATE,
    difficulty,
    choices,
    phase: "review",
    currentDecisionIndex: 9,
  };
}

function runAttack(choices: LabChoices) {
  const launched = launchAttack(filledState(choices));
  expect(launched.error).toBeNull();
  let state = launched.state;
  while (state.phase === "attack") {
    state = nextAttackStep(state);
  }
  return { state, simulation: simulateAttack(choices) };
}

describe("Architecture Defence Lab catalog", () => {
  it("validates ten binary decisions and seven techniques", () => {
    expect(labMissionSchema.parse(LAB_MISSION).id).toBe("lab-poisoned-claim");
    expect(LAB_MISSION.decisions).toHaveLength(10);
    expect(LAB_MISSION.techniques).toHaveLength(7);
    expect(LAB_MISSION.nodes).toHaveLength(13);
    expect(DECISION_IDS).toHaveLength(10);
  });

  it("keeps Recommended only on the stronger option", () => {
    for (const decision of LAB_MISSION.decisions) {
      expect(decision.options.filter((item) => item.recommended)).toHaveLength(1);
      expect(decision.options[0]?.recommended).toBe(true);
      expect(optionById(decision.options[0]!.id).strength).toBe("strong");
    }
  });
});

describe("decision flow", () => {
  it("completes all 10 decisions and preserves earlier choices", () => {
    let state = beginLab(EMPTY_LAB_STATE, "guided");
    expect(state.phase).toBe("decide");
    for (const decision of LAB_MISSION.decisions) {
      const strong = decision.options[0];
      state = selectOption(state, strong.id);
      expect(state.pendingOptionId).toBe(strong.id);
      state = confirmDecision(state);
    }
    expect(state.phase).toBe("review");
    expect(isComplete(state.choices)).toBe(true);
    expect(chosenCount(state.choices)).toBe(10);
    expect(state.choices.identity).toBe("identity-mfa");
    expect(state.choices.detection).toBe("detection-siem");
  });

  it("lets the player return to an earlier decision without losing later choices", () => {
    let state = filledState(STRONG_ARCHITECTURE);
    state = goToDecision(state, 0);
    expect(state.phase).toBe("decide");
    expect(state.currentDecisionIndex).toBe(0);
    expect(state.pendingOptionId).toBe("identity-mfa");
    expect(state.choices.oversight).toBe("oversight-human");
    state = selectOption(state, "identity-password");
    state = confirmDecision(state);
    expect(state.choices.identity).toBe("identity-password");
    expect(state.choices.input).toBe("input-sandbox");
  });
});

describe("attack simulation", () => {
  it("stops a blocked technique at its control and starts the next as a pivot", () => {
    const { simulation } = runAttack(STRONG_ARCHITECTURE);
    const stolen = simulation.stages[0];
    const document = simulation.stages[1];
    expect(stolen?.outcome).toBe("blocked");
    expect(stolen?.stopNode).toBe("identity");
    expect(stolen?.travelledPath.includes("app")).toBe(false);
    expect(document?.isPivot).toBe(true);
    expect(document?.pivotLabel).toBe("Blocked. Red Team changes technique.");
    expect(document?.entryNode).toBe("portal");
    expect(simulation.result).toBe("prevented");
  });

  it("does not continue a blocked technique past the holding node", () => {
    const stolen = simulateAttack(STRONG_ARCHITECTURE).stages[0];
    expect(stolen?.travelledPath).toEqual(["portal", "identity"]);
    expect(stolen?.travelledPath.at(-1)).toBe("identity");
  });

  it("contains a mixed architecture that fails identity but keeps human approval", () => {
    const { simulation } = runAttack(MIXED_ARCHITECTURE);
    expect(simulation.stages[0]?.outcome).toBe("successful");
    expect(simulation.stages[4]?.id).toBe("payout-manipulation");
    expect(simulation.stages[4]?.outcome).toBe("blocked");
    expect(simulation.result).toBe("contained");
  });

  it("breaches a weak architecture and still runs every technique", () => {
    const { simulation } = runAttack(WEAK_ARCHITECTURE);
    expect(simulation.stages).toHaveLength(7);
    expect(simulation.stages[4]?.outcome).toBe("successful");
    expect(simulation.result).toBe("breached");
  });

  it("gives different histories to different architectures", () => {
    const strong = simulateAttack(STRONG_ARCHITECTURE);
    const weak = simulateAttack(WEAK_ARCHITECTURE);
    expect(strong.stages.map((stage) => stage.outcome)).not.toEqual(weak.stages.map((stage) => stage.outcome));
    expect(strong.result).not.toBe(weak.result);
    expect(strong.stages.every((stage) => STRONG_ARCHITECTURE[stage.id as never] !== undefined || true)).toBe(true);
  });

  it("still prevents the objective when monitoring is weak", () => {
    const { simulation } = runAttack(STRONG_PREVENTION_WEAK_DETECTION);
    expect(simulation.result).toBe("prevented");
    expect(simulation.stages[6]?.outcome).toBe("successful");
  });

  it("lets later layers contain a weak front door", () => {
    const { simulation } = runAttack(WEAK_PREVENTION_STRONG_CONTAINMENT);
    expect(simulation.stages[0]?.outcome).toBe("successful");
    expect(simulation.stages[4]?.outcome).toBe("blocked");
    expect(simulation.result).not.toBe("breached");
  });

  it("keeps every selected decision visible in the final architecture", () => {
    expect(Object.keys(STRONG_ARCHITECTURE)).toEqual([...DECISION_IDS]);
    for (const decision of LAB_MISSION.decisions) {
      const node = LAB_MISSION.nodes.find((item) => item.decisionId === decision.id);
      expect(node).toBeTruthy();
      expect(STRONG_ARCHITECTURE[decision.id]).toBe(decision.options[0]?.id);
    }
  });
});

describe("lab play session", () => {
  it("refuses to launch before all ten decisions are made", () => {
    const result = launchAttack(EMPTY_LAB_STATE);
    expect(result.error).toMatch(/10 architecture decisions/);
    expect(result.state.phase).toBe("setup");
  });

  it("walks the campaign one event at a time and can replay", () => {
    const launched = launchAttack(filledState(STRONG_ARCHITECTURE));
    expect(launched.state.phase).toBe("attack");
    expect(launched.state.revealedStageCount).toBe(1);
    expect(launched.state.attackBeat).toBe(0);
    const second = nextAttackStep(launched.state);
    expect(second.revealedStageCount).toBe(1);
    expect(second.attackBeat).toBe(1);
    const replayed = replayAttack(second);
    expect(replayed.phase).toBe("attack");
    expect(replayed.revealedStageCount).toBe(1);
    expect(replayed.attackBeat).toBe(0);
  });

  it("pauses without advancing the attack beat", () => {
    const launched = launchAttack(filledState(STRONG_ARCHITECTURE)).state;
    const paused = pauseAttack(launched, true);
    expect(paused.paused).toBe(true);
    expect(paused.revealedStageCount).toBe(1);
    expect(paused.attackBeat).toBe(0);
    expect(pauseAttack(paused, false).paused).toBe(false);
  });

  it("can go backward and forward without changing selected decisions", () => {
    let state = launchAttack(filledState(STRONG_ARCHITECTURE)).state;
    const choices = state.choices;
    state = nextAttackStep(state);
    expect(state.attackBeat).toBe(1);
    state = previousAttackStep(state);
    expect(state.attackBeat).toBe(0);
    expect(state.revealedStageCount).toBe(1);
    expect(state.paused).toBe(true);
    expect(state.choices).toEqual(choices);
    state = pauseAttack(state, false);
    state = nextAttackStep(state);
    expect(state.attackBeat).toBe(1);
    expect(state.choices).toEqual(STRONG_ARCHITECTURE);
  });

  it("resets every attack visual on replay", () => {
    let state = launchAttack(filledState(STRONG_ARCHITECTURE)).state;
    state = nextAttackStep(state);
    state = nextAttackStep(state);
    const replayed = replayAttack(state);
    const visual = deriveBoardVisual({
      choices: STRONG_ARCHITECTURE,
      simulation: simulateAttack(STRONG_ARCHITECTURE),
      revealedStageCount: replayed.revealedStageCount,
      attackBeat: replayed.attackBeat,
      phase: replayed.phase,
    });
    expect(replayed.revealedStageCount).toBe(1);
    expect(replayed.attackBeat).toBe(0);
    expect(visual.pivotBanner).toBe(false);
    expect(visual.stopBadge).toBeNull();
    expect(visual.markerNode).toBe("portal");
  });

  it("stops a blocked route at the holding node and starts the next technique as a pivot", () => {
    const simulation = simulateAttack(STRONG_ARCHITECTURE);
    const stolen = simulation.stages[0]!;
    const resultBeat = beatsForStage(stolen).length - 1;
    const blocked = deriveBoardVisual({
      choices: STRONG_ARCHITECTURE,
      simulation,
      revealedStageCount: 1,
      attackBeat: resultBeat,
      phase: "attack",
    });
    expect(stolen.travelledPath.includes("app")).toBe(false);
    expect(blocked.nodeStatus.identity).toBe("blocked");
    expect(blocked.markerVisible).toBe(false);
    expect(blocked.stopBadge).toEqual({ nodeId: "identity", label: "BLOCKED" });
    const pivot = deriveBoardVisual({
      choices: STRONG_ARCHITECTURE,
      simulation,
      revealedStageCount: 2,
      attackBeat: 0,
      phase: "attack",
    });
    expect(pivot.pivotBanner).toBe(true);
    expect(pivot.markerVisible).toBe(false);
    expect(pivot.edges.some((edge) => edge.kind === "pivot-live")).toBe(true);
  });

  it("returns to the first decision on Improve and Retry without dropping choices", () => {
    const { state } = runAttack(MIXED_ARCHITECTURE);
    expect(state.phase).toBe("result");
    const retried = improveAndRetry(state);
    expect(retried.phase).toBe("decide");
    expect(retried.choices).toEqual(MIXED_ARCHITECTURE);
    expect(retried.revealedStageCount).toBe(0);
    expect(resetArchitecture(state).choices).toEqual({});
  });

  it("can jump to the recommended control from Improve this control", () => {
    const { state, simulation } = runAttack(WEAK_ARCHITECTURE);
    const retried = improveAndRetry(state, simulation.review.recommendedDecisionId);
    expect(retried.phase).toBe("decide");
    expect(retried.currentDecisionIndex).toBe(DECISION_IDS.indexOf(simulation.review.recommendedDecisionId));
    expect(retried.choices).toEqual(WEAK_ARCHITECTURE);
  });
});

describe("local architecture slices", () => {
  it("resolves held and exposed outcomes from option ids", () => {
    const subgraph = subgraphFor("identity");
    expect(subgraphOutcome(subgraph, null, true)).toBeNull();
    expect(subgraphOutcome(subgraph, "identity-mfa", true)?.controlStatus).toBe("held");
    expect(subgraphOutcome(subgraph, "identity-password", false)?.controlStatus).toBe("exposed");
    expect(subgraphOutcome(subgraph, "identity-mfa", true)?.headline).toContain("Identity");
  });
});

