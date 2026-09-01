import type { BuilderOption, BuilderOptionLetter } from "@/lib/builder/types";

export function BuilderAnswerOption({
  option,
  selected,
  locked,
  correctLetter,
  onSelect,
}: {
  option: BuilderOption;
  selected: boolean;
  locked: boolean;
  correctLetter: BuilderOptionLetter | null;
  onSelect: (letter: BuilderOptionLetter) => void;
}) {
  const isCorrect = locked && option.letter === correctLetter;
  const isWrong = locked && selected && option.letter !== correctLetter;
  const stateLabel = isCorrect ? "Correct answer" : isWrong ? "Your answer, not sufficient" : undefined;

  return (
    <button
      type="button"
      role="radio"
      className={[
        "builder-option",
        selected ? "is-selected" : "",
        isCorrect ? "is-correct" : "",
        isWrong ? "is-wrong" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-checked={selected}
      aria-label={`${option.letter}. ${option.text}${stateLabel ? `. ${stateLabel}` : ""}`}
      disabled={locked}
      onClick={() => onSelect(option.letter)}
    >
      <span className="builder-option__letter" aria-hidden="true">
        {option.letter}
        {isCorrect ? <span className="builder-option__mark">✓</span> : null}
        {isWrong ? <span className="builder-option__mark">✕</span> : null}
      </span>
      <span className="builder-option__text">{option.text}</span>
    </button>
  );
}
