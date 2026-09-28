"use client";

import { useEffect, useState } from "react";

export function HomeScroll() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const max = root.scrollHeight - window.innerHeight;
      setProgress(max <= 0 ? 1 : Math.min(1, Math.max(0, window.scrollY / max)));
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
      className="home-scroll-progress"
      aria-hidden="true"
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}
