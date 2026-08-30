"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DecisionDock } from "@/components/game/DecisionDock";
import { DestinationMarker } from "@/components/game/DestinationMarker";
import { MapDoor } from "@/components/game/MapDoor";
import { MissionPlayer } from "@/components/game/MissionPlayer";
import { MapLegend } from "@/components/game/MapLegend";
import { MissionRoleBadge } from "@/components/game/MissionRoleBadge";
import {
  allCheckpointsUnlocked,
  currentQuestion,
  currentScore,
  currentWorld,
  remainingCheckpoints,
  type GameState,
} from "@/lib/game/engine";
import {
  CHECKPOINT_HINT,
  DOOR_LOCKED_BUMP,
  coordsEqual,
  type DoorSpec,
} from "@/lib/game/doors";
import {
  acceptsMovementInput,
  hasActiveDecision,
  isMissionMapVisible,
  isMovementLocked,
  movementFromControl,
} from "@/lib/game/player";
import { playTone } from "@/lib/game/sound";
import {
  firstClosedDoorOnApproach,
  findPath,
  manhattan,
  playAccess,
  stepFrom,
  tileKey,
  tryMove,
  type MoveDirection,
} from "@/lib/game/world";
import {
  adjacentMove,
  initialRouteHint,
  isCheckpointTile,
  isCompletedCheckpoint,
} from "@/lib/game/walkability";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { requireMission } from "@/lib/missions/catalog";
import { perspectiveFromState } from "@/lib/game/perspective";
import { trainingIntro, trainingObjective } from "@/lib/training/briefing";
import type { AnswerOption } from "@/lib/missions/types";

const DIRECTION_KEYS: Record<string, true> = {
  ArrowUp: true,
  ArrowDown: true,
  ArrowLeft: true,
  ArrowRight: true,
  w: true,
  s: true,
  a: true,
  d: true,
  W: true,
  S: true,
  A: true,
  D: true,
};

interface GameViewProps {
  state: GameState;
  onBegin: () => void;
  onMove: (direction: MoveDirection) => void;
  onChoose: (optionId: string, letter: "A" | "B" | "C") => void;
  onContinue: () => void;
  onRetry: () => void;
  onOpenReport: () => void;
  onToggleMute: () => void;
  onChooseAnother: () => void;
  onEndEarly: () => void;
}

function orderedOptions(
  questionId: string,
  options: readonly AnswerOption[],
  optionOrder: Record<string, readonly string[]>,
): AnswerOption[] {
  const order = optionOrder[questionId];
  if (!order) {
    return [...options];
  }
  return order.flatMap((id) => {
    const option = options.find((item) => item.id === id);
    return option ? [option] : [];
  });
}

