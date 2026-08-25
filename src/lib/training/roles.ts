import type { RoleId } from "@/lib/missions/types";

export interface TrainingRole {
  id: RoleId;
  name: string;
  description: string;
  topicIds: readonly string[];
  missionIds: readonly string[];
  fallbackNote?: string;
}

export const TRAINING_ROLES: readonly TrainingRole[] = [
  {
    id: "security-architect",
    name: "Security architects",
    description:
      "People who design controls, advise on trade-offs, and keep new technology from shipping as an accident.",
    topicIds: [
      "security-by-design",
      "ai-security",
      "cloud-architecture",
      "security-principles",
      "risk-recommendations",
    ],
    missionIds: ["ai-forge", "dependency-depths"],
  },
  {
    id: "developer",
    name: "Developers and DevOps teams",
    description:
      "Builders and platform teams who handle code, pipelines, secrets and the software supply chain.",
    topicIds: [
      "secure-development",
      "cicd-security",
      "secrets-management",
      "application-security",
      "software-supply-chain",
    ],
    missionIds: ["dependency-depths"],
  },
  {
    id: "incident-responder",
    name: "IT and incident responders",
    description:
      "The people who isolate, recover, escalate and keep operations moving when something is already on fire.",
    topicIds: [
      "ransomware",
      "containment",
      "recovery",
      "escalation",
      "operational-resilience",
    ],
    missionIds: ["locked-out"],
  },
  {
    id: "risk-governance",
    name: "Risk, privacy and governance professionals",
    description:
      "Roles that own DORA-style resilience, third-party risk, privacy and the question of who is accountable.",
    topicIds: ["dora", "third-party-risk", "ai-governance", "privacy", "risk-ownership"],
    missionIds: [],
    fallbackNote:
      "Relevant scenarios are included across the current mission library.",
  },
  {
    id: "business-leader",
    name: "Business and product leaders",
    description:
      "Leaders who decide trade-offs, customer communication, continuity and whether a launch is actually safe enough.",
    topicIds: [
      "security-tradeoffs",
      "secure-ai-adoption",
      "customer-trust",
      "business-continuity",
      "ownership",
    ],
    missionIds: [],
    fallbackNote:
      "Relevant scenarios are included across the current mission library.",
  },
];

export const PLAY_ROLES: readonly { id: RoleId; label: string }[] = [
  { id: "employee", label: "Employee" },
  { id: "finance", label: "Finance" },
  { id: "hr", label: "HR" },
  { id: "developer", label: "Developer" },
  { id: "devops", label: "DevOps" },
  { id: "it-support", label: "IT support" },
  { id: "incident-responder", label: "Incident responder" },
  { id: "security-architect", label: "Security architect" },
  { id: "risk-governance", label: "Risk and governance" },
  { id: "business-leader", label: "Business leader" },
];
