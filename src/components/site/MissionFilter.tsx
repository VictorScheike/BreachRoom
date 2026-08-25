"use client";

import type { ChangeEvent, ReactNode } from "react";

interface MissionFilterProps {
  id: string;
  label: string;
  value: string;
  displayValue: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
}

export function MissionFilter({
  id,
  label,
  value,
  displayValue,
  onChange,
  children,
}: MissionFilterProps) {
  return (
    <label className="mission-filter" htmlFor={id}>
      <span className="mission-filter__label">{label}</span>
      <span className="mission-filter__value">
        <span className="mission-filter__current">{displayValue}</span>
        <span className="mission-filter__chevron" aria-hidden="true" />
      </span>
      <select id={id} className="mission-filter__select" value={value} onChange={onChange}>
        {children}
      </select>
    </label>
  );
}
