import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomePage } from "@/components/site/HomePage";

describe("homepage layout", () => {
  it("puts How it works in the hero instead of a featured mission", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain('id="how-it-works"');
    expect(html).toContain("how-section--in-hero");
    expect(html).toContain("Three steps from a role to a debrief.");
    expect(html).toContain("Choose your training");
    expect(html).not.toContain("Featured mission");
    expect(html).not.toContain("Play mission");
    expect(html.indexOf("how-it-works")).toBeLessThan(html.indexOf("Playable missions"));
    expect(html).toContain("Architecture Defence Lab");
    expect(html).toContain("Enter the lab");
    expect(html).toContain("Secure Solution Builder");
    expect(html).toContain("Start mission");
    expect(html).toContain("Map missions");
    expect(html).toContain("decision-exercises");
    expect(html).toContain("builder-mission-thumb");
    expect(html).toContain("I’ll guide you through 15 decisions.");
    expect(html).toMatch(/href="\/lab\/?"/);
    expect(html.indexOf("Architecture Defence Lab")).toBeLessThan(html.indexOf("Secure Solution Builder"));
    expect(html.indexOf("Architecture Defence Lab")).toBeLessThan(html.indexOf("Inbox Under Siege"));
    expect(html.indexOf("Secure Solution Builder")).toBeLessThan(html.indexOf("Inbox Under Siege"));
    expect(html).toContain("No account. Choose a mission. A written debrief at the end.");
    expect(html).not.toContain("Eight decisions");
    expect(html).toContain("home-hero-depth");
  });

  it("forces native scrolling and never enables section snap", () => {
    const homeCss = readFileSync("src/components/site/home-page.css", "utf8");
    const globalCss = readFileSync("src/app/globals.css", "utf8");
    const homeScroll = readFileSync("src/components/site/HomeScroll.tsx", "utf8");
    const homePage = readFileSync("src/components/site/HomePage.tsx", "utf8");
    expect(homeCss).not.toMatch(/scroll-snap-type\s*:\s*(y|x|both|block|inline)/);
    expect(globalCss).not.toMatch(/scroll-snap-type\s*:\s*(y|x|both|block|inline)/);
    expect(globalCss).toMatch(/html\.home-root/);
    expect(globalCss).toMatch(/scroll-snap-type:\s*none\s*!important/);
    expect(homeCss).toMatch(/scroll-snap-type:\s*none\s*!important/);
    expect(homeCss).toMatch(/\.home-cta\s*\{[^}]*background:\s*#0b1a30/);
    expect(homeScroll).not.toContain('classList.add("home-root")');
    expect(homeScroll).toContain('classList.remove("home-root")');
    expect(homeScroll).toContain('setProperty("scroll-snap-type", "none", "important")');
    expect(homePage).not.toContain("home-reveal");
    expect(homePage).not.toContain("home-root");
  });
});
