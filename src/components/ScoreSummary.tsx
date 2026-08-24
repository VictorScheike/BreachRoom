import { SCORING_CONFIG } from "@/lib/simulation/scoring";
import { SCORE_DIMENSIONS } from "@/lib/simulation/types";
import type { AfterActionReport } from "@/lib/simulation/types";

interface ScoreSummaryProps {
  report: AfterActionReport;
}

export function ScoreSummary({ report }: ScoreSummaryProps) {
  return (
    <section className="panel p-6 sm:p-8" aria-labelledby="score-heading">
      <p className="font-mono text-xs tracking-[0.2em] text-cyan uppercase">
        {report.scoreCaption}
      </p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-6xl font-semibold tracking-tight text-ink">
            {report.overallScore}
            <span className="ml-2 text-2xl text-muted">/ 100</span>
          </p>
          <h2 id="score-heading" className="mt-3 text-2xl font-semibold">
            {report.resultLabel}
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted">
          This is a BreachRoom simulation score for the decisions made in this
          exercise. It is not an official maturity, compliance or security
          certification.
        </p>
      </div>

      <ul className="mt-8 space-y-4" aria-label="Category scores">
        {SCORE_DIMENSIONS.map((dimension) => {
          const score = report.categoryScores[dimension];
          return (
            <li key={dimension}>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <p className="font-medium">
                  {SCORING_CONFIG.dimensionLabels[dimension]}
                </p>
                <p className="font-mono text-sm text-muted">
                  {score} / 100
                </p>
              </div>
              <div
                className="h-3 overflow-hidden rounded-full bg-navy-600"
                role="img"
                aria-label={`${SCORING_CONFIG.dimensionLabels[dimension]} score ${score} out of 100`}
              >
                <div
                  className="h-full rounded-full bg-cyan-strong"
                  style={{ width: `${score}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted">
                {SCORING_CONFIG.dimensionSummaries[dimension]}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
