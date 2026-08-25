"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EDUCATIONAL_DISCLAIMER } from "@/lib/simulation/copy";
import { SITE_NAME } from "@/lib/site/copy";

function normalisePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path || "/";
}

export function SiteFooter() {
  const pathname = usePathname() ?? "/";
  const onPlay = normalisePath(pathname) === "/play";

  return (
    <footer
      className={
        onPlay
          ? "border-t border-line/80 bg-navy-950 py-8 text-muted"
          : "border-t border-paper-line bg-paper py-10 text-paper-muted"
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 text-sm leading-6 sm:px-6 lg:px-8">
        <p>
          {SITE_NAME} is an educational tabletop. The organisation and incident
          in the exercise are fictional.
        </p>
        <p>{EDUCATIONAL_DISCLAIMER}</p>
        <p>
          <Link
            href="https://github.com/VictorScheike/BreachRoom"
            className={onPlay ? "text-cyan hover:underline" : "text-navy-800 underline underline-offset-4"}
          >
            Source on GitHub
          </Link>
        </p>
      </div>
    </footer>
  );
}
