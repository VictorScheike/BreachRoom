import { describe, expect, it } from "vitest";
import { LAB_MISSION, componentsFor, requireComponent } from "@/lib/lab/catalog";
import { labMissionSchema } from "@/lib/lab/schemas";
import {
  canPlace,
  missingSlots,
  placeComponent,
  readinessFor,
  simulateAttack,
} from "@/lib/lab/engine";
import {
  STRONG_ARCHITECTURE,
  MIXED_ARCHITECTURE,
  WEAK_ARCHITECTURE,
  STRONG_PREVENTION_WEAK_DETECTION,
  WEAK_PREVENTION_STRONG_CONTAINMENT,
} from "@/lib/lab/fixtures";
import { changeDifficulty, improveAndRetry, launchAttack, nextAttackStep } from "@/lib/lab/play";
import { EMPTY_LAB_STATE } from "@/lib/lab/store";
import { SLOT_IDS, type LabPersistedState, type LabPlacements } from "@/lib/lab/types";

function filledState(placements: LabPlacements, difficulty: LabPersistedState["difficulty"] = "guided"): LabPersistedState {
  return {
    ...EMPTY_LAB_STATE,
    difficulty,
    placements,
  };
}

function runAttack(placements: LabPlacements, difficulty: LabPersistedState["difficulty"] = "guided") {
  const launched = launchAttack(filledState(placements, difficulty));
  expect(launched.error).toBeNull();
  let state = launched.state;
  while (state.phase === "attack") {
    state = nextAttackStep(state);
  }
  return { state, simulation: simulateAttack(placements) };
}

describe("Architecture Defence Lab catalog", () => {
  it("validates the Poisoned Claim mission with Zod", () => {
    expect(labMissionSchema.parse(LAB_MISSION).id).toBe("lab-poisoned-claim");
    expect(LAB_MISSION.slots).toHaveLength(8);
    expect(LAB_MISSION.attack.stages).toHaveLength(6);
    expect(LAB_MISSION.fixedNodes).toHaveLength(6);
    expect(LAB_MISSION.components.length).toBeGreaterThanOrEqual(16);
  });

  it("offers two Guided choices per slot and extra Architect options on some slots", () => {
    for (const slotId of SLOT_IDS) {
      const guided = componentsFor("guided", slotId);
      const architect = componentsFor("architect", slotId);
      expect(guided.length).toBe(2);
      expect(architect.length).toBeGreaterThanOrEqual(2);
      expect(guided.every((item) => item.difficulties.includes("guided"))).toBe(true);
    }
    expect(componentsFor("architect", "identity").map((item) => item.id)).toContain("identity-mfa-flat");
    expect(componentsFor("guided", "identity").map((item) => item.id)).not.toContain("identity-mfa-flat");
  });

  it("keeps Guided hints and recommended flags without auto-building the answer", () => {
    const recommended = LAB_MISSION.components.filter((item) => item.recommended);
    expect(recommended.length).toBeGreaterThan(0);
    expect(recommended.some((item) => item.id === "identity-password")).toBe(false);
    expect(requireComponent("identity-mfa-rbac").hint.length).toBeGreaterThan(10);
  });
});

describe("architecture placement", () => {
  it("accepts compatible drops and rejects incompatible ones", () => {
    expect(canPlace("identity-mfa-rbac", "identity", "guided")).toBe(true);
    expect(canPlace("identity-mfa-rbac", "model", "guided")).toBe(false);
    expect(canPlace("identity-mfa-flat", "identity", "guided")).toBe(false);
    expect(canPlace("identity-mfa-flat", "identity", "architect")).toBe(true);
    expect(canPlace("nope", "identity", "guided")).toBe(false);
  });

  it("replaces a component already in a slot", () => {
    const first = placeComponent({}, "identity-password", "identity", "guided");
    const second = placeComponent(first, "identity-mfa-rbac", "identity", "guided");
    expect(first.identity).toBe("identity-password");
    expect(second.identity).toBe("identity-mfa-rbac");
  });

  it("lists missing slots until the architecture is complete", () => {
    expect(missingSlots({}, "guided")).toEqual([...SLOT_IDS]);
    expect(missingSlots(STRONG_ARCHITECTURE, "guided")).toEqual([]);
  });
});

