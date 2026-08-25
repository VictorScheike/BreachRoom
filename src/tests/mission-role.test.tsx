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

const noop = () => undefined;

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
    expect(perspective.playingAs).toBe("Developer & DevOps");
    expect(perspective.reportLine).toContain("Played as: Developer & DevOps");
    const html = renderToStaticMarkup(
      <GameView
        state={state}
        onBegin={noop}
        onMove={noop}
        onChoose={noop}
        onContinue={noop}
        onOpenReport={noop}
        onToggleMute={noop}
        onChooseAnother={noop}
        onEndEarly={noop}
      />,
    );
    expect(html).toContain("You’re playing as");
    expect(html).toContain("Developer &amp; DevOps");
  });

  it("shows organisation-wide context for Northstar: Zero Hour", () => {
    let state = createInitialGameState();
    state = gameReducer(state, {
      type: "START_DIRECT",
      missionId: "northstar-zero-hour",
      roleId: null,
      seed: 4,
    });
    const html = renderToStaticMarkup(
      <GameView
        state={state}
        onBegin={noop}
        onMove={noop}
        onChoose={noop}
        onContinue={noop}
        onOpenReport={noop}
        onToggleMute={noop}
        onChooseAnother={noop}
        onEndEarly={noop}
      />,
    );
    expect(html).toContain("Organisation-wide");
    expect(html).not.toContain("Developer &amp; DevOps");
    const mission = requireMission("northstar-zero-hour");
    const play = preparePlaythrough(mission, 4);
    const report = buildMissionReport(mission, play.scenarioId, [], play.questions, null, null);
    expect(report.perspectiveLine).toBe("Perspective: Organisation-wide incident coordination team");
    const reportHtml = renderToStaticMarkup(
      <GameReport report={report} onReplay={noop} onNewScenario={noop} onOtherMission={noop} />,
    );
    expect(reportHtml).toContain("Organisation-wide incident coordination team");
    expect(buildEmailReportText(report)).toContain("Organisation-wide incident coordination team");
  });
});
