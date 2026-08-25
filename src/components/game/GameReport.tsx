"use client";

import Link from "next/link";
import { useState } from "react";
import { EducationalDisclaimer } from "@/components/EducationalDisclaimer";
import { mailtoForReport } from "@/lib/missions/email-report";
import { qualityLabel, type DecisionDebrief, type MissionReport } from "@/lib/missions/report";
import { scoringExplainer } from "@/lib/missions/scoring";
import { topicLabel } from "@/lib/training/labels";

type JourneyFilter = "all" | "strong" | "tradeoffs" | "improve";

interface GameReportProps {
  report: MissionReport;
  endedEarly?: boolean;
  onReplay: () => void;
  onNewScenario: () => void;
  onOtherMission: () => void;
}

function ScoreRing({ value }: { value: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg className="score-ring" viewBox="0 0 88 88" aria-hidden="true">
      <circle className="score-ring-track" cx="44" cy="44" r={radius} />
      <circle
        className="score-ring-value"
        cx="44"
        cy="44"
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <text x="44" y="50" textAnchor="middle" className="score-ring-text">
        {value}
      </text>
    </svg>
  );
}

function matchesFilter(item: DecisionDebrief, filter: JourneyFilter): boolean {
  if (filter === "all") {
    return true;
  }
  if (filter === "strong") {
    return item.verdict.id === "correct";
  }
  if (filter === "tradeoffs") {
    return item.verdict.id === "partly-correct";
  }
  return item.verdict.id === "incorrect";
}

