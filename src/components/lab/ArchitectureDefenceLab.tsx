"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ArchitectureMap } from "@/components/lab/ArchitectureMap";
import { DecisionScreen } from "@/components/lab/DecisionScreen";
import { DifficultySelect } from "@/components/lab/DifficultySelect";
import { FinalReview } from "@/components/lab/FinalReview";
import { IncidentPanel } from "@/components/lab/IncidentPanel";
import { EducationalDisclaimer } from "@/components/EducationalDisclaimer";
import { LAB_MISSION, decisionById, optionForChoice } from "@/lib/lab/catalog";
import { DIFFICULTY_CAPTION } from "@/lib/lab/copy";
import { simulateAttack } from "@/lib/lab/engine";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import {
  beginLab,
  changeDifficulty,
  confirmDecision,
  goToDecision,
  improveAndRetry,
  launchAttack,
  nextAttackStep,
  pauseAttack,
  persistLab,
  replayAttack,
  resetArchitecture,
  selectOption,
} from "@/lib/lab/play";
import { EMPTY_LAB_STATE, loadLabState, subscribeLab } from "@/lib/lab/store";
import type { LabDifficulty, LabPersistedState, MapNodeId } from "@/lib/lab/types";
import { DECISION_IDS } from "@/lib/lab/types";
import "./lab.css";

export function ArchitectureDefenceLab() {
  const state = useSyncExternalStore(subscribeLab, loadLabState, () => EMPTY_LAB_STATE);
  return <ArchitectureDefenceLabView state={state} onChange={persistLab} />;
}

