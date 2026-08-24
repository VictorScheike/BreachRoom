import type { DecisionReviewItem } from "@/lib/simulation/types";

interface DecisionReviewProps {
  item: DecisionReviewItem;
  index: number;
}

export function DecisionReview({ item, index }: DecisionReviewProps) {
  return (
    <details className="panel group p-0">
      <summary className="cursor-pointer list-none rounded-2xl px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs text-cyan">
              Decision {index + 1} · {item.timestamp}
            </p>
            <h3 className="mt-1 text-base font-semibold">{item.stageTitle}</h3>
            <p className="mt-1 text-sm text-muted">Selected: {item.selectedTitle}</p>
          </div>
          <span className="mt-2 text-sm text-cyan sm:mt-0">
            <span className="group-open:hidden">Show analysis</span>
            <span className="hidden group-open:inline">Hide analysis</span>
          </span>
        </div>
      </summary>
      <div className="space-y-4 border-t border-line px-5 py-5 text-sm leading-6">
        <section>
          <h4 className="font-semibold">What happened</h4>
          <p className="mt-1 text-muted">{item.incidentUpdate}</p>
        </section>
        <section>
          <h4 className="font-semibold">What you selected</h4>
          <p className="mt-1 text-muted">{item.selectedDescription}</p>
        </section>
        <section>
          <h4 className="font-semibold">Why the decision mattered</h4>
          <p className="mt-1 text-muted">{item.rationale}</p>
        </section>
        <section>
          <h4 className="font-semibold">Positive aspects</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted">
            {item.strengths.map((strength) => (
              <li key={strength}>{strength}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="font-semibold">Risks or trade-offs</h4>
          <p className="mt-1 text-muted">{item.tradeOffs}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            {item.potentialGaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="font-semibold">A better next step</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted">
            {item.recommendedFollowUp.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </section>
      </div>
    </details>
  );
}
