import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArchitectureDefenceLabView } from "@/components/lab/ArchitectureDefenceLab";
import { DecisionScreen } from "@/components/lab/DecisionScreen";
import { ArchitectureMap } from "@/components/lab/ArchitectureMap";
import { MissionsLibrary } from "@/components/site/MissionsLibrary";
import { ProgressDashboard } from "@/components/site/ProgressPage";
import { LAB_MISSION } from "@/lib/lab/catalog";
import { simulateAttack } from "@/lib/lab/engine";
import { STRONG_ARCHITECTURE, WEAK_ARCHITECTURE } from "@/lib/lab/fixtures";
import { EMPTY_LAB_STATE } from "@/lib/lab/store";
import { LAB_PROGRESS_SESSION_ID } from "@/lib/lab/progress";
import type { LabPersistedState } from "@/lib/lab/types";

const noop = () => undefined;

describe("Architecture Defence Lab UI", () => {
  it("starts with Guided and Challenge instead of a component palette", () => {
    const html = renderToStaticMarkup(
      <ArchitectureDefenceLabView state={EMPTY_LAB_STATE} onChange={noop} />,
    );
    expect(html).toContain("Architecture Defence Lab");
    expect(html).toContain("Guided");
    expect(html).toContain("Challenge");
    expect(html).toContain("Start the ten decisions");
    expect(html).toContain("Nordic Shield Insurance");
    expect(html).toContain("fictional");
    expect(html).not.toContain("User and Input Zone");
    expect(html).not.toContain("Launch Attack");
  });

  it("shows one decision at a time with a Recommended label only in Guided", () => {
    const decision = LAB_MISSION.decisions[0]!;
    const guided = renderToStaticMarkup(
      <DecisionScreen
        decision={decision}
        difficulty="guided"
        choices={{}}
        pendingOptionId={null}
        onSelect={noop}
        onContinue={noop}
        onBack={noop}
        canGoBack={false}
      />,
    );
    const challenge = renderToStaticMarkup(
      <DecisionScreen
        decision={decision}
        difficulty="challenge"
        choices={{}}
        pendingOptionId={null}
        onSelect={noop}
        onContinue={noop}
        onBack={noop}
        canGoBack={false}
      />,
    );
    expect(guided).toContain("Decision 1 of 10");
    expect(guided).toContain("Recommended");
    expect(guided).toContain("Slightly more friction during sign-in");
    expect(challenge).not.toContain("Recommended");
    expect(challenge).toContain("Select to see the trade-off");
    expect(challenge).not.toContain("Slightly more friction during sign-in");
  });

  it("renders the complete architecture after ten decisions", () => {
    const state: LabPersistedState = {
      ...EMPTY_LAB_STATE,
      choices: STRONG_ARCHITECTURE,
      phase: "review",
      currentDecisionIndex: 9,
    };
    const html = renderToStaticMarkup(<ArchitectureDefenceLabView state={state} onChange={noop} />);
    expect(html).toContain("Architecture complete · 10/10");
    expect(html).toContain("Run Red Team");
    expect(html).toContain("Claims Portal");
    expect(html).toContain("MFA + RBAC");
    expect(html).toContain("File Sandbox");
    expect(html).toContain("Private LLM");
    expect(html).toContain("Case-scoped RAG");
    expect(html).toContain("Managed Identity");
    expect(html).toContain("Restricted API");
    expect(html).toContain("Human Approval");
    expect(html).toContain("Network Segmentation");
    expect(html).toContain("Signed Builds");
    expect(html).toContain("SIEM");
    expect(html).toContain("Claims Database");
    expect(html).not.toContain("Stops stolen-password login");
    expect(html).not.toContain("lab-map__grid");
  });

  it("shows the first Red Team technique and next-step controls", () => {
    const state: LabPersistedState = {
      ...EMPTY_LAB_STATE,
      choices: STRONG_ARCHITECTURE,
      phase: "attack",
      revealedStageCount: 1,
    };
    const html = renderToStaticMarkup(<ArchitectureDefenceLabView state={state} onChange={noop} />);
    expect(html).toContain("Stolen credentials");
    expect(html).toContain("Next attack step");
    expect(html).toContain("Pause");
    expect(html).toContain("Replay attack");
    expect(html).toContain("Red Team · Step 1 of 7");
    expect(html).not.toContain("Run Red Team");
    expect(html).not.toContain("Current technique");
    expect(html).not.toContain("Attack impact");
  });

  it("shows Prevented or Breached from the actual architecture", () => {
    const strong = renderToStaticMarkup(
      <ArchitectureDefenceLabView
        state={{
          ...EMPTY_LAB_STATE,
          choices: STRONG_ARCHITECTURE,
          phase: "result",
          revealedStageCount: 7,
          lastResult: simulateAttack(STRONG_ARCHITECTURE).result,
        }}
        onChange={noop}
      />,
    );
    const weak = renderToStaticMarkup(
      <ArchitectureDefenceLabView
        state={{
          ...EMPTY_LAB_STATE,
          choices: WEAK_ARCHITECTURE,
          phase: "result",
          revealedStageCount: 7,
          lastResult: simulateAttack(WEAK_ARCHITECTURE).result,
        }}
        onChange={noop}
      />,
    );
    expect(strong).toContain("Prevented");
    expect(weak).toContain("Breached");
    expect(strong).toContain("Improve and retry");
    expect(strong).not.toContain("Defence readiness");
  });

  it("renders a connected network board instead of a card grid", () => {
    const html = renderToStaticMarkup(
      <ArchitectureMap choices={STRONG_ARCHITECTURE} inspectable={false} layout="desktop" />,
    );
    expect(html).toContain("lab-map");
    expect(html).toContain("lab-map__edges");
    expect(html).toContain("Claims Portal");
    expect(html).toContain("MFA + RBAC");
    expect(html).not.toContain("lab-map__grid");
    expect(html).not.toContain("Stops stolen-password login");
  });

  it("keeps a simplified vertical network on a mobile-sized board", () => {
    const html = renderToStaticMarkup(
      <ArchitectureMap choices={STRONG_ARCHITECTURE} inspectable={false} layout="mobile" />,
    );
    expect(html).toContain("lab-map--mobile");
    expect(html).toContain("Claims Database");
    expect(html).toContain("lab-map__edge");
  });
});

