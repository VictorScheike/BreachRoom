"use client";

import { useEffect, useState } from "react";
import { DecisionCard } from "@/components/DecisionCard";
import { IncidentPanel } from "@/components/IncidentPanel";
import { IncidentTimeline } from "@/components/IncidentTimeline";
import { ProgressHeader } from "@/components/ProgressHeader";
import { StatusPanel } from "@/components/StatusPanel";
import { CheckIcon } from "@/components/icons";
import { buildTimelineEvents } from "@/lib/simulation/timeline";
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
  const [toast, setToast] = useState<string | null>(null);
  const timelineEvents = buildTimelineEvents(
    scenario,
    decisions,
    stage.id,
    "live",
  );

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeout = window.setTimeout(() => setToast(null), 1400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-[90rem] flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
      <ProgressHeader
        scenarioTitle={scenario.title}
        clockTime={stage.clockTime}
        timestamp={stage.timestamp}
        severity={stage.severity}
        currentDecision={stageNumber}
        totalDecisions={scenario.stages.length}
      />

      <div className="grid items-start gap-4 xl:grid-cols-[18.5rem_minmax(0,1fr)_16.5rem]">
        <div className="order-2 xl:order-1 xl:sticky xl:top-4">
          <IncidentTimeline events={timelineEvents} variant="live" />
        </div>

        <div className="order-1 flex flex-col gap-4 xl:order-2">
          <IncidentPanel key={stage.id} stage={stage} />

          <section aria-labelledby="decision-heading">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="decision-heading" className="text-lg font-semibold">
                  Choose one response
                </h2>
                <p className="text-sm text-muted">
                  Select a card, then confirm. Confirmed choices are locked.
                </p>
              </div>
            </div>
            <div
              className="grid gap-3"
              role="radiogroup"
              aria-labelledby="decision-heading"
            >
              {stage.options.map((option, index) => (
                <DecisionCard
                  key={option.id}
                  option={option}
                  index={index}
                  selected={selectedOptionId === option.id}
                  dimmed={selectedOptionId !== null && selectedOptionId !== option.id}
                  recorded={false}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>

          <div className="sticky bottom-3 z-10">
            <div className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                {canConfirm
                  ? "This choice will be added to the timeline and cannot be changed."
                  : "Select one decision before continuing."}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!canConfirm) {
                    return;
                  }
                  setToast("Decision recorded");
                  onConfirm();
                }}
                disabled={!canConfirm}
                className={`confirm-button inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold transition-[background-color,box-shadow,color] duration-200 ${
                  canConfirm
                    ? "bg-cyan-strong text-navy-950 shadow-[0_0_18px_rgba(56,189,248,0.28)] hover:bg-cyan"
                    : "cursor-not-allowed bg-navy-600 text-muted"
                }`}
              >
                Confirm decision
              </button>
            </div>
          </div>
        </div>

        <div className="order-3 xl:sticky xl:top-4">
          <StatusPanel />
        </div>
      </div>

      {toast ? (
        <div
          className="toast-enter pointer-events-none fixed bottom-24 left-1/2 z-20 -translate-x-1/2 rounded-full border border-cyan/40 bg-navy-800 px-4 py-2 text-sm text-cyan shadow-lg"
          role="status"
        >
          <span className="inline-flex items-center gap-2">
            <CheckIcon className="h-4 w-4" />
            {toast}
          </span>
        </div>
      ) : null}
    </main>
  );
}
