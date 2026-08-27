"use client";

import Link from "next/link";
import { Suspense, useMemo, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GameReport } from "@/components/game/GameReport";
import { reportFromProgressSession } from "@/lib/progress/report";
import { EMPTY_PROGRESS_STORE, loadProgress, subscribeProgress } from "@/lib/progress/store";
import { playUrlForMission } from "@/lib/training/session";

function ProgressReportInner() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session");
  const store = useSyncExternalStore(subscribeProgress, loadProgress, () => EMPTY_PROGRESS_STORE);
  const session = store.sessions.find((item) => item.id === sessionId);
  const report = useMemo(
    () => (session ? reportFromProgressSession(session) : null),
    [session],
  );

  if (!sessionId || !session) {
    return (
      <div className="home-page progress-shell">
        <main id="main-content" className="site-page home-wrap progress-page">
          <p className="home-eyebrow">MY PROGRESS</p>
          <h1>That score is not on this browser.</h1>
          <p className="training-lede">
            Saved scores stay in local storage. If you cleared site data, or opened this link on
            another device, the report will not be here.
          </p>
          <p>
            <Link className="btn-primary" href="/progress/">
              Back to my progress
            </Link>
          </p>
        </main>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="home-page progress-shell">
        <main id="main-content" className="site-page home-wrap progress-page">
          <p className="home-eyebrow">MY PROGRESS</p>
          <h1>{session.missionTitle}</h1>
          <p className="training-lede">
            {session.overall !== null
              ? `This session scored ${session.overall}, but the individual answers were not saved.`
              : "The individual answers for this session were not saved."}{" "}
            Replay the mission to keep a full after-action report next time.
          </p>
          <div className="progress-empty-actions">
            <Link className="btn-primary" href={playUrlForMission(session.missionId, session.roleId)}>
              Replay {session.missionTitle}
            </Link>
            <Link className="btn-secondary" href="/progress/">
              Back to my progress
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <GameReport
      report={report}
      backHref="/progress/"
      backLabel="Back to my progress"
      onReplay={() => router.push(playUrlForMission(session.missionId, session.roleId))}
      onNewScenario={() => router.push("/play/")}
      onOtherMission={() => router.push("/missions/")}
    />
  );
}

export function ProgressReportPage() {
  return (
    <Suspense
      fallback={
        <main id="main-content" className="site-page home-wrap progress-page">
          <p className="training-lede">Loading your score…</p>
        </main>
      }
    >
      <ProgressReportInner />
    </Suspense>
  );
}
