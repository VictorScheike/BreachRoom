import { BUILDER_QUESTION_COUNT } from "@/lib/builder/types";

export function BuilderProgress({ current }: { current: number }) {
  const label = `Question ${current} of ${BUILDER_QUESTION_COUNT}`;
  return (
    <div className="builder-progress" aria-label={label}>
      <p className="builder-kicker">{label}</p>
      <ol className="builder-progress__bar" aria-hidden="true">
        {Array.from({ length: BUILDER_QUESTION_COUNT }, (_, index) => (
          <li
            key={index}
            className={index < current ? "is-complete" : ""}
          />
        ))}
      </ol>
    </div>
  );
}
