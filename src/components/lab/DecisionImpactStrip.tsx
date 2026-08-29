"use client";

import type { SubgraphOutcome } from "@/lib/lab/subgraphs";

export function DecisionImpactStrip({
  outcome,
  awaitingLock = false,
}: {
  outcome: SubgraphOutcome | null;
  awaitingLock?: boolean;
}) {
  if (outcome) {
    return (
      <p className={`decision-strip is-${outcome.controlStatus}`} role="status" aria-live="polite">
        <strong>{outcome.controlStatus === "held" ? "BLOCKED" : "EXPOSED"}</strong>
        <span>{outcome.headline}</span>
        <span>{outcome.explanation}</span>
      </p>
    );
  }
  if (awaitingLock) {
    return (
      <p className="decision-strip is-idle" role="status">
        Next saves this control and moves on. The path stays neutral so the answer is not given away.
      </p>
    );
  }
  return (
    <p className="decision-strip is-idle" role="status">
      Select a control to see which systems this decision changes.
    </p>
  );
}
