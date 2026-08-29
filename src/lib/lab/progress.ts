import { DECISION_IDS } from "./types";
import { LAB_MISSION_ID } from "./catalog";
import { resultLabel } from "./engine";
import { chosenCount } from "./catalog";
import type { FinalResultKind, LabDifficulty, LabPersistedState } from "./types";
import { upsertProgressSession, type ProgressSession } from "@/lib/progress/store";

export const LAB_PROGRESS_SESSION_ID = `${LAB_MISSION_ID}:lab`;

export function isLabProgressSession(session: { kind?: string; missionId: string }): boolean {
  return session.kind === "lab" || session.missionId.startsWith("lab-");
}

export function labResumeHref(): string {
  return "/lab/";
}

export function syncLabProgress(state: LabPersistedState, result: FinalResultKind | null, score: number | null): ProgressSession {
  const completed = state.bestResult !== null;
  const decided = chosenCount(state.choices);
  const session: ProgressSession = {
    id: LAB_PROGRESS_SESSION_ID,
    kind: "lab",
    missionId: LAB_MISSION_ID,
    missionTitle: "The Poisoned Claim",
    seed: 0,
    questionIds: [...DECISION_IDS],
    questionsCompleted: completed ? 10 : Math.min(10, decided),
    questionsRequired: 10,
    phaseLabel: result
      ? resultLabel(result)
      : state.bestResult
        ? resultLabel(state.bestResult)
        : state.phase === "attack"
          ? "Red Team running"
          : state.phase === "review"
            ? "Architecture complete"
            : "Deciding",
    completed,
    endedEarly: false,
    overall: score ?? state.bestScore,
    scenarioId: "poisoned-claim",
    choices: [],
    startedAt: Date.now(),
    updatedAt: Date.now(),
    roleGroupId: "it-security",
    roleId: "security-architect",
    topics: ["ai-security", "secure-architecture"],
    audienceMode: "standard",
    perspectiveLabel: difficultyLabel(state.difficulty),
  };
  upsertProgressSession(session);
  return session;
}

export function difficultyLabel(difficulty: LabDifficulty): string {
  return difficulty === "challenge" ? "Challenge" : "Guided";
}
