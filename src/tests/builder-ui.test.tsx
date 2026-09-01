import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BuilderQuiz } from "@/components/builder/BuilderQuiz";
import { SecureSolutionBuilderView } from "@/components/builder/SecureSolutionBuilder";
import { MissionsLibrary } from "@/components/site/MissionsLibrary";
import { ProgressDashboard } from "@/components/site/ProgressPage";
import { BUILDER_DECISIONS } from "@/lib/builder/catalog";
import { BUILDER_PROGRESS_SESSION_ID } from "@/lib/builder/copy";
import { EMPTY_BUILDER_STATE } from "@/lib/builder/store";
import type { BuilderPersistedState } from "@/lib/builder/types";

const noop = () => undefined;

describe("Secure Solution Builder UI", () => {
  it("shows the intro before the first question", () => {
    const html = renderToStaticMarkup(
      <SecureSolutionBuilderView state={EMPTY_BUILDER_STATE} onChange={noop} />,
    );
    expect(html).toContain("Secure Solution Builder");
    expect(html).toContain("15 decisions from idea to launch");
    expect(html).toContain("Start mission");
    expect(html).not.toContain("Reset game");
    expect(html).toContain("Security by Design");
    expect(html).toContain("Data Protection");
    expect(html).toContain("I’ll guide you through 15 decisions");
    expect(html).toContain("builder-bubble");
    expect(html).not.toContain("Make decision");
  });

  it("renders one question at a time with Make decision disabled until a choice is selected", () => {
    const idle: BuilderPersistedState = {
      ...EMPTY_BUILDER_STATE,
      phase: "quiz",
    };
    const selected: BuilderPersistedState = {
      ...idle,
      pendingLetter: "B",
    };
    const idleHtml = renderToStaticMarkup(
      <BuilderQuiz state={idle} onSelect={noop} onConfirm={noop} onNext={noop} onReset={noop} />,
    );
    const selectedHtml = renderToStaticMarkup(
      <BuilderQuiz state={selected} onSelect={noop} onConfirm={noop} onNext={noop} onReset={noop} />,
    );
    expect(idleHtml).toContain("Question 1 of 15");
    expect(idleHtml).toContain(BUILDER_DECISIONS[0]!.prompt);
    expect(idleHtml).toContain("disabled");
    expect(idleHtml).toContain("Make decision");
    expect(idleHtml).toContain("Reset game");
    expect(idleHtml).toContain("During the design phase, before key technology decisions are locked");
    expect(selectedHtml).not.toMatch(/<button[^>]*disabled[^>]*>[\s\S]*Make decision/);
  });

  it("locks the chosen answer and shows why this matters after confirmation", () => {
    const locked: BuilderPersistedState = {
      ...EMPTY_BUILDER_STATE,
      phase: "quiz",
      pendingLetter: "A",
      answers: [{ questionId: "ssb-01", letter: "A" }],
    };
    const html = renderToStaticMarkup(
      <BuilderQuiz state={locked} onSelect={noop} onConfirm={noop} onNext={noop} onReset={noop} />,
    );
    expect(html).toContain("Why this matters");
    expect(html).toContain("Not quite — security should help shape the solution during design");
    expect(html).toContain("Next decision");
    expect(html).toContain("is-wrong");
    expect(html).toContain("is-correct");
    expect(html).toContain("Your answer, not sufficient");
    expect(html).toContain("Correct answer");
  });

  it("shows See my result on the last confirmed question", () => {
    const last: BuilderPersistedState = {
      ...EMPTY_BUILDER_STATE,
      phase: "quiz",
      currentIndex: 14,
      pendingLetter: "B",
      answers: [{ questionId: "ssb-15", letter: "B" }],
    };
    const html = renderToStaticMarkup(
      <BuilderQuiz state={last} onSelect={noop} onConfirm={noop} onNext={noop} onReset={noop} />,
    );
    expect(html).toContain("Question 15 of 15");
    expect(html).toContain("See my result");
  });

  it("renders the result level, category scores and review of missed decisions", () => {
    const result: BuilderPersistedState = {
      ...EMPTY_BUILDER_STATE,
      phase: "result",
      answers: BUILDER_DECISIONS.map((question, index) => ({
        questionId: question.id,
        letter: index === 0 ? "A" : question.correctLetter,
      })),
      lastScore: 14,
      bestScore: 14,
      lastPercent: 93,
      bestPercent: 93,
      completed: true,
    };
    const html = renderToStaticMarkup(<SecureSolutionBuilderView state={result} onChange={noop} />);
    expect(html).toContain("Your secure build result");
    expect(html).toContain("14 / 15");
    expect(html).toContain("Security by Design ready");
    expect(html).toContain("Data Protection");
    expect(html).toContain("Review missed decisions");
    expect(html).toContain("Involve security while the solution can still be shaped");
    expect(html).toContain("Reset game");
  });

  it("shows Reset game during an in-progress session and keeps the intro start button on first visit", () => {
    const midQuiz: BuilderPersistedState = {
      ...EMPTY_BUILDER_STATE,
      phase: "quiz",
      currentIndex: 4,
      pendingLetter: "A",
      answers: [{ questionId: "ssb-01", letter: "B" }],
      bestScore: 12,
    };
    const quizHtml = renderToStaticMarkup(
      <SecureSolutionBuilderView state={midQuiz} onChange={noop} />,
    );
    expect(quizHtml).toContain("Reset game");
    expect(quizHtml).toContain("Make decision");
    expect(quizHtml).not.toContain("Start mission");
  });
});

