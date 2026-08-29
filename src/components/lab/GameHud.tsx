"use client";

export function GameHud({
  kicker,
  title,
  status,
  paused,
  showAttackControls,
  onPause,
  onNext,
  onReplay,
}: {
  kicker: string;
  title: string;
  status: string;
  paused?: boolean;
  showAttackControls?: boolean;
  onPause?: () => void;
  onNext?: () => void;
  onReplay?: () => void;
}) {
  return (
    <div className="lab-hud" role="status">
      <div className="lab-hud__copy">
        <p className="lab-hud__kicker">{kicker}</p>
        <p className="lab-hud__title">{title}</p>
      </div>
      <p className={`lab-hud__status is-${status.toLowerCase()}`}>{status}</p>
      {showAttackControls ? (
        <div className="lab-hud__controls">
          <button type="button" className="lab-hud__btn" onClick={onPause} aria-label={paused ? "Resume attack" : "Pause attack"}>
            {paused ? "Resume" : "Pause"}
          </button>
          <button type="button" className="lab-hud__btn lab-hud__btn--primary" onClick={onNext} aria-label="Next attack step">
            Next attack step
          </button>
          <button type="button" className="lab-hud__btn" onClick={onReplay} aria-label="Replay attack">
            Replay attack
          </button>
        </div>
      ) : null}
    </div>
  );
}
