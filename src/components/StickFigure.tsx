interface StickFigureProps {
  className?: string;
  title?: string;
}

export function StickFigure({ className, title }: StickFigureProps) {
  return (
    <svg
      viewBox="0 0 48 72"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <circle cx="24" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path
        d="M24 18v22M24 40 12 58M24 40 36 58M10 30h28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