export function ArchitectureDefenceLabView({
  state,
  onChange,
}: {
  state: LabPersistedState;
  onChange: (state: LabPersistedState) => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [inspectId, setInspectId] = useState<MapNodeId | null>(null);
  const [missingMessage, setMissingMessage] = useState<string | null>(null);
  const simulation = useMemo(
    () => (state.phase === "attack" || state.phase === "result" || state.phase === "review"
      ? simulateAttack(state.choices)
      : null),
    [state.choices, state.phase],
  );
  const revealed = state.phase === "attack" || state.phase === "result" ? state.revealedStageCount : 0;
  const activeStage = simulation && revealed > 0 ? simulation.stages[revealed - 1] ?? null : null;
  const currentDecision = decisionById(DECISION_IDS[state.currentDecisionIndex] ?? "identity");

  const update = (next: LabPersistedState) => {
    onChange(next);
  };

  useEffect(() => {
    if (state.phase !== "attack" || state.paused || reducedMotion) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      onChange(nextAttackStep(state));
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [state, reducedMotion, onChange]);

  const handleDifficulty = (difficulty: LabDifficulty) => {
    update(changeDifficulty(state, difficulty));
  };

  const inspectNode = inspectId ? LAB_MISSION.nodes.find((item) => item.id === inspectId) : null;
  const inspectChoice = inspectNode?.decisionId ? optionForChoice(state.choices, inspectNode.decisionId) : null;
  const inspectTechnique = inspectNode?.decisionId
    ? LAB_MISSION.techniques.find((item) => item.checks.some((check) => check.decisionId === inspectNode.decisionId))
    : null;

  return (
    <div
      className={["lab-shell", reducedMotion ? "is-reduced-motion" : "", `is-${state.phase}`].filter(Boolean).join(" ")}
      data-phase={state.phase}
      data-difficulty={state.difficulty}
    >
      <header className="lab-top">
        <div className="lab-brand">
          <p>BreachRoom</p>
          <h1>Architecture Defence Lab</h1>
        </div>
        {state.phase !== "setup" ? (
          <div className="lab-hardness" role="group" aria-label={DIFFICULTY_CAPTION}>
            <span className="lab-hardness__label">{DIFFICULTY_CAPTION}</span>
            <button
              type="button"
              className={state.difficulty === "guided" ? "is-active" : ""}
              aria-pressed={state.difficulty === "guided"}
              disabled={state.phase === "attack" || state.phase === "result"}
              onClick={() => handleDifficulty("guided")}
            >
              Guided
            </button>
            <button
              type="button"
              className={state.difficulty === "challenge" ? "is-active" : ""}
              aria-pressed={state.difficulty === "challenge"}
              disabled={state.phase === "attack" || state.phase === "result"}
              onClick={() => handleDifficulty("challenge")}
            >
              Challenge
            </button>
          </div>
        ) : null}
      </header>

      <div className="lab-mission-head">
        <div>
          <p className="lab-mission-head__kicker">
            {LAB_MISSION.missionLabel} · {LAB_MISSION.title}
          </p>
          <p className="lab-mission-head__tagline">{LAB_MISSION.tagline}</p>
          <p>{LAB_MISSION.scenario}</p>
          <p className="lab-fictional">{LAB_MISSION.fictionalNote}</p>
        </div>
        <p className="lab-phase-pill">
          {state.phase === "setup"
            ? "Choose difficulty"
            : state.phase === "decide"
              ? `Decision ${currentDecision.number} of 10`
              : state.phase === "review"
                ? "Architecture complete · 10/10"
                : state.phase === "attack"
                  ? "Red Team campaign"
                  : "Final assessment"}
        </p>
      </div>

      {state.phase === "setup" ? (
        <DifficultySelect
          difficulty={state.difficulty}
          onChange={handleDifficulty}
          onBegin={() => update(beginLab(state, state.difficulty))}
        />
      ) : null}

      {state.phase === "decide" ? (
        <DecisionScreen
          decision={currentDecision}
          difficulty={state.difficulty}
          choices={state.choices}
          pendingOptionId={state.pendingOptionId}
          onSelect={(optionId) => update(selectOption(state, optionId))}
          onContinue={() => update(confirmDecision(state))}
          onBack={() => update(goToDecision(state, state.currentDecisionIndex - 1))}
          canGoBack={state.currentDecisionIndex > 0}
        />
      ) : null}

      {state.phase === "review" || state.phase === "attack" || state.phase === "result" ? (
        <div className="lab-board">
          <ArchitectureMap
            choices={state.choices}
            simulation={simulation}
            revealedStageCount={revealed}
            selectedNodeId={inspectId}
            onSelectNode={setInspectId}
          />
          <div className="lab-board__side">
            {inspectNode ? (
              <article className="lab-inspect">
                <p className="lab-kicker">{inspectNode.name}</p>
                <h2>{inspectChoice?.title ?? inspectNode.name}</h2>
                <p>{inspectChoice?.tradeOff ?? inspectNode.description}</p>
                {inspectTechnique ? <p>This control is tested by {inspectTechnique.name}.</p> : null}
              </article>
            ) : (
              <IncidentPanel stage={state.phase === "review" ? null : activeStage} />
            )}
            {state.phase === "review" ? (
              <div className="lab-attack-controls">
                {missingMessage ? <p className="lab-missing">{missingMessage}</p> : null}
                <button
                  type="button"
                  className="lab-primary"
                  onClick={() => {
                    const result = launchAttack(state);
                    if (result.error) {
                      setMissingMessage(result.error);
                      return;
                    }
                    setMissingMessage(null);
                    update(result.state);
                  }}
                >
                  Run Red Team
                </button>
                <button type="button" className="lab-secondary" onClick={() => update(goToDecision(state, 9))}>
                  Change a decision
                </button>
              </div>
            ) : null}
            {state.phase === "attack" ? (
              <div className="lab-attack-controls">
                <button
                  type="button"
                  className="lab-secondary"
                  onClick={() => update(pauseAttack(state, !state.paused))}
                >
                  {state.paused ? "Resume" : "Pause"}
                </button>
                <button type="button" className="lab-primary" onClick={() => update(nextAttackStep(state))}>
                  Next attack step
                </button>
                <button type="button" className="lab-secondary" onClick={() => update(replayAttack(state))}>
                  Replay attack
                </button>
              </div>
            ) : null}
            {state.phase === "result" && simulation ? (
              <FinalReview
                simulation={simulation}
                difficulty={state.difficulty}
                onRetry={() => update(improveAndRetry(state))}
                onReplay={() => update(replayAttack(state))}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="lab-foot">
        <button type="button" className="lab-text" onClick={() => update(resetArchitecture(state))}>
          Reset architecture
        </button>
        <p className="lab-company">
          Fictional company: {LAB_MISSION.company}. {LAB_MISSION.fictionalNote}
        </p>
        <EducationalDisclaimer variant="short" className="lab-disclaimer" />
      </div>
    </div>
  );
}
