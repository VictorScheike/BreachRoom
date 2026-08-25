import Link from "next/link";
import { DecisionReview } from "@/components/DecisionReview";
import { EducationalDisclaimer } from "@/components/EducationalDisclaimer";
import { choiceLetter } from "@/lib/game/encounters";
import { classifyDecision } from "@/lib/game/consequence";
import { containmentOutcome, hudFromScores } from "@/lib/game/hud";
import { findOption, findStage } from "@/lib/simulation/lookups";
import type { AfterActionReport, Scenario } from "@/lib/simulation/types";

interface GameReportProps {
  scenario: Scenario;
  report: AfterActionReport;
  onRestart: () => void;
}

export function GameReport({ scenario, report, onRestart }: GameReportProps) {
  const hud = hudFromScores(report.categoryScores);
  const outcome = containmentOutcome(report.overallScore);

  return (
    <main id="main-content" className="game-page">
      <div className="game-shell game-report">
        <p className="game-kicker">After-action report</p>
        <h1 className="game-panel-title">{scenario.title}</h1>
        <p className="game-panel-copy">
          Overall incident response: {report.resultLabel}. This is a BreachRoom
          simulation score, not a certificate.
        </p>

        <div className={`report-outcome report-outcome-${outcome}`}>
          <p className="font-mono text-5xl font-semibold">{report.overallScore}</p>
          <p>{report.resultLabel}</p>
        </div>

        <ul className="game-status report-status">
          <li>
            Containment
            <span>{hud.containment}</span>
          </li>
          <li>
            Operations
            <span>{hud.operations}</span>
          </li>
          <li>
            Trust
            <span>{hud.trust}</span>
          </li>
        </ul>

        <section>
          <h2 className="text-lg font-semibold text-strength">Handled well</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
            {report.strengths.slice(0, 6).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-incident">
            Should have been done differently
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
            {report.gaps.slice(0, 6).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Timeline of eight decisions</h2>
          {report.timeline.map((item, index) => {
            const stage = findStage(scenario, item.stageId);
            const option = findOption(scenario, item.stageId, item.selectedOptionId);
            const optionIndex = stage.options.findIndex(
              (entry) => entry.id === item.selectedOptionId,
            );
            const quality = classifyDecision(option);
            return (
              <div key={item.stageId}>
                <p className={`report-letter report-letter-${quality}`}>
                  Decision {index + 1}: {choiceLetter(optionIndex)} — {item.selectedTitle}
                </p>
                <DecisionReview item={item} index={index} />
              </div>
            );
          })}
        </section>

        <EducationalDisclaimer />

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" className="game-primary" onClick={onRestart}>
            Play again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-line px-5 py-3 text-sm font-medium"
          >
            Back to the site
          </Link>
        </div>
      </div>
    </main>
  );
}
