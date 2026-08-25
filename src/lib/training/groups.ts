import type { RoleId } from "@/lib/missions/types";

export type RoleGroupId =
  | "general-employees"
  | "finance-hr"
  | "developers-devops"
  | "it-security"
  | "leaders-risk";

export interface RoleGroupDefinition {
  id: RoleGroupId;
  name: string;
  sentence: string;
  topicHints: readonly string[];
  roleIds: readonly RoleId[];
  defaultRole: RoleId;
}

export const ROLE_GROUPS: readonly RoleGroupDefinition[] = [
  {
    id: "general-employees",
    name: "General employees",
    sentence: "Pause on suspicious messages, protect credentials, and report through the official channel.",
    topicHints: ["Phishing", "Safe reporting", "Everyday incidents"],
    roleIds: ["employee"],
    defaultRole: "employee",
  },
  {
    id: "finance-hr",
    name: "Finance & HR",
    sentence: "Verify payment and people requests before money, payroll or personal data moves.",
    topicHints: ["Phishing", "Payment fraud", "Personal data"],
    roleIds: ["finance", "hr"],
    defaultRole: "finance",
  },
  {
    id: "developers-devops",
    name: "Developers & DevOps",
    sentence: "Protect code, pipelines, secrets and the path from commit to production.",
    topicHints: ["Supply chain", "Secure development", "CI/CD"],
    roleIds: ["developer", "devops"],
    defaultRole: "developer",
  },
  {
    id: "it-security",
    name: "IT & Security",
    sentence: "Contain active threats, verify identity requests, and keep evidence for the response.",
    topicHints: ["Incident response", "Identity", "Ransomware"],
    roleIds: ["it-support", "incident-responder", "security-architect"],
    defaultRole: "incident-responder",
  },
  {
    id: "leaders-risk",
    name: "Leaders, Risk & Governance",
    sentence: "Decide what to say, who to tell, and which trade-offs the organisation can live with.",
    topicHints: ["Crisis communication", "Accountability", "Continuity"],
    roleIds: ["business-leader", "risk-governance"],
    defaultRole: "business-leader",
  },
] as const;

export function requireRoleGroup(id: string): RoleGroupDefinition {
  const group = ROLE_GROUPS.find((item) => item.id === id);
  if (!group) {
    throw new Error(`Unknown role group: ${id}`);
  }
  return group;
}

export function roleGroupForRole(roleId: RoleId): RoleGroupId {
  const group = ROLE_GROUPS.find((item) => item.roleIds.includes(roleId));
  return group?.id ?? "general-employees";
}
