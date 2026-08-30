"use client";

import { ArchitectureMap } from "@/components/lab/ArchitectureMap";
import { LabIcon } from "@/components/lab/LabIcon";
import { chosenCount, optionById } from "@/lib/lab/catalog";
import type { ArchitectureDecision, LabChoices, LabDifficulty, OptionId } from "@/lib/lab/types";

export function DecisionScreen({
  decision,
  difficulty,
  choices,
  pendingOptionId,
  onSelect,
  onNext,
  onBack,
  canGoBack,
}: {
  decision: ArchitectureDecision;
  difficulty: LabDifficulty;
  choices: LabChoices;
  pendingOptionId: OptionId | null;
  onSelect: (optionId: OptionId) => void;
  onNext: () => void;
  onBack: () => void;
  canGoBack: boolean;
}) {
  const beginner = difficulty === "guided";
  const lockedCount = chosenCount(choices);

  return (
    <section className="lab-decision" aria-labelledby="lab-decision-heading" data-decision={decision.id}>
      <div className="lab-decision__copy">
        <p className="lab-kicker">
          Decision {decision.number} of 10 · {decision.area} · {lockedCount} of 10 controls selected
        </p>
        <p className="lab-insight">
          <span>You are looking at</span> {decision.lookingAt}
        </p>
        <h2 id="lab-decision-heading">{decision.question}</h2>
        <p className="lab-insight lab-insight--affects">
          <span>Your choice changes</span> {decision.affects}
        </p>
      </div>
      <div className="lab-decision__map">
        <p className="lab-kicker">Live architecture</p>
        <p className="lab-map-caption">
          Left to right is the path a claim — and an attacker — can travel. Boxes are systems. Small
          shields are the controls you choose.
        </p>
        <ArchitectureMap
          choices={choices}
          previewOptionId={pendingOptionId}
          phase="decide"
          inspectable={false}
          compact
          focusZone={decision.layer}
        />
        <ArchitectureUpdateNote optionId={pendingOptionId} beginner={beginner} />
      </div>
      <div className="lab-decision__choices">
        <div className="lab-options" role="radiogroup" aria-label="Architecture options">
          {decision.options.map((option) => {
            const selected = pendingOptionId === option.id;
            const showTradeOff = beginner || selected;
            const description = beginner ? option.description : option.challengeDescription;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                className={selected ? "lab-option is-selected" : "lab-option"}
                aria-checked={selected}
                onClick={() => onSelect(option.id)}
              >
                <span className="lab-option__top">
                  <LabIcon name={option.icon} />
                </span>
                <strong>{option.title}</strong>
                <span>{description}</span>
                {showTradeOff ? <em>Trade-off: {option.tradeOff}</em> : <em>Select to see the trade-off.</em>}
              </button>
            );
          })}
        </div>
        <div className="lab-decision__actions">
          <button type="button" className="lab-secondary" onClick={onBack} disabled={!canGoBack}>
            Previous decision
          </button>
          <button type="button" className="lab-primary" onClick={onNext} disabled={!pendingOptionId}>
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

function ArchitectureUpdateNote({ optionId, beginner }: { optionId: OptionId | null; beginner: boolean }) {
  if (!optionId) {
    return (
      <p className="decision-strip is-idle" role="status">
        Pick a control. It appears on the architecture before you continue.
      </p>
    );
  }
  const option = optionById(optionId);
  return (
    <p className="decision-strip is-updated" role="status" aria-live="polite">
      <strong>{option.architectureUpdate}</strong>
      {beginner ? <span>This reduces: {option.riskReduced}</span> : <span>Trade-off: {option.tradeOff}</span>}
    </p>
  );
}
