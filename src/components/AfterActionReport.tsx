import { DecisionReview } from "@/components/DecisionReview";
import { EducationalDisclaimer } from "@/components/EducationalDisclaimer";
import { IncidentTimeline } from "@/components/IncidentTimeline";
import { ScoreSummary } from "@/components/ScoreSummary";
import { requireStage } from "@/lib/simulation/lookups";
import { buildTimelineEvents } from "@/lib/simulation/timeline";
import type { AfterActionReport, RecordedDecision, Scenario } from "@/lib/simulation/types";

interface AfterActionReportViewProps {
  scenario: Scenario;
  report: AfterActionReport;
  decisions: readonly RecordedDecision[];
  onRestart: () => void;
  onHome: () => void;
}

export function AfterActionReport({
  scenario,
  report,
  decisions,
  onRestart,
  onHome,
}: AfterActionReportViewProps) {
  const lastStage = requireStage(scenario, scenario.stages.length - 1);
  const timelineEvents = buildTimelineEvents(
    scenario,
    decisions,
    lastStage.id,
    "report",
  );

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="panel p-6 sm:p-8">
        <p className="font-mono text-xs tracking-[0.2em] text-cyan uppercase">
          After-action report
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {scenario.title}
        </h1>
        <p className="mt-3 max-w-3xl text-muted">
          This report summarises the eight decisions made for the fictional
          organisation {scenario.organisation.name}. Use it as a discussion aid,
          not as a verdict on an individual or a certificate of readiness.
        </p>
      </header>

      <ScoreSummary report={report} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
        <div className="flex flex-col gap-6">
          <section className="panel border-strength/25 p-6">
            <h2 className="text-lg font-semibold text-strength">Strengths</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
              {report.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section className="panel border-amber/25 p-6">
            <h2 className="text-lg font-semibold text-amber">Trade-offs</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
              {report.tradeOffs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section className="panel border-incident/25 p-6">
            <h2 className="text-lg font-semibold text-incident">Important gaps</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
              {report.gaps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
        <IncidentTimeline events={timelineEvents} variant="report" />
      </div>

      <section className="panel p-6">
        <h2 className="text-lg font-semibold text-cyan">Recommended actions</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
          {report.recommendedFollowUp.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Decisions made</h2>
        {report.timeline.map((item, index) => (
          <DecisionReview key={item.stageId} item={item} index={index} />
        ))}
      </section>

      <EducationalDisclaimer />

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center justify-center rounded-xl bg-cyan-strong px-5 py-3 text-base font-semibold text-navy-950 hover:bg-cyan"
        >
          Restart simulation
        </button>
        <button
          type="button"
          onClick={onHome}
          className="inline-flex items-center justify-center rounded-xl border border-line px-5 py-3 text-base font-medium hover:bg-navy-700"
        >
          Return to home
        </button>
      </div>
    </main>
  );
}
