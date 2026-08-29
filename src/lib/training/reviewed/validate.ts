import { PLAYTHROUGH_LENGTH } from "@/lib/missions/types";
import { ROLE_GROUPS } from "@/lib/training/groups";
import { isContextId, isTechnologyId } from "@/lib/training/ids";
import { reviewedQuestionBank } from "@/lib/training/reviewed";
import type { ReviewedQuestion } from "@/lib/training/reviewed/types";

const JOKE_PATTERNS = [
  /who invited this crate/i,
  /open source is a lifestyle/i,
  /sent an emoji/i,
  /\bcommunity\b.*lifestyle/i,
  /screen is too small/i,
  /coffee shop/i,
  /colourful tag/i,
  /number of emojis/i,
];

export interface BankValidationIssue {
  id?: string;
  message: string;
}

export function validateReviewedBank(
  bank: readonly ReviewedQuestion[] = reviewedQuestionBank(),
): BankValidationIssue[] {
  const issues: BankValidationIssue[] = [];
  const ids = new Set<string>();
  for (const question of bank) {
    if (ids.has(question.id)) {
      issues.push({ id: question.id, message: "Duplicate question id" });
    }
    ids.add(question.id);
    if (question.options.length !== 3) {
      issues.push({ id: question.id, message: "Must have exactly three options" });
    }
    const optionIds = question.options.map((item) => item.id);
    if (!optionIds.includes(question.correctOptionId)) {
      issues.push({ id: question.id, message: "correctOptionId must match an option" });
    }
    if (new Set(question.options.map((item) => item.text)).size !== 3) {
      issues.push({ id: question.id, message: "Options must be unique" });
    }
    if (!question.guidance.trim() || !question.consequence.trim()) {
      issues.push({ id: question.id, message: "Guidance and consequence are required" });
    }
    if (question.difficulty !== "Beginner" && question.difficulty !== "Intermediate") {
      issues.push({ id: question.id, message: "Invalid difficulty" });
    }
    if (question.frameworks.length < 1) {
      issues.push({ id: question.id, message: "At least one framework is required" });
    }
    for (const tag of question.technologyTags) {
      if (!isTechnologyId(tag)) {
        issues.push({ id: question.id, message: `Invalid technology tag ${tag}` });
      }
    }
    for (const tag of question.contextTags) {
      if (!isContextId(tag)) {
        issues.push({ id: question.id, message: `Invalid context tag ${tag}` });
      }
    }
    const blob = `${question.title} ${question.options.map((item) => item.text).join(" ")}`;
    for (const pattern of JOKE_PATTERNS) {
      if (pattern.test(blob)) {
        issues.push({ id: question.id, message: `Joke-led content matched ${pattern}` });
      }
    }
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
    if (core.length < 24) {
      issues.push({ message: `${group.id} has ${core.length} core questions; need at least 24` });
    }
  }

  if (bank.length < PLAYTHROUGH_LENGTH) {
    issues.push({ message: `Bank has ${bank.length} questions` });
  }
  return issues;
}

export function assertReviewedBank(bank = reviewedQuestionBank()): void {
  const issues = validateReviewedBank(bank);
  if (issues.length > 0) {
    throw new Error(issues.map((item) => `${item.id ?? "bank"}: ${item.message}`).join("; "));
  }
}
