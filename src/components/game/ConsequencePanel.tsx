import type { DecisionConsequence } from "@/lib/game/consequence";

interface ConsequencePanelProps {
  consequence: DecisionConsequence;
  onContinue: () => void;
}

export function ConsequencePanel({
  consequence,
  onContinue,
}: ConsequencePanelProps) {
  return (
    <div
      className="game-panel-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-title"
    >
      <div className="game-panel">
        <p className="game-kicker">Incident update</p>
        <h2 id="update-title" className="game-panel-title">
          What happened
        </h2>
        <p className="game-panel-copy">{consequence.happened}</p>
        <p className="game-panel-copy">{consequence.why}</p>
        <p className="game-panel-copy">
          <span className="text-cyan">Principle: </span>
          {consequence.principle}
        </p>
        <p className="game-panel-copy">{consequence.effects}</p>
        <button type="button" className="game-primary" onClick={onContinue}>
          Continue journey
        </button>
      </div>
    </div>
  );
}
