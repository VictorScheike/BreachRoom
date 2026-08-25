"use client";

import { useMemo, useReducer } from "react";
import { GameReport } from "@/components/game/GameReport";
import { GameView } from "@/components/game/GameView";
import {
  createInitialState,
  simulationReducer,
} from "@/lib/simulation/reducer";
import { generateReport } from "@/lib/simulation/report";
import { scenario } from "@/lib/simulation/scenario";

export function BreachRoomApp() {
  const [state, dispatch] = useReducer(simulationReducer, undefined, createInitialState);

  const report = useMemo(() => {
    if (state.screen !== "report") {
      return null;
    }
    return generateReport(scenario, state.decisions);
  }, [state.decisions, state.screen]);

  if (state.screen === "report" && report) {
    return (
      <GameReport
        scenario={scenario}
        report={report}
        onRestart={() => dispatch({ type: "RESTART" })}
      />
    );
  }

  return (
    <GameView
      scenario={scenario}
      currentStageIndex={state.currentStageIndex}
      decisions={state.decisions}
      onBegin={() => dispatch({ type: "BEGIN_INCIDENT" })}
      onChoose={(optionId) => dispatch({ type: "CHOOSE_OPTION", optionId })}
      onReachCore={() => dispatch({ type: "REACH_EXIT" })}
    />
  );
}
