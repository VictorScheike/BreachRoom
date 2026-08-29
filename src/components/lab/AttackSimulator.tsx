import { AttackStageCard } from "@/components/lab/AttackStage";
import { LAB_MISSION } from "@/lib/lab/catalog";
import type { AttackSimulation, LabDifficulty, LabPhase } from "@/lib/lab/types";

export function AttackSimulator({
  phase,
  difficulty,
  revealedStageCount,
  simulation,
  missingMessage,
  onLaunch,
  onNext,
  onReset,
}: {
  phase: LabPhase;
  difficulty: LabDifficulty;
  revealedStageCount: number;
  simulation: AttackSimulation | null;
  missingMessage: string | null;
  onLaunch: () => void;
  onNext: () => void;
  onReset: () => void;
}) {
  const current = simulation?.stages[Math.max(0, revealedStageCount - 1)] ?? null;
  const attackReady = phase === "build";
  const underAttack = phase === "attack";

  return (
    <section className="lab-attack" aria-label="Attack simulation">
      <div className="lab-attack__head">
        <p className="lab-attack__kicker">Attack: The Poisoned Claim</p>
        <h2>
          {attackReady
            ? "The attack is ready. Test the architecture you built."
            : current
              ? `Stage ${current.number}: ${current.name}`
              : "Under attack"}
        </h2>
        {missingMessage ? (
          <p className="lab-attack__error" role="alert">
            {missingMessage}
          </p>
        ) : null}
        {underAttack && simulation ? (
          <div className="lab-attack__live">
            {simulation.stages.slice(0, revealedStageCount).map((stage, index) => {
              const definition = LAB_MISSION.attack.stages[index];
              if (!definition) {
                return null;
              }
              return (
                <AttackStageCard
                  key={stage.id}
                  stage={stage}
                  definitionSummary={definition.summary}
                  guidedDetail={definition.guidedDetail}
                  architectPrompt={definition.architectPrompt}
                  difficulty={difficulty}
                  active={index === revealedStageCount - 1}
                  revealed
                />
              );
            })}
            {current ? (
              <dl className="lab-meters">
                <div>
                  <dt>System health</dt>
                  <dd>{current.systemHealth}%</dd>
                </div>
                <div>
                  <dt>Data exposure</dt>
                  <dd>{current.dataExposure}</dd>
                </div>
                <div>
                  <dt>Attacker progress</dt>
                  <dd>
                    {current.attackerProgress} / 5
                  </dd>
                </div>
              </dl>
            ) : null}
          </div>
        ) : null}
        <div className="lab-attack__actions">
          {attackReady ? (
            <>
              <button type="button" className="lab-btn lab-btn-secondary" onClick={onReset}>
                Reset
              </button>
              <button type="button" className="lab-btn lab-btn-primary" onClick={onLaunch}>
                Launch Attack
              </button>
            </>
          ) : null}
          {underAttack ? (
            <button type="button" className="lab-btn lab-btn-primary" onClick={onNext}>
              {revealedStageCount < 6 ? "Next Attack Step" : "See results"}
            </button>
          ) : null}
        </div>
      </div>
      <ol className="lab-attack-steps">
        {LAB_MISSION.attack.stages.map((definition, index) => {
          const revealed = phase !== "build" && index < revealedStageCount;
          const active = underAttack && index === revealedStageCount - 1;
          const resolved = simulation?.stages[index] ?? null;
          return (
            <li key={definition.id} className={active ? "is-current" : revealed ? "is-done" : ""}>
              <span className="lab-attack-steps__num">{definition.number}</span>
              <span>
                <strong>{shortStageName(definition.number)}</strong>
                <em>{definition.summary}</em>
                {revealed && resolved ? <b className={`is-${resolved.outcome}`}>{resolved.outcome}</b> : null}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function shortStageName(number: number): string {
  switch (number) {
    case 1:
      return "Entry";
    case 2:
      return "Injection";
    case 3:
      return "Model";
    case 4:
      return "Access";
    case 5:
      return "Action";
    default:
      return "Detection";
  }
}
