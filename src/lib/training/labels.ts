import type { RoleId } from "@/lib/missions/types";
import { PLAY_ROLES } from "@/lib/training/roles";
import { ROLE_GROUPS, type RoleGroupId } from "@/lib/training/groups";

const TOPIC_LABELS: Record<string, string> = {
  phishing: "Phishing and social engineering",
  "social-engineering": "Social engineering",
  ransomware: "Ransomware and incident response",
  "incident-response": "Incident response",
  "ai-security": "AI security",
  "secure-architecture": "Secure architecture",
  "secure-development": "Secure software development",
  "supply-chain": "Supply chain security",
  "software-supply-chain": "Software supply chain security",
  "cloud-security": "Cloud security",
  "data-privacy": "Data handling and privacy",
  "business-continuity": "Business continuity",
  cicd: "CI/CD security",
  privacy: "Data handling and privacy",
};

export function roleLabel(roleId: RoleId): string {
  return PLAY_ROLES.find((role) => role.id === roleId)?.label ?? roleId;
}

export function roleGroupLabel(id: RoleGroupId): string {
  return ROLE_GROUPS.find((group) => group.id === id)?.name ?? id;
}

export function topicLabel(topicId: string): string {
  return TOPIC_LABELS[topicId] ?? topicId.replace(/-/g, " ");
}

export { displayDifficulty } from "@/lib/training/reviewed/convert";

export function humanRoleList(roleIds: readonly RoleId[]): string {
  return roleIds.map(roleLabel).join(" · ");
}
