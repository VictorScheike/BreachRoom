import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GameView } from "@/components/game/GameView";
import { MissionPlayer } from "@/components/game/MissionPlayer";
import {
  createInitialGameState,
  currentQuestion,
  gameReducer,
  type GameState,
} from "@/lib/game/engine";
import { worldForMission } from "@/lib/game/maps";
import {
  acceptsMovementInput,
  isMissionMapVisible,
  isMovementLocked,
  movementFromControl,
} from "@/lib/game/player";
import type { MissionId } from "@/lib/missions/types";
import type { MoveDirection } from "@/lib/game/world";

const MISSIONS: readonly MissionId[] = [
  "locked-out",
  "ai-forge",
  "dependency-depths",
  "inbox-under-siege",
  "northstar-zero-hour",
];

const noop = () => undefined;

function renderGame(state: GameState): string {
  return renderToStaticMarkup(
    <GameView
      state={state}
      onBegin={noop}
      onMove={noop}
      onChoose={noop}
      onContinue={noop}
      onOpenReport={noop}
      onToggleMute={noop}
      onChooseAnother={noop}
      onEndEarly={noop}
    />,
  );
}

function playerMatches(html: string): RegExpMatchArray | null {
  return html.match(/data-testid="mission-player"/g);
}

function beginExploring(missionId: MissionId, seed = 11): GameState {
  let state = createInitialGameState();
  state = gameReducer(state, {
    type: "START_DIRECT",
    missionId,
    roleId: null,
    seed,
  });
  return gameReducer(state, { type: "BEGIN_MISSION" });
}