export function GameView({
  state,
  onBegin,
  onMove,
  onChoose,
  onRetry,
  onOpenReport,
  onToggleMute,
  onChooseAnother,
  onEndEarly,
}: GameViewProps) {
  const [facing, setFacing] = useState<MoveDirection>("right");
  const [endConfirm, setEndConfirm] = useState(false);
  const [walking, setWalking] = useState(false);
  const [bumpKey, setBumpKey] = useState<string | null>(null);
  const [showMoveHint, setShowMoveHint] = useState(true);
  const [showRouteHint, setShowRouteHint] = useState(true);
  const [toastHiddenFor, setToastHiddenFor] = useState<string | null>(null);
  const [doorNotice, setDoorNotice] = useState<string | null>(null);
  const [openingDoorId, setOpeningDoorId] = useState<string | null>(null);
  const [routeRevealKeys, setRouteRevealKeys] = useState<string[]>([]);
  const prevOpenDoors = useRef<string[]>([]);
  const walkTimeout = useRef<number | null>(null);
  const bumpTimeout = useRef<number | null>(null);
  const toastTimeout = useRef<number | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swipeHandledRef = useRef(false);
  const reducedMotion = usePrefersReducedMotion();
  const world = currentWorld(state);
  const mission = state.missionId ? requireMission(state.missionId) : null;
  const question = currentQuestion(state);
  const score = currentScore(state);
  const movementLocked = isMovementLocked(state.screen);
  const showPlayer = isMissionMapVisible(state.screen);

  const displayed = useMemo(() => {
    if (!question || !state.playthrough) {
      return [];
    }
    return orderedOptions(question.id, question.options, state.playthrough.optionOrder);
  }, [question, state.playthrough]);

  const glitch = score
    ? Math.max(
        0,
        1 - (score.dimensions[0]?.percent ?? 50) / 100,
      )
    : 0.45;

  const hintTiles = useMemo(() => (world ? initialRouteHint(world) : []), [world]);
  const hintIndex = useMemo(() => {
    const lookup = new Map<string, number>();
    hintTiles.forEach((point, index) => {
      lookup.set(tileKey(point), index);
    });
    return lookup;
  }, [hintTiles]);

  const access = useMemo(
    () =>
      playAccess(
        state.openDoorIds,
        state.unlockedCheckpointOrders.length,
        state.playthrough?.questions.length ?? 0,
      ),
    [state.openDoorIds, state.playthrough?.questions.length, state.unlockedCheckpointOrders.length],
  );

  const doorsByTile = useMemo(() => {
    const lookup = new Map<string, DoorSpec>();
    if (!world) {
      return lookup;
    }
    for (const door of world.doors) {
      for (const point of door.blockedTiles) {
        lookup.set(tileKey(point), door);
      }
    }
    return lookup;
  }, [world]);

  const bumpTile = useCallback(
    (key: string, door: DoorSpec | null) => {
      setBumpKey(key);
      if (bumpTimeout.current !== null) {
        window.clearTimeout(bumpTimeout.current);
      }
      bumpTimeout.current = window.setTimeout(() => setBumpKey(null), 320);
      if (door) {
        setDoorNotice(DOOR_LOCKED_BUMP);
        window.setTimeout(() => setDoorNotice(null), 2200);
      }
      playTone(state.muted || reducedMotion, 110, 90);
    },
    [reducedMotion, state.muted],
  );

  const move = useCallback(
    (direction: MoveDirection, source: "keyboard" | "touch" = "touch") => {
      if (!acceptsMovementInput(state.screen) || !movementFromControl(state.screen, source, direction)) {
        return;
      }
      setFacing(direction);
      if (!world) {
        onMove(direction);
        return;
      }
      const next = tryMove(world, state.position, direction, access);
      if (!next) {
        const blocked = stepFrom(state.position, direction);
        bumpTile(tileKey(blocked), doorsByTile.get(tileKey(blocked)) ?? null);
        return;
      }
      setShowMoveHint(false);
      setShowRouteHint(false);
      setDoorNotice(null);
      setWalking(true);
      if (walkTimeout.current !== null) {
        window.clearTimeout(walkTimeout.current);
      }
      walkTimeout.current = window.setTimeout(() => setWalking(false), 140);
      onMove(direction);
    },
    [access, bumpTile, doorsByTile, onMove, state.position, state.screen, world],
  );

  const onMapTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }
    swipeStart.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onMapTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const start = swipeStart.current;
      const touch = event.changedTouches[0];
      swipeStart.current = null;
      if (!start || !touch) {
        return;
      }
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 36) {
        return;
      }
      swipeHandledRef.current = true;
      window.setTimeout(() => {
        swipeHandledRef.current = false;
      }, 400);
      if (Math.abs(dx) > Math.abs(dy)) {
        move(dx > 0 ? "right" : "left", "touch");
      } else {
        move(dy > 0 ? "down" : "up", "touch");
      }
    },
    [move],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = movementFromControl(state.screen, "keyboard", event.key);
      if (!direction || !DIRECTION_KEYS[event.key]) {
        return;
      }
      event.preventDefault();
      move(direction);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (walkTimeout.current !== null) {
        window.clearTimeout(walkTimeout.current);
      }
        if (bumpTimeout.current !== null) {
          window.clearTimeout(bumpTimeout.current);
        }
        if (toastTimeout.current !== null) {
          window.clearTimeout(toastTimeout.current);
        }
      };
    }, [move, state.screen]);

  useEffect(() => {
    if (state.screen !== "exploring" || reducedMotion) {
      return undefined;
    }
    const timeout = window.setTimeout(() => setShowRouteHint(false), 3200);
    return () => window.clearTimeout(timeout);
  }, [reducedMotion, state.missionId, state.screen]);

  useEffect(() => {
    const previous = new Set(prevOpenDoors.current);
    const newlyOpened = state.openDoorIds.find((id) => !previous.has(id)) ?? null;
    prevOpenDoors.current = state.openDoorIds;
    if (!newlyOpened || !world) {
      return undefined;
    }
    setOpeningDoorId(newlyOpened);
    const door = world.doors.find((item) => item.id === newlyOpened);
    setRouteRevealKeys(door ? door.blockedTiles.map((point) => tileKey(point)) : []);
    const timeout = window.setTimeout(() => {
      setOpeningDoorId(null);
      setRouteRevealKeys([]);
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [state.openDoorIds, world]);

  useEffect(() => {
    if (!state.lastFeedback) {
      return undefined;
    }
    const key = `${state.lastFeedback.quality}:${state.lastFeedback.doorMessage ?? ""}:${state.unlockedCheckpointOrders.join(",")}:${state.screen}`;
    if (toastTimeout.current !== null) {
      window.clearTimeout(toastTimeout.current);
    }
    toastTimeout.current = window.setTimeout(() => setToastHiddenFor(key), 4200);
    return () => {
      if (toastTimeout.current !== null) {
        window.clearTimeout(toastTimeout.current);
      }
    };
  }, [state.lastFeedback, state.screen, state.unlockedCheckpointOrders]);

  if (!world || !mission || !state.playthrough) {
    return null;
  }

  const objective = state.trainingConfig
    ? trainingObjective(state.trainingConfig)
    : mission.objective;
  const briefingBody = state.trainingConfig
    ? trainingIntro(state.trainingConfig)
    : `${mission.story} ${state.playthrough.scenarioId ? mission.scenarios.find((item) => item.id === state.playthrough?.scenarioId)?.setup ?? "" : ""}`;
  const total = state.playthrough.questions.length;
  const currentPhase = question
    ? mission.sessionPhases?.find((phase) => phase.id === question.phase)
    : mission.sessionPhases?.[
        Math.min(
          mission.sessionPhases.length - 1,
          Math.floor(Math.max(0, state.choices.length - 1) / 3),
        )
      ];
  const phaseCaption = currentPhase
    ? `Phase ${1 + (mission.sessionPhases?.findIndex((phase) => phase.id === currentPhase.id) ?? 0)}: ${currentPhase.label}`
    : null;
  const letters: ("A" | "B" | "C")[] = ["A", "B", "C"];
  const encounterActive = hasActiveDecision(state.screen);
  const perspective = perspectiveFromState(state, mission);
  const exitUnlocked = allCheckpointsUnlocked(state);
  const unresolved = remainingCheckpoints(state);
  const selectedOption =
    question && state.selectedOptionId
      ? question.options.find((item) => item.id === state.selectedOptionId) ?? null
      : null;
  const sheetOpen =
    state.screen === "briefing" ||
    state.screen === "encounter" ||
    state.screen === "consequence" ||
    state.screen === "finalEncounter";
  const toastKey = state.lastFeedback
    ? `${state.lastFeedback.quality}:${state.lastFeedback.doorMessage ?? ""}:${state.unlockedCheckpointOrders.join(",")}:${state.screen}`
    : "";
  const doorProgress = `${state.openDoorIds.length} of ${world.doors.length}`;

  let dock = (
    <DecisionDock
      mode="explore"
      decisionNumber={state.unlockedCheckpointOrders.length}
      total={total}
      title={objective}
      body={`${CHECKPOINT_HINT} Yellow ? markers are questions. Checkpoints trigger the next decision automatically.`}
    />
  );

  if (state.screen === "briefing") {
    dock = (
      <DecisionDock
        mode="briefing"
        decisionNumber={0}
        total={total}
        title={state.trainingConfig?.title ?? mission.title}
        body={briefingBody}
        npcLine={mission.tagline}
        onBegin={onBegin}
        beginLabel="Begin incident response"
      />
    );
  } else if (state.screen === "encounter" && question) {
    dock = (
      <DecisionDock
        mode="encounter"
        decisionNumber={state.unlockedCheckpointOrders.length + 1}
        total={total}
        title={question.title}
        body={question.situation}
        npcLine={question.npcLine}
        prompt={question.prompt}
        options={displayed}
        letters={letters}
        roleChip={
          perspective.mode === "role"
            ? `ROLE · ${perspective.chipLabel.toUpperCase()}`
            : perspective.mode === "general"
              ? "ORGANISATION-WIDE EXERCISE"
              : undefined
        }
        onChoose={(optionId, letter) => {
          playTone(state.muted || reducedMotion, 220, 80);
          onChoose(optionId, letter);
        }}
      />
    );
  } else if (state.screen === "consequence" && question && selectedOption) {
    dock = (
      <DecisionDock
        mode="consequence"
        decisionNumber={state.unlockedCheckpointOrders.length + 1}
        total={total}
        title={question.title}
        body={question.situation}
        selected={selectedOption}
        incorrect
        onRetry={onRetry}
      />
    );
  } else if (state.screen === "finalEncounter") {
    const overall = score?.overall ?? 0;
    dock = (
      <DecisionDock
        mode="final"
        decisionNumber={total}
        total={total}
        title={mission.destination}
        body={
          overall >= 70
            ? "The destination answers to your better decisions. The last light changes. You can enter the report."
            : "You reached the destination. The last light is messy, but the door opens. Time to debrief."
        }
        onOpenReport={onOpenReport}
      />
    );
  }

  return (
    <main id="main-content" className="game-page">
      <div
        className={`game-shell game-shell-live theme-${mission.id}${sheetOpen ? " is-sheet-open" : ""}`}
      >
        <header className="game-hud">
          <p className="game-objective">
            Objective: Reach {world.destinationLabel} · {manhattan(state.position, world.destination)} tiles
          </p>
          <p className="game-progress">
            Decisions: {state.unlockedCheckpointOrders.length} / {total}
            <span className="game-door-progress">Doors unlocked: {doorProgress}</span>
            {phaseCaption ? ` · ${phaseCaption}` : ""}
          </p>
          <ul className="game-status" aria-label="Mission status">
            {(score?.dimensions ?? mission.dimensions.map((dimension) => ({
              id: dimension.id,
              label: dimension.label,
              percent: 0,
              points: 0,
            }))).map((dimension) => (
              <li key={dimension.id}>
                {dimension.label}
                <span>{dimension.percent}</span>
              </li>
            ))}
          </ul>
        </header>

        <div className="game-mission-bar">
          <MissionRoleBadge perspective={perspective} />
          <div className="hud-actions">
            <button
              type="button"
              className="hud-button"
              onClick={onToggleMute}
              aria-pressed={state.muted}
            >
              {state.muted ? "Sound: muted" : "Sound: on"}
            </button>
            <button
              type="button"
              className="hud-button"
              onClick={() => setEndConfirm(true)}
            >
              End mission
            </button>
            <button type="button" className="hud-button" onClick={onChooseAnother}>
              Mission select
            </button>
          </div>
        </div>

        <div className="game-mobile-status">
          <p className="game-mobile-status-objective">{world.destinationLabel}</p>
          <div className="game-mobile-status-meta">
            <span>
              {state.unlockedCheckpointOrders.length}/{total}
            </span>
            <span className="game-door-progress-mobile">Doors {doorProgress}</span>
            <span>{perspective.playingAs}</span>
            <details className="game-mobile-more">
              <summary aria-label="Mission options">…</summary>
              <div className="game-mobile-more-menu">
                <button type="button" onClick={onToggleMute}>
                  {state.muted ? "Sound: muted" : "Sound: on"}
                </button>
                <button type="button" onClick={() => setEndConfirm(true)}>
                  End mission
                </button>
                <button type="button" onClick={onChooseAnother}>
                  Mission select
                </button>
              </div>
            </details>
          </div>
        </div>

        {state.screen === "briefing" ? dock : null}

        <div className="game-stage-column">
          <div className="game-map-frame">
            <div
              className={`game-map ${encounterActive ? "game-map-decision" : ""} ${state.screen === "finalEncounter" ? "map-focus-landmark" : ""} world-${mission.id}`}
              role="application"
              aria-label={`${mission.environment} map`}
              style={{
                ["--glitch" as string]: String(glitch),
                ["--player-x" as string]: String(state.position.x),
                ["--player-y" as string]: String(state.position.y),
                ["--map-cols" as string]: String(world.columns),
                ["--map-rows" as string]: String(world.rows),
                gridTemplateColumns: `repeat(${world.columns}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${world.rows}, minmax(0, 1fr))`,
                aspectRatio: `${world.columns} / ${world.rows}`,
              }}
              onTouchStart={onMapTouchStart}
              onTouchEnd={onMapTouchEnd}
            >
              {world.tiles.flatMap((row, y) =>
                row.map((tile, x) => {
                  const point = { x, y };
                  const key = tileKey(point);
                  const walkable = tile.walkable === true;
                  const highlight =
                    state.lastEncounterTile &&
                    encounterActive &&
                    key === tileKey(state.lastEncounterTile);
                  const landmark = world.landmarkTiles.some(
                    (mark) => mark.x === x && mark.y === y,
                  );
                  const hintStep = hintIndex.get(key);
                  const checkpoint = isCheckpointTile(world, point);
                  const checkpointDone = isCompletedCheckpoint(
                    world,
                    point,
                    state.unlockedCheckpointOrders,
                  );
                  const door = doorsByTile.get(key) ?? null;
                  const doorOpen = door ? state.openDoorIds.includes(door.id) : false;
                  return (
                    <div
                      key={key}
                      className={[
                        "rpg-tile",
                        `rpg-tile-${tile.visual}`,
                        walkable ? "rpg-tile--walkable" : "rpg-tile--blocked",
                        highlight ? "tile-highlight" : "",
                        landmark ? "tile-landmark" : "",
                        checkpoint ? "rpg-tile--checkpoint" : "",
                        checkpointDone ? "rpg-tile--checkpoint-done" : "",
                        tile.isExit ? "rpg-tile--objective" : "",
                        tile.isStart ? "rpg-tile--start" : "",
                        showRouteHint && hintStep !== undefined ? "rpg-tile--hint" : "",
                        bumpKey === key ? "rpg-tile--bump" : "",
                        routeRevealKeys.includes(key) ? "rpg-tile--route-reveal" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      data-tile={tile.type}
                      data-walkable={walkable ? "true" : "false"}
                      data-checkpoint={
                        checkpoint && tile.checkpointOrder
                          ? String(tile.checkpointOrder)
                          : undefined
                      }
                      style={{
                        gridColumn: x + 1,
                        gridRow: y + 1,
                        ...(hintStep !== undefined
                          ? { ["--hint-i" as string]: String(hintStep) }
                          : {}),
                      }}
                      onClick={() => {
                        if (swipeHandledRef.current) {
                          return;
                        }
                        const direction = adjacentMove(state.position, point);
                        if (direction) {
                          move(direction);
                          return;
                        }
                        if (door && !doorOpen) {
                          bumpTile(key, door);
                          return;
                        }
                        const path = findPath(world, state.position, point, access);
                        if (path && path[0]) {
                          const stepDirection = adjacentMove(state.position, path[0]);
                          if (stepDirection) {
                            move(stepDirection);
                          }
                          return;
                        }
                        const blockedDoor = firstClosedDoorOnApproach(
                          world,
                          state.position,
                          point,
                          access,
                        );
                        if (blockedDoor) {
                          bumpTile(tileKey(blockedDoor.anchor), blockedDoor);
                          return;
                        }
                        if (!walkable || (tile.isExit && !exitUnlocked)) {
                          bumpTile(key, null);
                        }
                      }}
                    >
                      {door ? (
                        <MapDoor
                          door={door}
                          open={doorOpen}
                          opening={openingDoorId === door.id}
                          isAnchor={coordsEqual(door.anchor, point)}
                        />
                      ) : null}
                    </div>
                  );
                }),
              )}
              {mission.id === "dependency-depths" ? (
                <div className="torch-veil" aria-hidden="true" />
              ) : null}
              {mission.id === "ai-forge" ? <div className="ember-layer" aria-hidden="true" /> : null}
              <DestinationMarker
                destination={world.destination}
                world={world}
                unlocked={exitUnlocked}
                remainingCheckpoints={unresolved}
              />
              {showPlayer ? (
                <MissionPlayer
                  position={state.position}
                  direction={facing}
                  paused={movementLocked}
                  walking={walking}
                  showDecisionIndicator={hasActiveDecision(state.screen)}
                  columns={world.columns}
                  rows={world.rows}
                />
              ) : null}
            </div>
          </div>
          {showMoveHint ? (
            <p className="map-move-hint">
              Use the arrow keys, WASD, or tap a neighbouring tile to walk the path.
            </p>
          ) : null}
          <MapLegend />
          {doorNotice ? (
            <p className="decision-toast decision-toast-door" role="status">
              {doorNotice}
            </p>
          ) : null}
          {state.lastFeedback &&
          state.screen !== "consequence" &&
          toastHiddenFor !== toastKey ? (
            <p
              className={`decision-toast decision-toast-${state.lastFeedback.quality}`}
              role="status"
            >
              {state.lastFeedback.doorMessage ? (
                <strong>{state.lastFeedback.doorMessage} </strong>
              ) : state.lastFeedback.verdictLabel ? (
                <strong>{state.lastFeedback.verdictLabel}. </strong>
              ) : null}
              {state.lastFeedback.guidance ? `${state.lastFeedback.guidance} ` : null}
              {state.lastFeedback.consequence}
              {state.lastFeedback.framework
                ? ` Educational mapping: ${state.lastFeedback.framework} — not proof of compliance.`
                : ""}
              {state.lastFeedback.technology
                ? ` Technology: ${state.lastFeedback.technology}.`
                : ""}
            </p>
          ) : null}
          {state.screen !== "briefing" ? dock : null}
        </div>

          {endConfirm ? (
            <div className="end-mission-modal" role="dialog" aria-labelledby="end-mission-title">
              <h2 id="end-mission-title">End this mission?</h2>
              <p>You can view an unfinished report. It will not count as a completed mission.</p>
              <button type="button" className="game-primary" onClick={onEndEarly}>
                End and view unfinished report
              </button>
              <button type="button" className="hud-button" onClick={onChooseAnother}>
                Discard and leave
              </button>
              <button type="button" className="hud-button" onClick={() => setEndConfirm(false)}>
                Keep playing
              </button>
            </div>
          ) : null}

        <div className="game-pad" aria-label="Movement pad">
          <span />
          <button
            type="button"
            aria-label="Move up"
            disabled={movementLocked}
            onClick={() => move("up", "touch")}
          >
            <span className="game-pad-icon" aria-hidden="true">
              ▲
            </span>
            <span className="game-pad-label">Up</span>
          </button>
          <span />
          <button
            type="button"
            aria-label="Move left"
            disabled={movementLocked}
            onClick={() => move("left", "touch")}
          >
            <span className="game-pad-icon" aria-hidden="true">
              ◀
            </span>
            <span className="game-pad-label">Left</span>
          </button>
          <button
            type="button"
            aria-label="Move down"
            disabled={movementLocked}
            onClick={() => move("down", "touch")}
          >
            <span className="game-pad-icon" aria-hidden="true">
              ▼
            </span>
            <span className="game-pad-label">Down</span>
          </button>
          <button
            type="button"
            aria-label="Move right"
            disabled={movementLocked}
            onClick={() => move("right", "touch")}
          >
            <span className="game-pad-icon" aria-hidden="true">
              ▶
            </span>
            <span className="game-pad-label">Right</span>
          </button>
        </div>

        <details className="game-mobile-details">
          <summary>Mission details</summary>
          <div className="game-mobile-details-body">
            <MissionRoleBadge perspective={perspective} />
            <p className="game-mobile-details-objective">{objective}</p>
            {phaseCaption ? <p className="game-mobile-details-phase">{phaseCaption}</p> : null}
            <ul className="game-status" aria-label="Mission status">
              {(score?.dimensions ??
                mission.dimensions.map((dimension) => ({
                  id: dimension.id,
                  label: dimension.label,
                  percent: 0,
                  points: 0,
                }))).map((dimension) => (
                <li key={dimension.id}>
                  {dimension.label}
                  <span>{dimension.percent}</span>
                </li>
              ))}
            </ul>
          </div>
        </details>
      </div>
    </main>
  );
}
