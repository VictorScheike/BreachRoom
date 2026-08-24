import type { RecordedDecision, Scenario, ScenarioStage } from "@/lib/simulation/types";
import { findOption } from "@/lib/simulation/lookups";

interface IncidentTimelineProps {
  scenario: Scenario;
  currentStage: ScenarioStage;
  decisions: readonly RecordedDecision[];
  variant: "live" | "report";
}

export function IncidentTimeline({
  scenario,
  currentStage,
  decisions,
  variant,
}: IncidentTimelineProps) {
  const currentIndex = scenario.stages.findIndex(
    (item) => item.id === currentStage.id,
  );
  const visibleStages =
    variant === "report"
      ? scenario.stages
      : scenario.stages.slice(0, currentIndex + 1);

  return (
    <section className="panel p-4" aria-label="Incident timeline">
      <h2 className="text-sm font-semibold tracking-wide uppercase text-muted">
        Incident timeline
      </h2>
      <ol className="mt-4 space-y-3">
        {visibleStages.map((stage) => {
          const recorded = decisions.find((decision) => decision.stageId === stage.id);
          const isCurrent = stage.id === currentStage.id && variant === "live";
          const selectedTitle = recorded
            ? findOption(scenario, stage.id, recorded.optionId).title
            : null;

          return (
            <li
              key={stage.id}
              className={`rounded-lg border px-3 py-3 ${
                isCurrent
                  ? "border-amber/50 bg-navy-700"
                  : "border-line bg-navy-900/60"
              }`}
            >
              <p className="font-mono text-xs text-cyan">{stage.timestamp}</p>
              <p className="mt-1 text-sm font-medium">{stage.title}</p>
              {isCurrent ? (
                <p className="mt-1 text-xs text-amber">In progress</p>
              ) : null}
              {selectedTitle ? (
                <p className="mt-1 text-xs text-muted">
                  Decision recorded: {selectedTitle}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
