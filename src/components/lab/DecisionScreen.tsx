"use client";

import { LocalImpactGraph } from "@/components/lab/LocalImpactGraph";
import { DecisionImpactStrip } from "@/components/lab/DecisionImpactStrip";
import { LabIcon } from "@/components/lab/LabIcon";
import { chosenCount } from "@/lib/lab/catalog";
import { subgraphFor, subgraphOutcome } from "@/lib/lab/subgraphs";
import type { ArchitectureDecision, LabChoices, LabDifficulty, OptionId } from "@/lib/lab/types";

export function DecisionScreen({
  decision,
  difficulty,
  choices,
  pendingOptionId,
  onSelect,
  onContinue,
  onBack,
  canGoBack,
}: {
  decision: ArchitectureDecision;
  difficulty: LabDifficulty;
  choices: LabChoices;
  pendingOptionId: OptionId | null;
  onSelect: (optionId: OptionId) => void;
  onContinue: () => void;
  onBack: () => void;
  canGoBack: boolean;
}) {
  const guided = difficulty === "guided";
  const subgraph = subgraphFor(decision.id);
  const pending = decision.options.find((item) => item.id === pendingOptionId) ?? null;
  const outcome = subgraphOutcome(subgraph, pendingOptionId, pending?.strength === "strong");
  const lockedCount = chosenCount(choices);

  return (
    <section className="lab-decision" aria-labelledby="lab-decision-heading" data-decision={decision.id}>
      <div className="lab-decision__copy">
        <p className="lab-kicker">
          Decision {decision.number} of 10 · {subgraph.domain} · {lockedCount} of 10 controls selected
        </p>
        <h2 id="lab-decision-heading">{decision.question}</h2>
      </div>
      <div className="lab-decision__map">
        <p className="lab-kicker">What this choice changes</p>
        <LocalImpactGraph subgraph={subgraph} option={pending} outcome={outcome} />
        <DecisionImpactStrip outcome={outcome} />
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
          <button type="button" className="lab-primary" onClick={onContinue} disabled={!pendingOptionId}>
            Lock choice and continue
          </button>
        </div>
      </div>
    </section>
  );
}
