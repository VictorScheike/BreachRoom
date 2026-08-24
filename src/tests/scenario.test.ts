import { describe, expect, it } from "vitest";
import { parseScenario, safeParseScenario, scenarioSchema } from "@/lib/simulation/schemas";
import { scenario } from "@/lib/simulation/scenario";

function makeOption(id: string, impacts: Record<string, number> = { containment: 1 }) {
  return {
    id,
    title: `Title ${id}`,
    description: `Description for ${id}`,
    scoreImpacts: impacts,
    rationale: "Why this option exists",
    tradeOffs: "What is given up",
    strengths: ["A strength"],
    potentialGaps: ["A gap"],
    recommendedFollowUp: ["A follow-up action"],
  };
}

function makeStage(id: string, prefix: string) {
  return {
    id,
    timestamp: "Monday 08:15 CET",
    title: `Stage ${id}`,
    incidentUpdate: "An incident update",
    availableFacts: ["A known fact"],
    knownUnknowns: ["An unknown"],
    options: [
      makeOption(`${prefix}-a`, { containment: 2 }),
      makeOption(`${prefix}-b`, { governance: 2 }),
      makeOption(`${prefix}-c`, { evidence: 2 }),
    ],
  };
}

function makeValidScenario() {
  return {
    id: "test-scenario",
    title: "Test scenario",
    estimatedDuration: "10–15 minutes",
    organisation: {
      name: "Northstar Logistics",
      fictionalLabel: "Fictional organisation",
      description: "A fictional logistics company used only in tests.",
      employeeCount: 320,
      geography: "Denmark and the EU",
      technologyEnvironment: ["Microsoft 365", "Azure"],
      businessDependency: "Time-sensitive deliveries",
    },
    initialSituation: "Shared files cannot be opened.",
    playerBrief: "Choose one option at each stage.",
    stages: Array.from({ length: 8 }, (_, index) =>
      makeStage(`stage-${index + 1}`, `s${index + 1}`),
    ),
  };
}

describe("scenario schema validation", () => {
  it("accepts the bundled Locked Out scenario", () => {
    const parsed = parseScenario(scenario);
    expect(parsed.id).toBe("locked-out-ransomware");
    expect(parsed.title).toBe("Locked Out: A Ransomware Incident");
    expect(parsed.organisation.name).toBe("Northstar Logistics");
    expect(parsed.organisation.fictionalLabel).toContain("Fictional");
    expect(parsed.stages).toHaveLength(8);
    expect(parsed.stages.every((stage) => stage.options.length === 3)).toBe(true);
  });

  it("accepts a well-formed scenario definition", () => {
    const result = scenarioSchema.safeParse(makeValidScenario());
    expect(result.success).toBe(true);
  });

  it("rejects a scenario with the wrong number of stages", () => {
    const invalid = makeValidScenario();
    invalid.stages.pop();
    const result = safeParseScenario(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a stage that does not have three options", () => {
    const invalid = makeValidScenario();
    const firstStage = invalid.stages[0];
    if (!firstStage) {
      throw new Error("Expected a first stage");
    }
    firstStage.options.pop();
    const result = safeParseScenario(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects duplicate stage ids", () => {
    const invalid = makeValidScenario();
    const firstStage = invalid.stages[0];
    const secondStage = invalid.stages[1];
    if (!firstStage || !secondStage) {
      throw new Error("Expected stages");
    }
    secondStage.id = firstStage.id;
    const result = safeParseScenario(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects duplicate option ids", () => {
    const invalid = makeValidScenario();
    const firstStage = invalid.stages[0];
    const secondStage = invalid.stages[1];
    const firstOption = firstStage?.options[0];
    const laterOption = secondStage?.options[0];
    if (!firstOption || !laterOption) {
      throw new Error("Expected options");
    }
    laterOption.id = firstOption.id;
    const result = safeParseScenario(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects empty required strings", () => {
    const invalid = makeValidScenario();
    invalid.title = "   ";
    const result = safeParseScenario(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects unknown scoring dimensions", () => {
    const invalid = makeValidScenario();
    const option = invalid.stages[0]?.options[0];
    if (!option) {
      throw new Error("Expected an option");
    }
    option.scoreImpacts = { stealth: 4 } as unknown as typeof option.scoreImpacts;
    const result = safeParseScenario(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects an option with no score impacts", () => {
    const invalid = makeValidScenario();
    const option = invalid.stages[0]?.options[0];
    if (!option) {
      throw new Error("Expected an option");
    }
    option.scoreImpacts = {};
    const result = safeParseScenario(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects unexpected keys on the scenario object", () => {
    const invalid = {
      ...makeValidScenario(),
      extraField: true,
    };
    const result = safeParseScenario(invalid);
    expect(result.success).toBe(false);
  });
});
