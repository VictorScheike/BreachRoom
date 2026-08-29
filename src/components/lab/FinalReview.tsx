"use client";

import Link from "next/link";
import { OUTCOME_LABELS } from "@/lib/lab/copy";
import type { AttackSimulation, AttackTechniqueId } from "@/lib/lab/types";

export function FinalReview({
  simulation,
  focusedStageId,
  onFocusStage,
  onRetry,
  onReplay,
  onImproveControl,
}: {
  simulation: AttackSimulation;
  focusedStageId?: string | null;
  onFocusStage?: (id: AttackTechniqueId) => void;
  onRetry: () => void;
  onReplay: () => void;
  onImproveControl?: () => void;
}) {
  const review = simulation.review;
  return (
    <section className="lab-final" aria-labelledby="lab-final-heading">
      <p className={`lab-final__result is-${simulation.result}`}>{simulation.resultLabel}</p>
      <h2 id="lab-final-heading">{simulation.resultSummary}</h2>
      <p className="lab-final__impact">{review.greatestImpact}</p>
      <ol className="attack-timeline" aria-label="Attack timeline">
        {simulation.stages.map((stage) => (
          <li key={stage.id}>
            <button
              type="button"
              className={focusedStageId === stage.id ? "is-active" : ""}
              onClick={() => onFocusStage?.(stage.id)}
            >
              <span>
                {stage.isPivot ? "Pivot · " : ""}
                {stage.name}
              </span>
              <strong className={`is-${stage.outcome}`}>{OUTCOME_LABELS[stage.outcome]}</strong>
            </button>
          </li>
        ))}
      </ol>
      <p>
        <strong>Improve this control.</strong> {review.recommendedImprovement}
      </p>
      <div className="lab-final__actions">
        <button type="button" className="lab-secondary" onClick={onReplay}>
          Replay attack
        </button>
        <button type="button" className="lab-secondary" onClick={onImproveControl ?? onRetry}>
          Improve this control
        </button>
        <button type="button" className="lab-secondary" onClick={onRetry}>
          Improve and retry
        </button>
        <Link className="lab-primary" href="/missions/">
          End mission
        </Link>
      </div>
    </section>
  );
}
