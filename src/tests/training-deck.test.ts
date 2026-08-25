import { describe, expect, it } from "vitest";
import { gameReducer, createInitialGameState } from "@/lib/game/engine";
import { buildMissionReport } from "@/lib/missions/report";
import { requireMission } from "@/lib/missions/catalog";
import { preparePlaythrough } from "@/lib/missions/playthrough";
import { questionBank } from "@/lib/training/bank";
import {
  assertPublicCoverage,
  formatCoverageMatrix,
  publicCombinations,
  topicFamilyCounts,
} from "@/lib/training/coverage";
import { generateDeck, hasCoherentPhases, phaseCoverage, questionsFromConfig } from "@/lib/training/deck";
import { eligibleQuestions, questionMatchesTopic, rankQuestions } from "@/lib/training/match";
import { requireTrainingTopic } from "@/lib/training/topics";

const FINANCE_PHISHING = {
  roleGroup: "finance-hr" as const,
  specificRole: "finance" as const,
  topics: ["phishing"],
  technologies: ["Microsoft 365", "SaaS platforms"],
  contexts: ["Third-party technology providers"],
  mapId: "inbox-under-siege" as const,
};

const DEV_SUPPLY = {
  roleGroup: "developers-devops" as const,
  specificRole: "developer" as const,
  topics: ["supply-chain"],
  technologies: ["GitHub", "CI/CD pipelines"],
  mapId: "dependency-depths" as const,
};

describe("training deck matching", () => {
  it("never selects developer-only supply-chain questions for finance phishing", () => {
    const deck = generateDeck(FINANCE_PHISHING, { seed: "finance-phish-1" });
    expect(deck.ok).toBe(true);
    if (!deck.ok) {
      return;
    }
    expect(deck.questions.every((question) => question.missionId === "inbox-under-siege")).toBe(true);
    expect(deck.questions.filter((question) => question.roleIds.includes("finance")).length).toBeGreaterThanOrEqual(3);
    expect(deck.questions.some((question) => question.missionId === "dependency-depths")).toBe(false);
    expect(
      deck.questions.every((question) => !/kubernetes|container|lockfile|SBOM/i.test(question.title)),
    ).toBe(true);
  });

  it("prioritises pipeline questions for developer CI/CD supply-chain training", () => {
    const ranked = rankQuestions(DEV_SUPPLY);
    expect(ranked.length).toBeGreaterThanOrEqual(16);
    const topIds = ranked.slice(0, 8).map((item) => item.question.id);
    const topText = ranked.slice(0, 8).map((item) => `${item.question.title} ${item.question.situation}`).join(" ");
    expect(topText).toMatch(/pipeline|CI|secret|package|GitHub|lockfile|provenance|SBOM/i);
    expect(topIds.every((id) => id.startsWith("dd-") || id.startsWith("dep-"))).toBe(true);
  });

  it("requires a topic match", () => {
    const bank = questionBank();
    const withoutTopic = eligibleQuestions({ ...FINANCE_PHISHING, topics: [] }, bank);
    expect(withoutTopic).toHaveLength(0);
    expect(questionMatchesTopic(bank[0]!, [])).toBe(false);
    const phishingOnly = bank.filter((question) => questionMatchesTopic(question, ["phishing"]));
    expect(phishingOnly.every((question) => question.missionId === "inbox-under-siege")).toBe(true);
  });

  it("uses technology and context to rank rather than to empty the pool", () => {
    const base = rankQuestions({ ...FINANCE_PHISHING, technologies: [], contexts: [] });
    const ranked = rankQuestions(FINANCE_PHISHING);
    expect(ranked.length).toBe(base.length);
    expect(ranked.length).toBeGreaterThanOrEqual(16);
    expect(ranked[0]!.score).toBeGreaterThanOrEqual(base[0]!.score);
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
    const phases = phaseCoverage(first.questions);
    expect(phases.recognise + phases.assess).toBeGreaterThanOrEqual(1);
    expect(phases.respond + phases.escalate).toBeGreaterThanOrEqual(2);
    expect(phases.recover + phases.reflect).toBeGreaterThanOrEqual(1);
  });

  it("returns a clear fallback instead of unrelated questions", () => {
    const result = generateDeck({
      roleGroup: "developers-devops",
      topics: ["business-continuity"],
      mapId: "locked-out",
    });
    if (result.ok) {
      expect(result.questions.every((question) => question.missionId === "locked-out")).toBe(true);
    } else {
      expect(result.message).toContain("not yet enough reviewed questions");
      expect(result.matchCount).toBeLessThan(8);
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
      questionIds: deck.config.questionIds,
    });
    expect(play.optionOrder[play.questions[0]!.id]).toHaveLength(3);
    const strongChoices = play.questions.map((question) => {
      const strong = question.options.find((option) => option.quality === "strong");
      return {
        questionId: question.id,
        optionId: strong!.id,
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
    expect(report.journey).toHaveLength(8);
    expect(report.journey.every((item) => deck.config.questionIds.includes(item.question.id))).toBe(true);
    expect(report.score.overall).toBeGreaterThanOrEqual(80);
  });

  it("starts the game from a training config", () => {
    const deck = generateDeck(DEV_SUPPLY, { seed: "dev-start" });
    expect(deck.ok).toBe(true);
    if (!deck.ok) {
      return;
    }
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
        mapId: requireTrainingTopic(row.topicId).mapId,
      });
      expect(deck.ok, `${row.roleGroup} ${row.topicId}`).toBe(true);
    }
    const families = topicFamilyCounts();
    expect(families.phishing).toBeGreaterThanOrEqual(32);
    expect(families.ransomware).toBeGreaterThanOrEqual(32);
    expect(families["ai-security"]).toBeGreaterThanOrEqual(32);
    expect(families["supply-chain"]).toBeGreaterThanOrEqual(32);
    expect(families["secure-development"]).toBeGreaterThanOrEqual(32);
    expect(formatCoverageMatrix().includes("Role group")).toBe(true);
  });
});
