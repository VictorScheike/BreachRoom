"use client";

import { useEffect, useRef } from "react";

function disableScrollSnap(root: HTMLElement, body: HTMLElement) {
  root.classList.remove("home-root");
  for (const el of [root, body]) {
    el.style.setProperty("scroll-snap-type", "none", "important");
    el.style.setProperty("scroll-behavior", "auto", "important");
    el.style.setProperty("scroll-padding", "0", "important");
  }
}

export function HomeScroll() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const el = bar.current;
    disableScrollSnap(root, body);

    const update = () => {
      const max = root.scrollHeight - window.innerHeight;
      const progress = max <= 0 ? 1 : Math.min(1, Math.max(0, window.scrollY / max));
      if (el) {
        el.style.transform = `scaleX(${progress})`;
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={bar}
      className="home-scroll-progress"
      aria-hidden="true"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