describe("Secure Solution Builder reachability", () => {
  it("adds the mission to the Missions page without replacing the lab", () => {
    const html = renderToStaticMarkup(<MissionsLibrary />);
    expect(html).toContain("Architecture Defence Lab");
    expect(html).toMatch(/href="\/lab\/?"/);
    expect(html).toContain("Secure Solution Builder");
    expect(html).toContain("BEGINNER · 15 DECISIONS");
    expect(html).toContain("Learn how to build security into a digital solution from the first idea to production.");
    expect(html).toContain("Start mission");
    expect(html).toContain("Decision exercises");
    expect(html).toContain("Map missions");
    expect(html).toContain("decision-exercises");
    expect(html).toContain("builder-mission-thumb");
    expect(html).toContain("I’ll guide you through 15 decisions.");
    expect(html).toContain("security-architect.webp");
    expect(html.indexOf("Architecture Defence Lab")).toBeLessThan(html.indexOf("Secure Solution Builder"));
    expect(html.indexOf("Secure Solution Builder")).toBeLessThan(html.indexOf("Inbox Under Siege"));
    expect(html).toContain("Security by Design");
    expect(html).toContain("DevSecOps");
    expect(html).toMatch(/href="\/secure-solution-builder\/?"/);
    expect(html).toContain("Inbox Under Siege");
  });

  it("lists a completed builder session on My Progress", () => {
    const html = renderToStaticMarkup(
      <ProgressDashboard
        store={{
          version: 2,
          sessions: [
            {
              id: BUILDER_PROGRESS_SESSION_ID,
              kind: "builder",
              missionId: "secure-solution-builder",
              missionTitle: "Secure Solution Builder",
              seed: 0,
              questionIds: BUILDER_DECISIONS.map((item) => item.id),
              questionsCompleted: 15,
              questionsRequired: 15,
              phaseLabel: "14 / 15 · Security by Design ready",
              completed: true,
              endedEarly: false,
              overall: 93,
              scenarioId: "secure-solution-builder",
              choices: [],
              startedAt: 1,
              updatedAt: 2,
              roleGroupId: "it-security",
              roleId: "security-architect",
              topics: ["secure-development"],
              audienceMode: "standard",
              perspectiveLabel: "Beginner · 15 decisions",
            },
          ],
        }}
        hydrated
      />,
    );
    expect(html).toContain("Secure Solution Builder");
    expect(html).toContain("Open mission");
    expect(html).toMatch(/href="\/secure-solution-builder\/?"/);
    expect(html).toContain("Score 93");
  });
});
