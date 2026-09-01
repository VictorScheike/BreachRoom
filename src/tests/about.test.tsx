import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AboutPage } from "@/components/site/AboutPage";
import { ABOUT_CLOSE, ABOUT_SECTIONS } from "@/lib/site/copy";

describe("About page", () => {
  it("talks about both incident practice and building resilient cybersecurity", () => {
    const html = renderToStaticMarkup(<AboutPage />);
    expect(html).toContain("Who we are");
    expect(html).toContain("Practising the incident");
    expect(html).toContain("Building resilient cybersecurity");
    expect(html).toContain("map missions");
    expect(html).toContain("Architecture Defence Lab");
    expect(html).toContain("Secure Solution Builder");
    expect(html).toContain("one layer at a time");
    expect(html).toContain("without being told whether a control held");
    expect(html).toContain("prevention, limitation, detection and recovery");
    expect(html).not.toContain("You assemble the controls");
    expect(html).not.toContain("after you lock it");
    expect(html).toContain("defence in depth");
    expect(html).toContain("Play a mission");
    expect(html).toContain("Enter the lab");
    expect(html).toMatch(/href="\/play\/?"/);
    expect(html).toMatch(/href="\/lab\/?"/);
    expect(ABOUT_SECTIONS).toHaveLength(2);
    expect(ABOUT_CLOSE).toMatch(/defence in depth/i);
  });
});
