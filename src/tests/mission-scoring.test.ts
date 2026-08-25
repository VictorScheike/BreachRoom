import { describe, expect, it } from "vitest";
import { MISSIONS } from "@/lib/missions/catalog";
import { buildMissionReport } from "@/lib/missions/report";
import { preparePlaythrough } from "@/lib/missions/playthrough";
import { outcomeLevel, pointsToPercent, scorePlaythrough } from "@/lib/missions/scoring";

describe("mission scoring", () => {
  it("converts 24-point dimensions into percentages and averages them", () => {
    expect(pointsToPercent(24, 24)).toBe(100);
    expect(pointsToPercent(12, 24)).toBe(50);
    expect(outcomeLevel(91)).toBe("Resilient response");
    expect(outcomeLevel(70)).toBe("Strong response with gaps");
    expect(outcomeLevel(50)).toBe("Developing response");
    expect(outcomeLevel(49)).toBe("High-risk response");
  });

  it("scores by option id rather than displayed letter", () => {
    const mission = MISSIONS["locked-out"];
    const play = preparePlaythrough(mission, 7);
    const choices = play.questions.map((question) => {
      const optionId = play.optionOrder[question.id]?.[0];
      if (!optionId) {
        throw new Error("Missing shuffled option");
      }
      return {
        questionId: question.id,
        optionId,
        displayLetter: "A" as const,
      };
    });
    const score = scorePlaythrough({ ...mission, questions: play.questions }, choices);
    const report = buildMissionReport(mission, play.scenarioId, choices, play.questions);
    expect(report.score.overall).toBe(score.overall);
    expect(report.journey).toHaveLength(8);
    expect(report.journey.every((item) => item.displayLetter === "A")).toBe(true);
  });
});
