import { correctOptionIdFor } from "@/lib/game/answers";
import { currentQuestion, gameReducer, type GameState } from "@/lib/game/engine";
import type { MoveDirection } from "@/lib/game/world";

export function chooseCorrect(state: GameState): GameState {
  const question = currentQuestion(state);
  const optionId = question ? correctOptionIdFor(question) : null;
  if (!question || !optionId) {
    throw new Error("No correct option to choose");
  }
  return gameReducer(state, {
    type: "CHOOSE_OPTION",
    optionId,
    displayLetter: "A",
  });
}

export function chooseIncorrect(state: GameState): GameState {
  const question = currentQuestion(state);
  const option = question?.options.find((item) => item.id !== correctOptionIdFor(question));
  if (!question || !option) {
    throw new Error("No incorrect option to choose");
  }
  return gameReducer(state, {
    type: "CHOOSE_OPTION",
    optionId: option.id,
    displayLetter: "B",
  });
}

export function walkToEncounter(start: GameState): GameState {
  const dirs: MoveDirection[] = ["right", "up", "down", "left"];
  const seen = new Set<string>();
  const queue: GameState[] = [start];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    if (current.screen === "encounter") {
      return current;
    }
    const key = `${current.position.x},${current.position.y},${current.unlockedCheckpointOrders.join("-")}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    for (const direction of dirs) {
      const next = gameReducer(current, { type: "MOVE", direction });
      if (
        next.screen !== current.screen ||
        next.position.x !== current.position.x ||
        next.position.y !== current.position.y
      ) {
        queue.push(next);
      }
    }
    if (seen.size > 4000) {
      break;
    }
  }
  throw new Error(`Could not reach an encounter on ${start.missionId}`);
}
