import { BUILDER_CATEGORIES, BUILDER_RESULT_LEVELS, categoryById } from "./copy";
import { BUILDER_DECISIONS, optionByLetter } from "./catalog";
import type {
  BuilderAnswer,
  BuilderCategoryScore,
  BuilderMissedDecision,
  BuilderResultLevel,
  BuilderScore,
} from "./types";
import { BUILDER_QUESTION_COUNT } from "./types";

export function isCorrectAnswer(answer: BuilderAnswer): boolean {
  const question = BUILDER_DECISIONS.find((item) => item.id === answer.questionId);
  return question?.correctLetter === answer.letter;
}

export function resultLevelFor(correct: number): BuilderResultLevel {
  const level = BUILDER_RESULT_LEVELS.find((item) => correct >= item.minCorrect && correct <= item.maxCorrect);
  if (!level) {
    return BUILDER_RESULT_LEVELS[BUILDER_RESULT_LEVELS.length - 1]!;
  }
  return level;
}

export function categoryScoresFrom(answers: readonly BuilderAnswer[]): BuilderCategoryScore[] {
  const byQuestion = new Map(answers.map((item) => [item.questionId, item]));
  return BUILDER_CATEGORIES.map((category) => {
    const total = category.questionIds.length;
    const correct = category.questionIds.filter((id) => {
      const answer = byQuestion.get(id);
      return answer ? isCorrectAnswer(answer) : false;
    }).length;
    return { categoryId: category.id, correct, total };
  });
}

export function scoreBuilderAnswers(answers: readonly BuilderAnswer[]): BuilderScore {
  const unique = uniqueAnswers(answers);
  const missed: BuilderMissedDecision[] = [];
  let correct = 0;

  for (const question of BUILDER_DECISIONS) {
    const answer = unique.find((item) => item.questionId === question.id);
    if (!answer) {
      continue;
    }
    if (answer.letter === question.correctLetter) {
      correct += 1;
      continue;
    }
    missed.push({
      question,
      selected: optionByLetter(question, answer.letter),
      correct: optionByLetter(question, question.correctLetter),
      recommendation: question.resultRecommendation,
    });
  }

  const categoryScores = categoryScoresFrom(unique);
  const missedCategoryIds = new Set(missed.map((item) => item.question.categoryId));
  const recommendations = BUILDER_CATEGORIES.filter((category) => missedCategoryIds.has(category.id))
    .slice(0, 3)
    .map((category) => category.recommendation);

  return {
    correct,
    total: BUILDER_QUESTION_COUNT,
    percent: Math.round((correct / BUILDER_QUESTION_COUNT) * 100),
    level: resultLevelFor(correct),
    categoryScores,
    recommendations,
    missed,
  };
}

export function uniqueAnswers(answers: readonly BuilderAnswer[]): BuilderAnswer[] {
  const seen = new Set<string>();
  const next: BuilderAnswer[] = [];
  for (const answer of answers) {
    if (seen.has(answer.questionId)) {
      continue;
    }
    seen.add(answer.questionId);
    next.push(answer);
  }
  return next;
}

export function categoryLabel(categoryId: BuilderCategoryScore["categoryId"]): string {
  return categoryById(categoryId).label;
}
