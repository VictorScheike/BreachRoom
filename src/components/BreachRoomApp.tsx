"use client";

import { Suspense, useEffect, useMemo, useReducer, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { GameReport } from "@/components/game/GameReport";
import { GameView } from "@/components/game/GameView";
import { MissionSelect } from "@/components/game/MissionSelect";
import { RoleSelect } from "@/components/game/RoleSelect";
import { createInitialGameState, gameReducer } from "@/lib/game/engine";
import { requireMission } from "@/lib/missions/catalog";
import { buildMissionReport } from "@/lib/missions/report";
import type { MissionId, RoleId } from "@/lib/missions/types";
import { loadTrainingSession, rememberQuestionIds } from "@/lib/training/session";
import { missionPerspective } from "@/lib/game/perspective";
import { sessionIdFor, upsertProgressSession } from "@/lib/progress/store";

const MISSION_IDS: readonly MissionId[] = [
  "locked-out",
  "ai-forge",
  "dependency-depths",
  "inbox-under-siege",
  "northstar-zero-hour",
];

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

function parseMission(value: string | null): MissionId | null {
  if (!value) {
    return null;
  }
  return MISSION_IDS.find((id) => id === value) ?? null;
}

function parseRole(value: string | null): RoleId | null {
  if (!value) {
    return null;
  }
  return ROLE_IDS.find((id) => id === value) ?? null;
}

function PlayApp() {
  const params = useSearchParams();
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) {
      return;
    }
    booted.current = true;
    const missionId = parseMission(params.get("mission"));
    const roleId = parseRole(params.get("role"));
    const training = params.get("training") === "1";
    const seed = Math.floor(Math.random() * 1_000_000_000);

    if (training) {
      const config = loadTrainingSession();
      if (config && (!missionId || config.mapId === missionId)) {
        rememberQuestionIds(config.questionIds);
        dispatch({ type: "START_TRAINING", config });
        return;
      }
    }
    if (missionId && roleId) {
      dispatch({ type: "START_DIRECT", missionId, roleId, seed });
      return;
    }
    if (missionId) {
      dispatch({ type: "SELECT_MISSION", missionId, seed });
    }
  }, [params]);

  const report = useMemo(() => {
    if (state.screen !== "report" || !state.missionId || !state.playthrough) {
      return null;
    }
    return buildMissionReport(
      requireMission(state.missionId),
      state.playthrough.scenarioId,
      state.choices,
      state.playthrough.questions,
      state.trainingConfig,
      state.roleId,
    );
  }, [state]);

  useEffect(() => {
    if (!state.missionId || !state.playthrough) {
      return;
    }
    if (state.screen === "missionSelection" || state.screen === "roleSelect") {
      return;
    }
    const mission = requireMission(state.missionId);
    const perspective = missionPerspective(mission, state.trainingConfig, state.roleId);
    const phase = mission.sessionPhases
      ? mission.sessionPhases[
          Math.min(
            mission.sessionPhases.length - 1,
            Math.floor(state.choices.length / 3),
          )
        ]
      : null;
    upsertProgressSession({
      id: sessionIdFor(state.missionId, state.seed),
      missionId: state.missionId,
      missionTitle: mission.title,
      seed: state.seed,
      questionIds: state.playthrough.questions.map((item) => item.id),
      questionsCompleted: state.choices.length,
      questionsRequired: state.playthrough.questions.length,
      phaseLabel: phase ? phase.label : null,
      completed: state.screen === "report" && !state.endedEarly,
      endedEarly: state.endedEarly,
      overall: report?.score.overall ?? null,
      startedAt: Date.now(),
      updatedAt: Date.now(),
      roleGroupId: state.trainingConfig?.roleGroup ?? null,
      roleId: state.roleId,
      topics: state.trainingConfig?.topics ?? [],
      audienceMode: perspective.mode,
      perspectiveLabel: perspective.playingAs,
    });
  }, [report, state]);

  if (state.screen === "missionSelection") {
    return (
      <MissionSelect
        onSelect={(missionId) =>
          dispatch({
            type: "SELECT_MISSION",
            missionId,
            seed: Math.floor(Math.random() * 1_000_000_000),
          })
        }
      />
    );
  }

  if (state.screen === "roleSelect" && state.missionId) {
    return (
      <RoleSelect
        missionId={state.missionId}
        onConfirm={(roleId) => dispatch({ type: "CONFIRM_ROLE", roleId })}
      />
    );
  }
  if (state.screen === "report" && report) {
    return (
      <GameReport
        report={report}
        endedEarly={state.endedEarly}
        onReplay={() => dispatch({ type: "REPLAY_MISSION" })}
        onNewScenario={() => dispatch({ type: "NEW_SCENARIO" })}
        onOtherMission={() => dispatch({ type: "CHOOSE_ANOTHER_MISSION" })}
      />
    );
  }

  return (
    <GameView
      state={state}
      onBegin={() => dispatch({ type: "BEGIN_MISSION" })}
      onMove={(direction) => dispatch({ type: "MOVE", direction })}
      onChoose={(optionId, displayLetter) =>
        dispatch({ type: "CHOOSE_OPTION", optionId, displayLetter })
      }
      onContinue={() => dispatch({ type: "CONTINUE_JOURNEY" })}
      onOpenReport={() => dispatch({ type: "OPEN_REPORT" })}
      onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })}
      onChooseAnother={() => dispatch({ type: "ABORT_MISSION" })}
      onEndEarly={() => dispatch({ type: "END_EARLY" })}
    />
  );
}

export function BreachRoomApp() {
  return (
    <Suspense fallback={<main id="main-content" className="game-page">Loading mission…</main>}>
      <PlayApp />
    </Suspense>
  );
}
