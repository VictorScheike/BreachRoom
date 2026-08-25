import { STAGE_COUNT, scenario } from "./scenario";
import { findOptionInStage, requireStage } from "./lookups";
import type { SimulationState } from "./types";

export type SimulationAction =
  | { type: "BEGIN_INCIDENT" }
  | { type: "SELECT_OPTION"; optionId: string }
  | { type: "CONFIRM_DECISION" }
  | { type: "REACH_EXIT" }
  | { type: "RESTART" };

export function createInitialState(): SimulationState {
  return {
    screen: "briefing",
    currentStageIndex: 0,
    selectedOptionId: null,
    decisions: [],
  };
}

function beginSimulation(): SimulationState {
  return {
    screen: "simulation",
    currentStageIndex: 0,
    selectedOptionId: null,
    decisions: [],
  };
}

export function canConfirmDecision(state: SimulationState): boolean {
  return state.screen === "simulation" && state.selectedOptionId !== null;
}

export function simulationReducer(
  state: SimulationState,
  action: SimulationAction,
): SimulationState {
  switch (action.type) {
    case "BEGIN_INCIDENT":
      return beginSimulation();
    case "SELECT_OPTION": {
      if (state.screen !== "simulation") {
        return state;
      }
      const stage = requireStage(scenario, state.currentStageIndex);
      findOptionInStage(stage, action.optionId);
      return {
        ...state,
        selectedOptionId: action.optionId,
      };
    }
    case "CONFIRM_DECISION": {
      if (!canConfirmDecision(state) || state.selectedOptionId === null) {
        return state;
      }

      const stage = requireStage(scenario, state.currentStageIndex);
      findOptionInStage(stage, state.selectedOptionId);

      const decisions = [
        ...state.decisions,
        {
          stageId: stage.id,
          optionId: state.selectedOptionId,
        },
      ];

      if (decisions.length >= STAGE_COUNT) {
        return {
          screen: "simulation",
          currentStageIndex: state.currentStageIndex,
          selectedOptionId: null,
          decisions,
        };
      }

      return {
        screen: "simulation",
        currentStageIndex: state.currentStageIndex + 1,
        selectedOptionId: null,
        decisions,
      };
    }
    case "REACH_EXIT":
      if (state.decisions.length < STAGE_COUNT) {
        return state;
      }
      return {
        ...state,
        screen: "report",
        selectedOptionId: null,
      };
    case "RESTART":
      return createInitialState();
    default: {
      const unhandled: never = action;
      return unhandled;
    }
  }
}
