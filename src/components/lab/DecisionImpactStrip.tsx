"use client";

import type { SubgraphOutcome } from "@/lib/lab/subgraphs";

export function DecisionImpactStrip({ outcome }: { outcome: SubgraphOutcome | null }) {
  if (!outcome) {
    return (
      <p className="decision-strip is-idle" role="status">
        Select a control to see which systems this decision changes.
      </p>
    );
  }
  return (
    <p className={`decision-strip is-${outcome.controlStatus}`} role="status" aria-live="polite">
      <strong>{outcome.controlStatus === "held" ? "BLOCKED" : "EXPOSED"}</strong>
      <span>{outcome.headline}</span>
      <span>{outcome.explanation}</span>
    </p>
  );
}
