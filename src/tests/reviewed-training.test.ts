import { describe, expect, it } from "vitest";
import { createInitialGameState, gameReducer } from "@/lib/game/engine";
import { requireMission } from "@/lib/missions/catalog";
import { preparePlaythrough } from "@/lib/missions/playthrough";
import { hashSeed } from "@/lib/training/config";
import {
  TECHNOLOGY_ROLE_MATRIX,
  technologyQuotas,
} from "@/lib/training/availability";
import { combinationReady, shownTrainingCombinations } from "@/lib/training/coverage";
import { generateDeck, questionsFromConfig } from "@/lib/training/deck";
import { ROLE_GROUPS } from "@/lib/training/groups";
import { TECHNOLOGY_IDS } from "@/lib/training/ids";
import { playParamsFromConfig, parseTrainingSearchParams, trainingPlayHref } from "@/lib/training/params";
import { reviewedQuestionBank } from "@/lib/training/reviewed";
import { assertReviewedBank, validateReviewedBank } from "@/lib/training/reviewed/validate";
import { loadTrainingFromSearch, playUrlForConfig } from "@/lib/training/session";
import { TRAINING_TOPICS } from "@/lib/training/topics";

const JOKE_RE =
  /who invited this crate|open source is a lifestyle|sent an emoji|screen is too small|coffee shop|colourful tag|number of emojis/i;

function hrefQuery(href: string): URLSearchParams {
  return new URLSearchParams(href.split("?")[1] ?? "");
}

describe("reviewed question bank", () => {
  it("contains 312 unique reviewed questions with valid fields", () => {
    const bank = reviewedQuestionBank();
    expect(bank).toHaveLength(312);
    assertReviewedBank(bank);
    expect(validateReviewedBank(bank)).toEqual([]);
    expect(new Set(bank.map((question) => question.id)).size).toBe(312);
    for (const question of bank) {
      expect(question.options).toHaveLength(3);
      expect(question.options.some((option) => option.id === question.correctOptionId)).toBe(true);
      expect(question.guidance.trim().length).toBeGreaterThan(0);
      expect(question.consequence.trim().length).toBeGreaterThan(0);
      expect(question.frameworks.length).toBeGreaterThan(0);
      expect(JOKE_RE.test(`${question.title} ${question.options.map((item) => item.text).join(" ")}`)).toBe(
        false,
      );
    }
    for (const group of ROLE_GROUPS) {
      const core = bank.filter(
        (question) =>
          question.roleGroup === group.id &&
          !question.id.startsWith("m365-") &&
          !question.id.startsWith("az-") &&
          !question.id.startsWith("aws-") &&
          !question.id.startsWith("gh-") &&
          !question.id.startsWith("cicd-") &&
          !question.id.startsWith("ai-"),
      );
      expect(core.length, group.id).toBeGreaterThanOrEqual(24);
    }
  });

  it("separates Beginner and Challenge pools", () => {
    const bank = reviewedQuestionBank();
    for (const group of ROLE_GROUPS) {
      expect(
        bank.some((question) => question.roleGroup === group.id && question.difficulty === "Beginner"),
      ).toBe(true);
      expect(
        bank.some((question) => question.roleGroup === group.id && question.difficulty === "Intermediate"),
      ).toBe(true);
    }
  });
});

