import type { IncidentEventType, IncidentSeverity } from "@/lib/simulation/types";

interface IconProps {
  className?: string;
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className}>
      <path
        d="M10 3.2 17.5 16H2.5L10 3.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 8.2v3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="13.8" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className}>
      <circle cx="10" cy="10" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M6.4 10.2 8.8 12.6 13.6 7.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RecordedIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className}>
      <rect
        x="4"
        y="3.5"
        width="12"
        height="13"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function eventTypeIcon(eventType: IncidentEventType | "Decision recorded") {
  if (eventType === "Decision recorded") {
    return CheckIcon;
  }
  if (eventType === "Attacker message" || eventType === "System alert") {
    return AlertIcon;
  }
  return RecordedIcon;
}

export function severityTone(severity: IncidentSeverity): "critical" | "warning" {
  return severity === "SEV-1" ? "critical" : "warning";
}
