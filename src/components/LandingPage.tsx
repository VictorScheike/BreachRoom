import { EducationalDisclaimer } from "@/components/EducationalDisclaimer";
import {
  LANDING_DESCRIPTION,
  LANDING_HEADLINE,
  PRACTICE_AREAS,
  PRODUCT_NAME,
} from "@/lib/simulation/copy";
import { SCORING_CONFIG } from "@/lib/simulation/scoring";
import { SCORE_DIMENSIONS } from "@/lib/simulation/types";

interface LandingPageProps {
  estimatedDuration: string;
  onStart: () => void;
}

export function LandingPage({ estimatedDuration, onStart }: LandingPageProps) {
  return (
    <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="panel p-6 sm:p-10">
        <p className="font-mono text-xs tracking-[0.2em] text-cyan uppercase">
          Interactive cyber crisis exercise
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {PRODUCT_NAME}
        </h1>
        <p className="mt-4 max-w-3xl text-2xl font-medium text-cyan sm:text-3xl">
          {LANDING_HEADLINE}
        </p>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted sm:text-lg">
          {LANDING_DESCRIPTION}
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center justify-center rounded-xl bg-cyan-strong px-5 py-3 text-base font-semibold text-navy-950 hover:bg-cyan"
          >
            Start simulation
          </button>
          <p className="font-mono text-sm text-muted">
            Estimated duration: {estimatedDuration}
          </p>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2" aria-label="What this exercise covers">
        <article className="panel p-6">
          <h2 className="text-lg font-semibold">Areas assessed</h2>
          <p className="mt-2 text-sm text-muted">
            After eight decisions you receive a BreachRoom simulation score across five areas. Live numbers are not shown during the exercise.
          </p>
          <ul className="mt-5 space-y-3">
            {SCORE_DIMENSIONS.map((dimension) => (
              <li key={dimension} className="rounded-lg border border-line bg-navy-700 px-4 py-3">
                <p className="font-medium">{SCORING_CONFIG.dimensionLabels[dimension]}</p>
                <p className="mt-1 text-sm text-muted">
                  {SCORING_CONFIG.dimensionSummaries[dimension]}
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel p-6">
          <h2 className="text-lg font-semibold">What you will practise</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {PRACTICE_AREAS.map((area) => (
              <li
                key={area}
                className="rounded-lg border border-line bg-navy-700 px-3 py-2 text-sm"
              >
                {area}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-lg border border-amber-dim/60 bg-navy-700 px-4 py-3">
            <p className="font-mono text-xs tracking-[0.18em] text-amber uppercase">
              Disclaimer
            </p>
            <EducationalDisclaimer className="mt-2 text-sm leading-6 text-muted" />
          </div>
        </article>
      </section>
    </main>
  );
}
