export function MapLegend() {
  return (
    <ul className="map-legend" aria-label="Map legend">
      <li>
        <span className="map-legend-swatch map-legend-swatch-walkable" aria-hidden="true" />
        Walkable area
      </li>
      <li>
        <span className="map-legend-swatch map-legend-swatch-blocked" aria-hidden="true" />
        Blocked area
      </li>
      <li>
        <span className="map-legend-swatch map-legend-swatch-player" aria-hidden="true" />
        Current position
      </li>
      <li>
        <span className="map-legend-swatch map-legend-swatch-objective" aria-hidden="true" />
        Mission objective
      </li>
    </ul>
  );
}
