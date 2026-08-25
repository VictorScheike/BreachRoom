import Link from "next/link";
import type { RoleGroupDefinition, RoleGroupId } from "@/lib/training/groups";

const ROLE_BLURBS: Record<RoleGroupId, string> = {
  "general-employees":
    "Practise how to pause on suspicious messages, protect credentials and report through the official channel.",
  "finance-hr":
    "Practise how to verify sensitive requests before money, payroll or personal data moves.",
  "developers-devops":
    "Practise how to protect code, pipelines, secrets and the path from commit to production.",
  "it-security":
    "Practise how to contain active threats, verify identity requests and keep evidence for the response.",
  "leaders-risk":
    "Practise how to decide what to say, who to tell, and which trade-offs the organisation can live with.",
};

const ROLE_ICONS: Record<string, string> = {
  "general-employees": "M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-3 0-6 1.5-6 4v1h12v-1c0-2.5-3-4-6-4Z",
  "finance-hr": "M3 4h10v2H3V4Zm0 4h10v6H3V8Zm2 2v2h6v-2H5Z",
  "developers-devops": "M6 3 2 8l4 5 1.2-1-3-4 3-4L6 3Zm4 0 4 5-4 5-1.2-1 3-4-3-4L10 3Z",
  "it-security": "M8 1 2 4v5c0 3.5 2.6 5.8 6 7 3.4-1.2 6-3.5 6-7V4L8 1Zm0 3.2 4 1.8v3.5c0 2-1.5 3.6-4 4.6-2.5-1-4-2.6-4-4.6V6l4-1.8Z",
  "leaders-risk": "M8 2 3 13h10L8 2Zm0 3.5 2.6 5.5H5.4L8 5.5Z",
};

interface RoleTrainingCardProps {
  group: RoleGroupDefinition;
  href?: string;
  onFind?: () => void;
}

export function RoleTrainingCard({ group, href, onFind }: RoleTrainingCardProps) {
  const icon = ROLE_ICONS[group.id] ?? ROLE_ICONS["general-employees"];
  const action = (
    <>
      Find my training
      <span className="btn-arrow" aria-hidden="true" />
    </>
  );

  return (
    <article className={`role-card role-training-card role-training-card-${group.id}`}>
      <div className="role-card__icon role-training-card__icon" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="22" height="22">
          <path d={icon} fill="currentColor" />
        </svg>
      </div>
      <div className="role-card__content">
        <h3 className="role-training-card__title">{group.name}</h3>
        <p className="role-training-card__copy">{ROLE_BLURBS[group.id]}</p>
        <p className="role-training-card__label">You will practise</p>
        <div className="role-card__topics">
          <ul className="topic-chips role-training-card__topics">
            {group.topicHints.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="role-card__footer">
        {href ? (
          <Link className="btn-primary button--role role-training-card__action" href={href}>
            {action}
          </Link>
        ) : (
          <button
            type="button"
            className="btn-primary button--role role-training-card__action"
            onClick={onFind}
          >
            {action}
          </button>
        )}
      </div>
    </article>
  );
}
