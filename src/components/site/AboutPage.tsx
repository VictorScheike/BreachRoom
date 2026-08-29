import Link from "next/link";
import {
  ABOUT_BODY,
  ABOUT_CLOSE,
  ABOUT_HEADLINE,
  ABOUT_INTRO,
  ABOUT_LINKS,
  ABOUT_SECTIONS,
} from "@/lib/site/copy";

export function AboutPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <p className="text-sm font-medium tracking-[0.16em] text-cyan uppercase">
        A one-person project
      </p>
      <h1 className="mt-4 font-serif text-4xl font-semibold text-site-ink sm:text-5xl">
        {ABOUT_HEADLINE}
      </h1>
      <p className="mt-6 text-lg leading-8 text-site-muted">
        {ABOUT_INTRO}
      </p>
      {ABOUT_BODY.map((paragraph) => (
        <p
          key={paragraph.slice(0, 28)}
          className="mt-5 text-base leading-8 text-site-muted"
        >
          {paragraph}
        </p>
      ))}

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {ABOUT_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-site-ink">{section.title}</h2>
            <p className="mt-3 text-base leading-8 text-site-muted">{section.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-base leading-8 text-site-muted">{ABOUT_CLOSE}</p>

      <ul className="mt-10 flex flex-col gap-3 text-sm sm:flex-row sm:gap-8">
        {ABOUT_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="font-medium text-cyan underline underline-offset-4 hover:text-cyan-strong"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/play/"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-cyan-strong px-5 py-3 text-sm font-semibold text-navy-950 hover:bg-cyan"
        >
          Play a mission
        </Link>
        <Link
          href="/lab/"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-cyan px-5 py-3 text-sm font-semibold text-cyan hover:bg-navy-800"
        >
          Enter the lab
        </Link>
      </div>
    </main>
  );
}
