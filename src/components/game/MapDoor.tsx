import type { DoorSpec } from "@/lib/game/doors";

interface MapDoorProps {
  door: DoorSpec;
  open: boolean;
  opening: boolean;
  isAnchor: boolean;
}

export function MapDoor({ door, open, opening, isAnchor }: MapDoorProps) {
  return (
    <div
      className={[
        "map-door",
        `map-door--${door.theme}`,
        `map-door--${door.orientation}`,
        open ? "map-door--open" : "map-door--locked",
        opening ? "map-door--opening" : "",
        isAnchor ? "map-door--anchor" : "map-door--bar",
      ]
        .filter(Boolean)
        .join(" ")}
      data-door-id={door.id}
      data-door-state={open ? "open" : "locked"}
      data-door-theme={door.theme}
      aria-hidden="true"
    >
      <span className="map-door-gate" />
      {isAnchor ? (
        <>
          <span className="map-door-lock">{open ? "✓" : "🔒"}</span>
          <span className="map-door-label">{open ? "OPEN" : "LOCKED"}</span>
        </>
      ) : null}
    </div>
  );
}
