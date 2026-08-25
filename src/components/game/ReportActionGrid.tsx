import type { ReactNode } from "react";

interface ReportActionGridProps {
  current: readonly ReactNode[];
  navigate: readonly ReactNode[];
  home: ReactNode;
}

export function ReportActionGrid({ current, navigate, home }: ReportActionGridProps) {
  return (
    <div className="report-action-block">
      <div className="report-actions">
        {current.map((action, index) => (
          <div key={`current-${index}`} className="report-action report-action--current">
            {action}
          </div>
        ))}
        {navigate.map((action, index) => (
          <div key={`navigate-${index}`} className="report-action report-action--navigate">
            {action}
          </div>
        ))}
      </div>
      <div className="report-home">{home}</div>
    </div>
  );
}
