import Image from "next/image";

export function SecurityArchitect({ className }: { className?: string }) {
  return (
    <Image
      className={className}
      src="/builder/security-architect.webp"
      alt="Security Architect in a navy blazer and chinos, pointing toward the question"
      width={800}
      height={1200}
      unoptimized
      priority
    />
  );
}
