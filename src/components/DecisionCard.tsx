import type { DecisionOption } from "@/lib/simulation/types";

interface DecisionCardProps {
  option: DecisionOption;
  index: number;
  selected: boolean;
  onSelect: (optionId: string) => void;
}

export function DecisionCard({
  option,
  index,
  selected,
  onSelect,
}: DecisionCardProps) {
  const optionNumber = index + 1;

  return (
    <label
      className={`block cursor-pointer rounded-2xl border p-4 transition-colors sm:p-5 ${
        selected
          ? "border-cyan bg-navy-700"
          : "border-line bg-navy-800 hover:border-cyan/50"
      }`}
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
        <p className="font-mono text-xs tracking-[0.18em] text-cyan uppercase">
          Option {optionNumber}
        </p>
        <span
          className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-cyan bg-cyan-strong" : "border-muted"
          }`}
          aria-hidden="true"
        >
          {selected ? (
            <span className="h-1.5 w-1.5 rounded-full bg-navy-950" />
          ) : null}
        </span>
      </div>
      <h3 className="mt-2 text-base font-semibold sm:text-lg">{option.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{option.description}</p>
      <p className="mt-3 text-xs text-muted">
        {selected ? "Selected. Confirm to lock this decision." : "Select to review, then confirm."}
      </p>
    </label>
  );
}
