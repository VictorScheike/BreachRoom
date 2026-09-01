import { BuilderAnswerOption } from "@/components/builder/BuilderAnswerOption";
import { BuilderFeedback } from "@/components/builder/BuilderFeedback";
import type { BuilderOptionLetter, BuilderQuestion } from "@/lib/builder/types";
import type { KeyboardEvent } from "react";

const LETTERS: readonly BuilderOptionLetter[] = ["A", "B", "C"];

export function BuilderQuestionCard({
  question,
  pendingLetter,
  locked,
  onSelect,
}: {
  question: BuilderQuestion;
  pendingLetter: BuilderOptionLetter | null;
  locked: boolean;
  onSelect: (letter: BuilderOptionLetter) => void;
}) {
  const selected = question.options.find((item) => item.letter === pendingLetter) ?? null;
  const correct = question.options.find((item) => item.letter === question.correctLetter) ?? question.options[1];
  const wrong = locked && selected && selected.letter !== question.correctLetter;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (locked) {
      return;
    }
    const current = pendingLetter ? LETTERS.indexOf(pendingLetter) : -1;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      onSelect(LETTERS[(current + 1) % LETTERS.length]!);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      onSelect(LETTERS[(current - 1 + LETTERS.length) % LETTERS.length]!);
    }
  };

  return (
    <section className="builder-card" aria-labelledby="builder-question-heading">
      <ul className="builder-card__tags" aria-label="Topics">
        {question.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <h2 id="builder-question-heading">{question.prompt}</h2>
      <div
        className="builder-options"
        role="radiogroup"
        aria-labelledby="builder-question-heading"
        onKeyDown={handleKeyDown}
      >
        {question.options.map((option) => (
          <BuilderAnswerOption
            key={option.letter}
            option={option}
            selected={pendingLetter === option.letter}
            locked={locked}
            correctLetter={locked ? question.correctLetter : null}
            onSelect={onSelect}
          />
        ))}
      </div>
      {locked && selected ? (
        <BuilderFeedback
          option={selected}
          mainPoint={question.mainPoint}
          better={wrong ? correct.feedback : null}
        />
      ) : null}
    </section>
  );
}
