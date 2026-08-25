"use client";

import Link from "next/link";
import { Component, type ReactNode, useMemo, useSyncExternalStore } from "react";
import {
  EMPTY_PROGRESS_STORE,
  loadProgress,
  progressSummary,
  subscribeProgress,
  type ProgressSession,
  type ProgressStore,
} from "@/lib/progress/store";
import { topicLabel } from "@/lib/training/labels";
import { playUrlForMission } from "@/lib/training/session";

class ProgressErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <main id="main-content" className="site-page home-wrap progress-page">
          <p className="home-eyebrow">MY PROGRESS</p>
          <h1>We couldn’t load your progress.</h1>
          <p className="training-lede">Your saved training data has not been deleted.</p>
          <div className="progress-empty-actions">
            <button type="button" className="btn-primary" onClick={() => this.setState({ failed: false })}>
              Try again
            </button>
            <Link className="btn-secondary" href="/">
              Return to homepage
            </Link>
            <Link className="btn-secondary" href="/missions/">
              Play a mission
            </Link>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

function topicCounts(sessions: readonly ProgressSession[]): { id: string; label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const session of sessions) {
    for (const topic of session.topics) {
      counts.set(topic, (counts.get(topic) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([id, count]) => ({ id, label: topicLabel(id), count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 6);
}

export function ProgressDashboard({
  store,
  hydrated,
}: {
  store: ProgressStore;
  hydrated: boolean;
}) {
  const summary = useMemo(() => progressSummary(store), [store]);
  const unfinished = store.sessions.find((item) => !item.completed && !item.endedEarly);
  const recent = store.sessions.slice(0, 6);
  const topics = topicCounts(store.sessions);
  const empty = store.sessions.length === 0;

  return (
    <main id="main-content" className="site-page home-wrap progress-page">
      <p className="home-eyebrow">MY PROGRESS</p>
      <h1>Your training progress</h1>
      {!hydrated ? (
        <p className="training-lede">Loading your progress…</p>
      ) : empty ? (
        <p className="training-lede">
          No missions completed yet. Play a mission to start tracking your progress.
        </p>
      ) : (
        <p className="training-lede">
          This browser keeps a local record of missions you start. Nothing is stored on a server.
        </p>
      )}

      <ul className="progress-summary">
        <li>
          <strong>{summary.missionsCompleted}</strong>
          <span>Missions completed</span>
        </li>
        <li>
          <strong>{summary.questionsAnswered}</strong>
          <span>Questions answered</span>
        </li>
        <li>
          <strong>{summary.overallCompletion}%</strong>
          <span>Overall completion</span>
        </li>
        <li>
          <strong>{summary.practiceScore === null ? "Not enough data" : `${summary.practiceScore}`}</strong>
          <span>Practice score</span>
        </li>
      </ul>

      {unfinished ? (
        <p>
          <Link className="btn-primary" href={playUrlForMission(unfinished.missionId)}>
            Continue {unfinished.missionTitle}
          </Link>
        </p>
      ) : null}

      {topics.length > 0 ? (
        <section>
          <h2>Topic progress</h2>
          <ul className="progress-sessions">
            {topics.map((topic) => (
              <li key={topic.id}>
                <strong>{topic.label}</strong>
                <span>{topic.count} session{topic.count === 1 ? "" : "s"}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section>
          <h2>Recent training sessions</h2>
          <ul className="progress-sessions">
            {recent.map((session) => (
              <li key={session.id}>
                <strong>{session.missionTitle}</strong>
                <span>
                  {session.perspectiveLabel} · {session.questionsCompleted}/{session.questionsRequired}{" "}
                  decisions · {session.completed ? "Completed" : session.endedEarly ? "Ended early" : "In progress"}
                </span>
                <Link href={playUrlForMission(session.missionId)}>
                  {session.completed ? "Replay" : "Continue"}
                </Link>
              </li>
            ))}
          </ul>
          <p>
            <Link className="btn-secondary" href="/training/">
              Recommended next training
            </Link>
          </p>
        </section>
      ) : (
        <div className="progress-empty-actions">
          <Link className="btn-primary" href="/missions/">
            Play your first mission
          </Link>
          <Link className="btn-secondary" href="/training/">
            Find training for my role
          </Link>
        </div>
      )}

      <p className="progress-note">
        Progress is stored in this browser. Clearing browser data will remove it.
      </p>
    </main>
  );
}

function subscribeHydration(): () => void {
  return () => undefined;
}

export function ProgressPage() {
  const snapshot = useSyncExternalStore(subscribeProgress, loadProgress, () => EMPTY_PROGRESS_STORE);
  const hydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);

  return (
    <div className="home-page progress-shell">
      <ProgressErrorBoundary>
        <ProgressDashboard store={snapshot} hydrated={hydrated} />
      </ProgressErrorBoundary>
    </div>
  );
}
