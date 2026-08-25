import Link from "next/link";
import { EDUCATIONAL_DISCLAIMER } from "@/lib/simulation/copy";
import {
  ABOUT_BODY,
  ABOUT_HEADLINE,
  ABOUT_INTRO,
  ABOUT_LINKS,
} from "@/lib/site/copy";

export function AboutPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <p className="text-sm font-medium tracking-[0.16em] text-navy-800 uppercase">
        A one-person project
      </p>
      <h1 className="mt-4 font-serif text-4xl font-semibold text-paper-ink sm:text-5xl">
        {ABOUT_HEADLINE}
      </h1>
      <p className="mt-6 text-lg leading-8 text-paper-muted">
        {ABOUT_INTRO}
      </p>
      {ABOUT_BODY.map((paragraph) => (
        <p
          key={paragraph.slice(0, 28)}
          className="mt-5 text-base leading-8 text-paper-muted"
        >
          {paragraph}
        </p>
      ))}

      <ul className="mt-10 flex flex-col gap-3 text-sm sm:flex-row sm:gap-8">
        {ABOUT_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="font-medium text-navy-800 underline underline-offset-4"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-sm leading-7 text-paper-muted">
        {EDUCATIONAL_DISCLAIMER}
      </p>

      <Link
        href="/play/"
        className="mt-8 inline-flex items-center justify-center rounded-md bg-navy-900 px-5 py-3 text-sm font-semibold text-ink hover:bg-navy-800"
      >
        Try the exercise
      </Link>
    </main>
  );
}
