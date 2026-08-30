import { describe, expect, it } from "vitest";
import { LAB_MISSION, chosenCount, isComplete, optionById } from "@/lib/lab/catalog";
import { labMissionSchema } from "@/lib/lab/schemas";
import { simulateAttack } from "@/lib/lab/engine";
import { visibleNodeIds } from "@/lib/lab/campaign";
import {
  STRONG_ARCHITECTURE,
  MIXED_ARCHITECTURE,
  WEAK_ARCHITECTURE,
  STRONG_PREVENTION_WEAK_DETECTION,
  WEAK_PREVENTION_STRONG_CONTAINMENT,
  MEDIUM_ARCHITECTURE,
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
  it("validates ten architecture decisions and ten campaign stages", () => {
    expect(labMissionSchema.parse(LAB_MISSION).id).toBe("lab-poisoned-claim");
    expect(LAB_MISSION.decisions).toHaveLength(10);
    expect(LAB_MISSION.techniques).toHaveLength(10);
    expect(LAB_MISSION.nodes).toHaveLength(14);
    expect(LAB_MISSION.edges).toHaveLength(4);
    expect(DECISION_IDS).toHaveLength(10);
  });

  it("keeps one stronger option per decision and offers three takes", () => {
    for (const decision of LAB_MISSION.decisions) {
      expect(decision.options).toHaveLength(3);
      expect(decision.options.filter((item) => item.recommended)).toHaveLength(1);
      expect(decision.options[0]?.recommended).toBe(true);
      expect(optionById(decision.options[0]!.id).strength).toBe("strong");
      expect(decision.options.some((item) => item.strength === "medium")).toBe(true);
      expect(decision.options.some((item) => item.strength === "weak")).toBe(true);
      expect(decision.options.every((item) => item.campaignStageIds.length > 0)).toBe(true);
      expect(decision.lookingAt.length).toBeGreaterThan(10);
      expect(decision.affects.length).toBeGreaterThan(10);
      expect(decision.question.length).toBeGreaterThan(20);
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
      expect(state.showingDecisionFeedback).toBe(false);
      state = confirmDecision(state);
    }
    expect(state.phase).toBe("review");
    expect(isComplete(state.choices)).toBe(true);
    expect(chosenCount(state.choices)).toBe(10);
    expect(state.choices.exposure).toBe("exposure-private");
    expect(state.choices.identity).toBe("identity-mfa");
    expect(state.choices.recovery).toBe("recovery-tested");
  });

  it("lets the player return to an earlier decision without losing later choices", () => {
    let state = filledState(STRONG_ARCHITECTURE);
    state = goToDecision(state, 1);
    expect(state.phase).toBe("decide");
    expect(state.currentDecisionIndex).toBe(1);
    expect(state.pendingOptionId).toBe("identity-mfa");
    expect(state.showingDecisionFeedback).toBe(false);
    expect(state.choices.recovery).toBe("recovery-tested");
    state = selectOption(state, "identity-password");
    state = confirmDecision(state);
    expect(state.choices.identity).toBe("identity-password");
    expect(state.choices.input).toBe("input-sandbox");
  });

  it("advances on Next without revealing the campaign result", () => {
    let state = beginLab(EMPTY_LAB_STATE, "guided");
    state = selectOption(state, "exposure-private");
    expect(state.showingDecisionFeedback).toBe(false);
    expect(state.currentDecisionIndex).toBe(0);
    state = confirmDecision(state);
    expect(state.showingDecisionFeedback).toBe(false);
    expect(state.phase).toBe("decide");
    expect(state.currentDecisionIndex).toBe(1);
    expect(state.choices.exposure).toBe("exposure-private");
  });
});

