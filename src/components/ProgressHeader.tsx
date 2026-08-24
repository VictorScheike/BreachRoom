import { AlertIcon, severityTone } from "@/components/icons";
import type { IncidentSeverity } from "@/lib/simulation/types";

interface ProgressHeaderProps {
  scenarioTitle: string;
  clockTime: string;
  timestamp: string;
  severity: IncidentSeverity;
  currentDecision: number;
  totalDecisions: number;
}

export function ProgressHeader({
  scenarioTitle,
  clockTime,
  timestamp,
  severity,
  currentDecision,
  totalDecisions,
}: ProgressHeaderProps) {
  const percent = Math.round((currentDecision / totalDecisions) * 100);
  const tone = severityTone(severity);
  const severityClass =
    tone === "critical"
      ? "border-incident/50 text-incident"
      : "border-amber/50 text-amber";

  return (
    <header className="panel overflow-hidden p-0">
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs tracking-[0.12em] uppercase sm:text-sm">
          <span className="inline-flex items-center gap-2 text-amber">
            <span className="h-2 w-2 rounded-full bg-amber" aria-hidden="true" />
            Live
          </span>
          <span className="hidden text-line sm:inline" aria-hidden="true">
            |
          </span>
          <time dateTime={timestamp} className="text-cyan">
            {clockTime}
          </time>
          <span className="hidden text-line sm:inline" aria-hidden="true">
            |
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 ${severityClass}`}
          >
            <AlertIcon className="h-3.5 w-3.5" />
            Incident level: {severity}
          </span>
          <span className="hidden text-line sm:inline" aria-hidden="true">
            |
          </span>
          <span className="text-ink">
            Decision {currentDecision} of {totalDecisions}
          </span>
        </div>
        <p className="text-xs text-muted lg:max-w-sm lg:text-right">{scenarioTitle}</p>
      </div>
      <div
        className="h-1.5 bg-navy-600"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={totalDecisions}
        aria-valuenow={currentDecision}
        aria-label={`Scenario progress: decision ${currentDecision} of ${totalDecisions}`}
      >
        <div
          className="score-bar h-full bg-cyan-strong transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </header>
  );
}
