"use client";

import Link from "next/link";
import type { AttackSimulation } from "@/lib/lab/types";

export function FinalReview({
  simulation,
  onRetry,
  onReplay,
}: {
  simulation: AttackSimulation;
  onRetry: () => void;
  onReplay: () => void;
}) {
  const review = simulation.review;
  const protectedItems = review.protectedItems.slice(0, 3);
  const exposedItems = review.exposedItems.slice(0, 3);
  return (
    <section className="lab-final" aria-labelledby="lab-final-heading">
      <p className={`lab-final__result is-${simulation.result}`}>{simulation.resultLabel}</p>
      <h2 id="lab-final-heading" className="lab-final__heading">
        {simulation.resultLabel}
      </h2>
      <div className="lab-final__brief">
        <article>
          <h3>Protected</h3>
          <ul>
            {protectedItems.map((item) => (
              <li key={item}>{shortBullet(item)}</li>
            ))}
          </ul>
        </article>
        <article>
          <h3>Exposed</h3>
          <ul>
            {exposedItems.length > 0
              ? exposedItems.map((item) => <li key={item}>{shortBullet(item)}</li>)
              : <li>No technique completed its objective.</li>}
          </ul>
        </article>
      </div>
      <p>
        <strong>Greatest impact.</strong> {review.greatestImpact}
      </p>
      <p>
        <strong>Improve.</strong> {review.recommendedImprovement}
      </p>
      <details className="lab-final__log">
        <summary>View full attack log</summary>
        <ol>
          {simulation.stages.map((stage) => (
            <li key={stage.id}>
              {stage.isPivot ? "Pivot · " : ""}
              {stage.name}: {stage.impact}
            </li>
          ))}
        </ol>
      </details>
      <div className="lab-final__actions">
        <button type="button" className="lab-secondary" onClick={onReplay}>
          Replay attack
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

function shortBullet(item: string): string {
  const cut = item.split(":")[0]?.trim();
  return cut && cut.length > 0 && cut.length < 48 ? cut : item;
}
