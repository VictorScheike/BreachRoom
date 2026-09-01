import { builderQuestionAt, isLastBuilderQuestion } from "./catalog";
import { BUILDER_QUESTION_COUNT, type BuilderOptionLetter, type BuilderPersistedState } from "./types";
import { uniqueAnswers, scoreBuilderAnswers } from "./scoring";
import { EMPTY_BUILDER_STATE, saveBuilderState } from "./store";
import { syncBuilderProgress } from "./progress";

export { EMPTY_BUILDER_STATE };

export function startBuilderDecisions(state: BuilderPersistedState): BuilderPersistedState {
  return {
    ...state,
    phase: "quiz",
    currentIndex: 0,
    pendingLetter: null,
    answers: [],
    categoryScores: [],
  };
}

export function selectBuilderOption(
  state: BuilderPersistedState,
  letter: BuilderOptionLetter,
): BuilderPersistedState {
  if (state.phase !== "quiz" || isQuestionLocked(state)) {
    return state;
  }
  return { ...state, pendingLetter: letter };
}

export function confirmBuilderDecision(state: BuilderPersistedState): BuilderPersistedState {
  if (state.phase !== "quiz" || state.pendingLetter === null || isQuestionLocked(state)) {
    return state;
  }
  const question = builderQuestionAt(state.currentIndex);
  const answers = uniqueAnswers([
    ...state.answers,
    { questionId: question.id, letter: state.pendingLetter },
  ]);
  return { ...state, answers, pendingLetter: state.pendingLetter };
}

export function goToNextBuilderDecision(state: BuilderPersistedState): BuilderPersistedState {
  if (state.phase !== "quiz" || !isQuestionLocked(state)) {
    return state;
  }
  if (isLastBuilderQuestion(state.currentIndex)) {
    return completeBuilderSession(state);
  }
  return {
    ...state,
    currentIndex: Math.min(BUILDER_QUESTION_COUNT - 1, state.currentIndex + 1),
    pendingLetter: null,
  };
}

export function completeBuilderSession(state: BuilderPersistedState): BuilderPersistedState {
  const score = scoreBuilderAnswers(state.answers);
  const bestScore = state.bestScore === null ? score.correct : Math.max(state.bestScore, score.correct);
  const bestPercent = state.bestPercent === null ? score.percent : Math.max(state.bestPercent, score.percent);
  return {
    ...state,
    phase: "result",
    pendingLetter: null,
    lastScore: score.correct,
    lastPercent: score.percent,
    bestScore,
    bestPercent,
    completed: true,
    completedAt: Date.now(),
    categoryScores: score.categoryScores,
  };
}

export function openBuilderReview(state: BuilderPersistedState): BuilderPersistedState {
  if (state.phase !== "result" && state.phase !== "review") {
    return state;
  }
  return { ...state, phase: "review" };
}

export function closeBuilderReview(state: BuilderPersistedState): BuilderPersistedState {
  if (state.phase !== "review") {
    return state;
  }
  return { ...state, phase: "result" };
}

export function replayBuilder(state: BuilderPersistedState): BuilderPersistedState {
  return resetBuilderGame(state);
}

export function resetBuilderGame(state: BuilderPersistedState): BuilderPersistedState {
  return {
    ...EMPTY_BUILDER_STATE,
    bestScore: state.bestScore,
    bestPercent: state.bestPercent,
    lastScore: state.lastScore,
    lastPercent: state.lastPercent,
    completed: state.completed,
    completedAt: state.completedAt,
    categoryScores: state.categoryScores,
  };
}

export function isQuestionLocked(state: BuilderPersistedState): boolean {
  if (state.phase !== "quiz") {
    return false;
  }
  const question = builderQuestionAt(state.currentIndex);
  return state.answers.some((item) => item.questionId === question.id);
}

export function confirmedLetter(state: BuilderPersistedState): BuilderOptionLetter | null {
  if (state.phase !== "quiz") {
    return null;
  }
  const question = builderQuestionAt(state.currentIndex);
  return state.answers.find((item) => item.questionId === question.id)?.letter ?? null;
}

export function persistBuilder(state: BuilderPersistedState): BuilderPersistedState {
  saveBuilderState(state);
  syncBuilderProgress(state);
  return state;
}
