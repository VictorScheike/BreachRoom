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

const decisionProps = {
  onSelect: noop,
  onNext: noop,
  onBack: noop,
  canGoBack: false,
};

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
        {...decisionProps}
      />,
    );
    const challenge = renderToStaticMarkup(
      <DecisionScreen
        decision={decision}
        difficulty="challenge"
        choices={{}}
        pendingOptionId={null}
        {...decisionProps}
      />,
    );
    expect(guided).toContain("Decision 1 of 10");
    expect(guided).toContain("Recommended");
    expect(guided).toContain("more infrastructure and private-link configuration");
    expect(guided).toContain("WAF in front of public portal and API");
    expect(guided).toContain("Direct public portal and API");
    expect(challenge).not.toContain("Recommended");
    expect(challenge).toContain("Select to see the trade-off");
    expect(challenge).not.toContain("more infrastructure and private-link configuration");
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
    expect(html).toContain("Preview final attack");
    expect(html).toContain("Claims Portal");
    expect(html).toContain("WAF + private API");
    expect(html).toContain("MFA + RBAC");
    expect(html).toContain("Segmented zones");
    expect(html).toContain("Private API gateway");
    expect(html).toContain("Managed identity");
    expect(html).toContain("Least-privilege API");
    expect(html).toContain("Case-scoped retrieval");
    expect(html).toContain("Document scanner");
    expect(html).toContain("SIEM + playbook");
    expect(html).toContain("Tested recovery");
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
    expect(html).toContain("Red Team · Step 1 of 10");
    expect(html).toContain("Initial foothold");
    expect(html).toContain("Pause");
    expect(html).toContain("Replay attack");
    expect(html).not.toContain("Run Red Team");
    expect(html).toContain("Previous");
    expect(html).toContain("Next");
    expect(html).not.toContain("Current technique");
    expect(html).not.toContain("Attack impact");
  });

  it("shows Contained or Breached from the actual architecture", () => {
    const strong = renderToStaticMarkup(
      <ArchitectureDefenceLabView
        state={{
          ...EMPTY_LAB_STATE,
          choices: STRONG_ARCHITECTURE,
          phase: "result",
          revealedStageCount: 10,
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
          revealedStageCount: 10,
          lastResult: simulateAttack(WEAK_ARCHITECTURE).result,
        }}
        onChange={noop}
      />,
    );
    expect(strong).toContain("Contained");
    expect(strong).not.toContain("Prevented");
    expect(weak).toContain("Breached");
    expect(weak).toContain("COMPROMISED");
    expect(weak).not.toContain(">SUCCESS<");
    expect(strong).toContain("Improve and retry");
    expect(strong).toContain("Prevention");
    expect(strong).toContain("Blast-radius limitation");
    expect(strong).toContain("Detection");
    expect(strong).toContain("Recovery");
    expect(strong).toContain("Furthest asset reached");
    expect(strong).toContain("attack-timeline");
    expect(strong).toContain("Because you chose:");
    expect(strong).toContain("What the attacker tried");
    expect(strong).toContain("Where it ended");
    expect(strong).toContain("NOT REACHED");
    expect(strong).toContain("Prepared, but not required");
    expect(strong).toContain("Claims Portal");
    expect(weak).toContain("Claims Database");
    expect(weak).toContain("Shared password");
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

  it("grows the preview from three core nodes instead of showing every control at once", () => {
    const empty = renderToStaticMarkup(
      <ArchitectureMap choices={{}} inspectable={false} layout="desktop" />,
    );
    expect(empty).toContain("Claims Portal");
    expect(empty).toContain("AI Claims App");
    expect(empty).toContain("Claims Database");
    expect(empty).not.toContain("MFA + RBAC");
    expect(empty).not.toContain("Document scanner");
    expect(empty).not.toContain("SIEM + playbook");
    const preview = renderToStaticMarkup(
      <ArchitectureMap
        choices={{}}
        previewOptionId="exposure-private"
        inspectable={false}
        layout="desktop"
      />,
    );
    expect(preview).toContain("WAF + private API");
    expect(preview).not.toContain("Document scanner");
    expect(preview).not.toContain("SIEM + playbook");
  });

  it("keeps a simplified vertical network on a mobile-sized board", () => {
    const html = renderToStaticMarkup(
      <ArchitectureMap choices={STRONG_ARCHITECTURE} inspectable={false} layout="mobile" />,
    );
    expect(html).toContain("lab-map--mobile");
    expect(html).toContain("Claims Database");
    expect(html).toContain("lab-map__edge");
  });

  it("keeps the local path neutral and offers three takes, with Next to continue", () => {
    const pending = renderToStaticMarkup(
      <DecisionScreen
        decision={LAB_MISSION.decisions[0]!}
        difficulty="guided"
        choices={{}}
        pendingOptionId="exposure-private"
        {...decisionProps}
      />,
    );
    expect(pending).toContain("Next");
    expect(pending).not.toContain("Lock choice");
    expect(pending).toContain("Architecture updated");
    expect(pending).toContain("WAF in front of public portal and API");
    expect(pending).not.toContain("Stolen credentials stop at identity");
    expect(pending).not.toContain("Valid attacker session");

    const password = renderToStaticMarkup(
      <DecisionScreen
        decision={LAB_MISSION.decisions[0]!}
        difficulty="challenge"
        choices={{}}
        pendingOptionId="exposure-direct"
        {...decisionProps}
      />,
    );
    expect(password).toContain("Next");
    expect(password).not.toContain("Recommended");
    expect(password).not.toContain('data-state="held"');
    expect(password).not.toContain("Valid attacker session");
  });

  it("shows the live architecture while deciding, growing with each control", () => {
    const deciding = renderToStaticMarkup(
      <ArchitectureDefenceLabView
        state={{
          ...EMPTY_LAB_STATE,
          phase: "decide",
          pendingOptionId: "exposure-private",
        }}
        onChange={noop}
      />,
    );
    expect(deciding).toContain("Decision 1 of 10");
    expect(deciding).toContain("Next");
    expect(deciding).not.toContain("Lock choice");
    expect(deciding).toContain("lab-map");
    expect(deciding).toContain("Architecture updated");
    expect(deciding).not.toContain("local-impact");
    expect(deciding).not.toContain("Preview final attack");
    expect(deciding).not.toContain("SIEM");
  });

  it("marks held edges green and live attack edges red, with text labels", () => {
    const simulation = simulateAttack(STRONG_ARCHITECTURE);
    const ai = simulation.stages.find((item) => item.id === "ai-manipulation");
    const aiIndex = simulation.stages.findIndex((item) => item.id === "ai-manipulation") + 1;
    const resultBeat = ai ? Math.max(0, ai.travelledPath.length) : 1;
    const blocked = renderToStaticMarkup(
      <ArchitectureMap
        choices={STRONG_ARCHITECTURE}
        simulation={simulation}
        revealedStageCount={aiIndex}
        attackBeat={resultBeat}
        phase="attack"
        inspectable={false}
        layout="desktop"
      />,
    );
    expect(blocked).toContain('data-state="held"');
    expect(blocked).toContain("BLOCKED");
    expect(blocked).toContain("PROTECTED");
    expect(blocked).toContain("EFFECTIVE");
    expect(blocked).toContain("MFA + RBAC");

    const live = renderToStaticMarkup(
      <ArchitectureMap
        choices={WEAK_ARCHITECTURE}
        simulation={simulateAttack(WEAK_ARCHITECTURE)}
        revealedStageCount={2}
        attackBeat={1}
        phase="attack"
        inspectable={false}
        layout="desktop"
        reducedMotion
      />,
    );
    expect(live).toContain('data-state="active"');
    expect(live).toContain("COMPROMISED");
    expect(live).not.toContain("animateMotion");
  });

  it("highlights the selected timeline path on the final architecture", () => {
    const simulation = simulateAttack(STRONG_ARCHITECTURE);
    const html = renderToStaticMarkup(
      <ArchitectureMap
        choices={STRONG_ARCHITECTURE}
        simulation={simulation}
        revealedStageCount={10}
        phase="result"
        focusedStageId="ai-manipulation"
        inspectable={false}
        layout="desktop"
      />,
    );
    expect(html).toContain('data-node-id="app"');
    expect(html).toContain("is-dimmed");
    expect(html).toContain("BLOCKED");
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
