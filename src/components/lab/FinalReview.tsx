"use client";

import Link from "next/link";
import type { AttackSimulation, LabDifficulty } from "@/lib/lab/types";

export function FinalReview({
  simulation,
  onRetry,
  onReplay,
}: {
  simulation: AttackSimulation;
  difficulty: LabDifficulty;
  onRetry: () => void;
  onReplay: () => void;
}) {
  const review = simulation.review;
  return (
    <section className="lab-final" aria-labelledby="lab-final-heading">
      <p className={`lab-final__result is-${simulation.result}`}>{simulation.resultLabel}</p>
      <h2 id="lab-final-heading">{simulation.resultSummary}</h2>
      <div className="lab-final__grid">
        <article>
          <h3>What was protected</h3>
          <ul>
            {review.protectedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <h3>What was exposed</h3>
          <ul>
            {review.exposedItems.length > 0
              ? review.exposedItems.map((item) => <li key={item}>{item}</li>)
              : <li>No technique completed its objective against the controls you chose.</li>}
          </ul>
        </article>
        <article>
          <h3>Greatest impact</h3>
          <p>{review.greatestImpact}</p>
          <h3>Defence in depth</h3>
          <p>{review.defenceInDepth}</p>
          <h3>Recommended improvement</h3>
          <p>{review.recommendedImprovement}</p>
        </article>
      </div>
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
