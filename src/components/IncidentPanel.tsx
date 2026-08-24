import { AlertIcon, severityTone } from "@/components/icons";
import type { ScenarioStage } from "@/lib/simulation/types";

interface IncidentPanelProps {
  stage: ScenarioStage;
}

export function IncidentPanel({ stage }: IncidentPanelProps) {
  const tone = severityTone(stage.severity);
  const accent =
    tone === "critical" ? "border-incident/40" : "border-amber/45";
  const label =
    tone === "critical" ? "text-incident" : "text-amber";

  return (
    <section
      className={`incident-enter panel ${accent} p-5 sm:p-6`}
      aria-labelledby="latest-update"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={`inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] uppercase ${label}`}>
          <AlertIcon className="h-4 w-4" />
          {stage.eventType}
        </p>
        <time className="font-mono text-xs text-muted" dateTime={stage.timestamp}>
          {stage.timestamp}
        </time>
      </div>
      <h2 id="latest-update" className="mt-3 text-2xl font-semibold">
        {stage.title}
      </h2>
      <p className="mt-3 text-base leading-7">{stage.incidentUpdate}</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-navy-900/70 p-4">
          <h3 className="text-sm font-semibold">Available facts</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
            {stage.availableFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-line bg-navy-900/70 p-4">
          <h3 className="text-sm font-semibold">Known unknowns</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
            {stage.knownUnknowns.map((unknown) => (
              <li key={unknown}>{unknown}</li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
