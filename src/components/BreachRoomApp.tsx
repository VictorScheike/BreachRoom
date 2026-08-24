"use client";

import { useMemo, useReducer } from "react";
import { AfterActionReport } from "@/components/AfterActionReport";
import { LandingPage } from "@/components/LandingPage";
import { ScenarioBriefing } from "@/components/ScenarioBriefing";
import { SimulationView } from "@/components/SimulationView";
import { PRODUCT_NAME } from "@/lib/simulation/copy";
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
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_#152238,_#070b14_52%)]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="border-b border-line/80 bg-navy-900/80">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <p className="font-semibold tracking-tight">{PRODUCT_NAME}</p>
          <p className="font-mono text-xs text-muted">
            {scenario.organisation.fictionalLabel}
          </p>
        </div>
      </div>

      {state.screen === "landing" ? (
        <LandingPage
          estimatedDuration={scenario.estimatedDuration}
          onStart={() => dispatch({ type: "OPEN_BRIEFING" })}
        />
      ) : null}

      {state.screen === "briefing" ? (
        <ScenarioBriefing
          scenario={scenario}
          onBegin={() => dispatch({ type: "BEGIN_INCIDENT" })}
          onBack={() => dispatch({ type: "RETURN_HOME" })}
        />
      ) : null}

      {state.screen === "simulation" ? (
        <SimulationView
          scenario={scenario}
          stage={requireStage(scenario, state.currentStageIndex)}
          stageNumber={state.currentStageIndex + 1}
          selectedOptionId={state.selectedOptionId}
          decisions={state.decisions}
          onSelect={(optionId) => dispatch({ type: "SELECT_OPTION", optionId })}
          onConfirm={() => dispatch({ type: "CONFIRM_DECISION" })}
        />
      ) : null}

      {state.screen === "report" && report ? (
        <AfterActionReport
          scenario={scenario}
          report={report}
          decisions={state.decisions}
          onRestart={() => dispatch({ type: "RESTART" })}
          onHome={() => dispatch({ type: "RETURN_HOME" })}
        />
      ) : null}
    </div>
  );
}
