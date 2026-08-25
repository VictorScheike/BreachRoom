import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createInitialGameState, gameReducer } from "@/lib/game/engine";
import { GameView } from "@/components/game/GameView";
import { DestinationMarker } from "@/components/game/DestinationMarker";
import { worldForMission } from "@/lib/game/maps";
import { manhattan, pointsEqual } from "@/lib/game/world";
import { publishedMissions } from "@/lib/missions/catalog";

describe("destination markers", () => {
  it("gives every published mission destination metadata that matches the exit tile", () => {
    for (const mission of publishedMissions()) {
      const world = worldForMission(mission.id);
      expect(world.destination.x).toBeGreaterThanOrEqual(0);
      expect(world.destination.y).toBeGreaterThanOrEqual(0);
      expect(world.destination.x).toBeLessThan(world.columns);
      expect(world.destination.y).toBeLessThan(world.rows);
      expect(world.destination.label).toBe(world.destinationLabel);
      expect(world.destination.shortLabel.length).toBeGreaterThan(0);
      expect(world.destination.icon).toBeTruthy();
      const html = renderToStaticMarkup(
        <DestinationMarker destination={world.destination} world={world} unlocked={false} />,
      );
      expect(html).toContain(`data-destination-x="${world.destination.x}"`);
      expect(html).toContain(`data-destination-y="${world.destination.y}"`);
      expect(html).toContain(`grid-column:${world.destination.x + 1}`);
      expect(html).toContain(`grid-row:${world.destination.y + 1}`);
      expect(html).toContain("EXIT LOCKED");
      const open = renderToStaticMarkup(
        <DestinationMarker destination={world.destination} world={world} unlocked />,
      );
      expect(open).toContain(`data-destination-x="${world.destination.x}"`);
      expect(open).toContain("EXIT OPEN");
      expect(manhattan(world.start, world.destination)).toBeGreaterThan(0);
      expect(html).toContain("map-destination__object");
    }
  });

  it("uses the same destination object for distance, collision and the marker", () => {
    const world = worldForMission("dependency-depths");
    let state = createInitialGameState();
    state = gameReducer(state, {
      type: "START_DIRECT",
      missionId: "dependency-depths",
      roleId: "developer",
      seed: 3,
    });
    expect(pointsEqual(state.position, world.start)).toBe(true);
    const html = renderToStaticMarkup(
      <GameView
        state={state}
        onBegin={() => undefined}
        onMove={() => undefined}
        onChoose={() => undefined}
        onContinue={() => undefined}
        onOpenReport={() => undefined}
        onToggleMute={() => undefined}
        onChooseAnother={() => undefined}
        onEndEarly={() => undefined}
      />,
    );
    expect(html).toContain(`Reach ${world.destinationLabel}`);
    expect(html).toContain(`data-destination-x="${world.destination.x}"`);
    expect(html).toContain(`data-destination-y="${world.destination.y}"`);
  });

  it("keeps labels inside the map near every edge", () => {
    for (const mission of publishedMissions()) {
      const world = worldForMission(mission.id);
      const html = renderToStaticMarkup(
        <DestinationMarker destination={world.destination} world={world} unlocked={false} />,
      );
      if (world.destination.y <= 0) {
        expect(html).toContain("map-destination--below");
      } else {
        expect(html).toContain("map-destination--above");
      }
      if (world.destination.x <= 1) {
        expect(html).toContain("map-destination--end");
      }
      if (world.destination.x >= world.columns - 2) {
        expect(html).toContain("map-destination--start");
      }
    }
  });
});
