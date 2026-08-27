import type { MissionDestination, WorldMap } from "@/lib/game/world";

interface DestinationMarkerProps {
  destination: MissionDestination;
  world: WorldMap;
  unlocked: boolean;
}

function placementClass(destination: MissionDestination, world: WorldMap): string {
  const classes = ["map-destination"];
  if (destination.y <= 1) {
    classes.push("map-destination--below");
  } else {
    classes.push("map-destination--above");
  }
  if (destination.x <= 1) {
    classes.push("map-destination--end");
  } else if (destination.x >= world.columns - 2) {
    classes.push("map-destination--start");
  }
  return classes.join(" ");
}

const ICONS: Record<MissionDestination["icon"], string> = {
  server: "▣",
  gate: "⬡",
  launch: "▲",
  hub: "◉",
  coordination: "✚",
};

export function DestinationMarker({ destination, world, unlocked }: DestinationMarkerProps) {
  return (
    <div
      className={`${placementClass(destination, world)} ${unlocked ? "is-open" : "is-locked"}`}
      style={{
        position: "absolute",
        left: `${(destination.x / world.columns) * 100}%`,
        top: `${(destination.y / world.rows) * 100}%`,
        width: `${100 / world.columns}%`,
        height: `${100 / world.rows}%`,
      }}
      data-destination-x={destination.x}
      data-destination-y={destination.y}
      data-destination-label={destination.label}
      data-exit-state={unlocked ? "open" : "locked"}
      title={
        unlocked
          ? destination.label
          : "Complete all required decisions to unlock this destination."
      }
    >
      <div className={`map-destination__object map-destination__object--${destination.icon}`} aria-hidden="true">
        {ICONS[destination.icon]}
      </div>
      <span className="map-destination__pointer" aria-hidden="true" />
      <p className="map-destination__label">
        <span>{unlocked ? "EXIT OPEN" : "EXIT LOCKED"}</span>
        <strong>{destination.shortLabel}</strong>
      </p>
    </div>
  );
}
