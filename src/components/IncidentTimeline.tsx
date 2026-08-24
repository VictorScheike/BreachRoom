import { eventTypeIcon } from "@/components/icons";
import type { TimelineEvent } from "@/lib/simulation/types";

interface IncidentTimelineProps {
  events: readonly TimelineEvent[];
  variant: "live" | "report";
}

export function IncidentTimeline({ events, variant }: IncidentTimelineProps) {
  return (
    <section className="panel flex h-full flex-col p-4" aria-label="Incident timeline">
      <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
        Incident timeline
      </h2>
      <p className="mt-1 text-xs text-muted">
        Updates and locked decisions appear in order. Colour is not the only signal:
        each event has a type label and icon.
      </p>
      <ol className="relative mt-4 space-y-3 border-l border-line pl-4">
        {events.map((event) => {
          const Icon = eventTypeIcon(event.eventType);
          const isDecision = event.kind === "decision";

          return (
            <li key={event.id} className="timeline-item relative">
              <span
                className={`absolute -left-[1.4rem] top-3 flex h-4 w-4 items-center justify-center rounded-full border ${
                  isDecision
                    ? "border-cyan bg-navy-900 text-cyan"
                    : event.isCurrent
                      ? "border-amber bg-amber text-navy-950"
                      : "border-amber/70 bg-navy-900 text-amber"
                }`}
                aria-hidden="true"
              >
                <Icon className="h-2.5 w-2.5" />
              </span>
              <article
                className={`rounded-xl border px-3 py-3 ${
                  isDecision
                    ? "border-cyan/30 bg-navy-900/80"
                    : event.isCurrent
                      ? "border-amber/50 bg-navy-700"
                      : "border-line bg-navy-900/60"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`font-mono text-[0.65rem] tracking-[0.16em] uppercase ${
                      isDecision ? "text-cyan" : "text-amber"
                    }`}
                  >
                    {event.eventType}
                  </p>
                  <time className="font-mono text-[0.65rem] text-muted">
                    {event.clockTime}
                  </time>
                </div>
                <p className="mt-1 text-sm font-medium">{event.title}</p>
                {event.isCurrent && variant === "live" ? (
                  <p className="mt-1 text-xs text-amber">Current incident</p>
                ) : null}
                {isDecision ? (
                  <p className="mt-1 text-xs text-muted">{event.detail}</p>
                ) : null}
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
