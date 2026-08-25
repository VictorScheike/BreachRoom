import Link from "next/link";
import { EducationalDisclaimer } from "@/components/EducationalDisclaimer";
import type { Scenario } from "@/lib/simulation/types";

interface ScenarioBriefingProps {
  scenario: Scenario;
  onBegin: () => void;
}

export function ScenarioBriefing({
  scenario,
  onBegin,
}: ScenarioBriefingProps) {
  return (
    <main id="main-content" className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header>
        <p className="font-mono text-xs tracking-[0.2em] text-amber uppercase">
          {scenario.organisation.fictionalLabel}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {scenario.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          You are walking a 20×20 field at Northstar Logistics, a fictional
          company. Every few steps a stick-figure guide stops you with one
          question: what should we do now? Clear the obstacles, then reach the
          far side.
        </p>
      </header>

      <EducationalDisclaimer className="text-sm leading-6 text-muted" />

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBegin}
          className="inline-flex items-center justify-center rounded-xl bg-cyan-strong px-5 py-3 text-base font-semibold text-navy-950 hover:bg-cyan"
        >
          Enter the field
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl border border-line px-5 py-3 text-base font-medium hover:bg-navy-700"
        >
          Back to the site
        </Link>
      </div>
    </main>
  );
}
