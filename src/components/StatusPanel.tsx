import { SCORING_CONFIG } from "@/lib/simulation/scoring";
import { SCORE_DIMENSIONS } from "@/lib/simulation/types";

export function StatusPanel() {
  return (
    <aside className="panel p-4" aria-label="Assessment status">
      <h2 className="text-sm font-semibold tracking-wide uppercase text-muted">
        Response areas
      </h2>
      <p className="mt-2 text-xs leading-5 text-muted">
        Scores stay hidden until the after-action report. Each area is marked
        assessment in progress so colour is not used as the only status signal.
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {SCORE_DIMENSIONS.map((dimension) => (
          <li
            key={dimension}
            className="rounded-lg border border-line bg-navy-700 px-3 py-2"
          >
            <p className="text-sm font-medium">
              {SCORING_CONFIG.dimensionLabels[dimension]}
            </p>
            <p className="text-xs text-muted">Assessment in progress</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
