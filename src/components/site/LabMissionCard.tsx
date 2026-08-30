import Link from "next/link";
import { LabMissionThumbnail } from "@/components/site/LabMissionThumbnail";
import { DECISION_COUNT } from "@/lib/lab/catalog";
import {
  LAB_CARD_CTA,
  LAB_CARD_DESCRIPTION,
  LAB_CARD_DESTINATION,
  LAB_CARD_HREF,
  LAB_CARD_META,
  LAB_CARD_SCENARIO,
  LAB_CARD_SUMMARY,
  LAB_CARD_TITLE,
  LAB_CARD_TOPICS,
} from "@/lib/lab/copy";

interface LabMissionCardProps {
  titleAs?: "h2" | "h3";
  descriptionLines?: 3 | 4;
  headingId?: string;
}

export function LabMissionCard({
  titleAs = "h3",
  descriptionLines = 3,
  headingId,
}: LabMissionCardProps) {
  const Title = titleAs;
  const description = descriptionLines === 4 ? LAB_CARD_DESCRIPTION : LAB_CARD_SUMMARY;

  return (
    <article className="mission-card lab-library-card">
      <div className="mission-card__media">
        <LabMissionThumbnail label={LAB_CARD_DESTINATION} />
      </div>
      <div className="mission-card__body">
        <div className="mission-card__content">
          <p className="mission-card__meta">
            {LAB_CARD_META} · {DECISION_COUNT} DECISIONS
          </p>
          <Title id={headingId} className="mission-card__title">
            {LAB_CARD_TITLE}
          </Title>
          <p
            className={
              descriptionLines === 4
                ? "mission-card__description mission-card__description--four"
                : "mission-card__description"
            }
          >
            {description}
          </p>
          <ul className="topic-chips">
            {LAB_CARD_TOPICS.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
          <p className="mission-card__destination">
            {LAB_CARD_SCENARIO} · Destination: {LAB_CARD_DESTINATION}
          </p>
        </div>
        <div className="mission-card__footer">
          <Link className="btn-primary mission-card__action" href={LAB_CARD_HREF}>
            {LAB_CARD_CTA}
          </Link>
        </div>
      </div>
    </article>
  );
}
