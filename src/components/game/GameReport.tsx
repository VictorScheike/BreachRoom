"use client";

import Link from "next/link";
import { useState } from "react";
import { EducationalDisclaimer } from "@/components/EducationalDisclaimer";
import {
  qualityLabel,
  SCORING_EXPLAINER,
  type DecisionDebrief,
  type MissionReport,
} from "@/lib/missions/report";

type JourneyFilter = "all" | "strong" | "tradeoffs" | "improve";

interface GameReportProps {
  report: MissionReport;
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
    return item.quality === "strong";
  }
  if (filter === "tradeoffs") {
    return item.quality === "defensible";
  }
  return item.quality === "weak" || item.quality === "high-risk";
}

export function GameReport({
  report,
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
          <div className="report-hero-row">
            <ScoreRing value={report.score.overall} />
            <div>
              <p className="report-level">{report.score.level}</p>
              <p className="game-panel-copy">{report.summary}</p>
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
                  {dimension.percent}/100 · {dimension.points}/24 points
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
          {scoringOpen ? <p className="game-panel-copy">{SCORING_EXPLAINER}</p> : null}
        </section>

        <section>
          <h2 className="report-h2">Your response at a glance</h2>
          <div className="glance-grid">
            <article>
              <h3>Strongest decisions</h3>
              <ul>
                {report.strongest.length === 0 ? <li>None this run.</li> : null}
                {report.strongest.map((item) => (
                  <li key={item.question.id}>
                    <span className="quality-tag quality-strong" aria-hidden="true">
                      ★
                    </span>{" "}
                    Strong — {item.question.title}
                  </li>
                ))}
              </ul>
            </article>
            <article>
              <h3>Decisions with trade-offs</h3>
              <ul>
                {report.tradeoffs.length === 0 ? <li>None this run.</li> : null}
                {report.tradeoffs.map((item) => (
                  <li key={item.question.id}>
                    <span className="quality-tag quality-trade" aria-hidden="true">
                      ~
                    </span>{" "}
                    {qualityLabel(item.quality)} — {item.question.title}
                  </li>
                ))}
              </ul>
            </article>
            <article>
              <h3>Highest-risk decisions</h3>
              <ul>
                {report.highestRisk.length === 0 ? <li>None this run.</li> : null}
                {report.highestRisk.map((item) => (
                  <li key={item.question.id}>
                    <span className="quality-tag quality-risk" aria-hidden="true">
                      !
                    </span>{" "}
                    High risk — {item.question.title}
                  </li>
                ))}
              </ul>
            </article>
          </div>
          <p className="lesson-callout">{report.lesson}</p>
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
                      {item.displayLetter} · {item.selected.title} ·{" "}
                      {qualityLabel(item.quality)}
                    </span>
                    <span className="impact-pips" aria-label="Score impact">
                      {item.dimensionDeltas.map((delta) => (
                        <span key={delta.id}>
                          {delta.label.slice(0, 3)} {delta.points}
                        </span>
                      ))}
                    </span>
                  </button>
                  {open ? (
                    <div className="journey-body">
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

        <div className="report-actions">
          <button type="button" className="game-primary" onClick={onReplay}>
            Replay this mission
          </button>
          <button type="button" className="hud-button" onClick={onNewScenario}>
            Play a different scenario
          </button>
          <button type="button" className="hud-button" onClick={onOtherMission}>
            Choose another mission
          </button>
          <Link href="/" className="hud-button">
            Return to the BreachRoom homepage
          </Link>
        </div>
        <EducationalDisclaimer />
      </div>
    </main>
  );
}
