import { describe, expect, it } from "vitest";
import { isCorrectAnswer } from "@/lib/game/answers";
import {
  closedMapAccess,
  findPath,
  floodWalkable,
  playAccess,
  tileKey,
  tryMove,
} from "@/lib/game/world";
import { createInitialGameState, currentQuestion, gameReducer } from "@/lib/game/engine";
import { ALL_MAPS, worldForMission } from "@/lib/game/maps";
import { DOOR_LOCKED_NOTICE_MS, doorsForMap } from "@/lib/game/doors";
import { validateDoorProgression, validateWorld } from "@/lib/game/validateMap";
import { publishedMissions } from "@/lib/missions/catalog";
import { playthroughLength } from "@/lib/missions/types";
import { chooseCorrect, chooseIncorrect, walkToEncounter } from "@/tests/helpers/play";

describe("locked-door progression", () => {
  it("defines themed doors on every walking map and none overlap route markers", () => {
    for (const world of ALL_MAPS) {
      expect(world.doors.length, world.id).toBeGreaterThan(0);
      expect(world.doors).toEqual(doorsForMap(world.id));
      expect(validateDoorProgression(world), world.id).toEqual([]);
    }
  });

  it("keeps the first checkpoint reachable and the rest gated", () => {
    for (const world of ALL_MAPS) {
      const closed = floodWalkable(world, world.start, closedMapAccess());
      expect(closed.has(tileKey(world.checkpoints[0]!))).toBe(true);
      expect(closed.has(tileKey(world.destination))).toBe(false);
      const second = world.checkpoints[1];
      if (second && world.doors.some((door) => door.requiredCheckpointOrder === 1)) {
        expect(closed.has(tileKey(second))).toBe(false);
      }
    }
  });

  it("blocks keyboard movement through a closed door and allows it after a correct answer", () => {
    let state = createInitialGameState();
    state = gameReducer(state, {
      type: "START_DIRECT",
      missionId: "locked-out",
      roleId: null,
      seed: 11,
    });
    state = gameReducer(state, { type: "BEGIN_MISSION" });
    const world = worldForMission("locked-out");
    const door = world.doors[0];
    expect(door).toBeTruthy();
    const closedAccess = playAccess([], 0, world.checkpoints.length);
    const from = { x: door!.blockedTiles[0]!.x - 1, y: door!.blockedTiles[0]!.y };
    expect(tryMove(world, from, "right", closedAccess)).toBeNull();
    state = walkToEncounter(state);
    state = chooseCorrect(state);
    expect(state.openDoorIds).toContain(door!.id);
    expect(state.unlockedCheckpointOrders).toEqual([1]);
    const openAccess = playAccess(state.openDoorIds, 1, world.checkpoints.length);
    expect(tryMove(world, from, "right", openAccess)).not.toBeNull();
  });

  it("records the first incorrect answer, keeps the door closed, and retries the same question", () => {
    let state = createInitialGameState();
    state = gameReducer(state, {
      type: "START_DIRECT",
      missionId: "ai-forge",
      roleId: null,
      seed: 7,
    });
    state = gameReducer(state, { type: "BEGIN_MISSION" });
    state = walkToEncounter(state);
    const question = currentQuestion(state);
    expect(question).toBeTruthy();
    state = chooseIncorrect(state);
    expect(state.screen).toBe("consequence");
    expect(state.openDoorIds).toEqual([]);
    expect(state.unlockedCheckpointOrders).toEqual([]);
    expect(state.choices).toHaveLength(1);
    expect(isCorrectAnswer(question!, state.choices[0]!.optionId)).toBe(false);
    state = gameReducer(state, { type: "RETRY_QUESTION" });
    expect(state.screen).toBe("encounter");
    expect(currentQuestion(state)?.id).toBe(question?.id);
    state = chooseCorrect(state);
    expect(state.screen).toBe("exploring");
    expect(state.openDoorIds).toHaveLength(1);
    expect(state.choices).toHaveLength(1);
    expect(isCorrectAnswer(question!, state.choices[0]!.optionId)).toBe(false);
    expect(state.lastFeedback?.doorMessage).toContain("security door unlocked");
  });

  it("does not pathfind through a closed door", () => {
    const world = worldForMission("inbox-under-siege");
    const path = findPath(
      world,
      world.start,
      world.destination,
      closedMapAccess(),
    );
    expect(path).toBeNull();
    const open = playAccess(
      world.doors.map((door) => door.id),
      world.checkpoints.length,
      world.checkpoints.length,
    );
    expect(findPath(world, world.start, world.destination, open)).not.toBeNull();
  });

  it("closes every door again when a mission is replayed", () => {
    let state = createInitialGameState();
    state = gameReducer(state, {
      type: "START_DIRECT",
      missionId: "dependency-depths",
      roleId: "developer",
      seed: 5,
    });
    state = gameReducer(state, { type: "BEGIN_MISSION" });
    state = walkToEncounter(state);
    state = chooseCorrect(state);
    expect(state.openDoorIds.length).toBeGreaterThan(0);
    state = gameReducer(state, { type: "REPLAY_MISSION" });
    expect(state.openDoorIds).toEqual([]);
    expect(state.unlockedCheckpointOrders).toEqual([]);
    expect(state.choices).toEqual([]);
  });

  it("keeps the locked-door notice visible for at least five seconds", () => {
    expect(DOOR_LOCKED_NOTICE_MS).toBeGreaterThanOrEqual(5000);
  });

  it("opens an unfinished report when the mission is ended early", () => {
    let state = createInitialGameState();
    state = gameReducer(state, {
      type: "START_DIRECT",
      missionId: "locked-out",
      roleId: null,
      seed: 11,
    });
    state = gameReducer(state, { type: "BEGIN_MISSION" });
    state = gameReducer(state, { type: "END_EARLY" });
    expect(state.screen).toBe("report");
    expect(state.endedEarly).toBe(true);
  });

  it("validates published maps including gated reachability", () => {
    for (const mission of publishedMissions()) {
      const world = worldForMission(mission.id);
      expect(validateWorld(world, playthroughLength(mission)).issues).toEqual([]);
    }
  });
});
