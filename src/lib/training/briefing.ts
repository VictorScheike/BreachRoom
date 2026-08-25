import { requireMission } from "@/lib/missions/catalog";
import type { TrainingConfig } from "@/lib/training/config";
import { roleGroupLabel, roleLabel, topicLabel } from "@/lib/training/labels";

export function trainingObjective(config: TrainingConfig): string {
  switch (config.mapId) {
    case "inbox-under-siege":
      return "Review the suspicious activity across the organisation and return to the Security Hub to submit your incident assessment.";
    case "dependency-depths":
      return "Inspect the build pipeline, resolve the dependency risks and reach the Trusted Build Exit.";
    case "locked-out":
      return "Work the incident across the campus and reach the Core Server Room with a response you can stand behind.";
    case "ai-forge":
      return "Walk the launch path, handle the AI risks, and reach the Model Launch Gateway.";
  }
}

export function trainingIntro(config: TrainingConfig): string {
  const role = config.specificRole ? roleLabel(config.specificRole) : roleGroupLabel(config.roleGroup);
  const topic = topicLabel(config.topics[0] ?? "phishing");
  const map = requireMission(config.mapId);
  return `${config.title}. You are practising as ${role} on ${topic}. Eight reviewed decisions wait on the ${map.title} map.`;
}

export function trainingContextLine(config: TrainingConfig): string {
  const parts = [...config.technologies, ...config.contexts];
  return parts.length > 0 ? parts.join(", ") : "No extra environment selected";
}
