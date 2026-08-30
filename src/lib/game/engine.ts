import { isCorrectAnswer } from "@/lib/game/answers";
import {
  DOOR_UNLOCK_MESSAGE,
  EXIT_UNLOCK_MESSAGE,
  doorUnlockedByCheckpoint,
  openDoorIdsForUnlocks,
} from "@/lib/game/doors";
import { worldForMission } from "@/lib/game/maps";
import {
  encounterForTile,
  playAccess,
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
    doorMessage?: string;
  } | null;
  muted: boolean;
  trainingConfig: TrainingConfig | null;
  endedEarly: boolean;
  unlockedCheckpointOrders: number[];
  openDoorIds: string[];
}

export type GameAction =
  | { type: "SELECT_MISSION"; missionId: MissionId; seed: number }
  | { type: "CONFIRM_ROLE"; roleId: RoleId | null }
  | { type: "START_DIRECT"; missionId: MissionId; roleId: RoleId | null; seed: number }
  | { type: "START_TRAINING"; config: TrainingConfig }
  | { type: "BEGIN_MISSION" }
  | { type: "MOVE"; direction: MoveDirection }
  | { type: "CHOOSE_OPTION"; optionId: string; displayLetter: "A" | "B" | "C" }
  | { type: "RETRY_QUESTION" }
  | { type: "CONTINUE_JOURNEY" }
  | { type: "OPEN_REPORT" }
  | { type: "REPLAY_MISSION" }
  | { type: "NEW_SCENARIO" }
  | { type: "CHOOSE_ANOTHER_MISSION" }
  | { type: "ABORT_MISSION" }
  | { type: "END_EARLY" }
  | { type: "TOGGLE_MUTE" }
  | { type: "RESTORE_SESSION"; snapshot: GameState };

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
    unlockedCheckpointOrders: [],
    openDoorIds: [],
  };
}

export function currentWorld(state: GameState): WorldMap | null {
  if (!state.missionId) {
    return null;
  }
  return worldForMission(state.missionId);
}

export function currentQuestion(state: GameState): Question | null {
  if (!state.playthrough || !state.missionId) {
    return null;
  }
  const world = worldForMission(state.missionId);
  const nextOrder = world.checkpoints
    .map((_, index) => index + 1)
    .find((order) => !state.unlockedCheckpointOrders.includes(order));
  if (nextOrder === undefined) {
    return null;
  }
  return state.playthrough.questions[nextOrder - 1] ?? null;
}

export function remainingCheckpoints(state: GameState): number {
  if (!state.playthrough) {
    return 0;
  }
  return Math.max(0, state.playthrough.questions.length - state.unlockedCheckpointOrders.length);
}

export function allCheckpointsUnlocked(state: GameState): boolean {
  return remainingCheckpoints(state) === 0 && (state.playthrough?.questions.length ?? 0) > 0;
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
    unlockedCheckpointOrders: [],
    openDoorIds: [],
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
        unlockedCheckpointOrders: [],
        openDoorIds: [],
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
      const access = playAccess(
        state.openDoorIds,
        state.unlockedCheckpointOrders.length,
        state.playthrough.questions.length,
      );
      const next = tryMove(world, state.position, action.direction, access);
      if (!next) {
        return state;
      }
      if (pointsEqual(next, world.destination) && allCheckpointsUnlocked(state)) {
        return {
          ...state,
          position: next,
          screen: "finalEncounter",
        };
      }
      const checkpoint = encounterForTile(world, next, state.unlockedCheckpointOrders);
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
      if (state.screen !== "encounter" || !state.playthrough || !state.missionId) {
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
      const alreadyRecorded = state.choices.some((choice) => choice.questionId === question.id);
      const choices = alreadyRecorded
        ? state.choices
        : [
            ...state.choices,
            {
              questionId: question.id,
              optionId: action.optionId,
              displayLetter: action.displayLetter,
            },
          ];
      const correct = isCorrectAnswer(question, action.optionId);
      const world = worldForMission(state.missionId);
      const currentOrder =
        world.checkpoints
          .map((_, index) => index + 1)
          .find((order) => !state.unlockedCheckpointOrders.includes(order)) ?? null;
      const lastFeedback = {
        title: chosen.title,
        consequence: question.questionConsequence ?? chosen.consequence,
        quality: chosen.quality,
        verdictLabel: correct ? "Correct" : "Not the safest action",
        guidance: question.guidance,
        framework: question.frameworks[0],
        technology: question.technologyTags?.[0]
          ? technologyLabel(question.technologyTags[0])
          : undefined,
        doorMessage: undefined as string | undefined,
      };
      if (!correct) {
        return {
          ...state,
          selectedOptionId: action.optionId,
          choices,
          lastFeedback,
          screen: "consequence",
        };
      }
      const unlockedCheckpointOrders =
        currentOrder !== null && !state.unlockedCheckpointOrders.includes(currentOrder)
          ? [...state.unlockedCheckpointOrders, currentOrder]
          : state.unlockedCheckpointOrders;
      const openDoorIds = openDoorIdsForUnlocks(state.missionId, unlockedCheckpointOrders);
      const newlyOpened = doorUnlockedByCheckpoint(state.missionId, currentOrder ?? 0);
      const allDone = unlockedCheckpointOrders.length >= state.playthrough.questions.length;
      lastFeedback.doorMessage = allDone
        ? EXIT_UNLOCK_MESSAGE
        : newlyOpened
          ? DOOR_UNLOCK_MESSAGE
          : undefined;
      return {
        ...state,
        selectedOptionId: action.optionId,
        choices,
        lastFeedback,
        unlockedCheckpointOrders,
        openDoorIds,
        screen: "exploring",
      };
    }
    case "RETRY_QUESTION":
      if (state.screen !== "consequence") {
        return state;
      }
      return {
        ...state,
        screen: "encounter",
        selectedOptionId: null,
      };
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
      if (!allCheckpointsUnlocked(state)) {
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
    case "RESTORE_SESSION":
      return {
        ...action.snapshot,
        muted: state.muted,
      };
    default: {
      const unhandled: never = action;
      return unhandled;
    }
  }
}
