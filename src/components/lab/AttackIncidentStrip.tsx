"use client";

import { nodeById } from "@/lib/lab/catalog";
import { compactOutcome, type AttackBeat } from "@/lib/lab/animation";
import { OUTCOME_LABELS } from "@/lib/lab/copy";
import type { ResolvedStage } from "@/lib/lab/types";

export function AttackIncidentStrip({
  stage,
  beat,
  paused,
  onPrevious,
  onPause,
  onNext,
  readyMessage,
  canPrevious,
}: {
  stage: ResolvedStage | null;
  beat?: AttackBeat | null;
  paused?: boolean;
  onPrevious?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  readyMessage?: string;
  canPrevious?: boolean;
}) {
  if (!stage) {
    return (
      <aside className="attack-strip" aria-label="Incident strip">
        <p>{readyMessage ?? "Run the Red Team campaign to watch each technique test the architecture you built."}</p>
      </aside>
    );
  }

  const pivot = beat?.kind === "pivot";
  const showResult = beat?.kind === "result" || !beat;
  const target = nodeById(beat?.toNode ?? beat?.markerNode ?? stage.stopNode);
  const headline = pivot
    ? "Blocked — Red Team changes technique"
    : showResult
      ? stage.explanation
      : stage.attackerAction;
  const kicker = pivot
    ? `ATTACK STEP ${stage.number} OF 7 · PIVOT · ${stage.name}`
    : `ATTACK STEP ${stage.number} OF 7 · ${stage.name}`;
  const outcome = showResult && !pivot ? (OUTCOME_LABELS[stage.outcome] ?? compactOutcome(stage.outcome)) : null;

  return (
    <aside className="attack-strip" aria-label="Incident strip">
      <div className="attack-strip__copy">
        <p className="lab-kicker">{kicker}</p>
        <p className="attack-strip__headline" aria-live="polite">
          {headline}
        </p>
        <p className="attack-strip__detail">
          Target: {target.name}
          {outcome ? ` · ${outcome}` : null}
        </p>
      </div>
      <div className="attack-strip__controls">
        <button
          type="button"
          className="lab-hud__btn"
          onClick={onPrevious}
          disabled={canPrevious === false}
          aria-label="Previous attack step"
        >
          Previous
        </button>
        <button type="button" className="lab-hud__btn" onClick={onPause} aria-label={paused ? "Continue attack" : "Pause attack"}>
          {paused ? "Continue" : "Pause"}
        </button>
        <button type="button" className="lab-hud__btn lab-hud__btn--primary" onClick={onNext} aria-label="Next attack step">
          Next
        </button>
      </div>
    </aside>
  );
}
