"use client";

import type { ReactNode } from "react";

interface WizardOptionCardProps {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  marker?: string;
  category?: string;
  disabled?: boolean;
  disabledReason?: string;
}

export function WizardOptionCard({
  title,
  description,
  selected,
  onSelect,
  marker = "◆",
  category,
  disabled = false,
  disabledReason,
}: WizardOptionCardProps) {
  const className = [
    "wizard-option",
    selected ? "is-selected" : "",
    disabled ? "is-disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type="button"
      className={className}
      onClick={onSelect}
      aria-pressed={selected}
      disabled={disabled}
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
      {disabled && disabledReason ? (
        <span className="wizard-option__disabled-label">{disabledReason}</span>
      ) : null}
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

export type WizardStepId = 1 | 2 | 3 | 4 | "result";

interface WizardActionsProps {
  step: WizardStepId;
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
  const showReset = step !== 1;
  return (
    <footer className="wizard-actions">
      <div className="wizard-actions__cluster">
        {showReset && onBack ? (
          <button type="button" className="btn-secondary" onClick={onBack}>
            Back
          </button>
        ) : null}
        <button
          type="button"
          className="btn-primary wizard-actions__continue"
          disabled={continueDisabled}
          onClick={onContinue}
        >
          {continueLabel}
        </button>
        {extra}
      </div>
      {showReset ? (
        <button type="button" className="btn-tertiary wizard-actions__reset" onClick={onReset}>
          Start over
        </button>
      ) : null}
    </footer>
  );
}
