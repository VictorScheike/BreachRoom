import { describe, expect, it } from "vitest";
import { LAB_STORAGE_KEY, parseLabState, saveLabState, loadLabState, EMPTY_LAB_STATE } from "@/lib/lab/store";
import { persistLab } from "@/lib/lab/play";
import { simulateAttack } from "@/lib/lab/engine";
import { STRONG_ARCHITECTURE } from "@/lib/lab/fixtures";
import { LAB_PROGRESS_SESSION_ID, syncLabProgress } from "@/lib/lab/progress";
import { sessionResumeHref } from "@/lib/progress/urls";
import {
  PROGRESS_STORAGE_KEY,
  loadProgress,
  progressSummary,
  validateAndMigrateProgress,
} from "@/lib/progress/store";

function installMemoryStorage() {
  const data = new Map<string, string>();
  const storage = {
    get length() {
      return data.size;
    },
    clear() {
      data.clear();
    },
    getItem(key: string) {
      return data.get(key) ?? null;
    },
    key(index: number) {
      return [...data.keys()][index] ?? null;
    },
    removeItem(key: string) {
      data.delete(key);
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
  };
  const windowStub = {
    localStorage: storage,
    dispatchEvent: () => true,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  };
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "window", { value: windowStub, configurable: true });
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
  return () => {
    if (previousWindow) {
      Object.defineProperty(globalThis, "window", previousWindow);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
    if (previousStorage) {
      Object.defineProperty(globalThis, "localStorage", previousStorage);
    } else {
      Reflect.deleteProperty(globalThis, "localStorage");
    }
  };
}

describe("lab persistence", () => {
  it("round-trips lab state through JSON", () => {
    const parsed = parseLabState({
      difficulty: "architect",
      choices: STRONG_ARCHITECTURE,
      phase: "attack",
      revealedStageCount: 3,
      attempts: 2,
      lastResult: "attack-contained",
      bestResult: "architecture-holds",
      bestScore: 92,
    });
    expect(parsed.difficulty).toBe("challenge");
    expect(parsed.choices.identity).toBe("identity-mfa");
    expect(parsed.phase).toBe("attack");
    expect(parsed.revealedStageCount).toBe(3);
    expect(parsed.lastResult).toBe("contained");
    expect(parsed.bestResult).toBe("prevented");
    expect(parseLabState("nope").phase).toBe("setup");
  });

  it("survives a refresh via localStorage", () => {
    const restore = installMemoryStorage();
    try {
      const simulation = simulateAttack(STRONG_ARCHITECTURE);
      saveLabState({
        ...EMPTY_LAB_STATE,
        choices: STRONG_ARCHITECTURE,
        phase: "result",
        revealedStageCount: 7,
        attempts: 1,
        lastResult: simulation.result,
        bestResult: simulation.result,
        bestScore: simulation.score,
      });
      const loaded = loadLabState();
      expect(loaded.choices).toEqual(STRONG_ARCHITECTURE);
      expect(loaded.phase).toBe("result");
      expect(loaded.bestResult).toBe("contained");
      expect(globalThis.localStorage.getItem(LAB_STORAGE_KEY)).toContain("lab-poisoned-claim");
    } finally {
      restore();
    }
  });

  it("writes a lab session into My Progress without breaking old map data", () => {
    const restore = installMemoryStorage();
    try {
      globalThis.localStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify({
          version: 2,
          sessions: [
            {
              id: "locked-out:1",
              missionId: "locked-out",
              missionTitle: "Locked Out",
              seed: 1,
              questionIds: ["a"],
              questionsCompleted: 8,
              questionsRequired: 8,
              completed: true,
              overall: 80,
              choices: [],
              topics: ["ransomware"],
            },
          ],
        }),
      );
      const simulation = simulateAttack(STRONG_ARCHITECTURE);
      persistLab({
        ...EMPTY_LAB_STATE,
        choices: STRONG_ARCHITECTURE,
        phase: "result",
        revealedStageCount: 7,
        attempts: 1,
        lastResult: simulation.result,
        bestResult: simulation.result,
        bestScore: simulation.score,
      });
      const store = loadProgress();
      expect(store.sessions.some((item) => item.id === "locked-out:1")).toBe(true);
      const lab = store.sessions.find((item) => item.id === LAB_PROGRESS_SESSION_ID);
      expect(lab?.kind).toBe("lab");
      expect(lab?.completed).toBe(true);
      expect(lab?.missionTitle).toBe("The Poisoned Claim");
      expect(sessionResumeHref(lab!)).toBe("/lab/");
      expect(progressSummary(store).missionsCompleted).toBe(2);
      expect(progressSummary(store).overallCompletion).toBe(20);
    } finally {
      restore();
    }
  });
});

describe("existing progress compatibility", () => {
  it("still migrates old map sessions that have no kind field", () => {
    const migrated = validateAndMigrateProgress({
      version: 1,
      history: [
        {
          missionId: "locked-out",
          seed: 3,
          questionsCompleted: 8,
          questionsRequired: 8,
          completed: true,
          overall: 70,
        },
      ],
    });
    expect(migrated.sessions[0]?.kind).toBe("map");
    expect(migrated.sessions[0]?.missionId).toBe("locked-out");
    expect(sessionResumeHref(migrated.sessions[0]!)).toContain("/play/");
  });

  it("does not let a completed lab raise map completion above 100%", () => {
    const store = validateAndMigrateProgress({
      version: 2,
      sessions: [
        { missionId: "inbox-under-siege", completed: true, overall: 70 },
        { missionId: "locked-out", completed: true, overall: 70 },
        { missionId: "northstar-zero-hour", completed: true, overall: 70 },
        { missionId: "ai-forge", completed: true, overall: 70 },
        { missionId: "dependency-depths", completed: true, overall: 70 },
        {
          id: LAB_PROGRESS_SESSION_ID,
          kind: "lab",
          missionId: "lab-poisoned-claim",
          missionTitle: "The Poisoned Claim",
          completed: true,
          overall: 92,
        },
      ],
    });
    const summary = progressSummary(store);
    expect(summary.missionsCompleted).toBe(6);
    expect(summary.overallCompletion).toBe(100);
  });

  it("keeps lab sync from requiring map report fields", () => {
    const session = syncLabProgress(
      {
        ...EMPTY_LAB_STATE,
        bestResult: "prevented",
        lastResult: "prevented",
        bestScore: 92,
        phase: "result",
      },
      "prevented",
      92,
    );
    expect(session.choices).toEqual([]);
    expect(session.kind).toBe("lab");
  });
});
