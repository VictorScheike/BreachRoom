import { EducationalDisclaimer } from "@/components/EducationalDisclaimer";
import { qualityLabel } from "@/lib/missions/report";
import type { AnswerOption } from "@/lib/missions/types";

interface DecisionDockProps {
  mode: "briefing" | "explore" | "encounter" | "consequence" | "final";
  decisionNumber: number;
  total: number;
  title: string;
  body: string;
  npcLine?: string;
  prompt?: string;
  options?: readonly AnswerOption[];
  letters?: readonly ("A" | "B" | "C")[];
  selected?: AnswerOption | null;
  scoreFlash?: readonly { label: string; points: number }[];
  onBegin?: () => void;
  onChoose?: (optionId: string, letter: "A" | "B" | "C") => void;
  onContinue?: () => void;
  onOpenReport?: () => void;
  beginLabel?: string;
  roleChip?: string;
}

export function DecisionDock({
  mode,
  decisionNumber,
  total,
  title,
  body,
  npcLine,
  prompt,
  options,
  letters,
  selected,
  scoreFlash,
  onBegin,
  onChoose,
  onOpenReport,
  beginLabel,
  roleChip,
}: DecisionDockProps) {
  return (
    <section
      className={`decision-dock decision-dock-${mode}`}
      aria-live="polite"
      aria-label="Decision panel"
    >
      {mode === "briefing" ? (
        <>
          <p className="game-kicker">Briefing</p>
          <h2 className="dock-title">{title}</h2>
          <p className="dock-copy">{body}</p>
          {npcLine ? <p className="npc-bubble">{npcLine}</p> : null}
          <button type="button" className="game-primary" onClick={onBegin}>
            {beginLabel ?? "Begin"}
          </button>
          <EducationalDisclaimer variant="short" />
        </>
      ) : null}

      {mode === "explore" ? (
        <>
          <p className="game-kicker">
            Decisions {decisionNumber} / {total}
          </p>
          <h2 className="dock-title">{title}</h2>
          <p className="dock-copy">{body}</p>
        </>
      ) : null}

      {mode === "encounter" && options && letters ? (
        <>
          <p className="game-kicker">
            Decision {decisionNumber} of {total}
          </p>
          {roleChip ? <p className="decision-role-chip">{roleChip}</p> : null}
          <h2 className="dock-title">{title}</h2>
          <p className="dock-copy">{body}</p>
          {npcLine ? <p className="npc-bubble">{npcLine}</p> : null}
          <p className="game-panel-question">{prompt || "What do you do now?"}</p>
          <div className="dock-choices">
            {options.map((option, index) => {
              const letter = letters[index];
              if (!letter) {
                return null;
              }
              return (
                <button
                  key={option.id}
                  type="button"
                  className="dock-choice"
                  onClick={() => onChoose?.(option.id, letter)}
                >
                  <span className="game-choice-letter">{letter}</span>
                  <span className="game-choice-body">
                    <span className="game-choice-title">{option.title}</span>
                    <span className="game-choice-text">{option.summary}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {mode === "consequence" && selected ? (
        <>
          <p className="game-kicker">Incident update</p>
          <h2 className="dock-title">{title}</h2>
          <p className="dock-copy">
            <strong>{qualityLabel(selected.quality)}.</strong> {selected.consequence}
          </p>
          <p className="dock-copy">{selected.explanation}</p>
          {scoreFlash ? (
            <ul className="score-flash" aria-label="Score impact">
              {scoreFlash.map((item) => (
                <li key={item.label} className={`score-flash-${item.points}`}>
                  {item.label} +{item.points}
                </li>
              ))}
            </ul>
          ) : null}
          {selected.npcReaction ? (
            <p className="npc-bubble">{selected.npcReaction}</p>
          ) : null}
        </>
      ) : null}

      {mode === "final" ? (
        <>
          <p className="game-kicker">Destination</p>
          <h2 className="dock-title">{title}</h2>
          <p className="dock-copy">{body}</p>
          <button type="button" className="game-primary" onClick={onOpenReport}>
            View after-action report
          </button>
        </>
      ) : null}
    </section>
  );
}
