import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MissionSelect } from "@/components/game/MissionSelect";
import { publishedMissions } from "@/lib/missions/catalog";

describe("mission select cards", () => {
  it("uses a short summary on every card and pins Start mission in the card footer", () => {
    const html = renderToStaticMarkup(<MissionSelect onSelect={() => undefined} />);
    expect(html).toContain("Choose a mission");
    expect(html.split("Start mission").length - 1).toBe(publishedMissions().length);
    expect(html).not.toContain("It is Monday at 06:55");
    expect(html).not.toContain("Funny enough to stay human");
    for (const mission of publishedMissions()) {
      expect(html).toContain(mission.summary);
      expect(html).toContain(`mission-card-${mission.id}`);
    }
    expect(html).toContain("mission-card-blurb");
    expect(html).toContain("mission-card-cta");
    expect(html).toContain("mission-select-card");
    expect(html).toContain("mission-select-thumb");
    expect(html).toContain("practise the hard calls");
  });

  it("keeps card summaries to a short, similar length", () => {
    const lengths = publishedMissions().map((mission) => mission.summary.length);
    expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThan(80);
    for (const mission of publishedMissions()) {
      expect(mission.summary.length).toBeGreaterThan(40);
      expect(mission.summary.length).toBeLessThan(140);
    }
  });
});
