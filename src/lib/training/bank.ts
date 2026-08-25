import { MISSION_LIST } from "@/lib/missions/catalog";
import type { DifficultyId, MissionId, Question, RoleId, StoryPhase } from "@/lib/missions/types";
import { ROLE_GROUPS, roleGroupForRole, type RoleGroupId } from "@/lib/training/groups";
import { TRAINING_TOPICS } from "@/lib/training/topics";

export type TrainingPhase =
  | "recognise"
  | "assess"
  | "respond"
  | "escalate"
  | "recover"
  | "reflect";

export interface BankQuestion extends Question {
  roleGroups: readonly RoleGroupId[];
  allRoles: boolean;
  technologies: readonly string[];
  contexts: readonly string[];
  compatibleMaps: readonly MissionId[];
  trainingPhase: TrainingPhase;
  topicIds: readonly string[];
  roleIds: readonly RoleId[];
  difficulty: DifficultyId;
}

const PHASE_MAP: Record<StoryPhase, TrainingPhase> = {
  start: "recognise",
  assess: "assess",
  contain: "respond",
  control: "respond",
  evidence: "escalate",
  communicate: "escalate",
  recover: "recover",
  close: "reflect",
};

const DEFAULT_TOPICS: Record<MissionId, readonly string[]> = {
  "inbox-under-siege": ["phishing", "social-engineering", "incident-reporting"],
  "locked-out": ["ransomware", "incident-response", "operational-resilience"],
  "ai-forge": ["ai-security", "security-architecture"],
  "dependency-depths": ["secure-development", "software-supply-chain"],
};

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function technologiesFrom(question: Question): string[] {
  const tools = question.toolIds ?? [];
  const blob = `${question.title} ${question.situation}`.toLowerCase();
  const extra: string[] = [];
  if (/microsoft 365|teams|oauth|mfa|outlook/.test(blob)) {
    extra.push("Microsoft 365");
  }
  if (/azure/.test(blob)) {
    extra.push("Azure");
  }
  if (/\baws\b|iam|cloud/.test(blob) && question.missionId === "dependency-depths") {
    extra.push("AWS");
  }
  if (/github|pull request|ci\b|pipeline|lockfile/.test(blob)) {
    extra.push("GitHub", "CI/CD pipelines");
  }
  if (/saas|login page|oauth/.test(blob)) {
    extra.push("SaaS platforms");
  }
  if (/ai |model |chatbot|coding agent/.test(blob)) {
    extra.push("AI assistants");
  }
  if (/invoice|iban|payroll|finance/.test(blob)) {
    extra.push("Financial data");
  }
  return unique([...tools, ...extra]);
}

function contextsFrom(question: Question, technologies: readonly string[]): string[] {
  const blob = `${question.title} ${question.situation} ${(question.toolIds ?? []).join(" ")}`.toLowerCase();
  const contexts: string[] = [];
  if (technologies.includes("SaaS platforms") || /saas/.test(blob)) {
    contexts.push("SaaS platforms");
  }
  if (/supplier|vendor|third-party|invoice/.test(blob)) {
    contexts.push("Third-party technology providers");
  }
  if (/internal app|helpdesk|quick assist|vpn/.test(blob)) {
    contexts.push("Internal applications");
  }
  return unique(contexts);
}

function topicsFor(question: Question): string[] {
  const existing = question.topicIds ?? [];
  const defaults = DEFAULT_TOPICS[question.missionId];
  const extra: string[] = [];
  if (question.missionId === "dependency-depths") {
    const scenarios = question.scenarioIds.join(" ");
    if (scenarios.includes("cave-package")) {
      extra.push("software-supply-chain", "third-party-risk", "supply-chain");
    }
    if (scenarios.includes("cave-secret")) {
      extra.push("cicd", "secrets-management", "secure-development");
    }
    if (scenarios.includes("cave-cloud")) {
      extra.push("cloud-security", "cloud-architecture");
    }
  }
  if (question.missionId === "inbox-under-siege" && existing.includes("privacy")) {
    extra.push("data-privacy", "data-security");
  }
  if (question.missionId === "locked-out") {
    extra.push("business-continuity");
  }
  return unique([...existing, ...defaults, ...extra]);
}

function allRolesFor(question: Question): boolean {
  return question.missionId === "inbox-under-siege";
}

function groupsFor(question: Question): RoleGroupId[] {
  const roles = question.roleIds ?? [];
  const matched = ROLE_GROUPS.filter((group) =>
    group.roleIds.some((role) => roles.includes(role)),
  ).map((group) => group.id);
  if (allRolesFor(question)) {
    return unique([...matched, ...ROLE_GROUPS.map((group) => group.id)]) as RoleGroupId[];
  }
  if (matched.length > 0) {
    return matched;
  }
  return roles.length > 0 ? [roleGroupForRole(roles[0]!)] : ["it-security"];
}

export function enrichQuestion(question: Question): BankQuestion {
  const technologies = technologiesFrom(question);
  const topicIds = topicsFor(question);
  const roleIds = question.roleIds ?? [];
  return {
    ...question,
    topicIds,
    roleIds,
    roleGroups: groupsFor(question),
    allRoles: allRolesFor(question),
    technologies,
    contexts: contextsFrom(question, technologies),
    compatibleMaps: [question.missionId],
    trainingPhase: PHASE_MAP[question.phase],
    difficulty: question.difficulty ?? (question.missionId === "ai-forge" || question.missionId === "dependency-depths"
      ? "Intermediate"
      : "Beginner"),
  };
}

export function questionBank(): BankQuestion[] {
  return MISSION_LIST.flatMap((mission) => mission.questions.map(enrichQuestion));
}

export function questionsForMap(mapId: MissionId): BankQuestion[] {
  return questionBank().filter((question) => question.compatibleMaps.includes(mapId));
}

export function topicAliases(topicId: string): readonly string[] {
  const topic = TRAINING_TOPICS.find((item) => item.id === topicId);
  return topic?.aliases ?? [topicId];
}