function walkToEncounter(start: GameState): GameState {
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
    const key = `${current.position.x},${current.position.y},${current.choices.length}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    for (const direction of dirs) {
      const next = gameReducer(current, { type: "MOVE", direction });
      if (next.screen !== current.screen || next.position.x !== current.position.x || next.position.y !== current.position.y) {
        queue.push(next);
      }
    }
    if (seen.size > 500) {
      break;
    }
  }
  throw new Error(`Could not reach an encounter on ${start.missionId}`);
}

function answerFirstOption(state: GameState): GameState {
  const question = currentQuestion(state);
  const option = question?.options[0];
  if (!option) {
    throw new Error("No option to choose");
  }
  return gameReducer(state, {
    type: "CHOOSE_OPTION",
    optionId: option.id,
    displayLetter: "A",
  });
}

describe("player stays visible during decisions", () => {
  it("does not remove the player element when a decision opens", () => {
    const encounter = walkToEncounter(beginExploring("locked-out"));
    expect(encounter.screen).toBe("encounter");
    const html = renderGame(encounter);
    expect(playerMatches(html)).toHaveLength(1);
    expect(html).toContain('data-decision-indicator="true"');
    expect(html).toContain('data-paused="true"');
  });

  it("keeps player coordinates unchanged while a decision is open", () => {
    const encounter = walkToEncounter(beginExploring("inbox-under-siege"));
    const blocked = gameReducer(encounter, { type: "MOVE", direction: "up" });
    expect(blocked.position).toEqual(encounter.position);
    expect(blocked.screen).toBe("encounter");
    expect(blocked.lastEncounterTile).toEqual(encounter.position);
  });

  it("ignores movement input while answering", () => {
    const encounter = walkToEncounter(beginExploring("ai-forge"));
    expect(isMovementLocked(encounter.screen)).toBe(true);
    expect(acceptsMovementInput(encounter.screen)).toBe(false);
    expect(movementFromControl(encounter.screen, "keyboard", "ArrowRight")).toBeNull();
    expect(movementFromControl(encounter.screen, "touch", "right")).toBeNull();
    const after = gameReducer(encounter, { type: "MOVE", direction: "right" });
    expect(after).toEqual(encounter);
  });

  it("keeps the player visible during consequence feedback", () => {
    const encounter = walkToEncounter(beginExploring("dependency-depths"));
    const consequence = answerFirstOption(encounter);
    expect(consequence.screen).toBe("consequence");
    expect(consequence.position).toEqual(encounter.position);
    const html = renderGame(consequence);
    expect(playerMatches(html)).toHaveLength(1);
    expect(html).toContain('data-paused="true"');
    expect(movementFromControl(consequence.screen, "keyboard", "w")).toBeNull();
  });

  it("unlocks movement only after continue", () => {
    const encounter = walkToEncounter(beginExploring("locked-out"));
    const consequence = answerFirstOption(encounter);
    const exploring = gameReducer(consequence, { type: "CONTINUE_JOURNEY" });
    expect(exploring.screen).toBe("exploring");
    expect(exploring.position).toEqual(encounter.position);
    expect(acceptsMovementInput(exploring.screen)).toBe(true);
    expect(movementFromControl(exploring.screen, "keyboard", "ArrowLeft")).toBe("left");
    expect(movementFromControl(exploring.screen, "touch", "down")).toBe("down");
    const moved = ["up", "down", "left", "right"].some((direction) => {
      const next = gameReducer(exploring, { type: "MOVE", direction: direction as MoveDirection });
      return next.position.x !== exploring.position.x || next.position.y !== exploring.position.y || next.screen !== "exploring";
    });
    expect(moved).toBe(true);
  });

  it("does not duplicate the player sprite across several decisions", () => {
    let state = beginExploring("inbox-under-siege", 21);
    for (let index = 0; index < 3; index += 1) {
      state = walkToEncounter(state);
      const html = renderGame(state);
      expect(playerMatches(html)).toHaveLength(1);
      state = answerFirstOption(state);
      expect(playerMatches(renderGame(state))).toHaveLength(1);
      state = gameReducer(state, { type: "CONTINUE_JOURNEY" });
    }
  });

  it("keeps the character visible on every existing map", () => {
    for (const missionId of MISSIONS) {
      const briefing = gameReducer(createInitialGameState(), {
        type: "START_DIRECT",
        missionId,
        roleId: null,
        seed: 3,
      });
      expect(isMissionMapVisible(briefing.screen)).toBe(true);
      expect(playerMatches(renderGame(briefing))).toHaveLength(1);
      const exploring = gameReducer(briefing, { type: "BEGIN_MISSION" });
      expect(playerMatches(renderGame(exploring))).toHaveLength(1);
      const encounter = walkToEncounter(exploring);
      expect(playerMatches(renderGame(encounter))).toHaveLength(1);
      expect(worldForMission(missionId).id).toBe(missionId);
    }
  });

  it("applies the same movement lock to keyboard and touch controls", () => {
    expect(movementFromControl("exploring", "keyboard", "ArrowUp")).toBe("up");
    expect(movementFromControl("exploring", "touch", "up")).toBe("up");
    expect(movementFromControl("encounter", "keyboard", "ArrowUp")).toBeNull();
    expect(movementFromControl("encounter", "touch", "up")).toBeNull();
    expect(movementFromControl("consequence", "keyboard", "s")).toBeNull();
    expect(movementFromControl("consequence", "touch", "down")).toBeNull();
    const markup = renderToStaticMarkup(
      <MissionPlayer
        position={{ x: 2, y: 3 }}
        direction="right"
        paused
        showDecisionIndicator
        columns={12}
        rows={8}
      />,
    );
    expect(markup).toContain('data-player-x="2"');
    expect(markup).toContain('data-player-y="3"');
    expect(markup.split("player-sprite").length - 1).toBe(1);
  });

  it("keeps the briefing above the map and the live shell in document flow", () => {
    let state = createInitialGameState();
    state = gameReducer(state, {
      type: "START_DIRECT",
      missionId: "locked-out",
      roleId: null,
      seed: 4,
    });
    const html = renderGame(state);
    expect(html).toContain("Mission perspective");
    expect(html).toContain("decision-dock-briefing");
    expect(html).toContain("Begin incident response");
    expect(html.indexOf("decision-dock-briefing")).toBeLessThan(html.indexOf("game-map"));
  });
});
