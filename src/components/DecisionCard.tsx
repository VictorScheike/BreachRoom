import { CheckIcon } from "@/components/icons";
import type { DecisionOption } from "@/lib/simulation/types";

interface DecisionCardProps {
  option: DecisionOption;
  index: number;
  selected: boolean;
  dimmed: boolean;
  recorded: boolean;
  onSelect: (optionId: string) => void;
}

export function DecisionCard({
  option,
  index,
  selected,
  dimmed,
  recorded,
  onSelect,
}: DecisionCardProps) {
  const optionNumber = index + 1;
  const statusLabel = recorded
    ? "Decision recorded"
    : selected
      ? "Selected"
      : "Not selected";

  return (
    <label
      className={`decision-card block cursor-pointer rounded-2xl border p-4 transition-[transform,box-shadow,border-color,background-color,opacity] duration-200 sm:p-5 ${
        selected
          ? "border-cyan bg-[#123044] shadow-[0_0_0_1px_rgba(56,189,248,0.45),0_10px_24px_rgba(8,47,73,0.55)]"
          : "border-line-bright/70 bg-navy-800 hover:-translate-y-0.5 hover:border-cyan/70 hover:shadow-[0_8px_20px_rgba(8,47,73,0.35)]"
      } ${dimmed ? "opacity-55" : "opacity-100"}`}
    >
      <input
        type="radio"
        name="incident-decision"
        value={option.id}
        checked={selected}
        onChange={() => onSelect(option.id)}
        className="sr-only"
      />
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
          Option {optionNumber}
        </p>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-medium ${
            selected
              ? "border-cyan bg-cyan-strong/15 text-cyan"
              : "border-line text-muted"
          }`}
        >
          {selected ? <CheckIcon className="h-3.5 w-3.5" /> : null}
          {statusLabel}
        </span>
      </div>
      <h3 className="mt-3 text-base font-semibold sm:text-lg">{option.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{option.description}</p>
    </label>
  );
}
