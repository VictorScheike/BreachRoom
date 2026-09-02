import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { GameView } from "@/components/game/GameView";
import { SiteHeader } from "@/components/site/SiteHeader";
import { createInitialGameState, gameReducer, type GameState } from "@/lib/game/engine";
import type { MoveDirection } from "@/lib/game/world";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/image", () => ({
  default: ({ alt, className }: { alt: string; className?: string }) => (
    <span role="img" aria-label={alt} className={className} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    onClick,
  }: {
    href: string;
    children: unknown;
    className?: string;
    onClick?: () => void;
  }) => (
    <a href={href} className={className} onClick={onClick}>
      {children as never}
    </a>
  ),
}));

const noop = () => undefined;

function renderGame(state: GameState): string {
  return renderToStaticMarkup(
    <GameView
      state={state}
      onBegin={noop}
      onMove={noop}
      onChoose={noop}
      onContinue={noop}
      onRetry={noop}
      onOpenReport={noop}
      onToggleMute={noop}
      onChooseAnother={noop}
      onEndEarly={noop}
    />,
  );
}

function beginExploring(seed = 11): GameState {
  let state = createInitialGameState();
  state = gameReducer(state, {
    type: "START_DIRECT",
    missionId: "locked-out",
    roleId: null,
    seed,
  });
  return gameReducer(state, { type: "BEGIN_MISSION" });
}

function walkToEncounter(start: GameState): GameState {
  const dirs: MoveDirection[] = ["right", "up", "down", "left"];
  const seen = new Set<string>();
  const queue: GameState[] = [start];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    if (current.screen === "encounter") {
      return current;
    }
    const key = `${current.position.x},${current.position.y},${current.choices.length}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    for (const direction of dirs) {
      const next = gameReducer(current, { type: "MOVE", direction });
      if (
        next.screen !== current.screen ||
        next.position.x !== current.position.x ||
        next.position.y !== current.position.y
      ) {
        queue.push(next);
      }
    }
    if (seen.size > 2500) {
      break;
    }
  }
  throw new Error("Could not reach an encounter");
}

describe("mobile mission chrome", () => {
  it("keeps a compact hamburger header with every primary destination", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain("site-nav-toggle");
    expect(html).toContain("site-nav-panel");
    expect(html).toContain("Open menu");
    expect(html).toContain("Start");
    expect(html).toContain("Missions");
    expect(html).toContain("Training by role");
    expect(html).toContain("How it works");
    expect(html).toContain("My progress");
    expect(html).toContain("About");
    expect(html).toContain("Play free");
  });

  it("exposes compact mobile status without removing the desktop HUD markup", () => {
    const html = renderGame(beginExploring());
    expect(html).toContain("game-hud");
    expect(html).toContain("game-mission-bar");
    expect(html).toContain("game-mobile-status");
    expect(html).toContain("game-mobile-details");
    expect(html).toContain("Mission details");
    expect(html).toContain('class="game-pad-label">Up');
    expect(html).toContain('class="game-pad-label">Left');
    expect(html).toContain('class="game-pad-label">Down');
    expect(html).toContain('class="game-pad-label">Right');
    expect(html).toContain("game-pad-icon");
    expect(html.split("End mission").length - 1).toBe(2);
    expect(html).not.toContain("end-mission-overlay");
    expect(html).not.toContain("is-sheet-open");
  });

  it("marks briefing and encounter as a sheet while keeping the map in the same tree", () => {
    let briefing = createInitialGameState();
    briefing = gameReducer(briefing, {
      type: "START_DIRECT",
      missionId: "locked-out",
      roleId: null,
      seed: 4,
    });
    const briefingHtml = renderGame(briefing);
    expect(briefingHtml).toContain("is-sheet-open");
    expect(briefingHtml).toContain("decision-dock-briefing");
    expect(briefingHtml.indexOf("decision-dock-briefing")).toBeLessThan(
      briefingHtml.indexOf("game-map"),
    );

    const encounterHtml = renderGame(walkToEncounter(beginExploring()));
    expect(encounterHtml).toContain("is-sheet-open");
    expect(encounterHtml).toContain("decision-dock-encounter");
    expect(encounterHtml).toContain("game-map");
    expect(encounterHtml).toContain("game-mobile-status");
  });
});
