export function MapLegend() {
  return (
    <ul className="map-legend" aria-label="Map markers">
      <li>
        <span className="map-legend-swatch map-legend-swatch-path" aria-hidden="true" />
        Walkable path
      </li>
      <li>
        <span className="map-legend-swatch map-legend-swatch-blocked" aria-hidden="true" />
        Blocked
      </li>
      <li>
        <span className="map-legend-swatch map-legend-swatch-checkpoint" aria-hidden="true">
          ?
        </span>
        Question checkpoint
      </li>
      <li>
        <span className="map-legend-swatch map-legend-swatch-player" aria-hidden="true" />
        Current position
      </li>
    </ul>
  );
}
