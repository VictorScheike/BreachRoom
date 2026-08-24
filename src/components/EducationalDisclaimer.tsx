import { EDUCATIONAL_DISCLAIMER } from "@/lib/simulation/copy";

interface EducationalDisclaimerProps {
  className?: string;
}

export function EducationalDisclaimer({ className }: EducationalDisclaimerProps) {
  return (
    <p className={className ?? "text-sm leading-6 text-muted"}>
      {EDUCATIONAL_DISCLAIMER}
    </p>
  );
}
