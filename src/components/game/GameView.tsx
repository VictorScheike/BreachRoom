"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConsequencePanel } from "@/components/game/ConsequencePanel";
import { EncounterPanel } from "@/components/game/EncounterPanel";
import { FinalEncounter } from "@/components/game/FinalEncounter";
import { PlayerSprite } from "@/components/game/PlayerSprite";
import { buildConsequence } from "@/lib/game/consequence";
import { ENCOUNTER_FLAVOR } from "@/lib/game/encounters";
import { containmentOutcome, hudFromScores } from "@/lib/game/hud";
import {
  MAP_COLUMNS,
  MAP_ROWS,
  MAP_TILES,
  START_TILE,
  isCoreTile,
  isGrassTile,
  isServerEntranceEncounter,
  shouldTriggerGrassEncounter,
  tileAt,
  tileKey,
  tryMove,
  type GridPoint,
  type MoveDirection,
} from "@/lib/game/map";
import { requireStage } from "@/lib/simulation/lookups";
import { calculateScores } from "@/lib/simulation/report";
import { calculateOverallScore } from "@/lib/simulation/scoring";
import type {
  DecisionOption,
  RecordedDecision,
  Scenario,
} from "@/lib/simulation/types";

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

type GamePhase =
  | "briefing"
  | "exploring"
  | "encounter"
  | "consequence"
  | "final";

interface GameViewProps {
  scenario: Scenario;
  currentStageIndex: number;
  decisions: readonly RecordedDecision[];
  onBegin: () => void;
  onChoose: (optionId: string) => void;
  onReachCore: () => void;
}

export function GameView({
  scenario,
  currentStageIndex,
  decisions,
  onBegin,
  onChoose,
  onReachCore,
}: GameViewProps) {
  const [phase, setPhase] = useState<GamePhase>("briefing");
  const [position, setPosition] = useState<GridPoint>(START_TILE);
  const [facing, setFacing] = useState<MoveDirection>("right");
  const [walking, setWalking] = useState(false);
  const [visitedGrass, setVisitedGrass] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [grassSinceEncounter, setGrassSinceEncounter] = useState(0);
  const [lastOption, setLastOption] = useState<DecisionOption | null>(null);
  const walkTimeout = useRef<number | null>(null);

  const total = scenario.stages.length;
  const stage = requireStage(scenario, Math.min(currentStageIndex, total - 1));
  const flavor = ENCOUNTER_FLAVOR[Math.min(currentStageIndex, total - 1)];
  const scores = useMemo(
    () => calculateScores(scenario, decisions),
    [decisions, scenario],
  );
  const hud = hudFromScores(scores);
  const overall = calculateOverallScore(scores);
  const movementLocked = phase !== "exploring";

  const move = useCallback(
    (direction: MoveDirection) => {
      if (movementLocked) {
        return;
      }
      setFacing(direction);
      const next = tryMove(position, direction, decisions.length, total);
      if (!next) {
        return;
      }

      setWalking(true);
      if (walkTimeout.current !== null) {
        window.clearTimeout(walkTimeout.current);
      }
      walkTimeout.current = window.setTimeout(() => setWalking(false), 140);
      setPosition(next);

      if (isCoreTile(next) && decisions.length >= total) {
        setPhase("final");
        return;
      }

      if (isServerEntranceEncounter(next, decisions.length, total)) {
        setPhase("encounter");
        return;
      }

      const kind = tileAt(next);
      if (!isGrassTile(kind)) {
        return;
      }
      const key = tileKey(next);
      if (visitedGrass.has(key)) {
        return;
      }
      const nextVisited = new Set(visitedGrass);
      nextVisited.add(key);
      const nextGrass = grassSinceEncounter + 1;
      setVisitedGrass(nextVisited);
      setGrassSinceEncounter(nextGrass);
      if (shouldTriggerGrassEncounter(nextGrass, decisions.length, total)) {
        setGrassSinceEncounter(0);
        setPhase("encounter");
      }
    },
    [
      decisions.length,
      grassSinceEncounter,
      movementLocked,
      position,
      total,
      visitedGrass,
    ],
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

  const consequence =
    lastOption === null
      ? null
      : buildConsequence(lastOption, Math.max(0, decisions.length - 1));

  return (
    <main id="main-content" className="game-page">
      <div className="game-shell">
        <header className="game-hud">
          <p className="game-objective">
            Current objective: Reach the Core Server Room
          </p>
          <p className="game-progress">
            Decisions: {decisions.length} / {total}
          </p>
          <ul className="game-status" aria-label="Incident status">
            <li>
              Containment
              <span>{hud.containment}</span>
            </li>
            <li>
              Operations
              <span>{hud.operations}</span>
            </li>
            <li>
              Trust
              <span>{hud.trust}</span>
            </li>
          </ul>
        </header>

        <div className="game-stage">
          <div
            className="game-map"
            role="application"
            aria-label="Northstar Logistics map"
          >
            {MAP_TILES.flatMap((row, y) =>
              row.map((kind, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`rpg-tile rpg-tile-${kind}`}
                  data-tile={kind}
                />
              )),
            )}
            <div
              className="player-layer"
              style={{
                width: `${100 / MAP_COLUMNS}%`,
                height: `${100 / MAP_ROWS}%`,
                transform: `translate(${position.x * 100}%, ${position.y * 100}%)`,
              }}
            >
              <PlayerSprite facing={facing} walking={walking} />
            </div>
          </div>

          {phase === "briefing" ? (
            <div className="game-panel-overlay" role="dialog" aria-modal="true">
              <div className="game-panel">
                <p className="game-kicker">Monday, 08:15 — Northstar Logistics</p>
                <h1 className="game-panel-title">
                  Reach the Core Server Room and contain the ransomware before
                  it spreads.
                </h1>
                <p className="game-panel-copy">
                  Employees are locked out and ransomware is spreading through
                  the network. Reach the Core Server Room, handle eight
                  critical decisions and contain the attack.
                </p>
                <button
                  type="button"
                  className="game-primary"
                  onClick={() => {
                    onBegin();
                    setPhase("exploring");
                  }}
                >
                  Begin incident response
                </button>
              </div>
            </div>
          ) : null}

          {phase === "encounter" && flavor ? (
            <EncounterPanel
              stage={stage}
              flavorTitle={flavor.title}
              flavorDescription={flavor.description}
              decisionNumber={decisions.length + 1}
              totalDecisions={total}
              onChoose={(optionId) => {
                const option = stage.options.find((item) => item.id === optionId);
                if (!option) {
                  return;
                }
                setLastOption(option);
                onChoose(optionId);
                setPhase("consequence");
              }}
            />
          ) : null}

          {phase === "consequence" && consequence ? (
            <ConsequencePanel
              consequence={consequence}
              onContinue={() => setPhase("exploring")}
            />
          ) : null}

          {phase === "final" ? (
            <FinalEncounter
              outcome={containmentOutcome(overall)}
              onViewReport={onReachCore}
            />
          ) : null}
        </div>

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