export function GameReport({
  report,
  endedEarly = false,
  onReplay,
  onNewScenario,
  onOtherMission,
}: GameReportProps) {
  const [filter, setFilter] = useState<JourneyFilter>("all");
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(() => new Set());
  const [scoringOpen, setScoringOpen] = useState(false);

  const visible = report.journey.filter((item) => matchesFilter(item, filter));

  const toggle = (index: number) => {
    const next = new Set(expanded);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setExpanded(next);
  };

  return (
    <main id="main-content" className="game-page">
      <div className="game-shell game-report">
        <section className={`report-hero report-hero-${report.destinationState}`}>
          <p className="game-kicker">
            {report.missionTitle} · {report.scenarioTitle}
          </p>
          <h1 className="game-panel-title">{report.outcomeHeadline}</h1>
          <p className="report-perspective">{report.perspectiveLine}</p>
          {endedEarly ? (
            <p className="game-panel-copy">
              This mission ended early. It is not recorded as complete. The scores below cover only
              the decisions you made.
            </p>
          ) : null}
          {report.training ? (
            <section className="training-report-summary">
              <h2 className="report-h2">Training session</h2>
              <ul>
                <li>
                  <strong>Role:</strong> {report.training.roleLabel}
                </li>
                <li>
                  <strong>Topic:</strong> {report.training.topicLabel}
                </li>
                <li>
                  <strong>Context:</strong> {report.training.contextLabel}
                </li>
                <li>
                  <strong>Map:</strong> {report.training.mapTitle}
                </li>
                <li>
                  <strong>Questions completed:</strong> {report.training.questionCount}
                </li>
              </ul>
            </section>
          ) : null}
          <div className="report-hero-row">
            <ScoreRing value={report.score.overall} />
            <div>
              <p className="report-level">{report.outcomeLabel}</p>
              <p className="game-panel-copy">{report.outcomeSentence}</p>
            </div>
          </div>
          <div
            className={`destination-finale destination-${report.destinationState}`}
            aria-label="Final destination state"
          />
        </section>

        <section>
          <h2 className="report-h2">What the score means</h2>
          <div className="dimension-grid">
            {report.dimensions.map((dimension) => (
              <article key={dimension.id} className="dimension-card">
                <h3>{dimension.label}</h3>
                <p className="dimension-score">
                  {dimension.percent}/100 · {dimension.points} of {dimension.cap} points
                </p>
                <div className="bar" aria-hidden="true">
                  <span style={{ width: `${dimension.percent}%` }} />
                </div>
                <p className="game-panel-copy">{dimension.interpretation}</p>
                <p className="mission-meta">
                  Most affected by: {dimension.topDecisionTitles.join("; ")}
                </p>
              </article>
            ))}
          </div>
          <button
            type="button"
            className="hud-button"
            onClick={() => setScoringOpen((value) => !value)}
            aria-expanded={scoringOpen}
          >
            How scoring works
          </button>
          {scoringOpen ? <p className="game-panel-copy">{scoringExplainer(Math.round((report.dimensions[0]?.cap ?? 24) / 3))}</p> : null}
        </section>

        <section>
          <h2 className="report-h2">Decision summary</h2>
          <div className="glance-grid">
            <article className="verdict-correct">
              <h3>✓ Correct: {report.verdictCounts.correct}</h3>
              <p>This was the recommended response.</p>
            </article>
            <article className="verdict-partly-correct">
              <h3>! Partly correct: {report.verdictCounts.partlyCorrect}</h3>
              <p>This helped, but important safeguards or actions were missing.</p>
            </article>
            <article className="verdict-incorrect">
              <h3>× Incorrect: {report.verdictCounts.incorrect}</h3>
              <p>This increased the risk or failed to respond adequately.</p>
            </article>
          </div>
        </section>

        <section>
          <h2 className="report-h2">What went well</h2>
          <ul>
            {report.wentWell.length === 0 ? <li>No fully recommended responses this time.</li> : null}
            {report.wentWell.map((item) => (
              <li key={item.question.id} className="verdict-correct">
                ✓ {item.question.title} — {item.selected.title}
              </li>
            ))}
          </ul>
          <h2 className="report-h2">What needs improvement</h2>
          <ul>
            {report.needsImprovement.length === 0 ? (
              <li>Keep repeating the recommended responses.</li>
            ) : null}
            {report.needsImprovement.map((item) => (
              <li key={item.question.id} className={`verdict-${item.verdict.id}`}>
                {item.verdict.icon === "warning" ? "!" : "×"} {item.question.title} — try{" "}
                {item.recommended.title}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="journey-toolbar">
            <h2 className="report-h2">Decision journey</h2>
            <div className="filter-row" role="group" aria-label="Filter decisions">
              {(
                [
                  ["all", "All"],
                  ["strong", "Strong"],
                  ["tradeoffs", "Trade-offs"],
                  ["improve", "Needs improvement"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={filter === id ? "hud-button hud-button-on" : "hud-button"}
                  aria-pressed={filter === id}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                className="hud-button"
                onClick={() =>
                  setExpanded(new Set(report.journey.map((item) => item.index)))
                }
              >
                Expand all
              </button>
              <button type="button" className="hud-button" onClick={() => setExpanded(new Set())}>
                Collapse all
              </button>
            </div>
          </div>
          <ol className="journey-list">
            {visible.map((item) => {
              const open = expanded.has(item.index);
              return (
                <li key={item.question.id} className={`journey-step quality-${item.quality}`}>
                  <button
                    type="button"
                    className="journey-toggle"
                    aria-expanded={open}
                    onClick={() => toggle(item.index)}
                  >
                    <span>
                      {item.index}. {item.question.title}
                    </span>
                    <span>
                      {item.displayLetter} · {item.selected.title} · {item.verdict.label}
                    </span>
                    <span className="impact-pips" aria-label="Score impact">
                      {item.dimensionDeltas.map((delta) => (
                        <span key={delta.id}>
                          {delta.label} {delta.points} of 3
                        </span>
                      ))}
                    </span>
                  </button>
                  {open ? (
                    <div className="journey-body">
                      <p>
                        <strong>Category:</strong>{" "}
                        {(item.question.topicIds ?? [])
                          .slice(0, 2)
                          .map((topic) => topicLabel(topic))
                          .join(" · ") || item.question.phase}
                      </p>
                      <p>
                        <strong>What happened:</strong> {item.selected.consequence}
                      </p>
                      <p>
                        <strong>You selected:</strong> {item.selected.title} (
                        {qualityLabel(item.quality)})
                      </p>
                      <p>
                        <strong>Recommended:</strong> {item.recommended.title}
                      </p>
                      <p>
                        <strong>Why it was stronger:</strong> {item.selected.whyRecommended}
                      </p>
                      <p>
                        <strong>Immediate consequence:</strong> {item.selected.explanation}
                      </p>
                      <p>
                        <strong>Score contribution:</strong>{" "}
                        {item.dimensionDeltas
                          .map((delta) => `${delta.label} ${delta.points}/3`)
                          .join(" · ")}
                      </p>
                      <p>
                        <strong>Framework:</strong> {item.question.frameworks.join(" · ")}
                      </p>
                      <p>
                        <strong>Takeaway:</strong> {item.selected.learningPoint}
                      </p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </section>

        <section>
          <h2 className="report-h2">Alternative outcome</h2>
          <p className="game-panel-copy">{report.alternativeHeadline}</p>
          <ul>
            {report.alternativeChanges.length === 0 ? (
              <li>No major forks — your stronger options already led the day.</li>
            ) : (
              report.alternativeChanges.map((change) => (
                <li key={change.title}>
                  Instead of the weaker move on {change.title}, {change.instead}.
                </li>
              ))
            )}
          </ul>
        </section>

        <div className="report-action-block">
          <div className="report-actions">
            <a className="report-action report-action--current" href={mailtoForReport(report)}>
              Email this report
            </a>
            <button type="button" className="report-action report-action--current" onClick={onReplay}>
              Replay this mission
            </button>
            <button type="button" className="report-action report-action--navigate" onClick={onNewScenario}>
              Play a different scenario
            </button>
            <button type="button" className="report-action report-action--navigate" onClick={onOtherMission}>
              Choose another mission
            </button>
          </div>
          <div className="report-home">
            <Link href="/" className="button--home">
              <span aria-hidden="true">← </span>
              Return to the BreachRoom homepage
            </Link>
          </div>
        </div>
        <EducationalDisclaimer />
      </div>
    </main>
  );
}
