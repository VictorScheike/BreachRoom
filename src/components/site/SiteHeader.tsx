"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/site/BrandMark";
import { NAV_ITEMS, SITE_NAME } from "@/lib/site/copy";

function normalisePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path || "/";
}

function isActive(pathname: string, href: string, hash: string): boolean {
  const current = normalisePath(pathname);
  if (href === "/") {
    return current === "/" && hash !== "#how-it-works";
  }
  if (href === "/#how-it-works") {
    return current === "/" && hash === "#how-it-works";
  }
  const target = normalisePath(href);
  if (target === "/training") {
    return current === "/training" || current === "/create-training";
  }
  return current === target;
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [hash, setHash] = useState("");
  const onPlay = normalisePath(pathname) === "/play";

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [pathname]);

  return (
    <header
      className={
        onPlay
          ? "site-header border-b border-line/80 bg-navy-950/95 text-ink"
          : "site-header border-b border-site-line bg-site/95 text-site-ink"
      }
    >
      <div className="site-header-inner">
        <Link href="/" className="inline-flex min-h-11 items-center gap-3">
          <BrandMark size={36} className="rounded-lg" />
          <span className="text-lg font-semibold tracking-tight">{SITE_NAME}</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="site-nav">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href, hash);
              const playCta = item.href === "/play/";
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={
                      playCta
                        ? "site-nav-play"
                        : active
                          ? "site-nav-link is-active"
                          : "site-nav-link"
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
