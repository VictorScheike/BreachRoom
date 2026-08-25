"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { requireMission } from "@/lib/missions/catalog";
import { loadSeenQuestionIds, loadTrainingSession } from "@/lib/training/session";
import { roleGroupLabel, topicLabel } from "@/lib/training/labels";

interface LocalProgress {
  seen: number;
  title: string | null;
  detail: string | null;
}

const EMPTY_PROGRESS: LocalProgress = { seen: 0, title: null, detail: null };

function readLocalProgress(): LocalProgress {
  const seen = loadSeenQuestionIds().length;
  const session = loadTrainingSession();
  if (!session) {
    return { seen, title: null, detail: null };
  }
  const mission = requireMission(session.mapId);
  return {
    seen,
    title: session.title,
    detail: `${roleGroupLabel(session.roleGroup)} · ${topicLabel(session.topics[0] ?? "")} · ${mission.title}`,
  };
}

export function ProgressPage() {
  const { seen, title, detail } = useSyncExternalStore(
    () => () => undefined,
    readLocalProgress,
    () => EMPTY_PROGRESS,
  );

  return (
    <div className="home-page">
      <main id="main-content" className="site-page home-wrap">
        <p className="home-eyebrow">My progress</p>
        <h1>Saved on this device</h1>
        <p className="training-lede">
          BreachRoom keeps a light local record of reviewed questions you have already seen. Nothing
          is stored on a server.
        </p>
        <ul className="training-facts">
          <li>
            <strong>Reviewed questions seen:</strong> {seen}
          </li>
          <li>
            <strong>Last assembled training:</strong> {title ?? "None yet in this browser session"}
          </li>
          {detail ? <li>{detail}</li> : null}
        </ul>
        <p>
          <Link className="btn-primary" href="/training/">
            Find training for my role
          </Link>
        </p>
      </main>
    </div>
  );
}
