import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProgressDashboard, ProgressPage } from "@/components/site/ProgressPage";
import { reportFromProgressSession } from "@/lib/progress/report";
import {
  createEmptyProgressStore,
  loadProgress,
  progressSummary,
  validateAndMigrateProgress,
  type ProgressSession,
} from "@/lib/progress/store";
import { NAV_ITEMS } from "@/lib/site/copy";

function sampleSession(overrides: Partial<ProgressSession> = {}): ProgressSession {
  return {
    id: "locked-out:1",
    missionId: "locked-out",
    missionTitle: "Locked Out",
    seed: 1,
    questionIds: ["a", "b"],
    questionsCompleted: 2,
    questionsRequired: 8,
    phaseLabel: "Containment",
    completed: false,
    endedEarly: false,
    overall: null,
    scenarioId: "lo-campus",
    choices: [],
    startedAt: 1,
    updatedAt: 2,
    roleGroupId: "it-security",
    roleId: "incident-responder",
    topics: ["ransomware"],
    audienceMode: "role",
    perspectiveLabel: "IT & Security",
    ...overrides,
  };
}

describe("progress store", () => {
  it("returns an empty store when local storage is missing", () => {
    const store = createEmptyProgressStore();
    const summary = progressSummary(store);
    expect(summary.missionsCompleted).toBe(0);
    expect(summary.questionsAnswered).toBe(0);
    expect(summary.overallCompletion).toBe(0);
    expect(summary.practiceScore).toBeNull();
    expect(loadProgress()).toBe(loadProgress());
  });

  it("migrates old schemas and unknown mission ids without throwing", () => {
    const migrated = validateAndMigrateProgress({
      version: 1,
      history: [
        {
          missionId: "retired-mission",
          seed: 3,
          questionsCompleted: 2,
          questionsRequired: 8,
          completed: true,
          overall: 61,
        },
      ],
    });
    expect(migrated.sessions[0]?.missionTitle).toBe("Previous mission");
    expect(validateAndMigrateProgress("nope").sessions).toEqual([]);
    expect(validateAndMigrateProgress(null).sessions).toEqual([]);
  });

  it("renders the empty progress page without saved sessions", () => {
    const html = renderToStaticMarkup(
      <ProgressDashboard store={createEmptyProgressStore()} hydrated />,
    );
    expect(html).toContain("MY PROGRESS");
    expect(html).toContain("Your training progress");
    expect(html).toContain("No missions completed yet. Play a mission to start tracking your progress.");
    expect(html).toContain("Missions completed");
    expect(html).toContain("Not enough data");
    expect(html).toContain("Play your first mission");
    expect(html).toMatch(/href="\/missions\/?"/);
    expect(html).toContain("Find training for my role");
    expect(html).toMatch(/href="\/training\/?"/);
    expect(html).toContain("Progress is stored in this browser");
    expect(NAV_ITEMS.some((item) => item.href === "/progress/")).toBe(true);
  });

  it("shows a loading state without going blank", () => {
    const html = renderToStaticMarkup(
      <ProgressDashboard store={createEmptyProgressStore()} hydrated={false} />,
    );
    expect(html).toContain("Loading your progress…");
    expect(html).toContain("Missions completed");
    expect(renderToStaticMarkup(<ProgressPage />)).toContain("Your training progress");
  });

  it("renders valid and unfinished sessions", () => {
    const store = {
      version: 2,
      sessions: [
        sampleSession(),
        sampleSession({
          id: "inbox:2",
          missionId: "inbox-under-siege",
          missionTitle: "Inbox Under Siege",
          completed: true,
          questionsCompleted: 8,
          overall: 72,
          topics: ["phishing"],
        }),
      ],
    };
    const html = renderToStaticMarkup(<ProgressDashboard store={store} hydrated />);
    expect(html).toContain("Continue Locked Out");
    expect(html).toContain("Replay");
    expect(html).toContain("IT &amp; Security");
    expect(html).toContain("Topic progress");
    expect(html).toContain("Recommended next training");
    expect(html).toContain("Completed missions");
    expect(html).toContain("Inbox Under Siege");
    expect(html).toContain("Score 72");
    expect(html).toContain("before answers were stored");
  });

  it("shows how completed missions were answered and links to the score", () => {
    const store = {
      version: 2,
      sessions: [
        sampleSession({
          id: "locked-out:9",
          completed: true,
          questionsCompleted: 2,
          questionsRequired: 8,
          overall: 81,
          choices: [
            { questionId: "lo-01", optionId: "lo-01-c", displayLetter: "A" },
            { questionId: "lo-02", optionId: "lo-02-a", displayLetter: "B" },
          ],
        }),
      ],
    };
    const html = renderToStaticMarkup(<ProgressDashboard store={store} hydrated />);
    expect(html).toContain("Completed missions");
    expect(html).toContain("You have finished Locked Out");
    expect(html).toContain("See my score");
    expect(html).toContain("progress/report?session=locked-out%3A9");
    expect(html).toContain("Screens go dark");
    expect(html).toContain("The Excel from &#x27;Finance&#x27;");
    expect(html).toContain("correct");
    expect(html).not.toContain("Recent training sessions");
  });

  it("rebuilds an after-action report from saved answers", () => {
    const session = sampleSession({
      completed: true,
      choices: [
        { questionId: "lo-01", optionId: "lo-01-c", displayLetter: "A" },
        { questionId: "lo-02", optionId: "lo-02-a", displayLetter: "B" },
      ],
    });
    const report = reportFromProgressSession(session);
    expect(report).not.toBeNull();
    expect(report?.journey).toHaveLength(2);
    expect(report?.journey[0]?.selected.id).toBe("lo-01-c");
    expect(report?.verdictCounts.correct).toBe(1);
    expect(report?.verdictCounts.partlyCorrect).toBe(1);
    expect(reportFromProgressSession(sampleSession())).toBeNull();
  });
});
