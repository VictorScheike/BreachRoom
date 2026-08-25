import { describe, expect, it } from "vitest";
import { MISSIONS, MISSION_LIST } from "@/lib/missions/catalog";
import { buildEmailReportHtml, buildEmailReportText } from "@/lib/missions/email-report";
import { preparePlaythrough } from "@/lib/missions/playthrough";
import { buildMissionReport } from "@/lib/missions/report";
import { classifyOption, classifyScore } from "@/lib/missions/verdicts";
import { recommendTraining } from "@/lib/training/recommend";

describe("verdicts", () => {
  it("maps 3 to correct, 2 to partly correct, and 0-1 to incorrect", () => {
    expect(classifyScore(3)).toBe("correct");
    expect(classifyScore(2.4)).toBe("partly-correct");
    expect(classifyScore(1)).toBe("incorrect");
    expect(classifyScore(0)).toBe("incorrect");
  });
});

describe("inbox under siege", () => {
  it("has at least 32 unique questions across four scenario packs", () => {
    const mission = MISSIONS["inbox-under-siege"];
    expect(mission.questions.length).toBeGreaterThanOrEqual(32);
    expect(new Set(mission.questions.map((question) => question.id)).size).toBe(32);
    expect(mission.scenarios).toHaveLength(4);
  });

  it("keeps finance questions out of the general-employee pack", () => {
    const mission = MISSIONS["inbox-under-siege"];
    const employeePlay = preparePlaythrough(mission, 9, { roleId: "employee" });
    const financePlay = preparePlaythrough(mission, 9, { roleId: "finance" });
    expect(["inbox-urgent", "inbox-hr"]).toContain(employeePlay.scenarioId);
    expect(financePlay.scenarioId).toBe("inbox-finance");
    expect(employeePlay.questions.every((question) => !question.id.startsWith("ius-f"))).toBe(true);
    expect(employeePlay.questions.every((question) => !question.id.startsWith("ius-i"))).toBe(true);
  });
});

describe("shared report model", () => {
  it("classifies browser and email reports from the same verdicts", () => {
    const mission = MISSION_LIST[0]!;
    const play = preparePlaythrough(mission, 3);
    const choices = play.questions.map((question) => {
      const option = question.options[0];
      return {
        questionId: question.id,
        optionId: option!.id,
        displayLetter: "A" as const,
      };
    });
    const report = buildMissionReport(mission, play.scenarioId, choices, play.questions);
    expect(report.journey).toHaveLength(8);
    for (const item of report.journey) {
      expect(item.verdict.id).toBe(classifyOption(item.selected).id);
      expect(item.verdict.label.length).toBeGreaterThan(0);
    }
    const email = buildEmailReportHtml(report);
    const text = buildEmailReportText(report);
    expect(email).toContain(report.journey[0]!.verdict.label);
    expect(text).toContain("Correct:");
    expect(text).toContain(report.dimensions[0]!.label);
    expect(text).not.toMatch(/\bAI 0\b/);
  });
});

describe("scout recommendations", () => {
  it("matches phishing to Inbox Under Siege without claiming a live model", () => {
    const result = recommendTraining({
      audienceId: "finance",
      tools: ["Microsoft 365", "Financial data"],
      environmentNote: "",
      topicId: "phishing",
      goal: "Recognise a threat",
      formatId: "mission",
    });
    expect(result.recommendedMissionId).toBe("inbox-under-siege");
    expect(result.canStartMission).toBe(true);
    const outline = recommendTraining({
      audienceId: "finance",
      tools: ["Microsoft 365"],
      environmentNote: "",
      topicId: "phishing",
      goal: "Recognise a threat",
      formatId: "quiz",
    });
    expect(outline.canStartMission).toBe(false);
    expect(outline.formatLabel).toBe("Training outline");
  });
});
