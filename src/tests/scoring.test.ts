import { describe, expect, it } from "vitest";
import {
  applyImpacts,
  calculateOverallScore,
  clampScore,
  createInitialScores,
  getResultLabel,
  SCORING_CONFIG,
} from "@/lib/simulation/scoring";
import { calculateScores } from "@/lib/simulation/report";
import { scenario } from "@/lib/simulation/scenario";
import type { RecordedDecision, ScoreVector } from "@/lib/simulation/types";
import { SCORE_DIMENSIONS } from "@/lib/simulation/types";

function firstOptionDecisions(): RecordedDecision[] {
  return scenario.stages.map((stage) => {
    const option = stage.options[0];
    if (!option) {
      throw new Error(`Stage ${stage.id} is missing options`);
    }
    return { stageId: stage.id, optionId: option.id };
  });
}

describe("score calculation", () => {
  it("starts every category at the configured initial score", () => {
    const scores = createInitialScores();
    for (const dimension of SCORE_DIMENSIONS) {
      expect(scores[dimension]).toBe(SCORING_CONFIG.initialScore);
    }
  });

  it("applies impacts deterministically", () => {
    const first = applyImpacts(createInitialScores(), {
      containment: 12,
      continuity: -6,
    });
    const second = applyImpacts(createInitialScores(), {
      containment: 12,
      continuity: -6,
    });
    expect(first).toEqual(second);
    expect(first.containment).toBe(62);
    expect(first.continuity).toBe(44);
    expect(first.governance).toBe(50);
  });

  it("calculates the same result every time for the same decisions", () => {
    const decisions = firstOptionDecisions();
    expect(calculateScores(scenario, decisions)).toEqual(
      calculateScores(scenario, decisions),
    );
  });

  it("clamps category scores between 0 and 100", () => {
    expect(clampScore(-25)).toBe(0);
    expect(clampScore(0)).toBe(0);
    expect(clampScore(50)).toBe(50);
    expect(clampScore(100)).toBe(100);
    expect(clampScore(140)).toBe(100);

    const high = applyImpacts(createInitialScores(), { evidence: 80 });
    expect(high.evidence).toBe(100);

    const low = applyImpacts(createInitialScores(), { evidence: -80 });
    expect(low.evidence).toBe(0);
  });

  it("calculates overall score as the rounded average of five categories", () => {
    const even: ScoreVector = {
      containment: 80,
      governance: 80,
      communication: 80,
      continuity: 80,
      evidence: 80,
    };
    expect(calculateOverallScore(even)).toBe(80);

    const roundedUp: ScoreVector = {
      containment: 80,
      governance: 80,
      communication: 80,
      continuity: 80,
      evidence: 79,
    };
    expect(calculateOverallScore(roundedUp)).toBe(80);

    const roundedDown: ScoreVector = {
      containment: 51,
      governance: 51,
      communication: 51,
      continuity: 51,
      evidence: 50,
    };
    expect(calculateOverallScore(roundedDown)).toBe(51);
  });
});

describe("result-label boundaries", () => {
  it("labels 80-100 as a strong response", () => {
    expect(getResultLabel(80)).toBe("Strong response");
    expect(getResultLabel(100)).toBe("Strong response");
  });

  it("labels 60-79 as a solid response with gaps", () => {
    expect(getResultLabel(79)).toBe("Solid response with gaps");
    expect(getResultLabel(60)).toBe("Solid response with gaps");
  });

  it("labels 40-59 as a developing response", () => {
    expect(getResultLabel(59)).toBe("Developing response");
    expect(getResultLabel(40)).toBe("Developing response");
  });

  it("labels 0-39 as major readiness gaps", () => {
    expect(getResultLabel(39)).toBe("Major readiness gaps");
    expect(getResultLabel(0)).toBe("Major readiness gaps");
  });
});
