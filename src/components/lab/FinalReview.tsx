"use client";

import Link from "next/link";
import { TECHNIQUE_COUNT, decisionById, nodeById } from "@/lib/lab/catalog";
import { OUTCOME_LABELS } from "@/lib/lab/copy";
import type { AttackSimulation, AttackTechniqueId, DefencePillar, ResolvedStage } from "@/lib/lab/types";

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
  const focused =
    simulation.stages.find((item) => item.id === focusedStageId) ??
    defaultFocusedStage(simulation) ??
    simulation.stages[0] ??
    null;

  return (
    <section className="lab-final" aria-labelledby="lab-final-heading">
      <p className={`lab-final__result is-${simulation.result}`}>{simulation.resultLabel}</p>
      <h2 id="lab-final-heading">{simulation.resultSummary}</h2>
      <p className="lab-final__impact">{review.greatestImpact}</p>
      <dl className="lab-final__facts">
        <div>
          <dt>Attack ended at</dt>
          <dd>{review.endedAt}</dd>
        </div>
        <div>
          <dt>Systems compromised</dt>
          <dd>{review.compromisedSystems.join(", ") || "None"}</dd>
        </div>
        <div>
          <dt>Never reached</dt>
          <dd>{review.neverReached.join(", ") || "None"}</dd>
        </div>
        <div>
          <dt>Control that stopped progression</dt>
          <dd>{review.stoppingControl}</dd>
        </div>
        <div>
          <dt>Monitoring</dt>
          <dd>{review.detectionOccurred ? "Detected" : "Did not correlate this incident in time"}</dd>
        </div>
        <div>
          <dt>Recovery</dt>
          <dd>{review.recoveryReadiness}</dd>
        </div>
      </dl>
      <p className="lab-final__asset">
        <strong>Furthest asset reached:</strong> {review.assetReached}
      </p>
      <p className="lab-final__score">Architecture score {simulation.score} — the path matters more than the number.</p>
      {focused ? <StageExplanation stage={focused} total={TECHNIQUE_COUNT} /> : null}
      <ol className="attack-timeline" aria-label="Attack timeline">
        {simulation.stages.map((stage) => (
          <li key={stage.id}>
            <button
              type="button"
              className={focused?.id === stage.id ? "is-active" : ""}
              onClick={() => onFocusStage?.(stage.id)}
            >
              <span>{stage.name}</span>
              <strong className={`is-${stage.outcome}`}>{OUTCOME_LABELS[stage.outcome]}</strong>
            </button>
          </li>
        ))}
      </ol>
      <div className="lab-pillars" aria-label="Defence report">
        {review.pillars.map((pillar) => (
          <PillarCard key={pillar.id} pillar={pillar} />
        ))}
      </div>
      {review.remainingRisks.length > 0 ? (
        <div className="lab-final__brief">
          <h3>Remaining risks</h3>
          <ul>
            {review.remainingRisks.slice(0, 4).map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="lab-final__brief">
        <h3>Prioritised improvements</h3>
        <ol>
          {review.improvements.map((item) => (
            <li key={item.decisionId}>
              <strong>{item.title}.</strong> {item.why}
            </li>
          ))}
        </ol>
      </div>
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

function PillarCard({ pillar }: { pillar: DefencePillar }) {
  return (
    <article className={`lab-pillar is-${pillar.id}`}>
      <p className="lab-kicker">{pillar.label}</p>
      <p className="lab-pillar__score">{pillar.id === "recovery" && pillar.summary.includes("not required") ? "—" : pillar.score}</p>
      <p>{pillar.summary}</p>
      {pillar.worked[0] ? <p className="lab-pillar__worked">{pillar.worked[0]}</p> : null}
      {pillar.failed[0] ? <p className="lab-pillar__failed">{pillar.failed[0]}</p> : null}
    </article>
  );
}

function StageExplanation({ stage, total }: { stage: ResolvedStage; total: number }) {
  const decision = decisionById(stage.testedDecisionId);
  const stop = nodeById(stage.stopNode);
  const control = nodeById(stage.responsibleNode);
  return (
    <article className="lab-final__detail" aria-live="polite">
      <p className="lab-kicker">
        Attack step {stage.number} of {total} · {OUTCOME_LABELS[stage.outcome]}
      </p>
      <h3>{stage.name}</h3>
      <p className="lab-final__choice">
        <strong>Because you chose:</strong> {stage.choiceTitle}
      </p>
      <p className="lab-final__question">{decision.question}</p>
      <dl className="lab-final__story">
        <div>
          <dt>Required previous access</dt>
          <dd>{stage.requiredAccess}</dd>
        </div>
        <div>
          <dt>Target</dt>
          <dd>{stage.target}</dd>
        </div>
        <div>
          <dt>What the attacker tried</dt>
          <dd>{stage.attackerAction}</dd>
        </div>
        <div>
          <dt>Control being tested</dt>
          <dd>
            {control.name}. {stage.controlResponse}
          </dd>
        </div>
        <div>
          <dt>What happened</dt>
          <dd>{stage.explanation}</dd>
        </div>
        <div>
          <dt>Where it ended</dt>
          <dd>
            {stop.name}. {stage.impact}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function defaultFocusedStage(simulation: AttackSimulation): ResolvedStage | undefined {
  const blocked = simulation.stages.find((item) => item.outcome === "blocked");
  if (blocked) {
    return blocked;
  }
  if (simulation.result === "breached") {
    return (
      simulation.stages.find((item) => item.id === "extract-modify" && item.outcome !== "not-reached") ??
      simulation.stages.find((item) => item.id === "payout-manipulation" && item.outcome !== "not-reached")
    );
  }
  return simulation.stages.find((item) => item.outcome === "contained") ?? simulation.stages.find((item) => item.id === "contain-recover");
}
