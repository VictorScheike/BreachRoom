export function MapLegend() {
  return (
    <ul className="map-legend" aria-label="Map markers">
      <li>
        <span className="map-legend-swatch map-legend-swatch-path" aria-hidden="true" />
        Walkable path
      </li>
      <li>
        <span className="map-legend-swatch map-legend-swatch-blocked" aria-hidden="true" />
        Blocked terrain
      </li>
      <li>
        <span className="map-legend-swatch map-legend-swatch-checkpoint" aria-hidden="true">
          ?
        </span>
        Question checkpoint
      </li>
      <li>
        <span className="map-legend-swatch map-legend-swatch-door-locked" aria-hidden="true">
          🔒
        </span>
        Closed door
      </li>
      <li>
        <span className="map-legend-swatch map-legend-swatch-door-open" aria-hidden="true">
          ✓
        </span>
        Open door
      </li>
      <li>
        <span className="map-legend-swatch map-legend-swatch-player" aria-hidden="true" />
        Current position
      </li>
      <li>
        <span className="map-legend-swatch map-legend-swatch-exit" aria-hidden="true" />
        Final exit
      </li>
    </ul>
  );
}
