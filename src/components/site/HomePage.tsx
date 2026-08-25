import Link from "next/link";
import { BrandMark } from "@/components/site/BrandMark";
import { EDUCATIONAL_DISCLAIMER } from "@/lib/simulation/copy";
import {
  EXERCISE_POINTS,
  EXERCISE_TITLE,
  HOME_EYEBROW,
  HOME_HEADLINE,
  HOME_LEDE,
  WHY_EXISTS_BODY,
  WHY_EXISTS_TITLE,
  WHY_MATTERS_BODY,
  WHY_MATTERS_TITLE,
} from "@/lib/site/copy";

export function HomePage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(14rem,0.85fr)]">
        <div>
          <p className="text-sm font-medium tracking-[0.16em] text-cyan uppercase">
            {HOME_EYEBROW}
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight font-semibold text-site-ink sm:text-5xl">
            {HOME_HEADLINE}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-site-muted">
            {HOME_LEDE}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/play/"
              className="inline-flex items-center justify-center rounded-md bg-cyan-strong px-5 py-3 text-sm font-semibold text-navy-950 hover:bg-cyan"
            >
              Try the exercise
            </Link>
            <Link
              href="/about/"
              className="inline-flex items-center justify-center rounded-md border border-site-line px-5 py-3 text-sm font-medium text-site-ink hover:bg-navy-700"
            >
              Who we are
            </Link>
          </div>
        </div>
        <div className="justify-self-center lg:justify-self-end">
          <BrandMark size={176} className="rounded-3xl shadow-sm" />
        </div>
      </section>

      <section className="mt-20 grid gap-12 border-t border-site-line pt-16 lg:grid-cols-2">
        <article>
          <h2 className="font-serif text-3xl font-semibold text-site-ink">
            {WHY_EXISTS_TITLE}
          </h2>
          {WHY_EXISTS_BODY.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="mt-5 text-base leading-8 text-site-muted"
            >
              {paragraph}
            </p>
          ))}
        </article>
        <article>
          <h2 className="font-serif text-3xl font-semibold text-site-ink">
            {WHY_MATTERS_TITLE}
          </h2>
          {WHY_MATTERS_BODY.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="mt-5 text-base leading-8 text-site-muted"
            >
              {paragraph}
            </p>
          ))}
        </article>
      </section>

      <section className="mt-20 border-t border-site-line pt-16">
        <h2 className="font-serif text-3xl font-semibold text-site-ink">
          {EXERCISE_TITLE}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {EXERCISE_POINTS.map((point) => (
            <article
              key={point.title}
              className="rounded-2xl border border-site-line bg-site-card p-6"
            >
              <h3 className="text-lg font-semibold text-site-ink">
                {point.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-site-muted">
                {point.body}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-sm leading-7 text-site-muted">
          {EDUCATIONAL_DISCLAIMER}
        </p>
      </section>
    </main>
  );
}
