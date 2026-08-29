import { worldForMission } from "@/lib/game/maps";
import {
  encounterForTile,
  pointsEqual,
  tryMove,
  type GridPoint,
  type MoveDirection,
  type WorldMap,
} from "@/lib/game/world";
import { requireMission } from "@/lib/missions/catalog";
import { preparePlaythrough, type PreparedPlaythrough } from "@/lib/missions/playthrough";
import { scorePlaythrough, type PlayScore } from "@/lib/missions/scoring";
import {
  type AnswerQuality,
  type MissionId,
  type Question,
  type RecordedChoice,
  type RoleId,
} from "@/lib/missions/types";
import type { TrainingConfig } from "@/lib/training/config";
import { hashSeed } from "@/lib/training/config";
import { questionsFromConfig } from "@/lib/training/deck";
import { technologyLabel } from "@/lib/training/ids";
import { isMovementLocked } from "@/lib/game/player";

export type GameScreen =
  | "missionSelection"
  | "roleSelect"
  | "briefing"
  | "exploring"
  | "encounter"
  | "consequence"
  | "finalEncounter"
  | "report";

export interface GameState {
  screen: GameScreen;
  missionId: MissionId | null;
  seed: number;
  roleId: RoleId | null;
  playthrough: PreparedPlaythrough | null;
  choices: RecordedChoice[];
  selectedOptionId: string | null;
  position: GridPoint;
  lastEncounterTile: GridPoint | null;
  lastFeedback: {
    title: string;
    consequence: string;
    quality: AnswerQuality;
    verdictLabel?: string;
    guidance?: string;
    framework?: string;
    technology?: string;
  } | null;
  muted: boolean;
  trainingConfig: TrainingConfig | null;
  endedEarly: boolean;
}

export type GameAction =
  | { type: "SELECT_MISSION"; missionId: MissionId; seed: number }
  | { type: "CONFIRM_ROLE"; roleId: RoleId | null }
  | { type: "START_DIRECT"; missionId: MissionId; roleId: RoleId | null; seed: number }
  | { type: "START_TRAINING"; config: TrainingConfig }
  | { type: "BEGIN_MISSION" }
  | { type: "MOVE"; direction: MoveDirection }
  | { type: "CHOOSE_OPTION"; optionId: string; displayLetter: "A" | "B" | "C" }
  | { type: "CONTINUE_JOURNEY" }
  | { type: "OPEN_REPORT" }
  | { type: "REPLAY_MISSION" }
  | { type: "NEW_SCENARIO" }
  | { type: "CHOOSE_ANOTHER_MISSION" }
  | { type: "ABORT_MISSION" }
  | { type: "END_EARLY" }
  | { type: "TOGGLE_MUTE" };

export function createInitialGameState(): GameState {
  return {
    screen: "missionSelection",
    missionId: null,
    seed: 0,
    roleId: null,
    playthrough: null,
    choices: [],
    selectedOptionId: null,
    position: { x: 1, y: 6 },
    lastEncounterTile: null,
    lastFeedback: null,
    muted: false,
    trainingConfig: null,
    endedEarly: false,
  };
}

export function currentWorld(state: GameState): WorldMap | null {
  if (!state.missionId) {
    return null;
  }
  return worldForMission(state.missionId);
}

export function currentQuestion(state: GameState): Question | null {
  if (!state.playthrough) {
    return null;
  }
  return state.playthrough.questions[state.choices.length] ?? null;
}

export function currentScore(state: GameState): PlayScore | null {
  if (!state.missionId || !state.playthrough) {
    return null;
  }
  const mission = requireMission(state.missionId);
  return scorePlaythrough(
    { ...mission, questions: state.playthrough.questions },
    state.choices,
  );
}

