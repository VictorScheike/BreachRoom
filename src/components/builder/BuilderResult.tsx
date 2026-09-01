import Link from "next/link";
import { BuilderResetButton } from "@/components/builder/BuilderResetButton";
import { categoryLabel } from "@/lib/builder/scoring";
import { BUILDER_QUESTION_COUNT } from "@/lib/builder/types";
import type { BuilderScore } from "@/lib/builder/types";

export function BuilderResult({
  score,
  bestScore,
  onReview,
  onReplay,
  onReset,
}: {
  score: BuilderScore;
  bestScore: number | null;
  onReview: () => void;
  onReplay: () => void;
  onReset: () => void;
}) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score.percent / 100) * circumference;

  return (
    <section className="builder-result" aria-labelledby="builder-result-heading">
      <p className="builder-kicker">Secure Solution Builder</p>
      <h1 id="builder-result-heading">Your secure build result</h1>
      <div className="builder-result__hero">
        <div className="builder-score-ring" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" />
            <circle
              cx="50"
              cy="50"
              r="42"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <strong>
            {score.correct} / {score.total}
          </strong>
        </div>
        <div>
          <p className="builder-result__percent">{score.percent}%</p>
          <h2>{score.level.title}</h2>
          <p>{score.level.text}</p>
          {bestScore !== null ? (
            <p className="builder-result__best">
              Best score: {bestScore} / {BUILDER_QUESTION_COUNT}
            </p>
          ) : null}
        </div>
      </div>

      <ul className="builder-result__counts">
        <li>
          <strong>{score.correct}</strong>
          <span>Correct decisions</span>
        </li>
        <li>
          <strong>{score.missed.length}</strong>
          <span>Missed decisions</span>
        </li>
      </ul>

      <h2>Category scores</h2>
      <ul className="builder-categories">
        {score.categoryScores.map((item) => (
          <li key={item.categoryId}>
            <div>
              <strong>{categoryLabel(item.categoryId)}</strong>
              <span>
                {item.correct} / {item.total}
              </span>
            </div>
            <div className="builder-categories__bar" aria-hidden="true">
              <span style={{ width: `${(item.correct / item.total) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>

      {score.recommendations.length > 0 ? (
        <>
          <h2>Areas to practise</h2>
          <ul className="builder-recommendations">
            {score.recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : (
        <p className="builder-result__perfect">
          No missed decisions. Keep using this approach when a real solution is being designed.
        </p>
      )}

      <div className="builder-result__actions">
        {score.missed.length > 0 ? (
          <button type="button" className="builder-secondary" onClick={onReview}>
            Review missed decisions
          </button>
        ) : null}
        <button type="button" className="builder-primary" onClick={onReplay}>
          Play again
        </button>
        <BuilderResetButton onReset={onReset} />
        <Link className="builder-secondary" href="/missions/">
          Back to missions
        </Link>
      </div>
    </section>
  );
}
