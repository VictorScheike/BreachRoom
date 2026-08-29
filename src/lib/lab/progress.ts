import { LAB_MISSION_ID } from "./catalog";
import { resultLabel } from "./engine";
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
  const session: ProgressSession = {
    id: LAB_PROGRESS_SESSION_ID,
    kind: "lab",
    missionId: LAB_MISSION_ID,
    missionTitle: "The Poisoned Claim",
    seed: 0,
    questionIds: ["initial-access", "poisoned-document", "prompt-injection", "model-data", "unsafe-action", "detection"],
    questionsCompleted: completed ? 6 : Math.min(6, state.revealedStageCount),
    questionsRequired: 6,
    phaseLabel: result
      ? resultLabel(result)
      : state.bestResult
        ? resultLabel(state.bestResult)
        : state.phase === "attack"
          ? "Under attack"
          : "Build",
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
    perspectiveLabel: hardnessLabel(state.difficulty),
  };
  upsertProgressSession(session);
  return session;
}

export function hardnessLabel(difficulty: LabDifficulty): string {
  return difficulty === "architect" ? "Architect · Hardness lvl" : "Guided · Hardness lvl";
}
