"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
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
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuId = useId();
  const onPlay = normalisePath(pathname) === "/play";
  const locationKey = `${pathname}#${hash}`;
  const menuOpen = menuFor === locationKey;

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuFor(null);
      }
    };
    document.body.classList.add("nav-drawer-open");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("nav-drawer-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuFor(null);

  return (
    <header
      className={
        onPlay
          ? "site-header border-b border-line/80 bg-navy-950/95 text-ink"
          : "site-header border-b border-site-line bg-site/95 text-site-ink"
      }
    >
      <div className="site-header-inner">
        <Link href="/" className="site-brand inline-flex min-h-11 items-center gap-3" onClick={closeMenu}>
          <BrandMark size={36} className="site-brand-mark rounded-lg" />
          <span className="site-brand-name text-lg font-semibold tracking-tight">{SITE_NAME}</span>
        </Link>
        <button
          type="button"
          className="site-nav-toggle"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuFor(menuOpen ? null : locationKey)}
        >
          <span className={menuOpen ? "site-nav-toggle__bars is-open" : "site-nav-toggle__bars"} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
        {menuOpen ? (
          <button
            type="button"
            className="site-nav-backdrop"
            aria-label="Close menu"
            onClick={closeMenu}
          />
        ) : null}
        <nav id={menuId} className={menuOpen ? "site-nav-panel is-open" : "site-nav-panel"} aria-label="Primary">
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
                    onClick={closeMenu}
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
