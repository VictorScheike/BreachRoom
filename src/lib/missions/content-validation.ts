import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { MISSION_LIST } from "@/lib/missions/catalog";
import type { MissionDefinition, Question } from "@/lib/missions/types";
import { reviewedQuestionBank } from "@/lib/training/reviewed";

/** Exact legacy phrases that must never appear in a production question pool. */
export const PROHIBITED_LEGACY_PHRASES = [
  "Admin for everyone",
  "because printers",
  "The printers only listen to administrators",
  "New sticky notes for everyone",
  "Revoke standing admin",
  "They know the printers better than IT",
  "Who invited this crate",
  "Open source is a lifestyle",
  "sent an emoji",
  "Comic Sans",
  "YOLO",
  "BACKUP_GOD",
  "maybe-Dave",
  "NOT MALWARE",
  "Have you tried turning the ransomware",
  "Ignore it and hope",
  "Unplug the internet",
  "Kill site power",
  "New sticky notes",
  "lockfile is a vibe",
  "They sent an emoji",
] as const;

const OBSOLETE_IMPORT_MARKERS = [
  'from "@/lib/missions/extras"',
  "from '@/lib/missions/extras'",
  "lib/missions/extras",
  "missions/legacy",
  "old-question-bank",
  "fixtures/questions",
];

const VAGUE_PROMPTS = ["what do you do now?", "what do you do?", "what now?"];

const PRODUCTION_QUESTION_FILES = [
  "src/lib/missions/locked-out/questions.ts",
  "src/lib/missions/ai-forge/questions.ts",
  "src/lib/missions/dependency-depths/questions.ts",
  "src/lib/missions/inbox-under-siege/questions.ts",
  "src/lib/missions/inbox-under-siege/it-questions.ts",
  "src/lib/missions/inbox-under-siege/urgent-questions.ts",
  "src/lib/missions/northstar-zero-hour/questions.ts",
] as const;

export interface ContentIssue {
  id?: string;
  missionId?: string;
  message: string;
}

function questionBlob(question: Question): string {
  const optionText = question.options
    .map((option) =>
      [
        option.title,
        option.summary,
        option.consequence,
        option.explanation,
        option.recommendedAction,
        option.whyRecommended,
        option.learningPoint,
        option.npcReaction,
      ].join(" "),
    )
    .join(" ");
  return [
    question.title,
    question.situation,
    question.npcLine,
    question.prompt ?? "",
    optionText,
  ].join(" ");
}

