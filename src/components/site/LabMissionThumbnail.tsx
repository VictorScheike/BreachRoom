const LAB_THUMB_NODES = ["Staff", "Portal", "AI", "API", "Data"] as const;

interface LabMissionThumbnailProps {
  label: string;
  showLabel?: boolean;
}

export function LabMissionThumbnail({ label, showLabel = true }: LabMissionThumbnailProps) {
  return (
    <div className="mission-thumb lab-mission-thumb" aria-hidden="true">
      <div className="lab-mission-thumb__chain">
        {LAB_THUMB_NODES.map((name, index) => (
          <span key={name} className="lab-mission-thumb__item">
            {index > 0 ? <span className="lab-mission-thumb__arrow" /> : null}
            <span className="lab-mission-thumb__node">{name}</span>
          </span>
        ))}
      </div>
      {showLabel ? (
        <span className="mission-thumb-label">
          <span className="mission-thumb-mark__kicker">Destination</span>
          {label}
        </span>
      ) : null}
    </div>
  );
}