function startMission(
  missionId: MissionId,
  seed: number,
  roleId: RoleId | null,
  muted: boolean,
  trainingConfig: TrainingConfig | null = null,
): GameState {
  const mission = requireMission(missionId);
  const playthrough = preparePlaythrough(mission, seed, {
    roleId,
    questionIds: trainingConfig?.questionIds,
    questions: trainingConfig ? questionsFromConfig(trainingConfig) : undefined,
  });
  const world = worldForMission(missionId);
  return {
    screen: "briefing",
    missionId,
    seed,
    roleId,
    playthrough,
    choices: [],
    selectedOptionId: null,
    position: world.start,
    lastEncounterTile: null,
    lastFeedback: null,
    muted,
    trainingConfig,
    endedEarly: false,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_MISSION": {
      const mission = requireMission(action.missionId);
      if (mission.requiresRoleSelection === false) {
        return startMission(action.missionId, action.seed, null, state.muted, null);
      }
      return {
        ...state,
        screen: "roleSelect",
        missionId: action.missionId,
        seed: action.seed,
        roleId: null,
        playthrough: null,
        choices: [],
        selectedOptionId: null,
        lastEncounterTile: null,
        lastFeedback: null,
        trainingConfig: null,
        endedEarly: false,
      };
    }
    case "START_DIRECT":
      return startMission(action.missionId, action.seed, action.roleId, state.muted, null);
    case "START_TRAINING":
      return startMission(
        action.config.mapId,
        hashSeed(action.config.seed),
        action.config.specificRole ?? null,
        state.muted,
        action.config,
      );
    case "CONFIRM_ROLE":
      if (state.screen !== "roleSelect" || !state.missionId) {
        return state;
      }
      return startMission(state.missionId, state.seed, action.roleId, state.muted, null);
    case "ABORT_MISSION":
      return { ...createInitialGameState(), muted: state.muted };
    case "BEGIN_MISSION":
      if (state.screen !== "briefing") {
        return state;
      }
      return { ...state, screen: "exploring" };
    case "MOVE": {
      if (isMovementLocked(state.screen) || !state.missionId || !state.playthrough) {
        return state;
      }
      const world = worldForMission(state.missionId);
      const next = tryMove(world, state.position, action.direction);
      if (!next) {
        return state;
      }
      if (pointsEqual(next, world.destination) && state.choices.length >= state.playthrough.questions.length) {
        return {
          ...state,
          position: next,
          screen: "finalEncounter",
        };
      }
      const checkpoint = encounterForTile(world, next, state.choices.length);
      if (checkpoint !== null) {
        return {
          ...state,
          position: next,
          lastEncounterTile: next,
          screen: "encounter",
          selectedOptionId: null,
        };
      }
      return { ...state, position: next };
    }
    case "CHOOSE_OPTION": {
      if (state.screen !== "encounter" || !state.playthrough) {
        return state;
      }
      const question = currentQuestion(state);
      if (!question) {
        return state;
      }
      const chosen = question.options.find((item) => item.id === action.optionId);
      if (!chosen) {
        return state;
      }
      return {
        ...state,
        selectedOptionId: action.optionId,
        choices: [
          ...state.choices,
          {
            questionId: question.id,
            optionId: action.optionId,
            displayLetter: action.displayLetter,
          },
        ],
        lastFeedback: {
          title: chosen.title,
          consequence: question.questionConsequence ?? chosen.consequence,
          quality: chosen.quality,
          verdictLabel:
            question.correctOptionId
              ? chosen.id === question.correctOptionId
                ? "Correct"
                : "Not quite"
              : undefined,
          guidance: question.guidance,
          framework: question.frameworks[0],
          technology: question.technologyTags?.[0]
            ? technologyLabel(question.technologyTags[0])
            : undefined,
        },
        screen: "exploring",
      };
    }
    case "CONTINUE_JOURNEY":
      if (state.screen !== "consequence" && state.screen !== "exploring") {
        return state;
      }
      return {
        ...state,
        screen: "exploring",
        selectedOptionId: null,
      };
    case "OPEN_REPORT":
      if (state.screen !== "finalEncounter" || !state.playthrough) {
        return state;
      }
      if (state.choices.length < state.playthrough.questions.length) {
        return state;
      }
      return { ...state, screen: "report", endedEarly: false };
    case "END_EARLY":
      if (!state.playthrough) {
        return state;
      }
      return { ...state, screen: "report", endedEarly: true };
    case "REPLAY_MISSION":
      if (!state.missionId) {
        return createInitialGameState();
      }
      return {
        ...startMission(
          state.missionId,
          state.seed + 1,
          state.roleId,
          state.muted,
          state.trainingConfig
            ? { ...state.trainingConfig, seed: `${state.trainingConfig.seed}-replay` }
            : null,
        ),
        muted: state.muted,
      };
    case "NEW_SCENARIO":
      if (!state.missionId) {
        return createInitialGameState();
      }
      return {
        ...startMission(
          state.missionId,
          (state.seed + 17) >>> 0,
          state.roleId,
          state.muted,
          state.trainingConfig,
        ),
        muted: state.muted,
      };
    case "CHOOSE_ANOTHER_MISSION":
      return { ...createInitialGameState(), muted: state.muted };
    case "TOGGLE_MUTE":
      return { ...state, muted: !state.muted };
    default: {
      const unhandled: never = action;
      return unhandled;
    }
  }
}
