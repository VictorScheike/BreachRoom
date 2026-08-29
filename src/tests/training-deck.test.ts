import { describe, expect, it } from "vitest";
import { gameReducer, createInitialGameState } from "@/lib/game/engine";
import { buildMissionReport } from "@/lib/missions/report";
import { requireMission } from "@/lib/missions/catalog";
import { preparePlaythrough } from "@/lib/missions/playthrough";
import { generateDeck, hasCoherentPhases, questionsFromConfig } from "@/lib/training/deck";
import {
  assertPublicCoverage,
  formatCoverageMatrix,
  publicCombinations,
  shownTrainingCombinations,
} from "@/lib/training/coverage";
import { displayDifficulty } from "@/lib/training/reviewed/convert";
import { playUrlForConfig } from "@/lib/training/session";

const FINANCE_PHISHING = {
  roleGroup: "finance-hr" as const,
  specificRole: "finance" as const,
  topics: ["phishing"],
  technologies: ["microsoft-365"],
  contexts: [] as const,
  mapId: "inbox-under-siege" as const,
  difficulty: "Beginner" as const,
};

const DEV_SUPPLY = {
  roleGroup: "developers-devops" as const,
  specificRole: "developer" as const,
  topics: ["supply-chain"],
  technologies: ["github"],
  mapId: "dependency-depths" as const,
  difficulty: "Beginner" as const,
};

describe("training deck matching", () => {
  it("never selects developer-only supply-chain questions for finance phishing", () => {
    const deck = generateDeck(FINANCE_PHISHING, { seed: "finance-phish-1" });
    expect(deck.ok).toBe(true);
    if (!deck.ok) {
      return;
    }
    expect(deck.questions.every((question) => question.roleGroups.includes("finance-hr"))).toBe(true);
    expect(
      deck.questions.every((question) => !/kubernetes|container|lockfile|SBOM/i.test(question.title)),
    ).toBe(true);
  });

  it("keeps GitHub questions for developer supply-chain training", () => {
    const deck = generateDeck(DEV_SUPPLY, { seed: "dev-github-1" });
    expect(deck.ok).toBe(true);
    if (!deck.ok) {
      return;
    }
    const githubCount = deck.questions.filter((question) =>
      question.technologyTags?.includes("github"),
    ).length;
    expect(githubCount).toBeGreaterThanOrEqual(4);
  });

  it("builds unique eight-question decks that are reproducible by seed", () => {
    const first = generateDeck(FINANCE_PHISHING, { seed: "same-seed" });
    const second = generateDeck(FINANCE_PHISHING, { seed: "same-seed" });
    const third = generateDeck(FINANCE_PHISHING, { seed: "other-seed" });
    expect(first.ok && second.ok && third.ok).toBe(true);
    if (!first.ok || !second.ok || !third.ok) {
      return;
    }
    expect(first.config.questionIds).toEqual(second.config.questionIds);
    expect(new Set(first.config.questionIds).size).toBe(8);
    expect(first.config.questionIds).not.toEqual(third.config.questionIds);
    expect(hasCoherentPhases(first.questions)).toBe(true);
  });

  it("returns a clear fallback instead of unrelated questions", () => {
    const result = generateDeck({
      roleGroup: "general-employees",
      topics: ["supply-chain"],
      mapId: "dependency-depths",
      difficulty: "Beginner",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/not enough reviewed questions/i);
    }
  });

  it("keeps scoring stable when answer order is shuffled", () => {
    const deck = generateDeck(FINANCE_PHISHING, { seed: "score-seed" });
    expect(deck.ok).toBe(true);
    if (!deck.ok) {
      return;
    }
    expect(questionsFromConfig(deck.config).map((question) => question.id)).toEqual(
      deck.config.questionIds,
    );
    const mission = requireMission(deck.config.mapId);
    const play = preparePlaythrough(mission, 99, {
      roleId: "finance",
      questions: questionsFromConfig(deck.config),
    });
    expect(play.optionOrder[play.questions[0]!.id]).toHaveLength(3);
    const strongChoices = play.questions.map((question) => {
      const correctId = question.correctOptionId;
      const option = question.options.find((item) => item.id === correctId);
      return {
        questionId: question.id,
        optionId: option!.id,
        displayLetter: "A" as const,
      };
    });
    const report = buildMissionReport(
      mission,
      play.scenarioId,
      strongChoices,
      play.questions,
      deck.config,
    );
    expect(report.training?.roleLabel).toBe("Finance");
    expect(report.training?.topicLabel).toMatch(/Phishing/);
    expect(report.training?.difficultyLabel).toBe(displayDifficulty("Beginner"));
    expect(report.journey).toHaveLength(8);
    expect(report.journey.every((item) => deck.config.questionIds.includes(item.question.id))).toBe(true);
    expect(report.score.overall).toBeGreaterThanOrEqual(80);
    expect(report.training?.frameworkNote).toMatch(/educational/i);
  });

  it("starts the game from a training config", () => {
    const deck = generateDeck(DEV_SUPPLY, { seed: "dev-start" });
    expect(deck.ok).toBe(true);
    if (!deck.ok) {
      return;
    }
    const href = playUrlForConfig(deck.config);
    expect(href).toContain("tech=github");
    expect(href).toContain("topic=supply-chain");
    expect(href).toContain("training=1");
    const next = gameReducer(createInitialGameState(), { type: "START_TRAINING", config: deck.config });
    expect(next.screen).toBe("briefing");
    expect(next.missionId).toBe("dependency-depths");
    expect(next.roleId).toBe("developer");
    expect(next.playthrough?.questions.map((question) => question.id)).toEqual([...deck.config.questionIds]);
    expect(next.trainingConfig?.questionIds).toEqual(deck.config.questionIds);
  });

  it("passes coverage for every public role/topic combination", () => {
    assertPublicCoverage();
    const publicRows = publicCombinations();
    expect(publicRows.length).toBeGreaterThan(0);
    for (const row of publicRows) {
      const deck = generateDeck({
        roleGroup: row.roleGroup,
        topics: [row.topicId],
        difficulty: row.difficulty,
        mapId: row.topicId === "cloud-security" || row.topicId === "supply-chain" || row.topicId === "secure-development"
          ? "dependency-depths"
          : undefined,
      });
      expect(deck.ok, `${row.roleGroup} ${row.topicId} ${row.difficulty}`).toBe(true);
    }
    expect(shownTrainingCombinations().length).toBeGreaterThan(0);
    expect(formatCoverageMatrix().includes("Role group")).toBe(true);
  });
});
