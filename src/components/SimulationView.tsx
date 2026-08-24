import { DecisionCard } from "@/components/DecisionCard";
import { IncidentTimeline } from "@/components/IncidentTimeline";
import { ProgressHeader } from "@/components/ProgressHeader";
import { StatusPanel } from "@/components/StatusPanel";
import type { RecordedDecision, Scenario, ScenarioStage } from "@/lib/simulation/types";

interface SimulationViewProps {
  scenario: Scenario;
  stage: ScenarioStage;
  stageNumber: number;
  selectedOptionId: string | null;
  decisions: readonly RecordedDecision[];
  onSelect: (optionId: string) => void;
  onConfirm: () => void;
}

export function SimulationView({
  scenario,
  stage,
  stageNumber,
  selectedOptionId,
  decisions,
  onSelect,
  onConfirm,
}: SimulationViewProps) {
  const canConfirm = selectedOptionId !== null;

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <ProgressHeader
        scenarioTitle={scenario.title}
        timestamp={stage.timestamp}
        currentDecision={stageNumber}
        totalDecisions={scenario.stages.length}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex flex-col gap-6">
          <section className="panel border-amber/30 p-5 sm:p-6" aria-labelledby="latest-update">
            <p className="font-mono text-xs tracking-[0.18em] text-amber uppercase">
              Latest incident update
            </p>
            <h2 id="latest-update" className="mt-2 text-2xl font-semibold">
              {stage.title}
            </h2>
            <p className="mt-3 text-base leading-7">{stage.incidentUpdate}</p>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="panel p-5">
              <h2 className="text-lg font-semibold">Available facts</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
                {stage.availableFacts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </section>
            <section className="panel p-5">
              <h2 className="text-lg font-semibold">Known unknowns</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
                {stage.knownUnknowns.map((unknown) => (
                  <li key={unknown}>{unknown}</li>
                ))}
              </ul>
            </section>
          </div>

          <section aria-labelledby="decision-heading">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="decision-heading" className="text-lg font-semibold">
                  Choose one response
                </h2>
                <p className="text-sm text-muted">
                  Select a card, then confirm. The decision will be locked.
                </p>
              </div>
            </div>
            <div
              className="grid gap-4"
              role="radiogroup"
              aria-labelledby="decision-heading"
            >
              {stage.options.map((option, index) => (
                <DecisionCard
                  key={option.id}
                  option={option}
                  index={index}
                  selected={selectedOptionId === option.id}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <StatusPanel />
          <IncidentTimeline
            scenario={scenario}
            currentStage={stage}
            decisions={decisions}
            variant="live"
          />
        </div>
      </div>

      <div className="sticky bottom-4 z-10">
        <div className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            {canConfirm
              ? "This choice will be added to the timeline and cannot be changed."
              : "Select one decision before continuing."}
          </p>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className="inline-flex items-center justify-center rounded-xl bg-cyan-strong px-5 py-3 text-base font-semibold text-navy-950 hover:bg-cyan disabled:cursor-not-allowed disabled:bg-navy-600 disabled:text-muted"
          >
            Confirm decision
          </button>
        </div>
      </div>
    </main>
  );
}
