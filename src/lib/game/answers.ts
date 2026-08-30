import type { Question } from "@/lib/missions/types";

export function isCorrectAnswer(question: Question, optionId: string): boolean {
  if (question.correctOptionId) {
    return optionId === question.correctOptionId;
  }
  const option = question.options.find((item) => item.id === optionId);
  return option?.quality === "strong";
}

export function correctOptionIdFor(question: Question): string | null {
  if (question.correctOptionId) {
    return question.correctOptionId;
  }
  return question.options.find((item) => item.quality === "strong")?.id ?? null;
}
