import {
  OUTCOME_COPY,
  type ContainmentOutcome,
} from "@/lib/game/hud";

interface FinalEncounterProps {
  outcome: ContainmentOutcome;
  onViewReport: () => void;
}

export function FinalEncounter({
  outcome,
  onViewReport,
}: FinalEncounterProps) {
  const copy = OUTCOME_COPY[outcome];

  return (
    <div
      className="game-panel-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="core-title"
    >
      <div className="game-panel">
        <div className={`ransomware-core ransomware-core-${outcome}`} />
        <p className="game-kicker">Core Server Room</p>
        <h2 id="core-title" className="game-panel-title">
          {copy.title}
        </h2>
        <p className="game-panel-copy">{copy.body}</p>
        <button type="button" className="game-primary" onClick={onViewReport}>
          View after-action report
        </button>
      </div>
    </div>
  );
}
