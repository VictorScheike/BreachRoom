import { SCORING_CONFIG } from "@/lib/simulation/scoring";
import { SCORE_DIMENSIONS } from "@/lib/simulation/types";

export function StatusPanel() {
  return (
    <aside className="panel p-4" aria-label="Response status">
      <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
        Response status
      </h2>
      <p className="mt-2 text-xs leading-5 text-muted">
        Assessment is active. Numerical scores stay hidden until the after-action
        report.
      </p>
      <ul className="mt-4 space-y-2">
        {SCORE_DIMENSIONS.map((dimension) => (
          <li
            key={dimension}
            className="rounded-lg border border-line bg-navy-700 px-3 py-2.5"
          >
            <p className="text-sm font-medium">
              {SCORING_CONFIG.dimensionLabels[dimension]}
            </p>
            <p className="mt-1 flex items-center gap-2 text-xs text-muted">
              <span className="flex items-center gap-1" aria-hidden="true">
                <span className="status-dot h-1.5 w-1.5 rounded-full bg-cyan" />
                <span className="status-dot h-1.5 w-1.5 rounded-full bg-cyan" />
                <span className="status-dot h-1.5 w-1.5 rounded-full bg-cyan" />
              </span>
              Assessment in progress
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
