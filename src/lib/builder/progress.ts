import { BUILDER_DECISIONS } from "./catalog";
import { BUILDER_PROGRESS_SESSION_ID, BUILDER_TITLE } from "./copy";
import { scoreBuilderAnswers } from "./scoring";
import type { BuilderPersistedState } from "./types";
import { BUILDER_MISSION_ID, BUILDER_QUESTION_COUNT } from "./types";
import { upsertProgressSession, type ProgressSession } from "@/lib/progress/store";

export function isBuilderProgressSession(session: { kind?: string; missionId: string }): boolean {
  return session.kind === "builder" || session.missionId === BUILDER_MISSION_ID;
}

export function builderResumeHref(): string {
  return "/secure-solution-builder/";
}

export function syncBuilderProgress(state: BuilderPersistedState): ProgressSession {
  const score = state.answers.length > 0 ? scoreBuilderAnswers(state.answers) : null;
  const session: ProgressSession = {
    id: BUILDER_PROGRESS_SESSION_ID,
    kind: "builder",
    missionId: BUILDER_MISSION_ID,
    missionTitle: BUILDER_TITLE,
    seed: 0,
    questionIds: BUILDER_DECISIONS.map((item) => item.id),
    questionsCompleted: state.completed ? BUILDER_QUESTION_COUNT : state.answers.length,
    questionsRequired: BUILDER_QUESTION_COUNT,
    phaseLabel: score
      ? `${score.correct} / ${score.total} · ${score.level.title}`
      : state.phase === "intro"
        ? "Ready to start"
        : "In progress",
    completed: state.completed && state.answers.length === BUILDER_QUESTION_COUNT,
    endedEarly: false,
    overall: state.bestPercent ?? state.lastPercent ?? score?.percent ?? null,
    scenarioId: BUILDER_MISSION_ID,
    choices: state.answers.map((answer) => ({
      questionId: answer.questionId,
      optionId: answer.letter,
      displayLetter: answer.letter,
    })),
    startedAt: Date.now(),
    updatedAt: Date.now(),
    roleGroupId: "it-security",
    roleId: "security-architect",
    topics: ["secure-development", "ai-security", "cloud-security", "data-privacy"],
    audienceMode: "standard",
    perspectiveLabel: "Beginner · 15 decisions",
  };
  upsertProgressSession(session);
  return session;
}
