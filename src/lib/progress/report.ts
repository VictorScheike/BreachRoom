import { findMission } from "@/lib/missions/catalog";
import { buildMissionReport, type MissionReport } from "@/lib/missions/report";
import type { RoleId } from "@/lib/missions/types";
import type { ProgressSession } from "@/lib/progress/store";

const ROLE_IDS: readonly RoleId[] = [
  "employee",
  "finance",
  "hr",
  "business-leader",
  "developer",
  "devops",
  "it-support",
  "incident-responder",
  "security-architect",
  "risk-governance",
];

function asRoleId(value: string | null): RoleId | null {
  if (!value) {
    return null;
  }
  return ROLE_IDS.find((id) => id === value) ?? null;
}

export function reportFromProgressSession(session: ProgressSession): MissionReport | null {
  if (session.choices.length === 0) {
    return null;
  }
  const mission = findMission(session.missionId);
  if (!mission) {
    return null;
  }
  const questions = session.choices
    .map((choice) => mission.questions.find((question) => question.id === choice.questionId))
    .filter((question): question is NonNullable<typeof question> => Boolean(question));
  if (questions.length !== session.choices.length) {
    return null;
  }
  try {
    return buildMissionReport(
      mission,
      session.scenarioId ?? questions[0]?.scenarioIds[0] ?? mission.scenarios[0]?.id ?? mission.id,
      session.choices,
      questions,
      null,
      asRoleId(session.roleId),
    );
  } catch (error) {
    console.error("Unable to rebuild saved BreachRoom report", error);
    return null;
  }
}

export function answerSummaryLabel(report: MissionReport): string {
  const { correct, partlyCorrect, incorrect } = report.verdictCounts;
  return `${correct} correct · ${partlyCorrect} partly correct · ${incorrect} to improve`;
}

