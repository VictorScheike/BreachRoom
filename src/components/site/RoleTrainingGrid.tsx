import type { ReactNode } from "react";

interface RoleTrainingGridProps {
  children: ReactNode;
}

export function RoleTrainingGrid({ children }: RoleTrainingGridProps) {
  return <div className="role-training-grid">{children}</div>;
}
