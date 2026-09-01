import type { BuilderOption } from "@/lib/builder/types";

export function BuilderFeedback({
  option,
  mainPoint,
  better,
}: {
  option: BuilderOption;
  mainPoint: string;
  better?: string | null;
}) {
  return (
    <div className="builder-feedback" role="status" aria-live="polite">
      <p className="builder-feedback__why">
        <span className="builder-feedback__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="M9 18h6M10 21h4M12 3a7 7 0 0 0-4 12c.8.7 1 1.4 1 2h6c0-.6.2-1.3 1-2a7 7 0 0 0-4-12Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </span>
        <strong>Why this matters</strong>
        <span>{mainPoint}</span>
      </p>
      <p className="builder-feedback__detail">{option.feedback}</p>
      {better ? <p className="builder-feedback__better">{better}</p> : null}
    </div>
  );
}
