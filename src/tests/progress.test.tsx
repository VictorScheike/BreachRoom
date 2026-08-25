import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProgressPage } from "@/components/site/ProgressPage";
import {
  createEmptyProgressStore,
  progressSummary,
  validateAndMigrateProgress,
} from "@/lib/progress/store";
import { NAV_ITEMS } from "@/lib/site/copy";

describe("progress store", () => {
  it("returns an empty store when local storage is missing", () => {
    const store = createEmptyProgressStore();
    const summary = progressSummary(store);
    expect(summary.missionsCompleted).toBe(0);
    expect(summary.questionsAnswered).toBe(0);
    expect(summary.overallCompletion).toBe(0);
    expect(summary.practiceScore).toBeNull();
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
    const html = renderToStaticMarkup(<ProgressPage />);
    expect(html).toContain("Your training progress");
    expect(html).toMatch(/Loading your progress|Complete a mission to start building/);
    expect(NAV_ITEMS.some((item) => item.href === "/progress/")).toBe(true);
  });
});
