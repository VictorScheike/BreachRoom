"use client";

import { useEffect, useState } from "react";

export function HomeScroll() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".home-reveal"));
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in-view");
            reveal.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    for (const section of sections) {
      if (section.getBoundingClientRect().top < window.innerHeight * 0.92) {
        section.classList.add("is-in-view");
      } else {
        reveal.observe(section);
      }
    }
    root.classList.add("home-root");

    const update = () => {
      const max = root.scrollHeight - window.innerHeight;
      setProgress(max <= 0 ? 1 : Math.min(1, Math.max(0, window.scrollY / max)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      root.classList.remove("home-root");
      reveal.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="home-scroll-progress"
      aria-hidden="true"
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}
