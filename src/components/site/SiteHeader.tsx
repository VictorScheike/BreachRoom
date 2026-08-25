"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/site/BrandMark";
import { NAV_ITEMS, SITE_NAME } from "@/lib/site/copy";

function normalisePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path || "/";
}

function isActive(pathname: string, href: string): boolean {
  const current = normalisePath(pathname);
  const target = normalisePath(href);
  if (target === "/training") {
    return current === "/training" || current === "/create-training";
  }
  return current === target;
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const onPlay = normalisePath(pathname) === "/play";

  return (
    <header
      className={
        onPlay
          ? "site-header border-b border-line/80 bg-navy-950/95 text-ink"
          : "site-header border-b border-site-line bg-site/95 text-site-ink"
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex min-h-11 items-center gap-3">
          <BrandMark size={36} className="rounded-lg" />
          <span className="text-lg font-semibold tracking-tight">{SITE_NAME}</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              const playCta = item.href === "/play/";
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={
                      playCta
                        ? "inline-flex min-h-11 items-center rounded-md bg-amber px-3 py-2 font-semibold text-navy-950"
                        : active
                          ? onPlay
                            ? "inline-flex min-h-11 items-center text-cyan"
                            : "inline-flex min-h-11 items-center text-cyan underline decoration-cyan decoration-2 underline-offset-8"
                          : onPlay
                            ? "inline-flex min-h-11 items-center text-muted hover:text-ink"
                            : "inline-flex min-h-11 items-center text-site-muted hover:text-site-ink"
                    }
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
