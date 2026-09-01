import Link from "next/link";
import { BuilderMissionThumbnail } from "@/components/site/BuilderMissionThumbnail";
import {
  BUILDER_CARD_DESCRIPTION,
  BUILDER_CARD_LABEL,
  BUILDER_CARD_TAGS,
  BUILDER_ROUTE,
  BUILDER_SUBTITLE,
  BUILDER_TITLE,
} from "@/lib/builder/copy";

interface BuilderMissionCardProps {
  titleAs?: "h2" | "h3";
  headingId?: string;
}

export function BuilderMissionCard({ titleAs = "h3", headingId }: BuilderMissionCardProps) {
  const Title = titleAs;
  return (
    <article className="mission-card lab-library-card">
      <div className="mission-card__media">
        <BuilderMissionThumbnail />
      </div>
      <div className="mission-card__body">
        <div className="mission-card__content">
          <p className="mission-card__meta">{BUILDER_CARD_LABEL}</p>
          <Title id={headingId} className="mission-card__title">
            {BUILDER_TITLE}
          </Title>
          <p className="mission-card__description mission-card__description--four">
            {BUILDER_CARD_DESCRIPTION}
          </p>
          <ul className="topic-chips">
            {BUILDER_CARD_TAGS.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
          <p className="mission-card__destination">{BUILDER_SUBTITLE}</p>
        </div>
        <div className="mission-card__footer">
          <Link className="btn-primary mission-card__action" href={BUILDER_ROUTE}>
            Start mission
          </Link>
        </div>
      </div>
    </article>
  );
}
