import { SecurityArchitect } from "@/components/builder/SecurityArchitect";
import { BUILDER_CARD_BUBBLE, BUILDER_SUBTITLE } from "@/lib/builder/copy";

interface BuilderMissionThumbnailProps {
  showLabel?: boolean;
}

export function BuilderMissionThumbnail({ showLabel = true }: BuilderMissionThumbnailProps) {
  return (
    <div className="mission-thumb builder-mission-thumb" aria-hidden="true">
      <div className="builder-mission-thumb__scene">
        <div className="builder-mission-thumb__figure">
          <SecurityArchitect className="builder-mission-thumb__architect" />
        </div>
        <p className="builder-mission-thumb__bubble">{BUILDER_CARD_BUBBLE}</p>
      </div>
      {showLabel ? (
        <span className="mission-thumb-label">
          <span className="mission-thumb-mark__kicker">Mission</span>
          {BUILDER_SUBTITLE}
        </span>
      ) : null}
    </div>
  );
}
