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
    expect(html).toMatch(/href="\/lab\/?"/);
    expect(html.indexOf("Architecture Defence Lab")).toBeLessThan(html.indexOf("Secure Solution Builder"));
    expect(html.indexOf("Architecture Defence Lab")).toBeLessThan(html.indexOf("Inbox Under Siege"));
    expect(html.indexOf("Secure Solution Builder")).toBeLessThan(html.indexOf("Inbox Under Siege"));
  });
});
