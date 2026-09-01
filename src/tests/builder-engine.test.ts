import { describe, expect, it } from "vitest";
import { BUILDER_DECISIONS, builderQuestionAt } from "@/lib/builder/catalog";
import { BUILDER_CATEGORIES } from "@/lib/builder/copy";
import {
  confirmBuilderDecision,
  EMPTY_BUILDER_STATE,
  goToNextBuilderDecision,
  isQuestionLocked,
  replayBuilder,
  resetBuilderGame,
  selectBuilderOption,
  startBuilderDecisions,
} from "@/lib/builder/play";
import { scoreBuilderAnswers } from "@/lib/builder/scoring";
import { parseBuilderState } from "@/lib/builder/store";
import type { BuilderAnswer, BuilderOptionLetter } from "@/lib/builder/types";
import { BUILDER_QUESTION_COUNT } from "@/lib/builder/types";

const CORRECT: Record<string, BuilderOptionLetter> = {
  "ssb-01": "B",
  "ssb-02": "B",
  "ssb-03": "B",
  "ssb-04": "B",
  "ssb-05": "B",
  "ssb-06": "B",
  "ssb-07": "B",
  "ssb-08": "B",
  "ssb-09": "A",
  "ssb-10": "A",
  "ssb-11": "B",
  "ssb-12": "B",
  "ssb-13": "A",
  "ssb-14": "B",
  "ssb-15": "B",
};

function allCorrect(): BuilderAnswer[] {
  return BUILDER_DECISIONS.map((question) => ({
    questionId: question.id,
    letter: CORRECT[question.id]!,
  }));
}

function answerAll(letter: BuilderOptionLetter): BuilderAnswer[] {
  return BUILDER_DECISIONS.map((question) => ({ questionId: question.id, letter }));
}

