import type { Metadata } from "next";
import { ArchitectureDefenceLab } from "@/components/lab/ArchitectureDefenceLab";

export const metadata: Metadata = {
  title: "Architecture Defence Lab | BreachRoom",
  description:
    "Build a secure architecture, then let a fictional poisoned-claim attack loose against it.",
};

export default function LabPage() {
  return (
    <div className="lab-page command-shell">
      <main id="main-content">
        <ArchitectureDefenceLab />
      </main>
    </div>
  );
}
