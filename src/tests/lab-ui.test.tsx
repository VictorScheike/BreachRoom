import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArchitectureDefenceLabView } from "@/components/lab/ArchitectureDefenceLab";
import { ComponentPalette } from "@/components/lab/ComponentPalette";
import { AttackSimulator } from "@/components/lab/AttackSimulator";
import { ArchitectureReview } from "@/components/lab/ArchitectureReview";
import { MissionsLibrary } from "@/components/site/MissionsLibrary";
import { ProgressDashboard } from "@/components/site/ProgressPage";
import { simulateAttack } from "@/lib/lab/engine";
import { STRONG_ARCHITECTURE, WEAK_ARCHITECTURE } from "@/lib/lab/fixtures";
import { EMPTY_LAB_STATE } from "@/lib/lab/store";
import { LAB_PROGRESS_SESSION_ID } from "@/lib/lab/progress";
import type { LabPersistedState } from "@/lib/lab/types";

const noop = () => undefined;

describe("Architecture Defence Lab UI", () => {
  it("renders Guided and Architect hardness controls and the three trust zones", () => {
    const html = renderToStaticMarkup(
      <ArchitectureDefenceLabView state={EMPTY_LAB_STATE} onChange={noop} />,
    );
    expect(html).toContain("Hardness lvl");
    expect(html).toContain("Guided");
    expect(html).toContain("Architect");
    expect(html).toContain("Architecture Defence Lab");
    expect(html).toContain("Build it. Then let the attack loose.");
    expect(html).toContain("User and Input Zone");
    expect(html).toContain("AI Application Zone");
    expect(html).toContain("Protected Systems Zone");
    expect(html).toContain("Launch Attack");
    expect(html).toContain("Nordic Shield Insurance");
    expect(html).toContain("fictional");
    expect(html).toContain("Phase 1 · Build");
  });

  it("hides Architect-only options and recommended labels according to difficulty", () => {
    const guided = renderToStaticMarkup(
      <ComponentPalette
        difficulty="guided"
        selectedId={null}
        locked={false}
        onSelect={noop}
        onDragStart={noop}
        onDragEnd={noop}
      />,
    );
    const architect = renderToStaticMarkup(
      <ComponentPalette
        difficulty="architect"
        selectedId={null}
        locked={false}
        onSelect={noop}
        onDragStart={noop}
        onDragEnd={noop}
      />,
    );
    expect(guided).toContain("Recommended");
    expect(guided).toContain("Stolen passwords fail");
    expect(guided).not.toContain("MFA without clear roles");
    expect(architect).toContain("MFA without clear roles");
    expect(architect).not.toContain("Recommended");
    expect(architect).toContain("Higher operational cost");
  });

  it("explains missing slots instead of launching", () => {
    const html = renderToStaticMarkup(
      <AttackSimulator
        phase="build"
        difficulty="guided"
        revealedStageCount={0}
        simulation={null}
        missingMessage="Place a component in Identity and access before launching the attack."
        onLaunch={noop}
        onNext={noop}
        onReset={noop}
      />,
    );
    expect(html).toContain("Place a component in Identity and access");
    expect(html).toContain("Launch Attack");
  });

  it("locks the architecture copy during the attack and shows the first stage", () => {
    const state: LabPersistedState = {
      ...EMPTY_LAB_STATE,
      placements: STRONG_ARCHITECTURE,
      phase: "attack",
      revealedStageCount: 1,
    };
    const html = renderToStaticMarkup(<ArchitectureDefenceLabView state={state} onChange={noop} />);
    expect(html).toContain("Phase 2 · Under Attack");
    expect(html).toContain("Next Attack Step");
    expect(html).toContain("Components locked");
    expect(html).toContain("Blocked");
    expect(html).not.toContain("Launch Attack");
  });

  it("shows the review, Improve and Retry, and defence-in-depth copy after a run", () => {
    const simulation = simulateAttack(STRONG_ARCHITECTURE);
    const html = renderToStaticMarkup(
      <ArchitectureReview
        simulation={simulation}
        difficulty="guided"
        onReviewArchitecture={noop}
        onRetry={noop}
      />,
    );
    expect(html).toContain("Architecture Holds");
    expect(html).toContain("Improve and Retry");
    expect(html).toContain("Review Architecture");
    expect(html).toContain("End Mission");
    expect(html).toContain("Defence in depth");
    expect(html).toContain("NIST AI RMF");
    expect(html).toContain("OWASP");
  });

  it("renders a different review headline for a weak architecture", () => {
    const html = renderToStaticMarkup(
      <ArchitectureReview
        simulation={simulateAttack(WEAK_ARCHITECTURE)}
        difficulty="architect"
        onReviewArchitecture={noop}
        onRetry={noop}
      />,
    );
    expect(html).toContain("Architecture Breached");
  });
});

describe("lab reachability from existing surfaces", () => {
  it("adds the lab to the missions library without changing published map missions", () => {
    const html = renderToStaticMarkup(<MissionsLibrary />);
    expect(html).toContain("Architecture Defence Lab");
    expect(html).toMatch(/href="\/lab\/?"/);
    expect(html).toContain("The Poisoned Claim");
    expect(html).toContain("Inbox Under Siege");
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
              questionsCompleted: 6,
              questionsRequired: 6,
              phaseLabel: "Architecture Holds",
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
              perspectiveLabel: "Guided · Hardness lvl",
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
