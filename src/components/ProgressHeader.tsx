interface ProgressHeaderProps {
  scenarioTitle: string;
  timestamp: string;
  currentDecision: number;
  totalDecisions: number;
}

export function ProgressHeader({
  scenarioTitle,
  timestamp,
  currentDecision,
  totalDecisions,
}: ProgressHeaderProps) {
  const percent = Math.round((currentDecision / totalDecisions) * 100);

  return (
    <header className="panel p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-cyan uppercase">
            Active incident
          </p>
          <h1 className="mt-1 text-xl font-semibold sm:text-2xl">{scenarioTitle}</h1>
        </div>
        <div className="flex flex-col gap-1 sm:items-end">
          <p className="font-mono text-sm text-amber">
            Simulated time: <time dateTime={timestamp}>{timestamp}</time>
          </p>
          <p className="text-sm text-muted">
            Decision {currentDecision} of {totalDecisions}
          </p>
        </div>
      </div>
      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-navy-600"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={totalDecisions}
        aria-valuenow={currentDecision}
        aria-label={`Scenario progress: decision ${currentDecision} of ${totalDecisions}`}
      >
        <div
          className="h-full rounded-full bg-cyan-strong"
          style={{ width: `${percent}%` }}
        />
      </div>
    </header>
  );
}
