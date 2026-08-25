import type { MissionId } from "@/lib/missions/types";
import type { RoleGroupId } from "@/lib/training/groups";

export interface TrainingTopicDefinition {
  id: string;
  label: string;
  supporting: string;
  mapId: MissionId;
  aliases: readonly string[];
  suggestedFor: readonly RoleGroupId[];
}

export const TRAINING_TOPICS: readonly TrainingTopicDefinition[] = [
  {
    id: "phishing",
    label: "Phishing and social engineering",
    supporting: "Suspicious email, chat, invoices and fake login pages.",
    mapId: "inbox-under-siege",
    aliases: [
      "phishing",
      "social-engineering",
      "suspicious-links",
      "mfa",
      "file-sharing",
      "incident-reporting",
      "identity",
      "password-management",
    ],
    suggestedFor: [
      "general-employees",
      "finance-hr",
      "it-security",
      "leaders-risk",
      "developers-devops",
    ],
  },
  {
    id: "ransomware",
    label: "Ransomware and incident response",
    supporting: "Containment, recovery, evidence and crisis communication.",
    mapId: "locked-out",
    aliases: [
      "ransomware",
      "incident-response",
      "containment",
      "recovery",
      "operational-resilience",
      "escalation",
    ],
    suggestedFor: ["it-security", "leaders-risk", "general-employees", "finance-hr"],
  },
  {
    id: "ai-security",
    label: "AI security",
    supporting: "Safe launch, data exposure and automated decisions.",
    mapId: "ai-forge",
    aliases: ["ai-security", "security-architecture", "secure-ai-adoption"],
    suggestedFor: ["developers-devops", "it-security", "leaders-risk"],
  },
  {
    id: "supply-chain",
    label: "Supply chain security",
    supporting: "Packages, provenance, third-party code and build integrity.",
    mapId: "dependency-depths",
    aliases: ["software-supply-chain", "third-party-risk", "supply-chain"],
    suggestedFor: ["developers-devops", "it-security"],
  },
  {
    id: "secure-development",
    label: "Secure software development",
    supporting: "Design, build, verify and release with security in the pipeline.",
    mapId: "dependency-depths",
    aliases: ["secure-development", "application-security", "devsecops", "cicd"],
    suggestedFor: ["developers-devops"],
  },
  {
    id: "cloud-security",
    label: "Cloud security",
    supporting: "Identity, logging, containers and cloud permissions.",
    mapId: "dependency-depths",
    aliases: ["cloud-security", "cloud-architecture"],
    suggestedFor: ["developers-devops", "it-security"],
  },
  {
    id: "data-privacy",
    label: "Data handling and privacy",
    supporting: "Personal data, file sharing and sensitive people processes.",
    mapId: "inbox-under-siege",
    aliases: ["privacy", "data-security", "data-privacy"],
    suggestedFor: ["finance-hr", "general-employees", "leaders-risk"],
  },
  {
    id: "business-continuity",
    label: "Business continuity",
    supporting: "Keep operations moving while the incident is still messy.",
    mapId: "locked-out",
    aliases: ["business-continuity", "operational-resilience"],
    suggestedFor: ["leaders-risk", "finance-hr"],
  },
];

export function requireTrainingTopic(id: string): TrainingTopicDefinition {
  const topic = TRAINING_TOPICS.find((item) => item.id === id);
  if (!topic) {
    throw new Error(`Unknown training topic: ${id}`);
  }
  return topic;
}