describe("attack simulation", () => {
  it("always starts with a succeeded foothold and a compromised portal", () => {
    const { simulation } = runAttack(STRONG_ARCHITECTURE);
    expect(simulation.stages[0]?.id).toBe("initial-foothold");
    expect(simulation.stages[0]?.outcome).toBe("succeeded");
    expect(simulation.stages[1]?.id).toBe("claims-portal");
    expect(simulation.stages[1]?.outcome).toBe("compromised");
    expect(simulation.result).toBe("contained");
    expect(simulation.resultLabel).toBe("Contained");
  });

  it("blocks AI manipulation on the strongest architecture and marks later offensive stages not reached", () => {
    const { simulation } = runAttack(STRONG_ARCHITECTURE);
    const byId = (id: string) => simulation.stages.find((item) => item.id === id);
    expect(byId("poisoned-document")?.outcome).toBe("limited");
    expect(byId("ai-manipulation")?.outcome).toBe("blocked");
    expect(byId("ai-manipulation")?.travelledPath.includes("api")).toBe(false);
    expect(byId("api-call")?.outcome).toBe("not-reached");
    expect(byId("unrelated-claims")?.outcome).toBe("not-reached");
    expect(byId("extract-modify")?.outcome).toBe("not-reached");
    expect(byId("payout-manipulation")?.outcome).toBe("not-reached");
    expect(byId("api-call")?.isPivot).toBe(false);
  });

  it("still runs detection after a blocked attempt when telemetry exists", () => {
    const { simulation } = runAttack(STRONG_ARCHITECTURE);
    expect(simulation.stages.find((item) => item.id === "monitoring")?.outcome).toBe("detected");
    expect(simulation.stages.find((item) => item.id === "contain-recover")?.outcome).toBe("contained");
    expect(simulation.review.detectionOccurred).toBe(true);
    expect(simulation.review.recoveryRequired).toBe(false);
    expect(simulation.review.recoveryReadiness).toContain("Prepared, but not required");
  });

  it("does not run recovery without impact", () => {
    const { simulation } = runAttack(STRONG_ARCHITECTURE);
    expect(simulation.stages.find((item) => item.id === "contain-recover")?.outcome).not.toBe("recovered");
    expect(simulation.review.pillars.find((item) => item.id === "recovery")?.score).toBe(0);
    expect(simulation.review.pillars.find((item) => item.id === "recovery")?.summary).toContain("not required");
  });

  it("does not continue a blocked technique past the holding node", () => {
    const ai = simulateAttack(STRONG_ARCHITECTURE).stages.find((item) => item.id === "ai-manipulation");
    expect(ai?.travelledPath.at(-1)).toBe("app");
    expect(ai?.stopNode).toBe("app");
    expect(ai?.travelledPath.includes("database")).toBe(false);
  });

  it("contains a mixed architecture that fails the front door but keeps later layers", () => {
    const { simulation } = runAttack(MIXED_ARCHITECTURE);
    expect(simulation.stages[0]?.outcome).toBe("succeeded");
    expect(simulation.stages[1]?.outcome).toBe("compromised");
    expect(simulation.stages.find((item) => item.id === "poisoned-document")?.outcome).toBe("succeeded");
    expect(simulation.stages.find((item) => item.id === "extract-modify")?.outcome).toBe("not-reached");
    expect(simulation.result).toBe("contained");
  });

  it("lets weak controls continue the same chain into protected data", () => {
    const { simulation } = runAttack(WEAK_ARCHITECTURE);
    expect(simulation.stages).toHaveLength(10);
    expect(simulation.stages.find((item) => item.id === "ai-manipulation")?.outcome).toBe("succeeded");
    expect(simulation.stages.find((item) => item.id === "api-call")?.outcome).toBe("succeeded");
    expect(simulation.stages.find((item) => item.id === "unrelated-claims")?.outcome).toBe("succeeded");
    expect(simulation.stages.find((item) => item.id === "extract-modify")?.outcome).toBe("succeeded");
    expect(simulation.stages.find((item) => item.id === "payout-manipulation")?.outcome).toBe("succeeded");
    expect(simulation.stages.find((item) => item.id === "extract-modify")?.stopNode).toBe("database");
    expect(simulation.review.assetReached).toBe("Payout functions");
    expect(simulation.result).toBe("breached");
  });

  it("keeps the mandatory foothold even when identity is strong", () => {
    const simulation = simulateAttack({ ...STRONG_ARCHITECTURE, identity: "identity-device-mfa" });
    expect(simulation.stages[0]?.outcome).toBe("succeeded");
    expect(simulation.stages[0]?.controlStatus).toBe("effective");
    expect(simulation.stages[1]?.outcome).toBe("compromised");
  });

  it("gives different histories to different architectures", () => {
    const strong = simulateAttack(STRONG_ARCHITECTURE);
    const weak = simulateAttack(WEAK_ARCHITECTURE);
    const medium = simulateAttack(MEDIUM_ARCHITECTURE);
    expect(strong.stages.map((stage) => stage.outcome)).not.toEqual(weak.stages.map((stage) => stage.outcome));
    expect(strong.result).not.toBe(weak.result);
    expect(medium.stages.map((stage) => stage.outcome)).not.toEqual(strong.stages.map((stage) => stage.outcome));
    expect(medium.stages.map((stage) => stage.outcome)).not.toEqual(weak.stages.map((stage) => stage.outcome));
  });

  it("still contains the objective when monitoring is weak", () => {
    const { simulation } = runAttack(STRONG_PREVENTION_WEAK_DETECTION);
    expect(simulation.result).toBe("contained");
    expect(simulation.stages.find((item) => item.id === "ai-manipulation")?.outcome).toBe("blocked");
    expect(simulation.stages.find((item) => item.id === "monitoring")?.outcome).toBe("limited");
    expect(simulation.review.detectionOccurred).toBe(false);
  });

  it("lets later layers contain a weak front door", () => {
    const { simulation } = runAttack(WEAK_PREVENTION_STRONG_CONTAINMENT);
    expect(simulation.stages[0]?.outcome).toBe("succeeded");
    expect(simulation.stages.find((item) => item.id === "extract-modify")?.outcome).toBe("blocked");
    expect(simulation.stages.find((item) => item.id === "payout-manipulation")?.outcome).toBe("not-reached");
    expect(simulation.result).not.toBe("breached");
  });

  it("recovers after a deep hit when isolation and backups are tested", () => {
    const simulation = simulateAttack({
      ...WEAK_ARCHITECTURE,
      recovery: "recovery-tested",
      detection: "detection-siem",
    });
    expect(simulation.stages.find((item) => item.id === "extract-modify")?.outcome).toBe("succeeded");
    expect(simulation.stages.find((item) => item.id === "contain-recover")?.outcome).toBe("recovered");
    expect(simulation.result).toBe("contained");
    expect(simulation.review.recoveryRequired).toBe(true);
  });

  it("skips not-reached stages while walking the attack", () => {
    const launched = launchAttack(filledState(STRONG_ARCHITECTURE));
    let state = launched.state;
    const seen = new Set<number>([state.revealedStageCount]);
    while (state.phase === "attack") {
      state = nextAttackStep(state);
      if (state.phase === "attack") {
        seen.add(state.revealedStageCount);
      }
    }
    expect(seen.has(5)).toBe(false);
    expect(seen.has(6)).toBe(false);
    expect(seen.has(7)).toBe(false);
    expect(seen.has(8)).toBe(false);
    expect(state.phase).toBe("result");
  });

  it("keeps previous selections on the growing architecture", () => {
    const afterIdentity = visibleNodeIds({
      exposure: "exposure-private",
      identity: "identity-mfa",
    });
    expect(afterIdentity.has("employee")).toBe(true);
    expect(afterIdentity.has("waf")).toBe(true);
    expect(afterIdentity.has("identity")).toBe(true);
    expect(afterIdentity.has("scanner")).toBe(false);
    const complete = visibleNodeIds(STRONG_ARCHITECTURE);
    expect(complete.has("scanner")).toBe(true);
    expect(complete.has("gateway")).toBe(true);
    expect(complete.has("backup")).toBe(true);
    expect(complete.has("network")).toBe(false);
  });

  it("calculates the campaign from selected controls rather than a hardcoded matrix", () => {
    const strong = simulateAttack(STRONG_ARCHITECTURE);
    const weak = simulateAttack(WEAK_ARCHITECTURE);
    expect(strong.review.improvements).toHaveLength(0);
    expect(weak.review.improvements).toHaveLength(3);
    expect(strong.review.pillars.map((item) => item.id)).toEqual([
      "prevention",
      "limitation",
      "detection",
      "recovery",
    ]);
    expect(strong.review.neverReached).toEqual(
      expect.arrayContaining(["Claims API", "Unrelated claims", "Protected database records", "Payout functions"]),
    );
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
    expect(visual.markerNode).toBe("employee");
  });

  it("stops a blocked route at the AI app and does not draw later attack hops", () => {
    const simulation = simulateAttack(STRONG_ARCHITECTURE);
    const ai = simulation.stages.find((item) => item.id === "ai-manipulation")!;
    const aiIndex = simulation.stages.findIndex((item) => item.id === "ai-manipulation") + 1;
    const resultBeat = beatsForStage(ai).length - 1;
    const blocked = deriveBoardVisual({
      choices: STRONG_ARCHITECTURE,
      simulation,
      revealedStageCount: aiIndex,
      attackBeat: resultBeat,
      phase: "attack",
    });
    expect(ai.travelledPath.includes("api")).toBe(false);
    expect(blocked.nodeStatus.app).toBe("blocked");
    expect(blocked.systemStatus.app).toBe("protected");
    expect(blocked.markerVisible).toBe(false);
    expect(blocked.stopBadge).toEqual({ nodeId: "app", label: "BLOCKED" });
    expect(blocked.controlStatus.retrieval).toBe("effective");
    expect(blocked.edges.filter((edge) => edge.kind === "live" && (edge.to === "api" || edge.to === "database"))).toHaveLength(0);
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

describe("architecture slices", () => {
  it("resolves held and exposed outcomes from option ids", () => {
    const subgraph = subgraphFor("identity");
    expect(subgraphOutcome(subgraph, null, true)).toBeNull();
    expect(subgraphOutcome(subgraph, "identity-mfa", true)?.controlStatus).toBe("held");
    expect(subgraphOutcome(subgraph, "identity-password", false)?.controlStatus).toBe("exposed");
    expect(subgraphOutcome(subgraph, "identity-mfa", true)?.headline.toLowerCase()).toContain("identity");
  });
});
