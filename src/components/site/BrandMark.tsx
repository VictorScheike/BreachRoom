import Image from "next/image";

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export function BrandMark({ size = 40, className }: BrandMarkProps) {
  return (
    <Image
      src="/breachroom-mark.svg"
      alt="BreachRoom"
      width={size}
      height={size}
      className={className}
      unoptimized
    />
  );
}
