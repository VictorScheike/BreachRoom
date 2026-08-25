"use client";

import { useMemo, useReducer } from "react";
import { AfterActionReport } from "@/components/AfterActionReport";
import { FieldView } from "@/components/FieldView";
import { ScenarioBriefing } from "@/components/ScenarioBriefing";
import { requireStage } from "@/lib/simulation/lookups";
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

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-navy-950 text-ink">
      {state.screen === "briefing" ? (
        <ScenarioBriefing
          scenario={scenario}
          onBegin={() => dispatch({ type: "BEGIN_INCIDENT" })}
        />
      ) : null}

      {state.screen === "simulation" ? (
        <FieldView
          scenario={scenario}
          stage={requireStage(scenario, state.currentStageIndex)}
          stageNumber={Math.min(state.currentStageIndex + 1, scenario.stages.length)}
          selectedOptionId={state.selectedOptionId}
          decisions={state.decisions}
          onSelect={(optionId) => dispatch({ type: "SELECT_OPTION", optionId })}
          onConfirm={() => dispatch({ type: "CONFIRM_DECISION" })}
          onReachExit={() => dispatch({ type: "REACH_EXIT" })}
        />
      ) : null}

      {state.screen === "report" && report ? (
        <AfterActionReport
          scenario={scenario}
          report={report}
          decisions={state.decisions}
          onRestart={() => dispatch({ type: "RESTART" })}
        />
      ) : null}
    </div>
  );
}
