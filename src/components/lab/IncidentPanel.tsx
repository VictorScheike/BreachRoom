"use client";

import { nodeById } from "@/lib/lab/catalog";
import { compactOutcome, type AttackBeat, type IncidentLogEvent } from "@/lib/lab/animation";
import { OUTCOME_LABELS } from "@/lib/lab/copy";
import type { ResolvedStage } from "@/lib/lab/types";

export function IncidentPanel({
  stage,
  beat,
  log,
  readyMessage,
}: {
  stage: ResolvedStage | null;
  beat?: AttackBeat | null;
  log: readonly IncidentLogEvent[];
  readyMessage?: string;
}) {
  if (!stage) {
    return (
      <aside className="lab-incident" aria-label="Incident panel">
        <p className="lab-kicker">Incident</p>
        <p>{readyMessage ?? "Run the Red Team campaign to watch each technique test the architecture you built."}</p>
      </aside>
    );
  }

  const recent = log.slice(-3);
  const older = log.slice(0, -3);
  const targetId = beat?.toNode ?? beat?.markerNode ?? stage.stopNode;
  const target = nodeById(targetId);
  const showResult = beat?.kind === "result" || !beat;

  if (beat?.kind === "pivot") {
    return (
      <aside className="lab-incident is-pivot" aria-live="polite" aria-label="Incident panel">
        <p className="lab-kicker">Red Team</p>
        <h2>Red Team pivots</h2>
        <p className="lab-incident__response">{stage.pivotLabel ?? "Blocked. Red Team changes technique."}</p>
        <ul className="lab-incident__log">
          {recent.map((event) => (
            <li key={event.id} className={`is-${event.tone}`}>
              {event.text}
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  return (
    <aside className="lab-incident" aria-live="polite" aria-label="Incident panel">
      <p className="lab-kicker">Technique {stage.number} of 7</p>
      <h2>{stage.name}</h2>
      <p className="lab-incident__target">Target: {target.name}</p>
      <p className="lab-incident__response">{showResult ? stage.explanation : stage.attackerAction}</p>
      {showResult ? (
        <p className={`lab-incident__outcome is-${stage.outcome}`}>
          {OUTCOME_LABELS[stage.outcome] ?? compactOutcome(stage.outcome)}
        </p>
      ) : null}
      <ul className="lab-incident__log">
        {recent.map((event) => (
          <li key={event.id} className={`is-${event.tone}`}>
            {event.text}
          </li>
        ))}
      </ul>
      {older.length > 0 ? (
        <details className="lab-incident__more">
          <summary>Earlier events</summary>
          <ul>
            {older.map((event) => (
              <li key={event.id}>{event.text}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </aside>
  );
}
