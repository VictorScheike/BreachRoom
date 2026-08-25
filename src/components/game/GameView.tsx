"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DecisionDock } from "@/components/game/DecisionDock";
import { PlayerSprite } from "@/components/game/PlayerSprite";
import {
  currentQuestion,
  currentScore,
  currentWorld,
  type GameState,
} from "@/lib/game/engine";
import { playTone } from "@/lib/game/sound";
import {
  manhattan,
  tileKey,
  type MoveDirection,
} from "@/lib/game/world";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { requireMission } from "@/lib/missions/catalog";
import type { AnswerOption } from "@/lib/missions/types";

const DIRECTION_KEYS: Record<string, MoveDirection> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  W: "up",
  S: "down",
  A: "left",
  D: "right",
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
  const movementLocked = state.screen !== "exploring";

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
    (direction: MoveDirection) => {
      if (movementLocked) {
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
    [movementLocked, onMove],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = DIRECTION_KEYS[event.key];
      if (!direction || movementLocked) {
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
  }, [move, movementLocked]);

  if (!world || !mission || !state.playthrough) {
    return null;
  }

  const letters: ("A" | "B" | "C")[] = ["A", "B", "C"];
  const encounterActive =
    state.screen === "encounter" || state.screen === "consequence";

  let dock = (
    <DecisionDock
      mode="explore"
      decisionNumber={state.choices.length}
      total={8}
      title={mission.objective}
      body="Walk toward the destination. Checkpoints trigger the next decision automatically — you do not need to hunt tiles."
    />
  );

  if (state.screen === "briefing") {
    dock = (
      <DecisionDock
        mode="briefing"
        decisionNumber={0}
        total={8}
        title={mission.title}
        body={`${mission.story} ${state.playthrough.scenarioId ? mission.scenarios.find((item) => item.id === state.playthrough?.scenarioId)?.setup ?? "" : ""}`}
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
        total={8}
        title={question.title}
        body={question.situation}
        npcLine={question.npcLine}
        options={displayed}
        letters={letters}
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
        total={8}
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
        decisionNumber={8}
        total={8}
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
            Decisions: {state.choices.length} / 8
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
          <div
            className={`game-map ${encounterActive ? "game-map-dim" : ""} ${state.screen === "finalEncounter" ? "map-focus-landmark" : ""} world-${mission.id}`}
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
            {mission.id === "locked-out" ? (
              <div className="server-sign" aria-hidden="true">
                CORE SERVER ROOM
              </div>
            ) : null}
            {mission.id === "ai-forge" ? (
              <div className="server-sign forge-sign" aria-hidden="true">
                MODEL LAUNCH GATEWAY
              </div>
            ) : null}
            {mission.id === "dependency-depths" ? (
              <div className="server-sign vault-sign" aria-hidden="true">
                TRUSTED BUILD EXIT
              </div>
            ) : null}
            {mission.id === "inbox-under-siege" ? (
              <div className="server-sign" aria-hidden="true">
                SECURITY HUB
              </div>
            ) : null}
            <div
              className="player-layer"
              style={{
                width: `${100 / world.columns}%`,
                height: `${100 / world.rows}%`,
                transform: `translate(${state.position.x * 100}%, ${state.position.y * 100}%)`,
              }}
            >
              <PlayerSprite facing={facing} walking={walking} />
            </div>
          </div>
          {dock}
        </div>

          {endConfirm ? (
            <div className="end-mission-modal" role="dialog" aria-labelledby="end-mission-title">
              <h2 id="end-mission-title">End this mission?</h2>
              <p>Progress will be discarded. No report is created for an unfinished run.</p>
              <button type="button" className="game-primary" onClick={onChooseAnother}>
                Discard and leave
              </button>
              <button type="button" className="hud-button" onClick={() => setEndConfirm(false)}>
                Keep playing
              </button>
            </div>
          ) : null}

        <div className="game-pad" aria-label="Movement pad">
          <span />
          <button type="button" onClick={() => move("up")}>
            Up
          </button>
          <span />
          <button type="button" onClick={() => move("left")}>
            Left
          </button>
          <button type="button" onClick={() => move("down")}>
            Down
          </button>
          <button type="button" onClick={() => move("right")}>
            Right
          </button>
        </div>
      </div>
    </main>
  );
}
