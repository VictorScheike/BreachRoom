import { MISSION_LIST } from "@/lib/missions/catalog";
import type { FormatId, MissionId, RoleId } from "@/lib/missions/types";
import { AUDIENCES } from "@/lib/training/curriculum";

export interface ScoutInput {
  audienceId: RoleId;
  tools: readonly string[];
  environmentNote: string;
  topicId: string;
  goal: string;
  formatId: FormatId;
}

export interface TrainingRecommendation {
  title: string;
  audienceLabel: string;
  tools: readonly string[];
  environmentNote: string;
  topicId: string;
  goal: string;
  formatId: FormatId;
  formatLabel: string;
  learningObjectives: readonly string[];
  recommendedMissionId: MissionId | null;
  recommendedMissionTitle: string | null;
  scenarioTitle: string | null;
  estimatedMinutes: number | null;
  frameworks: readonly string[];
  outline: readonly string[];
  canStartMission: boolean;
  explanation: string;
}

const TOPIC_MISSION: Record<string, MissionId> = {
  phishing: "inbox-under-siege",
  "social-engineering": "inbox-under-siege",
  "password-management": "inbox-under-siege",
  mfa: "inbox-under-siege",
  "incident-reporting": "inbox-under-siege",
  "suspicious-links": "inbox-under-siege",
  "file-sharing": "inbox-under-siege",
  "remote-work": "inbox-under-siege",
  privacy: "inbox-under-siege",
  "data-security": "inbox-under-siege",
  ransomware: "locked-out",
  "incident-response": "locked-out",
  "operational-resilience": "locked-out",
  "ai-security": "ai-forge",
  "security-architecture": "ai-forge",
  "cloud-security": "dependency-depths",
  "application-security": "dependency-depths",
  devsecops: "dependency-depths",
  "secure-development": "dependency-depths",
  "software-supply-chain": "dependency-depths",
  identity: "locked-out",
  "third-party-risk": "dependency-depths",
};

function audienceLabel(id: RoleId): string {
  return AUDIENCES.find((item) => item.id === id)?.label ?? id;
}

function scoreMission(mission: (typeof MISSION_LIST)[number], input: ScoutInput): number {
  let score = 0;
  if (TOPIC_MISSION[input.topicId] === mission.id) {
    score += 8;
  }
  if (mission.intendedRoles.includes(input.audienceId)) {
    score += 5;
  }
  if (mission.topics.some((topic) => topic.toLowerCase().includes(input.topicId.replace(/-/g, " ")))) {
    score += 3;
  }
  const blob = `${mission.story} ${mission.learningAreas.join(" ")}`.toLowerCase();
  for (const tool of input.tools) {
    if (blob.includes(tool.toLowerCase()) || mission.topics.join(" ").toLowerCase().includes(tool.toLowerCase())) {
      score += 1;
    }
  }
  if (input.tools.includes("GitHub") && mission.id === "dependency-depths") {
    score += 3;
  }
  if (input.tools.includes("AI assistants") && mission.id === "ai-forge") {
    score += 3;
  }
  if (input.tools.includes("Microsoft 365") && mission.id === "inbox-under-siege") {
    score += 2;
  }
  return score;
}

export function recommendTraining(input: ScoutInput): TrainingRecommendation {
  const ranked = [...MISSION_LIST]
    .map((mission) => ({ mission, score: scoreMission(mission, input) }))
    .sort((left, right) => right.score - left.score);
  const best = ranked[0];
  const mapped = TOPIC_MISSION[input.topicId];
  const chosen =
    (mapped && MISSION_LIST.find((item) => item.id === mapped)) || best?.mission || null;
  const startMission = input.formatId === "mission" && chosen !== null;
  const scenario = chosen?.scenarios[0] ?? null;

  const objectives = [
    `Recognise how ${input.topicId.replace(/-/g, " ")} shows up in ${audienceLabel(input.audienceId).toLowerCase()} work.`,
    input.goal,
    "Practise a decision, see the consequence, and compare it with the recommended response.",
  ];

  const outline = [
    `Audience: ${audienceLabel(input.audienceId)}`,
    `Topic: ${input.topicId.replace(/-/g, " ")}`,
    `Goal: ${input.goal}`,
    input.tools.length > 0
      ? `Context to keep in view: ${input.tools.join(", ")}`
      : "No specific tools were selected.",
    chosen
      ? `Reviewed playable content: ${chosen.title} (${chosen.estimatedMinutes} min).`
      : "No matching playable mission is in the library yet.",
    "If a quiz or learning path was requested, treat this as a training outline — those formats are not playable yet.",
    "Do not enter passwords, secrets or customer data into Scout.",
  ];

  return {
    title: startMission && chosen
      ? `${chosen.title} for ${audienceLabel(input.audienceId)}`
      : `Training outline: ${input.topicId.replace(/-/g, " ")}`,
    audienceLabel: audienceLabel(input.audienceId),
    tools: input.tools,
    environmentNote: input.environmentNote.trim(),
    topicId: input.topicId,
    goal: input.goal,
    formatId: input.formatId,
    formatLabel: startMission ? "Playable mission" : "Training outline",
    learningObjectives: objectives,
    recommendedMissionId: chosen?.id ?? null,
    recommendedMissionTitle: chosen?.title ?? null,
    scenarioTitle: scenario?.title ?? null,
    estimatedMinutes: chosen?.estimatedMinutes ?? null,
    frameworks: chosen?.frameworks ?? [],
    outline,
    canStartMission: startMission,
    explanation: chosen
      ? `Scout matched this request to curated BreachRoom content. Scoring and recommended answers stay on the reviewed mission — they are not generated for this session.`
      : "Scout could not match a playable mission. The outline below is a structured plan, not a complete course.",
  };
}
