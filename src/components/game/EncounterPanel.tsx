import { choiceLetter } from "@/lib/game/encounters";
import type { ScenarioStage } from "@/lib/simulation/types";

interface EncounterPanelProps {
  stage: ScenarioStage;
  flavorTitle: string;
  flavorDescription: string;
  decisionNumber: number;
  totalDecisions: number;
  onChoose: (optionId: string) => void;
}

export function EncounterPanel({
  stage,
  flavorTitle,
  flavorDescription,
  decisionNumber,
  totalDecisions,
  onChoose,
}: EncounterPanelProps) {
  return (
    <div
      className="game-panel-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="encounter-title"
    >
      <div className="game-panel">
        <p className="game-kicker">
          Decision {decisionNumber} / {totalDecisions}
        </p>
        <h2 id="encounter-title" className="game-panel-title">
          {flavorTitle}
        </h2>
        <p className="game-panel-copy">{flavorDescription}</p>
        <p className="game-panel-question">What do you do now?</p>
        <div className="game-choices">
          {stage.options.map((option, index) => (
            <button
              key={option.id}
              type="button"
              className="game-choice"
              onClick={() => onChoose(option.id)}
            >
              <span className="game-choice-letter">{choiceLetter(index)}</span>
              <span className="game-choice-body">
                <span className="game-choice-title">{option.title}</span>
                <span className="game-choice-text">{option.description}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
