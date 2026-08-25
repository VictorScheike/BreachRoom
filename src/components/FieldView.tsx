"use client";

import { useCallback, useEffect, useState } from "react";
import { EncounterDialog } from "@/components/EncounterDialog";
import { StickFigure } from "@/components/StickFigure";
import {
  GOAL_TILE,
  GRID_SIZE,
  START_TILE,
  isGoalTile,
  shouldTriggerEncounter,
  tryMove,
  type GridPoint,
  type MoveDirection,
} from "@/lib/simulation/field";
import type { RecordedDecision, Scenario, ScenarioStage } from "@/lib/simulation/types";

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

interface FieldViewProps {
  scenario: Scenario;
  stage: ScenarioStage;
  stageNumber: number;
  selectedOptionId: string | null;
  decisions: readonly RecordedDecision[];
  onSelect: (optionId: string) => void;
  onConfirm: () => void;
  onReachExit: () => void;
}

export function FieldView({
  scenario,
  stage,
  stageNumber,
  selectedOptionId,
  decisions,
  onSelect,
  onConfirm,
  onReachExit,
}: FieldViewProps) {
  const [position, setPosition] = useState<GridPoint>(START_TILE);
  const [stepsSinceEncounter, setStepsSinceEncounter] = useState(0);
  const [encounterOpen, setEncounterOpen] = useState(false);

  const remainingObstacles = scenario.stages.length - decisions.length;
  const obstaclesCleared = decisions.length;

  const move = useCallback(
    (direction: MoveDirection) => {
      if (encounterOpen) {
        return;
      }

      const next = tryMove(
        position,
        direction,
        obstaclesCleared,
        scenario.stages.length,
      );
      if (!next) {
        return;
      }

      if (isGoalTile(next)) {
        setPosition(next);
        onReachExit();
        return;
      }

      const nextSteps = stepsSinceEncounter + 1;
      setPosition(next);
      setStepsSinceEncounter(nextSteps);

      if (shouldTriggerEncounter(nextSteps, remainingObstacles)) {
        setEncounterOpen(true);
        setStepsSinceEncounter(0);
      }
    },
    [
      encounterOpen,
      obstaclesCleared,
      onReachExit,
      position,
      remainingObstacles,
      scenario.stages.length,
      stepsSinceEncounter,
    ],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = DIRECTION_KEYS[event.key];
      if (!direction) {
        return;
      }
      event.preventDefault();
      move(direction);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [move]);

  const tiles = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
    const x = index % GRID_SIZE;
    const y = Math.floor(index / GRID_SIZE);
    return { x, y };
  });

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{scenario.title}</h1>
          <p className="text-sm text-muted">
            Walk the grass to the far side. A guide stops you every few steps
            with one question. Arrow keys or WASD to move.
          </p>
        </div>
        <p className="font-mono text-sm text-cyan">
          Obstacles {obstaclesCleared}/{scenario.stages.length}
        </p>
      </div>

      <div className="relative overflow-auto rounded-2xl border border-line">
        <div
          className="field-grid min-w-[20rem]"
          role="application"
          aria-label="Incident field"
        >
          {tiles.map((tile) => {
            const isStart = tile.x === START_TILE.x && tile.y === START_TILE.y;
            const isGoal = tile.x === GOAL_TILE.x && tile.y === GOAL_TILE.y;
            const isPlayer = tile.x === position.x && tile.y === position.y;
            const checker = (tile.x + tile.y) % 2 === 0;
            return (
              <div
                key={`${tile.x}-${tile.y}`}
                className={`field-tile ${checker ? "field-tile-a" : "field-tile-b"} ${
                  isStart ? "field-tile-start" : ""
                } ${isGoal ? "field-tile-goal" : ""}`}
              >
                {isPlayer ? (
                  <StickFigure className="h-5 w-4 text-navy-950 sm:h-6 sm:w-5" />
                ) : null}
              </div>
            );
          })}
        </div>

        {encounterOpen ? (
          <EncounterDialog
            stage={stage}
            obstacleNumber={stageNumber}
            totalObstacles={scenario.stages.length}
            selectedOptionId={selectedOptionId}
            onSelect={onSelect}
            onConfirm={() => {
              if (selectedOptionId === null) {
                return;
              }
              onConfirm();
              setEncounterOpen(false);
            }}
          />
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-2 self-center sm:hidden">
        <span />
        <button type="button" className="field-pad" onClick={() => move("up")}>
          Up
        </button>
        <span />
        <button type="button" className="field-pad" onClick={() => move("left")}>
          Left
        </button>
        <button type="button" className="field-pad" onClick={() => move("down")}>
          Down
        </button>
        <button type="button" className="field-pad" onClick={() => move("right")}>
          Right
        </button>
      </div>
    </main>
  );
}
