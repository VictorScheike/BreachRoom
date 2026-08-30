import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GameReport } from "@/components/game/GameReport";
import { GameView } from "@/components/game/GameView";
import { createInitialGameState, gameReducer } from "@/lib/game/engine";
import { missionPerspective } from "@/lib/game/perspective";
import { requireMission } from "@/lib/missions/catalog";
import { preparePlaythrough } from "@/lib/missions/playthrough";
import { buildMissionReport } from "@/lib/missions/report";
import { buildEmailReportText } from "@/lib/missions/email-report";
import type { TrainingConfig } from "@/lib/training/config";
import { generateDeck } from "@/lib/training/deck";
import type { MoveDirection } from "@/lib/game/world";

const noop = () => undefined;

function renderGame(state: ReturnType<typeof createInitialGameState>): string {
  return renderToStaticMarkup(
    <GameView
      state={state}
      onBegin={noop}
      onMove={noop}
      onChoose={noop}
      onContinue={noop}
      onRetry={noop}
      onOpenReport={noop}
      onToggleMute={noop}
      onChooseAnother={noop}
      onEndEarly={noop}
    />,
  );
}

function walkToEncounter(start: ReturnType<typeof createInitialGameState>) {
  const dirs: MoveDirection[] = ["right", "up", "down", "left"];
  const seen = new Set<string>();
  const queue = [start];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    if (current.screen === "encounter") {
      return current;
    }
    const key = `${current.position.x},${current.position.y},${current.choices.length}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    for (const direction of dirs) {
      const next = gameReducer(current, { type: "MOVE", direction });
      if (next.screen !== current.screen || next.position.x !== current.position.x || next.position.y !== current.position.y) {
        queue.push(next);
      }
    }
    if (seen.size > 2500) {
      break;
    }
  }
  throw new Error("Could not reach an encounter");
}

describe("mission role indicator", () => {
  it("shows You’re playing as with the selected role group", () => {
    let state = createInitialGameState();
    state = gameReducer(state, {
      type: "START_DIRECT",
      missionId: "dependency-depths",
      roleId: "developer",
      seed: 9,
    });
    const mission = requireMission("dependency-depths");
    const perspective = missionPerspective(mission, null, "developer");
    expect(perspective.playingAs).toBe("Developers & DevOps");
    expect(perspective.reportLine).toBe("Played as: Developers & DevOps");
    const html = renderGame(state);
    expect(html).toContain("You’re playing as");
    expect(html).toContain("Developers &amp; DevOps");
    expect(html).toContain("code, pipelines, secrets and secure releases");
  });

  it("keeps the training wizard role after a resumed session", () => {
    const deck = generateDeck(
      {
        roleGroup: "developers-devops",
        specificRole: "developer",
        topics: ["supply-chain"],
        technologies: ["github"],
        contexts: [],
        difficulty: "Intermediate",
        mapId: "dependency-depths",
      },
      { seed: "resume-seed" },
    );
    expect(deck.ok).toBe(true);
    if (!deck.ok) {
      return;
    }
    const config: TrainingConfig = deck.config;
    let state = createInitialGameState();
    state = gameReducer(state, { type: "START_TRAINING", config });
    expect(missionPerspective(requireMission("dependency-depths"), state.trainingConfig, state.roleId).playingAs).toBe(
      "Developers & DevOps",
    );
    const replayed = gameReducer(state, { type: "REPLAY_MISSION" });
    expect(
      missionPerspective(requireMission("dependency-depths"), replayed.trainingConfig, replayed.roleId).playingAs,
    ).toBe("Developers & DevOps");
  });

  it("shows a compact ROLE chip on an active decision", () => {
    let state = createInitialGameState();
    state = gameReducer(state, {
      type: "START_DIRECT",
      missionId: "dependency-depths",
      roleId: "developer",
      seed: 9,
    });
    state = gameReducer(state, { type: "BEGIN_MISSION" });
    const encounter = walkToEncounter(state);
    const html = renderGame(encounter);
    expect(html).toContain("ROLE · DEVELOPERS &amp; DEVOPS");
  });

  it("includes the same role on the report and in email", () => {
    const mission = requireMission("dependency-depths");
    const play = preparePlaythrough(mission, 9, { roleId: "developer" });
    const report = buildMissionReport(mission, play.scenarioId, [], play.questions, null, "developer");
    expect(report.perspectiveLine).toBe("Played as: Developers & DevOps");
    const html = renderToStaticMarkup(
      <GameReport report={report} onReplay={noop} onNewScenario={noop} onOtherMission={noop} />,
    );
    expect(html).toContain("Played as: Developers &amp; DevOps");
    expect(buildEmailReportText(report)).toContain("Played as: Developers & DevOps");
  });

  it("shows organisation-wide context for Northstar: Zero Hour", () => {
    let state = createInitialGameState();
    state = gameReducer(state, {
      type: "START_DIRECT",
      missionId: "northstar-zero-hour",
      roleId: null,
      seed: 4,
    });
    const html = renderGame(state);
    expect(html).toContain("Organisation-wide exercise");
    expect(html).toContain("incident coordination team");
    expect(html).not.toContain("You’re playing as");
    expect(html).not.toContain("Developer &amp; DevOps");
    const mission = requireMission("northstar-zero-hour");
    const play = preparePlaythrough(mission, 4);
    const report = buildMissionReport(mission, play.scenarioId, [], play.questions, null, null);
    expect(report.perspectiveLine).toBe("Perspective: Organisation-wide incident coordination team");
    expect(buildEmailReportText(report)).toContain("Organisation-wide incident coordination team");
  });

  it("does not invent a role for a standard mission played without one", () => {
    const mission = requireMission("locked-out");
    const perspective = missionPerspective(mission, null, null);
    expect(perspective.playingAs).toBe("Standard mission");
    expect(perspective.mode).toBe("standard");
  });
});
