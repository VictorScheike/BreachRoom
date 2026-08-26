export function MapLegend() {
  return (
    <ul className="map-legend" aria-label="Map markers">
      <li>
        <span className="map-legend-swatch map-legend-swatch-checkpoint" aria-hidden="true">
          ?
        </span>
        Question checkpoint
      </li>
      <li>
        <span className="map-legend-swatch map-legend-swatch-objective" aria-hidden="true" />
        Final destination
      </li>
      <li>
        <span className="map-legend-swatch map-legend-swatch-player" aria-hidden="true" />
        Current position
      </li>
    </ul>
  );
}
