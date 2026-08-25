"use client";

import { useMemo, useReducer } from "react";
import { GameReport } from "@/components/game/GameReport";
import { GameView } from "@/components/game/GameView";
import { MissionSelect } from "@/components/game/MissionSelect";
import { RoleSelect } from "@/components/game/RoleSelect";
import { createInitialGameState, gameReducer } from "@/lib/game/engine";
import { requireMission } from "@/lib/missions/catalog";
import { buildMissionReport } from "@/lib/missions/report";

export function BreachRoomApp() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);

  const report = useMemo(() => {
    if (state.screen !== "report" || !state.missionId || !state.playthrough) {
      return null;
    }
    return buildMissionReport(
      requireMission(state.missionId),
      state.playthrough.scenarioId,
      state.choices,
      state.playthrough.questions,
    );
  }, [state]);

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
        onBack={() => dispatch({ type: "ABORT_MISSION" })}
      />
    );
  }
  if (state.screen === "report" && report) {
    return (
      <GameReport
        report={report}
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
    />
  );
}
