"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ArchitectureMap } from "@/components/lab/ArchitectureMap";
import { AttackIncidentStrip } from "@/components/lab/AttackIncidentStrip";
import { DecisionScreen } from "@/components/lab/DecisionScreen";
import { DifficultySelect } from "@/components/lab/DifficultySelect";
import { FinalReview, defaultFocusedStage } from "@/components/lab/FinalReview";
import { GameHud } from "@/components/lab/GameHud";
import { EducationalDisclaimer } from "@/components/EducationalDisclaimer";
import { LAB_MISSION, decisionById } from "@/lib/lab/catalog";
import { DIFFICULTY_CAPTION } from "@/lib/lab/copy";
import { ATTACK_STEP_MS, currentBeat, hudStatus } from "@/lib/lab/animation";
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
  previousAttackStep,
  replayAttack,
  resetArchitecture,
  selectOption,
} from "@/lib/lab/play";
import { EMPTY_LAB_STATE, loadLabState, subscribeLab } from "@/lib/lab/store";
import type { AttackTechniqueId, LabDifficulty, LabPersistedState, MapNodeId } from "@/lib/lab/types";
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
  const [focusedStageId, setFocusedStageId] = useState<AttackTechniqueId | null>(null);
  const [missingMessage, setMissingMessage] = useState<string | null>(null);
  const simulation = useMemo(
    () =>
      state.phase === "attack" || state.phase === "result" || state.phase === "review"
        ? simulateAttack(state.choices)
        : null,
    [state.choices, state.phase],
  );
  const revealed = state.phase === "attack" || state.phase === "result" ? state.revealedStageCount : 0;
  const activeStage = simulation && revealed > 0 ? simulation.stages[revealed - 1] ?? null : null;
  const beat = currentBeat(activeStage, state.attackBeat);
  const currentDecision = decisionById(DECISION_IDS[state.currentDecisionIndex] ?? "identity");
  const status = hudStatus({
    phase: state.phase,
    stage: activeStage,
    beat,
    resultLabel: simulation?.resultLabel,
  });
  const canPrevious = state.phase === "attack" && (state.revealedStageCount > 1 || state.attackBeat > 0);

  const update = (next: LabPersistedState) => {
    onChange(next);
  };

  useEffect(() => {
    if (state.phase !== "attack" || state.paused || reducedMotion) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      onChange(nextAttackStep(state));
    }, ATTACK_STEP_MS);
    return () => window.clearTimeout(timer);
  }, [state, reducedMotion, onChange]);

  const handleDifficulty = (difficulty: LabDifficulty) => {
    update(changeDifficulty(state, difficulty));
  };

  const inGame = state.phase !== "setup";
  const campaignPhase = state.phase === "review" || state.phase === "attack" || state.phase === "result";
  const progressCurrent =
    state.phase === "attack" ? (activeStage?.number ?? 1) : state.phase === "decide" ? currentDecision.number : 10;
  const progressTotal = state.phase === "attack" || state.phase === "result" ? 7 : 10;
  const resultFocusId =
    state.phase === "result" && simulation
      ? (focusedStageId ?? defaultFocusedStage(simulation)?.id ?? null)
      : focusedStageId;

  return (
    <div
      className={["lab-shell", reducedMotion ? "is-reduced-motion" : "", `is-${state.phase}`].filter(Boolean).join(" ")}
      data-phase={state.phase}
      data-difficulty={state.difficulty}
      data-beat={beat?.kind ?? ""}
    >
      {state.phase === "setup" ? (
        <header className="lab-top">
          <div className="lab-brand">
            <p>BreachRoom</p>
            <h1>Architecture Defence Lab</h1>
          </div>
        </header>
      ) : null}

      {inGame ? (
        <GameHud
          kicker={`${LAB_MISSION.company} · ${state.difficulty === "guided" ? "Guided" : "Challenge"}`}
          title={
            state.phase === "decide"
              ? `Decision ${currentDecision.number} of 10`
              : state.phase === "review"
                ? "Architecture complete · 10/10"
                : state.phase === "attack"
                  ? `Red Team · Step ${activeStage?.number ?? 1} of 7`
                  : "Final assessment"
          }
          status={status}
          paused={state.paused}
          progressCurrent={progressCurrent}
          progressTotal={progressTotal}
          showAttackControls={state.phase === "attack"}
          onReplay={() => update(replayAttack(state))}
        />
      ) : null}

      {inGame ? (
        <div className="lab-hardness lab-hardness--hud" role="group" aria-label={DIFFICULTY_CAPTION}>
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

      {state.phase === "setup" ? (
        <div className="lab-mission-head">
          <div>
            <p className="lab-mission-head__kicker">
              {LAB_MISSION.missionLabel} · {LAB_MISSION.title}
            </p>
            <p className="lab-mission-head__tagline">{LAB_MISSION.tagline}</p>
            <p>{LAB_MISSION.scenario}</p>
            <p className="lab-fictional">{LAB_MISSION.fictionalNote}</p>
          </div>
        </div>
      ) : null}

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
          onNext={() => update(confirmDecision(state))}
          onBack={() => update(goToDecision(state, state.currentDecisionIndex - 1))}
          canGoBack={state.currentDecisionIndex > 0}
        />
      ) : null}

      {campaignPhase ? (
          <div className={["lab-campaign", state.phase === "result" ? "lab-campaign--result" : ""].filter(Boolean).join(" ")}>
          {state.phase === "review" ? (
            <div className="lab-launch lab-launch--banner">
              <div>
                <p className="lab-kicker">Architecture locked</p>
                <h2 className="lab-launch__title">Run the complete attack</h2>
                <p className="lab-launch__copy">
                  Ten controls are now on the board. The Red Team will test the live paths, not a static scorecard.
                </p>
                {missingMessage ? <p className="lab-missing">{missingMessage}</p> : null}
              </div>
              <div className="lab-attack-controls">
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
                    setInspectId(null);
                    setFocusedStageId(null);
                    update(result.state);
                  }}
                >
                  Preview final attack
                </button>
                <button type="button" className="lab-secondary" onClick={() => update(goToDecision(state, 9))}>
                  Change a decision
                </button>
              </div>
            </div>
          ) : null}

          <section className="lab-campaign__map" aria-label="Architecture network">
            <ArchitectureMap
              choices={state.choices}
              simulation={simulation}
              revealedStageCount={revealed}
              attackBeat={state.attackBeat}
              phase={state.phase}
              selectedNodeId={inspectId}
              onSelectNode={setInspectId}
              reducedMotion={reducedMotion}
              paused={state.paused}
              focusedStageId={state.phase === "result" ? resultFocusId : null}
            />
          </section>

          {state.phase === "review" || state.phase === "attack" ? (
            <AttackIncidentStrip
              stage={state.phase === "review" ? null : activeStage}
              beat={state.phase === "attack" ? beat : null}
              paused={state.paused}
              canPrevious={canPrevious}
              onPrevious={() => update(previousAttackStep(state))}
              onPause={() => update(pauseAttack(state, !state.paused))}
              onNext={() => update(nextAttackStep(state))}
              readyMessage="The architecture is ready. Run the Red Team campaign to see how each defensive layer changes the attack."
            />
          ) : null}

          {state.phase === "result" && simulation ? (
            <FinalReview
              simulation={simulation}
              focusedStageId={resultFocusId}
              onFocusStage={setFocusedStageId}
              onRetry={() => update(improveAndRetry(state))}
              onReplay={() => {
                setFocusedStageId(null);
                update(replayAttack(state));
              }}
              onImproveControl={() => update(improveAndRetry(state, simulation.review.recommendedDecisionId))}
            />
          ) : null}
        </div>
      ) : null}

      <div className="lab-foot">
        <button type="button" className="lab-text" onClick={() => update(resetArchitecture(state))}>
          Reset architecture
        </button>
        {state.phase === "setup" ? (
          <p className="lab-company">
            Fictional company: {LAB_MISSION.company}. {LAB_MISSION.fictionalNote}
          </p>
        ) : null}
        <EducationalDisclaimer variant="short" className="lab-disclaimer" />
      </div>
    </div>
  );
}
