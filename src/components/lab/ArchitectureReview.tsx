import Link from "next/link";
import { AttackResultBanner } from "@/components/lab/AttackResult";
import { AttackStageCard } from "@/components/lab/AttackStage";
import { LAB_MISSION } from "@/lib/lab/catalog";
import type { AttackSimulation, LabDifficulty } from "@/lib/lab/types";

export function ArchitectureReview({
  simulation,
  difficulty,
  onReviewArchitecture,
  onRetry,
}: {
  simulation: AttackSimulation;
  difficulty: LabDifficulty;
  onReviewArchitecture: () => void;
  onRetry: () => void;
}) {
  const review = simulation.review;
  return (
    <section className="lab-review" aria-label="Architecture review">
      <AttackResultBanner simulation={simulation} />
      <div className="lab-review__grid">
        <article>
          <h3>Stage-by-stage results</h3>
          <ol className="lab-review-stages">
            {simulation.stages.map((stage, index) => {
              const definition = LAB_MISSION.attack.stages[index];
              if (!definition) {
                return null;
              }
              return (
                <li key={stage.id}>
                  <AttackStageCard
                    stage={stage}
                    definitionSummary={definition.summary}
                    guidedDetail={definition.guidedDetail}
                    architectPrompt={definition.architectPrompt}
                    difficulty={difficulty}
                    active={false}
                    revealed
                  />
                </li>
              );
            })}
          </ol>
        </article>
        <article>
          <h3>Architecture strengths</h3>
          <ul>{review.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3>Architecture weaknesses</h3>
          <ul>{review.weaknesses.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3>Data exposed</h3>
          <p>{review.dataExposed}</p>
          <h3>Controls that blocked or limited the attack</h3>
          <ul>
            {review.blockedControls.length > 0
              ? review.blockedControls.map((item) => <li key={item}>{item}</li>)
              : <li>No control fully stopped a payload stage.</li>}
          </ul>
          <h3>Controls that failed</h3>
          <ul>
            {review.failedControls.length > 0
              ? review.failedControls.map((item) => <li key={item}>{item}</li>)
              : <li>No payload stage completed against a chosen control.</li>}
          </ul>
        </article>
        <article>
          <h3>Best architecture decision</h3>
          <p>{review.bestDecision}</p>
          <h3>Most important improvement</h3>
          <p>{review.mostImportantImprovement}</p>
          <h3>Residual risk</h3>
          <p>{review.residualRisk}</p>
          <h3>Business trade-offs</h3>
          <p>{review.businessTradeOffs}</p>
          <h3>Defence in depth</h3>
          <p>{review.defenceInDepth}</p>
          <h3>Recommended next steps</h3>
          <ul>
            {review.nextSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>How this maps</h3>
          <ul className="lab-review-map">
            {review.mappings.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.note}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
      <div className="lab-review__actions">
        <button type="button" className="lab-btn lab-btn-secondary" onClick={onReviewArchitecture}>
          Review Architecture
        </button>
        <button type="button" className="lab-btn lab-btn-primary" onClick={onRetry}>
          Improve and Retry
        </button>
        <Link className="lab-btn lab-btn-secondary" href="/missions/">
          End Mission
        </Link>
      </div>
    </section>
  );
}
