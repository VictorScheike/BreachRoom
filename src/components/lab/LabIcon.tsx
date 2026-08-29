import type { ReactNode } from "react";

const ICONS: Record<string, ReactNode> = {
  shield: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 5 6v6c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6l-7-3Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  key: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M11 12h9v3M17 12v3" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  badge: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7 19c1.2-2.4 3-3.5 5-3.5S15.8 16.6 17 19" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  cpu: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  cloud: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 17h10a4 4 0 0 0 0-8 5 5 0 0 0-9.5-1.5A3.5 3.5 0 0 0 7 17Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  network: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6" cy="12" r="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="18" cy="7" r="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="18" cy="17" r="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 12h8M16.4 8.6 8.8 11.2M16.4 15.4 8.8 12.8" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  scan: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 9V5h4M15 5h4v4M19 15v4h-4M9 19H5v-4M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16l-6 7v5l-4 2v-7L4 6Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="11" width="12" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  database: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="7" rx="7" ry="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 7v10c0 1.7 3.1 3 7 3s7-1.3 7-3V7" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="8" width="10" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6 16V6a1.5 1.5 0 0 1 1.5-1.5H16" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  person: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6 19c.8-3.2 3-5 6-5s5.2 1.8 6 5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 3 6 14h6l-1 7 7-11h-6l1-7Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  ),
  scale: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v14M7 20h10M12 7 6 13h5M12 7l6 6h-5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  radar: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 12 17 8M12 4v2M12 18v2M4 12h2M18 12h2" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  list: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 7h11M8 12h11M8 17h11M5 7h.01M5 12h.01M5 17h.01" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16ZM10 20h4" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  vault: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="6" width="16" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12.5" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h7l5 5v11H7V4Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M14 4v5h5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  pipeline: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="8" width="6" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <rect x="15" y="8" width="6" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 12h6" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8 12 4l8 4-8 4-8-4Zm0 0v8l8 4V12m16-4v8l-8 4V12" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 20V6l7-3 7 3v14H5Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 20v-6h4v6" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  portal: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 9h16" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 12h16M12 4c2.5 2.8 3.7 5.8 3.7 8S14.5 17.2 12 20c-2.5-2.8-3.7-5.8-3.7-8S9.5 6.8 12 4Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  blocked: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 8l8 8" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  contained: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 8h12v10H6V8Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  detected: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="m15.5 15.5 4 4" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  successful: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4 4 18h16L12 4Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 10v4M12 16.5h.01" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
};

export function LabIcon({ name, className }: { name: string; className?: string }) {
  return <span className={className ?? "lab-icon"}>{ICONS[name] ?? ICONS.shield}</span>;
}