describe("lab reachability from existing surfaces", () => {
  it("adds the lab to the missions library without changing published map missions", () => {
    const html = renderToStaticMarkup(<MissionsLibrary />);
    expect(html).toContain("Architecture Defence Lab");
    expect(html).toMatch(/href="\/lab\/?"/);
    expect(html).toContain("The Poisoned Claim");
    expect(html).toContain("Inbox Under Siege");
    expect(html).toContain("GUIDED OR CHALLENGE");
  });

  it("lists a completed lab on My Progress with an Open lab link", () => {
    const html = renderToStaticMarkup(
      <ProgressDashboard
        store={{
          version: 2,
          sessions: [
            {
              id: LAB_PROGRESS_SESSION_ID,
              kind: "lab",
              missionId: "lab-poisoned-claim",
              missionTitle: "The Poisoned Claim",
              seed: 0,
              questionIds: [],
              questionsCompleted: 10,
              questionsRequired: 10,
              phaseLabel: "Prevented",
              completed: true,
              endedEarly: false,
              overall: 92,
              scenarioId: "poisoned-claim",
              choices: [],
              startedAt: 1,
              updatedAt: 2,
              roleGroupId: "it-security",
              roleId: "security-architect",
              topics: ["ai-security", "secure-architecture"],
              audienceMode: "standard",
              perspectiveLabel: "Guided",
            },
          ],
        }}
        hydrated
      />,
    );
    expect(html).toContain("The Poisoned Claim");
    expect(html).toContain("Open lab");
    expect(html).toContain("Architecture Defence Lab");
    expect(html).not.toContain("See my score");
    expect(html).toMatch(/href="\/lab\/?"/);
  });
});
