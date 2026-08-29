import { requireMission } from "@/lib/missions/catalog";
import type { TrainingConfig } from "@/lib/training/config";
import { coverageSummary } from "@/lib/training/deck";
import { contextLabel, technologyLabel } from "@/lib/training/ids";
import { roleGroupLabel, roleLabel, topicLabel } from "@/lib/training/labels";
import { displayDifficulty } from "@/lib/training/reviewed/convert";

export const FRAMEWORK_EDUCATIONAL_NOTE =
  "Framework labels are educational mappings, not proof of compliance or certification.";

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
    case "northstar-zero-hour":
      return "Stabilise Northstar and reach the Incident Coordination Room.";
  }
}

export function trainingIntro(config: TrainingConfig): string {
  const role = config.specificRole ? roleLabel(config.specificRole) : roleGroupLabel(config.roleGroup);
  const topic = topicLabel(config.topics[0] ?? "phishing");
  const map = requireMission(config.mapId);
  const coverage = coverageSummary(config);
  const coverageLine = coverage ? ` Coverage: ${coverage}.` : "";
  return `${config.title}. You are practising as ${role} on ${topic} at ${displayDifficulty(config.difficulty)}. Eight reviewed decisions wait on the ${map.title} map.${coverageLine}`;
}

export function trainingContextLine(config: TrainingConfig): string {
  const parts = [
    ...config.technologies.map((id) => technologyLabel(id)),
    ...config.contexts.map((id) => contextLabel(id)),
  ];
  return parts.length > 0 ? parts.join(", ") : "No extra environment selected";
}
