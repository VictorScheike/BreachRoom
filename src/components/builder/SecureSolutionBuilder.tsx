"use client";

import { useMemo, useSyncExternalStore } from "react";
import { BuilderIntro } from "@/components/builder/BuilderIntro";
import { BuilderQuiz } from "@/components/builder/BuilderQuiz";
import { BuilderResult } from "@/components/builder/BuilderResult";
import { BuilderReview } from "@/components/builder/BuilderReview";
import { EducationalDisclaimer } from "@/components/EducationalDisclaimer";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import {
  closeBuilderReview,
  confirmBuilderDecision,
  goToNextBuilderDecision,
  openBuilderReview,
  persistBuilder,
  replayBuilder,
  resetBuilderGame,
  selectBuilderOption,
  startBuilderDecisions,
} from "@/lib/builder/play";
import { scoreBuilderAnswers } from "@/lib/builder/scoring";
import { EMPTY_BUILDER_STATE, loadBuilderState, subscribeBuilder } from "@/lib/builder/store";
import type { BuilderOptionLetter, BuilderPersistedState } from "@/lib/builder/types";
import "./builder.css";

export function SecureSolutionBuilder() {
  const state = useSyncExternalStore(subscribeBuilder, loadBuilderState, () => EMPTY_BUILDER_STATE);
  return <SecureSolutionBuilderView state={state} onChange={persistBuilder} />;
}

export function SecureSolutionBuilderView({
  state,
  onChange,
}: {
  state: BuilderPersistedState;
  onChange: (state: BuilderPersistedState) => BuilderPersistedState | void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const score = useMemo(
    () => (state.phase === "result" || state.phase === "review" ? scoreBuilderAnswers(state.answers) : null),
    [state.answers, state.phase],
  );

  const update = (next: BuilderPersistedState) => {
    onChange(next);
  };

  return (
    <div
      className={["builder-shell", reducedMotion ? "is-reduced-motion" : "", `is-${state.phase}`]
        .filter(Boolean)
        .join(" ")}
    >
      {state.phase === "intro" ? (
        <BuilderIntro onStart={() => update(startBuilderDecisions(state))} />
      ) : null}
      {state.phase === "quiz" ? (
        <BuilderQuiz
          state={state}
          onSelect={(letter: BuilderOptionLetter) => update(selectBuilderOption(state, letter))}
          onConfirm={() => update(confirmBuilderDecision(state))}
          onNext={() => update(goToNextBuilderDecision(state))}
          onReset={() => update(resetBuilderGame(state))}
        />
      ) : null}
      {state.phase === "result" && score ? (
        <BuilderResult
          score={score}
          bestScore={state.bestScore}
          onReview={() => update(openBuilderReview(state))}
          onReplay={() => update(replayBuilder(state))}
          onReset={() => update(resetBuilderGame(state))}
        />
      ) : null}
      {state.phase === "review" && score ? (
        <BuilderReview
          missed={score.missed}
          onBack={() => update(closeBuilderReview(state))}
          onReset={() => update(resetBuilderGame(state))}
        />
      ) : null}
      <EducationalDisclaimer variant="short" className="builder-disclaimer" />
    </div>
  );
}
