import { EDUCATIONAL_DISCLAIMER, SHORT_FICTIONAL_DISCLAIMER } from "@/lib/simulation/copy";

interface EducationalDisclaimerProps {
  className?: string;
  variant?: "full" | "short";
}

export function EducationalDisclaimer({
  className,
  variant = "full",
}: EducationalDisclaimerProps) {
  return (
    <p className={className ?? "text-sm leading-6 text-muted"}>
      {variant === "short" ? SHORT_FICTIONAL_DISCLAIMER : EDUCATIONAL_DISCLAIMER}
    </p>
  );
}
