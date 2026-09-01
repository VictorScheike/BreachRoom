import { BuilderArchitectGuide } from "@/components/builder/BuilderArchitectGuide";
import { BuilderProgress } from "@/components/builder/BuilderProgress";
import { BuilderQuestionCard } from "@/components/builder/BuilderQuestionCard";
import { BuilderResetButton } from "@/components/builder/BuilderResetButton";
import { BuilderVisual } from "@/components/builder/BuilderVisual";
import { builderQuestionAt, isLastBuilderQuestion } from "@/lib/builder/catalog";
import { BUILDER_SUBTITLE, BUILDER_TITLE } from "@/lib/builder/copy";
import { confirmedLetter, isQuestionLocked } from "@/lib/builder/play";
import type { BuilderOptionLetter, BuilderPersistedState } from "@/lib/builder/types";

export function BuilderQuiz({
  state,
  onSelect,
  onConfirm,
  onNext,
  onReset,
}: {
  state: BuilderPersistedState;
  onSelect: (letter: BuilderOptionLetter) => void;
  onConfirm: () => void;
  onNext: () => void;
  onReset: () => void;
}) {
  const question = builderQuestionAt(state.currentIndex);
  const locked = isQuestionLocked(state);
  const pending = locked ? confirmedLetter(state) : state.pendingLetter;
  const last = isLastBuilderQuestion(state.currentIndex);
  const architect = locked
    ? pending === question.correctLetter
      ? question.architectCorrect
      : question.architectWrong
    : "Choose the most practical security decision, then confirm it.";

  return (
    <div className="builder-quiz">
      <header className="builder-quiz__top">
        <div>
          <p className="builder-kicker">{BUILDER_TITLE}</p>
          <h1>{BUILDER_SUBTITLE}</h1>
        </div>
        <BuilderProgress current={question.number} />
      </header>
      <div className="builder-quiz__body">
        <BuilderArchitectGuide message={architect} />
        <div className="builder-quiz__main">
          <BuilderQuestionCard
            question={question}
            pendingLetter={pending}
            locked={locked}
            onSelect={onSelect}
          />
        </div>
        <BuilderVisual visual={question.visual} />
      </div>
      <div className="builder-quiz__actions">
        <ul className="builder-card__tags builder-quiz__tags" aria-hidden="true">
          {question.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div className="builder-quiz__cta">
          <BuilderResetButton onReset={onReset} />
          {locked ? (
            <button type="button" className="builder-primary" onClick={onNext}>
              {last ? "See my result" : "Next decision"}
            </button>
          ) : (
            <button type="button" className="builder-primary" onClick={onConfirm} disabled={pending === null}>
              Make decision
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
