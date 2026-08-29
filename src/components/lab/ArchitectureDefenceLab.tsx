"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ArchitectureCanvas } from "@/components/lab/ArchitectureCanvas";
import { ArchitectureReview } from "@/components/lab/ArchitectureReview";
import { AttackSimulator } from "@/components/lab/AttackSimulator";
import { ComponentPalette } from "@/components/lab/ComponentPalette";
import { LabIcon } from "@/components/lab/LabIcon";
import { EducationalDisclaimer } from "@/components/EducationalDisclaimer";
import { LAB_MISSION, requireComponent } from "@/lib/lab/catalog";
import { HARDNESS_CAPTION } from "@/lib/lab/copy";
import { readinessBand, readinessFor, simulateAttack } from "@/lib/lab/engine";
import {
  changeDifficulty,
  improveAndRetry,
  launchAttack,
  nextAttackStep,
  persistLab,
  placeOnSlot,
} from "@/lib/lab/play";
import { EMPTY_LAB_STATE, loadLabState, subscribeLab } from "@/lib/lab/store";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import type {
  ArchitectureComponent,
  ArchitectureNodeId,
  LabDifficulty,
  LabPersistedState,
  SlotId,
} from "@/lib/lab/types";
import { SLOT_IDS } from "@/lib/lab/types";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [inspectId, setInspectId] = useState<ArchitectureNodeId | null>(null);
  const [missingMessage, setMissingMessage] = useState<string | null>(null);
  const locked = state.phase !== "build";
  const simulation = useMemo(
    () => (locked ? simulateAttack(state.placements) : null),
    [locked, state.placements],
  );
  const revealed = state.phase === "build" ? 0 : state.revealedStageCount;
  const activeStage = simulation && revealed > 0 ? simulation.stages[revealed - 1] ?? null : null;
  const highlighted = activeStage?.highlight ?? [];
  const readiness = readinessFor(state.placements);
  const showPreciseReadiness = state.difficulty === "guided" || state.phase !== "build";

  const update = (next: LabPersistedState) => {
    onChange(next);
  };

  const handleSelect = (component: ArchitectureComponent) => {
    if (locked) {
      return;
    }
    setSelectedId((current) => (current === component.id ? null : component.id));
    setInspectId(component.slotId);
  };

  const handlePlace = (componentId: string, nodeId: ArchitectureNodeId) => {
    if (!SLOT_IDS.includes(nodeId as SlotId)) {
      return;
    }
    const next = placeOnSlot(state, componentId, nodeId as SlotId);
    update(next);
    setSelectedId(null);
    setMissingMessage(null);
    setInspectId(nodeId);
  };

  const handleLaunch = () => {
    const result = launchAttack(state);
    if (result.error) {
      setMissingMessage(result.error);
      return;
    }
    setMissingMessage(null);
    setSelectedId(null);
    update(result.state);
  };

  const handleNext = () => {
    update(nextAttackStep(state));
  };

  const handleDifficulty = (difficulty: LabDifficulty) => {
    if (locked) {
      return;
    }
    update(changeDifficulty(state, difficulty));
    setSelectedId(null);
  };

  const handleRetry = () => {
    update(improveAndRetry(state));
    setMissingMessage(null);
  };

  const compatibleSlot = selectedId ? requireComponent(selectedId).slotId : draggingId ? requireComponent(draggingId).slotId : null;

  return (
    <div
      className={[
        "lab-shell",
        reducedMotion ? "is-reduced-motion" : "",
        `is-${state.phase}`,
        compatibleSlot ? `is-aiming-${compatibleSlot}` : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-phase={state.phase}
      data-difficulty={state.difficulty}
    >
      <header className="lab-top">
        <div className="lab-brand">
          <p>BreachRoom</p>
          <h1>
            <LabIcon name="shield" />
            Architecture Defence Lab
          </h1>
        </div>
        <div className="lab-hardness" role="group" aria-label={HARDNESS_CAPTION}>
          <span className="lab-hardness__label">{HARDNESS_CAPTION}</span>
          <button
            type="button"
            className={state.difficulty === "guided" ? "is-active" : ""}
            aria-pressed={state.difficulty === "guided"}
            disabled={locked}
            onClick={() => handleDifficulty("guided")}
          >
            Guided
          </button>
          <button
            type="button"
            className={state.difficulty === "architect" ? "is-active" : ""}
            aria-pressed={state.difficulty === "architect"}
            disabled={locked}
            onClick={() => handleDifficulty("architect")}
          >
            Architect
          </button>
        </div>
      </header>

      <div className="lab-mission-head">
        <div>
          <p className="lab-mission-head__kicker">
            {LAB_MISSION.missionLabel} · {LAB_MISSION.attack.name}
          </p>
          <p className="lab-mission-head__tagline">{LAB_MISSION.attack.tagline}</p>
          <p>{LAB_MISSION.attack.scenario}</p>
          <p className="lab-fictional">{LAB_MISSION.attack.fictionalNote}</p>
        </div>
        <p className="lab-phase-pill">
          {state.phase === "build"
            ? "Phase 1 · Build"
            : state.phase === "attack"
              ? "Phase 2 · Under Attack"
              : "Phase 2 · Review"}
        </p>
      </div>

      <ReadinessPanel readiness={readiness} precise={showPreciseReadiness} filled={SLOT_IDS.filter((slot) => state.placements[slot]).length} />

      <div className="lab-workspace">
        {state.phase === "build" ? (
          <ComponentPalette
            difficulty={state.difficulty}
            selectedId={selectedId}
            locked={locked}
            onSelect={handleSelect}
            onDragStart={setDraggingId}
            onDragEnd={() => setDraggingId(null)}
          />
        ) : (
          <aside className="lab-palette lab-palette--locked" aria-hidden="true">
            <div className="lab-palette__head">
              <h2>Components locked</h2>
              <p>Replace components after the attack by choosing Improve and Retry.</p>
            </div>
          </aside>
        )}
        <ArchitectureCanvas
          placements={state.placements}
          difficulty={state.difficulty}
          selectedComponentId={selectedId}
          draggingId={draggingId}
          locked={locked}
          highlighted={highlighted}
          activeStage={activeStage}
          inspectId={inspectId}
          onPlace={handlePlace}
          onInspect={setInspectId}
        />
      </div>

      {state.phase === "review" && simulation ? (
        <ArchitectureReview
          simulation={simulation}
          difficulty={state.difficulty}
          onReviewArchitecture={() => {
            const first = simulation.stages[0];
            setInspectId(first?.highlight[0] ?? "ai-application");
            document.querySelector(".lab-canvas")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
          }}
          onRetry={handleRetry}
        />
      ) : (
        <AttackSimulator
          phase={state.phase}
          difficulty={state.difficulty}
          revealedStageCount={revealed}
          simulation={simulation}
          missingMessage={missingMessage}
          onLaunch={handleLaunch}
          onNext={handleNext}
          onReset={() => {
            update({ ...state, placements: {} });
            setSelectedId(null);
            setMissingMessage(null);
          }}
        />
      )}

      <p className="lab-company">
        Fictional company: {LAB_MISSION.attack.company}. {LAB_MISSION.attack.fictionalNote}
      </p>
      <EducationalDisclaimer variant="short" className="lab-disclaimer" />
    </div>
  );
}

function ReadinessPanel({
  readiness,
  precise,
  filled,
}: {
  readiness: ReturnType<typeof readinessFor>;
  precise: boolean;
  filled: number;
}) {
  const band = readinessBand(readiness.overall);
  return (
    <section className="lab-readiness" aria-label="Defence readiness">
      <div className="lab-readiness__main">
        <p>Defence readiness</p>
        {precise ? <strong>{filled === 0 ? "—" : `${readiness.overall}`}</strong> : <strong className={`is-${band}`}>{band}</strong>}
        <div className="lab-readiness__bar" aria-hidden="true">
          <span style={{ width: `${filled === 0 ? 0 : readiness.overall}%` }} />
        </div>
      </div>
      <ul>
        {(["prevention", "dataProtection", "containment", "detection"] as const).map((pillar) => {
          const label =
            pillar === "dataProtection" ? "Data protection" : pillar.charAt(0).toUpperCase() + pillar.slice(1);
          const value = readiness[pillar];
          return (
            <li key={pillar}>
              <span>{label}</span>
              <b>{precise ? `${value}` : readinessBand(value)}</b>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
