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
  const guided = difficulty === "guided";
  const lockedCount = chosenCount(choices);

  return (
    <section className="lab-decision" aria-labelledby="lab-decision-heading" data-decision={decision.id}>
      <div className="lab-decision__copy">
        <p className="lab-kicker">
          Decision {decision.number} of 10 · {decision.area} · {lockedCount} of 10 controls selected
        </p>
        <h2 id="lab-decision-heading">{decision.question}</h2>
      </div>
      <div className="lab-decision__map">
        <p className="lab-kicker">Live architecture</p>
        <ArchitectureMap
          choices={choices}
          previewOptionId={pendingOptionId}
          phase="decide"
          inspectable={false}
          compact
        />
        <ArchitectureUpdateNote optionId={pendingOptionId} guided={guided} />
      </div>
      <div className="lab-decision__choices">
        <div className="lab-options" role="radiogroup" aria-label="Architecture options">
          {decision.options.map((option) => {
            const selected = pendingOptionId === option.id;
            const showTradeOff = guided || selected;
            const description = guided ? option.description : option.challengeDescription;
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
                  {guided && option.recommended ? <span className="lab-recommended">Recommended</span> : null}
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

function ArchitectureUpdateNote({ optionId, guided }: { optionId: OptionId | null; guided: boolean }) {
  if (!optionId) {
    return (
      <p className="decision-strip is-idle" role="status">
        Select a control to add or change it on the architecture.
      </p>
    );
  }
  const option = optionById(optionId);
  return (
    <p className="decision-strip is-updated" role="status" aria-live="polite">
      <strong>{option.architectureUpdate}</strong>
      {guided ? <span>{option.riskReduced}</span> : <span>Trade-off: {option.tradeOff}</span>}
    </p>
  );
}
