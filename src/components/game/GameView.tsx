"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DecisionDock } from "@/components/game/DecisionDock";
import { DestinationMarker } from "@/components/game/DestinationMarker";
import { MissionPlayer } from "@/components/game/MissionPlayer";
import { MissionRoleBadge } from "@/components/game/MissionRoleBadge";
import {
  currentQuestion,
  currentScore,
  currentWorld,
  type GameState,
} from "@/lib/game/engine";
import {
  acceptsMovementInput,
  hasActiveDecision,
  hasDecisionFeedback,
  isMissionMapVisible,
  isMovementLocked,
  movementFromControl,
} from "@/lib/game/player";
import { playTone } from "@/lib/game/sound";
import {
  manhattan,
  tileKey,
  type MoveDirection,
} from "@/lib/game/world";
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
  onContinue,
  onOpenReport,
  onToggleMute,
  onChooseAnother,
  onEndEarly,
}: GameViewProps) {
  const [facing, setFacing] = useState<MoveDirection>("right");
  const [endConfirm, setEndConfirm] = useState(false);
  const [walking, setWalking] = useState(false);
  const walkTimeout = useRef<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const world = currentWorld(state);
  const mission = state.missionId ? requireMission(state.missionId) : null;
  const question = currentQuestion(state);
  const score = currentScore(state);
  const movementLocked = isMovementLocked(state.screen);
  const showPlayer = isMissionMapVisible(state.screen);

  const selected = useMemo(() => {
    const last = state.choices[state.choices.length - 1];
    if (!last || !state.playthrough) {
      return null;
    }
    const asked = state.playthrough.questions.find((item) => item.id === last.questionId);
    return asked?.options.find((item) => item.id === last.optionId) ?? null;
  }, [state.choices, state.playthrough]);

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

  const move = useCallback(
    (direction: MoveDirection, source: "keyboard" | "touch" = "touch") => {
      if (!acceptsMovementInput(state.screen) || !movementFromControl(state.screen, source, direction)) {
        return;
      }
      setFacing(direction);
      setWalking(true);
      if (walkTimeout.current !== null) {
        window.clearTimeout(walkTimeout.current);
      }
      walkTimeout.current = window.setTimeout(() => setWalking(false), 140);
      onMove(direction);
    },
    [onMove, state.screen],
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
    };
  }, [move, state.screen]);

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
  const encounterActive = hasActiveDecision(state.screen) || hasDecisionFeedback(state.screen);
  const perspective = perspectiveFromState(state, mission);
  const exitUnlocked = state.choices.length >= total;

  let dock = (
    <DecisionDock
      mode="explore"
      decisionNumber={state.choices.length}
      total={total}
        title={objective}
      body="Walk toward the destination. Checkpoints trigger the next decision automatically — you do not need to hunt tiles."
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
        decisionNumber={state.choices.length + 1}
        total={total}
        title={question.title}
        body={question.situation}
        npcLine={question.npcLine}
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
  } else if (state.screen === "consequence" && selected) {
    dock = (
      <DecisionDock
        mode="consequence"
        decisionNumber={state.choices.length}
        total={total}
        title="What happened"
        body={selected.consequence}
        selected={selected}
        scoreFlash={mission.dimensions.map((dimension) => ({
          label: dimension.label,
          points: selected.scores[dimension.id] ?? 0,
        }))}
        onContinue={() => {
          playTone(state.muted || reducedMotion, 330, 90, "triangle");
          onContinue();
        }}
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
      <div className={`game-shell game-shell-live theme-${mission.id}`}>
        <header className="game-hud">
          <p className="game-objective">
            Objective: Reach {world.destinationLabel} · {manhattan(state.position, world.destination)} tiles
          </p>
          <p className="game-progress">
            Decisions: {state.choices.length} / {total}
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
        </header>

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
            >
              {world.tiles.flatMap((row, y) =>
                row.map((kind, x) => {
                  const highlight =
                    state.lastEncounterTile &&
                    encounterActive &&
                    tileKey({ x, y }) === tileKey(state.lastEncounterTile);
                  const landmark = world.landmarkTiles.some(
                    (point) => point.x === x && point.y === y,
                  );
                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`rpg-tile rpg-tile-${kind} ${highlight ? "tile-highlight" : ""} ${landmark ? "tile-landmark" : ""}`}
                      data-tile={kind}
                      data-zone={world.zones[y]?.[x]}
                    />
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
              />
              {showPlayer ? (
                <MissionPlayer
                  position={state.position}
                  direction={facing}
                  paused={movementLocked}
                  walking={walking}
                  showDecisionIndicator={hasActiveDecision(state.screen) || hasDecisionFeedback(state.screen)}
                  columns={world.columns}
                  rows={world.rows}
                />
              ) : null}
            </div>
          </div>
          {dock}
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
          <button type="button" disabled={movementLocked} onClick={() => move("up", "touch")}>
            Up
          </button>
          <span />
          <button type="button" disabled={movementLocked} onClick={() => move("left", "touch")}>
            Left
          </button>
          <button type="button" disabled={movementLocked} onClick={() => move("down", "touch")}>
            Down
          </button>
          <button type="button" disabled={movementLocked} onClick={() => move("right", "touch")}>
            Right
          </button>
        </div>
      </div>
    </main>
  );
}
