"use client";

import Link from "next/link";
import { Component, type ReactNode, useMemo, useSyncExternalStore } from "react";
import {
  createEmptyProgressStore,
  loadProgress,
  progressSummary,
  type ProgressStore,
} from "@/lib/progress/store";
import { playUrlForMission } from "@/lib/training/session";

function subscribeProgress(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

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
          <p className="home-eyebrow">My progress</p>
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

function ProgressDashboard({ store, hydrated }: { store: ProgressStore; hydrated: boolean }) {
  const summary = useMemo(() => progressSummary(store), [store]);
  const unfinished = store.sessions.find((item) => !item.completed && !item.endedEarly);
  const recent = store.sessions.slice(0, 6);

  if (!hydrated) {
    return (
      <main id="main-content" className="site-page home-wrap progress-page">
        <p className="home-eyebrow">My progress</p>
        <h1>Your training progress</h1>
        <p className="training-lede">Loading your progress…</p>
        <div className="progress-skeleton" aria-hidden="true" />
      </main>
    );
  }

  return (
    <main id="main-content" className="site-page home-wrap progress-page">
      <p className="home-eyebrow">My progress</p>
      <h1>Your training progress</h1>
      {store.sessions.length === 0 ? (
        <p className="training-lede">
          Complete a mission to start building your BreachRoom learning history.
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

export function ProgressPage() {
  const snapshot = useSyncExternalStore(subscribeProgress, loadProgress, createEmptyProgressStore);
  const hydrated = useSyncExternalStore(
    subscribeProgress,
    () => true,
    () => false,
  );

  return (
    <div className="home-page">
      <ProgressErrorBoundary>
        <ProgressDashboard store={snapshot} hydrated={hydrated} />
      </ProgressErrorBoundary>
    </div>
  );
}
