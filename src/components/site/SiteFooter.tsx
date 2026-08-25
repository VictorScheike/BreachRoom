"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EducationalDisclaimer } from "@/components/EducationalDisclaimer";

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
          : "border-t border-site-line bg-site py-10 text-site-muted"
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 text-sm leading-6 sm:px-6 lg:px-8">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/" className="text-cyan underline underline-offset-4">
                Start
              </Link>
            </li>
            <li>
              <Link href="/missions/" className="text-cyan underline underline-offset-4">
                Missions
              </Link>
            </li>
            <li>
              <Link href="/training/" className="text-cyan underline underline-offset-4">
                Training by role
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="text-cyan underline underline-offset-4">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/progress/" className="text-cyan underline underline-offset-4">
                My progress
              </Link>
            </li>
            <li>
              <Link href="/about/" className="text-cyan underline underline-offset-4">
                About
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/VictorScheike/BreachRoom"
                className="text-cyan underline underline-offset-4"
              >
                GitHub
              </Link>
            </li>
          </ul>
        </nav>
        <EducationalDisclaimer />
      </div>
    </footer>
  );
}
