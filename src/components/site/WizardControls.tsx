"use client";

import type { ReactNode } from "react";

interface WizardOptionCardProps {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  marker?: string;
  category?: string;
}

export function WizardOptionCard({
  title,
  description,
  selected,
  onSelect,
  marker = "◆",
  category,
}: WizardOptionCardProps) {
  return (
    <button
      type="button"
      className={selected ? "wizard-option is-selected" : "wizard-option"}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="wizard-option__marker" aria-hidden="true">
        {marker}
      </span>
      <span className="wizard-option__check" aria-hidden="true">
        {selected ? "✓" : ""}
      </span>
      {category ? <span className="wizard-option__category">{category}</span> : null}
      <strong className="wizard-option__title">{title}</strong>
      <span className="wizard-option__copy">{description}</span>
      {selected ? <span className="wizard-option__selected-label">Selected</span> : null}
    </button>
  );
}

interface WizardStepProps {
  title: string;
  supporting: string;
  children: ReactNode;
}

export function WizardStep({ title, supporting, children }: WizardStepProps) {
  return (
    <div className="wizard-step">
      <header className="wizard-step__header">
        <h2>{title}</h2>
        <p>{supporting}</p>
      </header>
      {children}
    </div>
  );
}

interface WizardActionsProps {
  step: 1 | 2 | 3 | "result";
  continueLabel: string;
  continueDisabled?: boolean;
  onContinue: () => void;
  onBack?: () => void;
  onReset: () => void;
  extra?: ReactNode;
}

export function WizardActions({
  step,
  continueLabel,
  continueDisabled,
  onContinue,
  onBack,
  onReset,
  extra,
}: WizardActionsProps) {
  const showSecondary = step !== 1;
  return (
    <footer className="wizard-actions">
      <div className="wizard-actions__secondary">
        {showSecondary && onBack ? (
          <button type="button" className="btn-secondary" onClick={onBack}>
            Back
          </button>
        ) : null}
        {showSecondary ? (
          <button type="button" className="btn-tertiary" onClick={onReset}>
            Start over
          </button>
        ) : null}
        {extra}
      </div>
      <button
        type="button"
        className="btn-primary wizard-actions__continue"
        disabled={continueDisabled}
        onClick={onContinue}
      >
        {continueLabel}
      </button>
    </footer>
  );
}