function normalizeForDuplicate(question: Question): string {
  return `${question.title} ${question.situation}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function similar(a: string, b: string): boolean {
  if (a === b) {
    return true;
  }
  if (a.length < 24 || b.length < 24) {
    return false;
  }
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  return longer.includes(shorter);
}

function phraseMatches(blob: string, phrase: string): boolean {
  const haystack = blob.toLowerCase();
  const needle = phrase.toLowerCase();
  if (!haystack.includes(needle)) {
    return false;
  }
  if (!/^[a-z0-9]+$/i.test(phrase)) {
    return true;
  }
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(blob);
}

function hasCategory(question: Question): boolean {
  return Boolean(
    (question.roleIds && question.roleIds.length > 0) ||
      (question.departmentIds && question.departmentIds.length > 0) ||
      (question.topicIds && question.topicIds.length > 0),
  );
}

export function firstProhibitedPhrase(blob: string): string | null {
  for (const phrase of PROHIBITED_LEGACY_PHRASES) {
    if (phraseMatches(blob, phrase)) {
      return phrase;
    }
  }
  return null;
}

function validateQuestion(mission: MissionDefinition, question: Question): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const loc = { id: question.id, missionId: mission.id };

  if (!question.title.trim()) {
    issues.push({ ...loc, message: "Missing title" });
  }
  if (!question.situation.trim() || question.situation.trim().length < 40) {
    issues.push({ ...loc, message: "Missing or too-short scenario text" });
  }
  if (!question.prompt?.trim()) {
    issues.push({ ...loc, message: "Missing prompt" });
  } else if (VAGUE_PROMPTS.includes(question.prompt.trim().toLowerCase())) {
    issues.push({ ...loc, message: `Vague prompt: ${question.prompt}` });
  }
  if (question.options.length !== 3) {
    issues.push({ ...loc, message: `Expected 3 options, found ${question.options.length}` });
  }
  const strong = question.options.filter((option) => option.quality === "strong");
  if (strong.length === 0) {
    issues.push({ ...loc, message: "No correct (strong) answer" });
  }
  if (strong.length > 1) {
    issues.push({ ...loc, message: "Multiple correct (strong) answers" });
  }
  for (const option of question.options) {
    if (!option.explanation.trim() || option.explanation.trim().length < 20) {
      issues.push({ ...loc, message: `Missing explanation on ${option.id}` });
    }
    if (!option.title.trim() || !option.summary.trim()) {
      issues.push({ ...loc, message: `Incomplete option ${option.id}` });
    }
  }
  if (!hasCategory(question)) {
    issues.push({ ...loc, message: "Missing role or category" });
  }
  const blob = questionBlob(question);
  for (const phrase of PROHIBITED_LEGACY_PHRASES) {
    if (phraseMatches(blob, phrase)) {
      issues.push({ ...loc, message: `Prohibited legacy phrase: "${phrase}"` });
    }
  }
  return issues;
}

export function validateMissionQuestions(
  missions: readonly MissionDefinition[] = MISSION_LIST,
): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const globalIds = new Set<string>();

  for (const mission of missions) {
    const localIds = new Set<string>();
    const normalized: Array<{ id: string; key: string }> = [];
    for (const question of mission.questions) {
      if (localIds.has(question.id) || globalIds.has(question.id)) {
        issues.push({
          id: question.id,
          missionId: mission.id,
          message: "Duplicate question id",
        });
      }
      localIds.add(question.id);
      globalIds.add(question.id);
      issues.push(...validateQuestion(mission, question));
      normalized.push({ id: question.id, key: normalizeForDuplicate(question) });
    }
    for (let i = 0; i < normalized.length; i += 1) {
      for (let j = i + 1; j < normalized.length; j += 1) {
        const left = normalized[i];
        const right = normalized[j];
        if (left && right && similar(left.key, right.key)) {
          issues.push({
            id: `${left.id}/${right.id}`,
            missionId: mission.id,
            message: "Duplicate or nearly identical questions",
          });
        }
      }
    }
  }

  return issues;
}

export function validateReviewedBankPhrases(): ContentIssue[] {
  const issues: ContentIssue[] = [];
  for (const question of reviewedQuestionBank()) {
    const blob = `${question.title} ${question.situation} ${question.question} ${question.options
      .map((option) => option.text)
      .join(" ")} ${question.guidance}`;
    for (const phrase of PROHIBITED_LEGACY_PHRASES) {
      if (phraseMatches(blob, phrase)) {
        issues.push({
          id: question.id,
          message: `Reviewed bank contains prohibited phrase: "${phrase}"`,
        });
      }
    }
  }
  return issues;
}

export function validateCatalogSource(catalogSource: string): ContentIssue[] {
  const issues: ContentIssue[] = [];
  for (const marker of OBSOLETE_IMPORT_MARKERS) {
    if (catalogSource.includes(marker)) {
      issues.push({
        message: `Catalog still references obsolete question bank: ${marker}`,
      });
    }
  }
  return issues;
}

export function productionQuestionFilesPresent(repoRoot: string): ContentIssue[] {
  const issues: ContentIssue[] = [];
  for (const relative of PRODUCTION_QUESTION_FILES) {
    if (!existsSync(join(repoRoot, relative))) {
      issues.push({ message: `Missing production question file ${relative}` });
    }
  }
  if (existsSync(join(repoRoot, "src/lib/missions/extras.ts"))) {
    issues.push({
      message: "Obsolete extras.ts is still present and must not be importable",
    });
  }
  return issues;
}

export function repoRootFromValidationModule(): string {
  return process.cwd();
}

export function readCatalogSource(root = repoRootFromValidationModule()): string {
  return readFileSync(join(root, "src/lib/missions/catalog.ts"), "utf8");
}

export function assertProductionQuestionContent(): void {
  const root = repoRootFromValidationModule();
  const issues = [
    ...validateMissionQuestions(),
    ...validateReviewedBankPhrases(),
    ...validateCatalogSource(readCatalogSource(root)),
    ...productionQuestionFilesPresent(root),
  ];
  if (issues.length > 0) {
    throw new Error(
      issues
        .map((item) => `${item.missionId ?? "pool"} ${item.id ?? ""}: ${item.message}`.trim())
        .join("; "),
    );
  }
}

export { PRODUCTION_QUESTION_FILES };
