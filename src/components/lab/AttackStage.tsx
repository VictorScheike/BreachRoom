import { LabIcon } from "@/components/lab/LabIcon";
import { OUTCOME_LABELS } from "@/lib/lab/copy";
import type { LabDifficulty, ResolvedStage } from "@/lib/lab/types";

export function AttackStageCard({
  stage,
  definitionSummary,
  guidedDetail,
  architectPrompt,
  difficulty,
  active,
  revealed,
}: {
  stage: ResolvedStage | null;
  definitionSummary: string;
  guidedDetail: string;
  architectPrompt: string;
  difficulty: LabDifficulty;
  active: boolean;
  revealed: boolean;
}) {
  if (!revealed || !stage) {
    return (
      <article className={active ? "lab-stage is-upcoming" : "lab-stage is-hidden"}>
        <p className="lab-stage__kicker">Stage hidden until it plays</p>
        <h3>{definitionSummary}</h3>
      </article>
    );
  }

  const className = [
    "lab-stage",
    active ? "is-active" : "",
    `is-${stage.outcome}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={className} data-stage={stage.id}>
      <p className="lab-stage__kicker">
        Stage {stage.number} · {stage.name}
      </p>
      <p className={`lab-outcome is-${stage.outcome}`}>
        <LabIcon name={stage.outcome} />
        <span>{OUTCOME_LABELS[stage.outcome]}</span>
      </p>
      <h3>{stage.attackerAction}</h3>
      <p>
        <strong>Control reaction: </strong>
        {stage.controlReaction}
      </p>
      {difficulty === "guided" || !active ? (
        <p>{stage.explanation}</p>
      ) : (
        <p>{architectPrompt}</p>
      )}
      {difficulty === "architect" && !active ? <p className="lab-stage__detail">{stage.architectDetail}</p> : null}
      {difficulty === "guided" ? <p className="lab-stage__detail">{guidedDetail}</p> : null}
      {stage.legitimateActivity ? (
        <p className="lab-stage__note">This upload is a legitimate business function, not by itself a control failure.</p>
      ) : null}
    </article>
  );
}