describe("Secure Solution Builder catalog", () => {
  it("has 15 unique reviewed questions with three options and per-option feedback", () => {
    expect(BUILDER_DECISIONS).toHaveLength(BUILDER_QUESTION_COUNT);
    expect(new Set(BUILDER_DECISIONS.map((item) => item.id)).size).toBe(15);
    expect(BUILDER_DECISIONS.map((item) => item.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    for (const question of BUILDER_DECISIONS) {
      expect(question.options.map((item) => item.letter)).toEqual(["A", "B", "C"]);
      expect(question.correctLetter).toBe(CORRECT[question.id]);
      for (const option of question.options) {
        expect(option.feedback.length).toBeGreaterThan(20);
        expect(option.feedback).not.toMatch(/^(Correct|Wrong|Try again)$/i);
      }
      expect(question.architectCorrect.startsWith("Correct —")).toBe(true);
      expect(question.architectWrong.startsWith("Not quite —")).toBe(true);
      expect(question.visual.nodes.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("groups every question into the six result categories", () => {
    const grouped = BUILDER_CATEGORIES.flatMap((item) => item.questionIds);
    expect(grouped).toEqual(BUILDER_DECISIONS.map((item) => item.id));
  });
});

describe("Secure Solution Builder scoring", () => {
  it("scores a perfect run as 15/15 and Security by Design ready", () => {
    const score = scoreBuilderAnswers(allCorrect());
    expect(score.correct).toBe(15);
    expect(score.percent).toBe(100);
    expect(score.level.id).toBe("ready");
    expect(score.missed).toHaveLength(0);
    expect(score.recommendations).toHaveLength(0);
    expect(score.categoryScores.every((item) => item.correct === item.total)).toBe(true);
  });

  it("counts each question once even if answers are duplicated", () => {
    const duplicated = [...allCorrect(), ...allCorrect()];
    expect(scoreBuilderAnswers(duplicated).correct).toBe(15);
  });

  it("builds at most three recommendations from missed categories", () => {
    const score = scoreBuilderAnswers(answerAll("C"));
    expect(score.correct).toBe(0);
    expect(score.level.id).toBe("foundations");
    expect(score.recommendations).toHaveLength(3);
    expect(score.categoryScores.find((item) => item.categoryId === "security-by-design")?.correct).toBe(0);
    expect(score.categoryScores.find((item) => item.categoryId === "secure-delivery")?.correct).toBe(0);
  });

  it("maps 12/15 to a strong foundation and 8/15 to gaps", () => {
    const twelve = allCorrect().map((item, index) =>
      index < 3 ? { ...item, letter: "A" as const } : item,
    );
    expect(scoreBuilderAnswers(twelve).level.id).toBe("strong");
    expect(scoreBuilderAnswers(twelve).correct).toBe(12);
    const eight = allCorrect().map((item, index) =>
      index < 7 ? { ...item, letter: "C" as const } : item,
    );
    expect(scoreBuilderAnswers(eight).correct).toBe(8);
    expect(scoreBuilderAnswers(eight).level.id).toBe("gaps");
  });
});

describe("Secure Solution Builder play flow", () => {
  it("keeps Make decision locked until an option is chosen and then locks the answer", () => {
    let state = startBuilderDecisions(EMPTY_BUILDER_STATE);
    expect(state.pendingLetter).toBeNull();
    expect(isQuestionLocked(state)).toBe(false);
    expect(goToNextBuilderDecision(state)).toBe(state);
    state = selectBuilderOption(state, "B");
    expect(state.pendingLetter).toBe("B");
    const confirmed = confirmBuilderDecision(state);
    expect(isQuestionLocked(confirmed)).toBe(true);
    expect(confirmBuilderDecision(confirmed).answers).toHaveLength(1);
    expect(selectBuilderOption(confirmed, "A").pendingLetter).toBe("B");
    expect(confirmed.answers[0]?.letter).toBe("B");
  });

  it("walks all 15 questions in order and completes once", () => {
    let state = startBuilderDecisions(EMPTY_BUILDER_STATE);
    for (let index = 0; index < BUILDER_QUESTION_COUNT; index += 1) {
      const question = builderQuestionAt(index);
      expect(state.currentIndex).toBe(index);
      state = selectBuilderOption(state, CORRECT[question.id]!);
      state = confirmBuilderDecision(state);
      state = goToNextBuilderDecision(state);
    }
    expect(state.phase).toBe("result");
    expect(state.lastScore).toBe(15);
    expect(state.bestScore).toBe(15);
    expect(state.completed).toBe(true);
  });

  it("resets the active session on play again while keeping the best score", () => {
    const finished = {
      ...EMPTY_BUILDER_STATE,
      phase: "result" as const,
      answers: allCorrect(),
      lastScore: 15,
      bestScore: 15,
      lastPercent: 100,
      bestPercent: 100,
      completed: true,
      completedAt: 10,
    };
    const replayed = replayBuilder(finished);
    expect(replayed.phase).toBe("intro");
    expect(replayed.answers).toEqual([]);
    expect(replayed.currentIndex).toBe(0);
    expect(replayed.bestScore).toBe(15);
    expect(replayed.completed).toBe(true);
  });

  it("returns to the intro from a mid-quiz session without clearing the best score", () => {
    const midQuiz = {
      ...EMPTY_BUILDER_STATE,
      phase: "quiz" as const,
      currentIndex: 6,
      pendingLetter: "A" as const,
      answers: [{ questionId: "ssb-01", letter: "B" as const }],
      bestScore: 11,
      bestPercent: 73,
    };
    const reset = resetBuilderGame(midQuiz);
    expect(reset.phase).toBe("intro");
    expect(reset.answers).toEqual([]);
    expect(reset.currentIndex).toBe(0);
    expect(reset.pendingLetter).toBeNull();
    expect(reset.bestScore).toBe(11);
    expect(reset.bestPercent).toBe(73);
  });

  it("ignores unrecognised persisted payloads", () => {
    expect(parseBuilderState("nope").phase).toBe("intro");
    const parsed = parseBuilderState({
      phase: "quiz",
      currentIndex: 4,
      answers: [{ questionId: "ssb-01", letter: "B" }, { questionId: "unknown", letter: "A" }],
      pendingLetter: "C",
      bestScore: 11,
    });
    expect(parsed.currentIndex).toBe(4);
    expect(parsed.answers).toEqual([{ questionId: "ssb-01", letter: "B" }]);
    expect(parsed.pendingLetter).toBe("C");
    expect(parsed.bestScore).toBe(11);
  });
});
