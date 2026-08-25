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
  const { organisation } = scenario;

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="panel p-6 sm:p-8">
        <p className="font-mono text-xs tracking-[0.2em] text-amber uppercase">
          {organisation.fictionalLabel}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {scenario.title}
        </h1>
        <p className="mt-3 max-w-3xl text-muted">{organisation.description}</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="panel p-6">
          <h2 className="text-lg font-semibold">Organisation profile</h2>
          <dl className="mt-4 space-y-3 text-sm leading-6">
            <div>
              <dt className="text-muted">Name</dt>
              <dd>{organisation.name}</dd>
            </div>
            <div>
              <dt className="text-muted">People</dt>
              <dd>{organisation.employeeCount} employees</dd>
            </div>
            <div>
              <dt className="text-muted">Geography</dt>
              <dd>{organisation.geography}</dd>
            </div>
          </dl>
        </article>

        <article className="panel p-6">
          <h2 className="text-lg font-semibold">Business dependency</h2>
          <p className="mt-4 text-sm leading-6 text-muted">
            {organisation.businessDependency}
          </p>
        </article>
      </section>

      <article className="panel p-6">
        <h2 className="text-lg font-semibold">Technology environment</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
          {organisation.technologyEnvironment.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className="panel border-amber/30 p-6">
        <h2 className="text-lg font-semibold">Initial incident situation</h2>
        <p className="mt-4 text-base leading-7">{scenario.initialSituation}</p>
      </article>

      <article className="panel p-6">
        <h2 className="text-lg font-semibold">What you are expected to do</h2>
        <p className="mt-4 text-sm leading-7 text-muted">{scenario.playerBrief}</p>
        <EducationalDisclaimer className="mt-5 text-sm leading-6 text-muted" />
      </article>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBegin}
          className="inline-flex items-center justify-center rounded-xl bg-cyan-strong px-5 py-3 text-base font-semibold text-navy-950 hover:bg-cyan"
        >
          Start the exercise
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
