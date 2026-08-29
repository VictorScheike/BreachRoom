"use client";

import { nodeById } from "@/lib/lab/catalog";
import { OUTCOME_LABELS } from "@/lib/lab/copy";
import type { ResolvedStage } from "@/lib/lab/types";

export function IncidentPanel({ stage }: { stage: ResolvedStage | null }) {
  if (!stage) {
    return (
      <aside className="lab-incident" aria-label="Incident panel">
        <p className="lab-kicker">Incident panel</p>
        <p>Run the Red Team campaign to watch each technique test the architecture you built.</p>
      </aside>
    );
  }

  return (
    <aside className="lab-incident" aria-live="polite" aria-label="Incident panel">
      <p className="lab-kicker">{stage.isPivot ? "Pivot" : "Technique"} {stage.number} of 7</p>
      {stage.pivotLabel ? <p className="lab-incident__pivot">{stage.pivotLabel}</p> : null}
      <h2>{stage.name}</h2>
      <dl>
        <div>
          <dt>Current technique</dt>
          <dd>{stage.name}</dd>
        </div>
        <div>
          <dt>Current target</dt>
          <dd>{nodeById(stage.stopNode).name}</dd>
        </div>
        <div>
          <dt>Control response</dt>
          <dd>{stage.controlResponse}</dd>
        </div>
        <div>
          <dt>Explanation</dt>
          <dd>{stage.explanation}</dd>
        </div>
        <div>
          <dt>Attack impact</dt>
          <dd>{stage.impact}</dd>
        </div>
      </dl>
      <p className={`lab-incident__outcome is-${stage.outcome}`}>{OUTCOME_LABELS[stage.outcome]}</p>
    </aside>
  );
}