describe("attack simulation", () => {
  it("blocks a strong architecture early and still runs detection", () => {
    const { simulation } = runAttack(STRONG_ARCHITECTURE);
    expect(simulation.result).toBe("architecture-holds");
    expect(simulation.stages[0]?.outcome).toBe("blocked");
    expect(simulation.stages[1]?.chainReached).toBe(false);
    expect(simulation.stages[2]?.outcome).toBe("blocked");
    expect(simulation.stages[4]?.outcome).toBe("blocked");
    expect(simulation.stages[5]?.id).toBe("detection");
    expect(simulation.stages[5]?.outcome).toBe("detected");
  });

  it("lets mixed prevention fail while later controls contain the export", () => {
    const { simulation } = runAttack(MIXED_ARCHITECTURE);
    expect(simulation.stages[0]?.outcome).toBe("successful");
    expect(simulation.stages[2]?.outcome).toBe("successful");
    expect(simulation.stages[3]?.outcome).toBe("contained");
    expect(simulation.stages[4]?.outcome).toBe("blocked");
    expect(simulation.result).toBe("attack-contained");
    expect(simulation.review.dataExposed).toMatch(/not exported|trusted environment/i);
  });

  it("completes a weak architecture as a full breach", () => {
    const { simulation } = runAttack(WEAK_ARCHITECTURE);
    expect(simulation.stages[0]?.outcome).toBe("successful");
    expect(simulation.stages[2]?.outcome).toBe("successful");
    expect(simulation.stages[3]?.outcome).toBe("successful");
    expect(simulation.stages[4]?.outcome).toBe("successful");
    expect(simulation.stages[5]?.outcome).toBe("successful");
    expect(simulation.result).toBe("architecture-breached");
  });

  it("can block the attack while weak monitoring fails to identify it", () => {
    const { simulation } = runAttack(STRONG_PREVENTION_WEAK_DETECTION);
    expect(simulation.result).toBe("architecture-holds");
    expect(simulation.stages[0]?.outcome).toBe("blocked");
    expect(simulation.stages[5]?.outcome).toBe("successful");
  });

  it("lets early controls fail while later layers stop exfiltration", () => {
    const { simulation } = runAttack(WEAK_PREVENTION_STRONG_CONTAINMENT);
    expect(simulation.stages[0]?.outcome).toBe("successful");
    expect(simulation.stages[2]?.outcome).toBe("successful");
    expect(simulation.stages[4]?.outcome).toBe("blocked");
    expect(simulation.result).toBe("attack-contained");
  });

  it("does not treat a legitimate upload as a control failure", () => {
    const { simulation } = runAttack(WEAK_ARCHITECTURE);
    const upload = simulation.stages.find((stage) => stage.id === "poisoned-document");
    expect(upload?.legitimateActivity).toBe(true);
    expect(upload?.outcome).toBe("successful");
    expect(simulation.review.failedControls.join(" ")).not.toMatch(/Poisoned document/i);
  });

  it("produces visibly different paths for different architectures", () => {
    const strong = simulateAttack(STRONG_ARCHITECTURE).stages.map((stage) => stage.outcome);
    const weak = simulateAttack(WEAK_ARCHITECTURE).stages.map((stage) => stage.outcome);
    expect(strong).not.toEqual(weak);
    expect(simulateAttack(STRONG_ARCHITECTURE).result).not.toBe(simulateAttack(WEAK_ARCHITECTURE).result);
  });

  it("does not make one failed control an automatic total breach", () => {
    const mixed = simulateAttack(MIXED_ARCHITECTURE);
    expect(mixed.stages[2]?.outcome).toBe("successful");
    expect(mixed.result).not.toBe("architecture-breached");
  });
});

describe("lab play session", () => {
  it("refuses to launch until every slot is filled", () => {
    const result = launchAttack(EMPTY_LAB_STATE);
    expect(result.error).toMatch(/Fill every architecture slot/);
    expect(result.state.phase).toBe("build");
  });

  it("walks the attack one stage at a time", () => {
    const launched = launchAttack(filledState(STRONG_ARCHITECTURE));
    expect(launched.state.phase).toBe("attack");
    expect(launched.state.revealedStageCount).toBe(1);
    const second = nextAttackStep(launched.state);
    expect(second.revealedStageCount).toBe(2);
    expect(second.phase).toBe("attack");
  });

  it("returns to build with the same components on Improve and Retry", () => {
    const { state } = runAttack(MIXED_ARCHITECTURE);
    expect(state.phase).toBe("review");
    const retried = improveAndRetry(state);
    expect(retried.phase).toBe("build");
    expect(retried.placements).toEqual(MIXED_ARCHITECTURE);
    expect(retried.revealedStageCount).toBe(0);
    expect(retried.bestResult).toBe("attack-contained");
  });

  it("drops Architect-only components when switching back to Guided", () => {
    const state = filledState({ ...STRONG_ARCHITECTURE, identity: "identity-mfa-flat" }, "architect");
    const guided = changeDifficulty(state, "guided");
    expect(guided.placements.identity).toBeUndefined();
    expect(guided.placements.model).toBe("model-private");
  });

  it("does not let readiness alone equal the attack result", () => {
    const strongReady = readinessFor(STRONG_ARCHITECTURE).overall;
    const weakDetect = readinessFor(STRONG_PREVENTION_WEAK_DETECTION).overall;
    expect(strongReady).toBeGreaterThan(weakDetect);
    expect(simulateAttack(STRONG_ARCHITECTURE).result).toBe(simulateAttack(STRONG_PREVENTION_WEAK_DETECTION).result);
  });
});
