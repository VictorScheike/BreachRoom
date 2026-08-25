import { recommendTraining, type ScoutInput } from "@/lib/training/recommend";
import type { FormatId, RoleId } from "@/lib/missions/types";
import { AUDIENCES } from "@/lib/training/curriculum";

export const SCOUT_IDENTITY = {
  name: "Scout",
  purpose: "Tell Scout what your team works with, and it will help shape the right training.",
  note:
    "Scout uses a local recommendation engine over curated BreachRoom content. Free-form model generation is not active in this deployment.",
} as const;

export function defaultScoutInput(): ScoutInput {
  return {
    audienceId: "employee",
    tools: [],
    environmentNote: "",
    topicId: "phishing",
    goal: "Recognise a threat",
    formatId: "mission",
  };
}

export function parseAudience(value: string): RoleId {
  const match = AUDIENCES.find((item) => item.id === value);
  return match?.id ?? "employee";
}

export function parseFormat(value: string): FormatId {
  if (value === "quiz" || value === "learning-path" || value === "mission") {
    return value;
  }
  return "mission";
}

export { recommendTraining };
