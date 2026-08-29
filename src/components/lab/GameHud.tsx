"use client";

export function GameHud({
  kicker,
  title,
  status,
  paused,
  progressCurrent,
  progressTotal,
  showAttackControls,
  onReplay,
}: {
  kicker: string;
  title: string;
  status: string;
  paused?: boolean;
  progressCurrent?: number;
  progressTotal?: number;
  showAttackControls?: boolean;
  onReplay?: () => void;
}) {
  const total = progressTotal ?? 10;
  const current = Math.min(total, Math.max(0, progressCurrent ?? 0));
  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="lab-hud" role="status">
      <div className="lab-hud__copy">
        <p className="lab-hud__kicker">{kicker}</p>
        <p className="lab-hud__title">{title}</p>
        {typeof progressCurrent === "number" ? (
          <div
            className="lab-hud__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuenow={current}
            aria-valuemax={total}
            aria-label="Lab progress"
          >
            <span style={{ width: `${percent}%` }} />
          </div>
        ) : null}
      </div>
      <p className={`lab-hud__status is-${status.toLowerCase()}`}>
        {paused && status === "Attacking" ? "Paused" : status}
      </p>
      {showAttackControls ? (
        <div className="lab-hud__controls">
          <button type="button" className="lab-hud__btn" onClick={onReplay} aria-label="Replay attack">
            Replay attack
          </button>
        </div>
      ) : null}
    </div>
  );
}
