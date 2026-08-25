import { StickFigure } from "@/components/StickFigure";
import type { ScenarioStage } from "@/lib/simulation/types";

interface EncounterDialogProps {
  stage: ScenarioStage;
  obstacleNumber: number;
  totalObstacles: number;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  onConfirm: () => void;
}

export function EncounterDialog({
  stage,
  obstacleNumber,
  totalObstacles,
  selectedOptionId,
  onSelect,
  onConfirm,
}: EncounterDialogProps) {
  const canConfirm = selectedOptionId !== null;

  return (
    <div
      className="absolute inset-0 z-20 flex items-end justify-center bg-navy-950/70 p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-question-title"
    >
      <div className="flex w-full max-w-2xl flex-col gap-4 rounded-2xl border border-line bg-navy-800 p-4 shadow-2xl sm:p-6">
        <div className="flex items-start gap-4">
          <StickFigure className="h-20 w-14 shrink-0 text-cyan" title="Guide" />
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-amber uppercase">
              Obstacle {obstacleNumber} of {totalObstacles}
            </p>
            <h2 id="guide-question-title" className="mt-2 text-xl font-semibold">
              What should I do now?
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">{stage.incidentUpdate}</p>
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="sr-only">Choose one response</legend>
          {stage.options.map((option) => {
            const selected = selectedOptionId === option.id;
            return (
              <label
                key={option.id}
                className={`block cursor-pointer rounded-xl border px-4 py-3 ${
                  selected
                    ? "border-cyan bg-[#123044]"
                    : "border-line hover:border-cyan/60"
                }`}
              >
                <input
                  type="radio"
                  name="field-decision"
                  value={option.id}
                  checked={selected}
                  onChange={() => onSelect(option.id)}
                  className="sr-only"
                />
                <span className="font-medium">{option.title}</span>
              </label>
            );
          })}
        </fieldset>

        <button
          type="button"
          onClick={onConfirm}
          disabled={!canConfirm}
          className={`self-end rounded-xl px-5 py-3 text-sm font-semibold ${
            canConfirm
              ? "bg-cyan-strong text-navy-950 hover:bg-cyan"
              : "cursor-not-allowed bg-navy-600 text-muted"
          }`}
        >
          Continue walking
        </button>
      </div>
    </div>
  );
}
