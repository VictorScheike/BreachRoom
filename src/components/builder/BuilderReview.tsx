import { BuilderResetButton } from "@/components/builder/BuilderResetButton";
import type { BuilderMissedDecision } from "@/lib/builder/types";

export function BuilderReview({
  missed,
  onBack,
  onReset,
}: {
  missed: readonly BuilderMissedDecision[];
  onBack: () => void;
  onReset: () => void;
}) {
  return (
    <section className="builder-review" aria-labelledby="builder-review-heading">
      <p className="builder-kicker">Secure Solution Builder</p>
      <h1 id="builder-review-heading">Missed decisions</h1>
      <p>Review the questions you missed, your answer, and the more secure choice.</p>
      <ol className="builder-review__list">
        {missed.map((item) => (
          <li key={item.question.id}>
            <p className="builder-kicker">
              Question {item.question.number} · {item.question.tags[0]}
            </p>
            <h2>{item.question.prompt}</h2>
            <p>
              <strong>Your answer:</strong> {item.selected.letter}. {item.selected.text}
            </p>
            <p>
              <strong>Better decision:</strong> {item.correct.letter}. {item.correct.text}
            </p>
            <p>{item.correct.feedback}</p>
            <p className="builder-review__tip">{item.recommendation}</p>
          </li>
        ))}
      </ol>
      <div className="builder-review__actions">
        <button type="button" className="builder-primary" onClick={onBack}>
          Back to result
        </button>
        <BuilderResetButton onReset={onReset} />
      </div>
    </section>
  );
}