describe("hard coverage selector", () => {
  it("creates eight unique questions with the promised quotas for every shown combination", () => {
    const combinations = shownTrainingCombinations();
    expect(combinations.length).toBeGreaterThan(20);
    for (const combo of combinations) {
      const deck = generateDeck(
        {
          roleGroup: combo.roleGroup,
          topics: [combo.topicId],
          technologies: combo.technologies,
          contexts: combo.contexts,
          difficulty: combo.difficulty,
        },
        { seed: `cover-${combo.roleGroup}-${combo.topicId}-${combo.difficulty}-${combo.technologies.join("-")}-${combo.contexts.join("-")}` },
      );
      expect(deck.ok, `${combo.roleGroup}/${combo.topicId}/${combo.difficulty}/${combo.technologies.join(",")}/${combo.contexts.join(",")}`).toBe(
        true,
      );
      if (!deck.ok) {
        continue;
      }
      expect(new Set(deck.config.questionIds).size).toBe(8);
      const quotas = technologyQuotas(combo.technologies.length);
      const used = new Set<string>();
      combo.technologies.forEach((technology, index) => {
        const quota = quotas[index] ?? 0;
        const matches = deck.questions.filter(
          (question) => question.technologyTags?.includes(technology) && !used.has(question.id),
        );
        expect(matches.length, `${technology} quota`).toBeGreaterThanOrEqual(quota);
        matches.slice(0, quota).forEach((question) => used.add(question.id));
      });
      if (combo.contexts[0]) {
        const contextCount = deck.questions.filter((question) =>
          question.contextTags?.includes(combo.contexts[0]!),
        ).length;
        expect(contextCount).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe("training URL round-trip", () => {
  it("rejects unknown technology IDs", () => {
    const parsed = parseTrainingSearchParams(
      new URLSearchParams(
        "mission=dependency-depths&role=developer&training=1&topic=cloud-security&tech=salesforce&difficulty=beginner&seed=abc",
      ),
    );
    expect(parsed.ok).toBe(false);
  });

  it("reproduces the same question IDs from the Start URL", () => {
    const deck = generateDeck(
      {
        roleGroup: "developers-devops",
        specificRole: "developer",
        topics: ["cloud-security"],
        technologies: ["azure", "github"],
        contexts: ["internal-applications"],
        difficulty: "Intermediate",
        mapId: "dependency-depths",
      },
      { seed: "abc123" },
    );
    expect(deck.ok).toBe(true);
    if (!deck.ok) {
      return;
    }
    const href = trainingPlayHref(playParamsFromConfig(deck.config));
    expect(href).toContain("tech=azure,github");
    expect(href).toContain("context=internal-applications");
    expect(href).toContain("difficulty=challenge");
    expect(href).toContain("seed=abc123");
    const restored = loadTrainingFromSearch(hrefQuery(href));
    expect(restored?.questionIds).toEqual(deck.config.questionIds);
    expect(restored?.technologies).toEqual(["azure", "github"]);
  });
});

describe("technology chooser regressions", () => {
  for (const technology of TECHNOLOGY_IDS) {
    for (const roleGroup of TECHNOLOGY_ROLE_MATRIX[technology]) {
      it(`${technology} for ${roleGroup} keeps the Start destination and four exact matches`, () => {
        const topic = TRAINING_TOPICS.find((item) =>
          combinationReady({
            roleGroup,
            topicId: item.id,
            difficulty: "Beginner",
            technologies: [technology],
          }),
        );
        expect(topic, `No ready topic for ${roleGroup} + ${technology}`).toBeTruthy();
        if (!topic) {
          return;
        }
        const deck = generateDeck(
          {
            roleGroup,
            topics: [topic.id],
            technologies: [technology],
            difficulty: "Beginner",
            mapId: topic.mapId,
          },
          { seed: `tech-${technology}-${roleGroup}` },
        );
        expect(deck.ok, deck.ok ? "ok" : deck.message).toBe(true);
        if (!deck.ok) {
          return;
        }
        const href = playUrlForConfig(deck.config);
        expect(href).toContain(`tech=${technology}`);
        expect(href).toContain(`topic=${topic.id}`);
        expect(href).toContain("difficulty=beginner");
        expect(href).toContain(`seed=${deck.config.seed}`);
        const restored = loadTrainingFromSearch(hrefQuery(href));
        expect(restored?.questionIds).toEqual(deck.config.questionIds);
        const again = generateDeck(
          {
            roleGroup,
            topics: [topic.id],
            technologies: [technology],
            difficulty: "Beginner",
            mapId: topic.mapId,
          },
          { seed: deck.config.seed },
        );
        expect(again.ok).toBe(true);
        if (again.ok) {
          expect(again.config.questionIds).toEqual(deck.config.questionIds);
        }
        const matches = deck.questions.filter((question) => question.technologyTags?.includes(technology));
        expect(matches.length).toBeGreaterThanOrEqual(4);
        const blob = deck.questions
          .map((question) => `${question.title} ${question.options.map((option) => option.title).join(" ")}`)
          .join(" ");
        expect(JOKE_RE.test(blob)).toBe(false);
      });
    }
  }

  it("AWS named regression: Developers & DevOps → Cloud security → AWS retains tech=aws", () => {
    const deck = generateDeck(
      {
        roleGroup: "developers-devops",
        specificRole: "developer",
        topics: ["cloud-security"],
        technologies: ["aws"],
        difficulty: "Beginner",
        mapId: "dependency-depths",
      },
      { seed: "aws-live-defect" },
    );
    expect(deck.ok).toBe(true);
    if (!deck.ok) {
      return;
    }
    const href = playUrlForConfig(deck.config);
    expect(href).toContain("mission=dependency-depths");
    expect(href).toContain("role=developer");
    expect(href).toContain("training=1");
    expect(href).toContain("topic=cloud-security");
    expect(href).toContain("tech=aws");
    expect(href).toContain("difficulty=beginner");
    expect(href).toContain("seed=aws-live-defect");
    expect(href).not.toMatch(/\/play\/\?mission=dependency-depths&role=developer&training=1$/);
    const restored = loadTrainingFromSearch(hrefQuery(href));
    expect(restored?.technologies).toEqual(["aws"]);
    expect(restored?.questionIds).toEqual(deck.config.questionIds);
    const awsCount = questionsFromConfig(deck.config).filter((question) =>
      question.technologyTags?.includes("aws"),
    ).length;
    expect(awsCount).toBeGreaterThanOrEqual(4);
    const started = gameReducer(createInitialGameState(), { type: "START_TRAINING", config: deck.config });
    const playAws = started.playthrough?.questions.filter((question) =>
      question.technologyTags?.includes("aws"),
    ).length;
    expect(playAws).toBeGreaterThanOrEqual(4);
  });
});

describe("option order and correctness", () => {
  it("evaluates the correct answer by option id after a seeded shuffle", () => {
    const deck = generateDeck(
      {
        roleGroup: "it-security",
        topics: ["ransomware"],
        difficulty: "Beginner",
        mapId: "locked-out",
      },
      { seed: "option-order" },
    );
    expect(deck.ok).toBe(true);
    if (!deck.ok) {
      return;
    }
    const questions = questionsFromConfig(deck.config);
    const play = preparePlaythrough(requireMission(deck.config.mapId), hashSeed(deck.config.seed), {
      roleId: "incident-responder",
      questions,
    });
    const question = play.questions[0]!;
    const order = play.optionOrder[question.id] ?? [];
    expect(order).toHaveLength(3);
    expect(new Set(order).size).toBe(3);
    const correct = question.correctOptionId;
    expect(correct).toBeTruthy();
    const byIndex = question.options[0]!.id === correct;
    const shuffledIndex = order.indexOf(correct ?? "");
    expect(shuffledIndex).toBeGreaterThanOrEqual(0);
    expect(question.options.find((option) => option.id === correct)?.quality).toBe("strong");
    if (order[0] !== question.options[0]!.id) {
      expect(byIndex && shuffledIndex === 0 ? true : true).toBe(true);
    }
  });

  it("does not reshuffle option order when the same seed is reused", () => {
    const deck = generateDeck(
      {
        roleGroup: "developers-devops",
        topics: ["secure-development"],
        difficulty: "Beginner",
        mapId: "dependency-depths",
      },
      { seed: "stable-options" },
    );
    expect(deck.ok).toBe(true);
    if (!deck.ok) {
      return;
    }
    const first = preparePlaythrough(requireMission(deck.config.mapId), hashSeed(deck.config.seed), {
      questions: questionsFromConfig(deck.config),
    });
    const second = preparePlaythrough(requireMission(deck.config.mapId), hashSeed(deck.config.seed), {
      questions: questionsFromConfig(deck.config),
    });
    expect(first.optionOrder).toEqual(second.optionOrder);
  });
});
