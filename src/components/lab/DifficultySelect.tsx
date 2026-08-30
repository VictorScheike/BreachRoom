"use client";

import { LabIcon } from "@/components/lab/LabIcon";
import type { LabDifficulty } from "@/lib/lab/types";

export function DifficultySelect({
  difficulty,
  onChange,
  onBegin,
}: {
  difficulty: LabDifficulty;
  onChange: (difficulty: LabDifficulty) => void;
  onBegin: () => void;
}) {
  return (
    <section className="lab-setup" aria-labelledby="lab-setup-heading">
      <p className="lab-kicker">Architecture Defence Lab</p>
      <h2 id="lab-setup-heading">Choose a difficulty</h2>
      <p>
        You will configure ten architecture controls for fictional Nordic Shield Insurance. Then one
        Red Team campaign tests the exact system you built — what it prevents, how far a hit can
        spread, what gets detected, and whether the organisation can recover.
      </p>
      <div className="lab-setup__choices">
        <button
          type="button"
          className={difficulty === "guided" ? "is-active" : ""}
          aria-pressed={difficulty === "guided"}
          onClick={() => onChange("guided")}
        >
          <LabIcon name="shield" />
          <strong>Guided</strong>
          <span>Recommended label, the practical trade-off, and which risk the control reduces. The campaign result stays hidden until the Red Team runs.</span>
        </button>
        <button
          type="button"
          className={difficulty === "challenge" ? "is-active" : ""}
          aria-pressed={difficulty === "challenge"}
          onClick={() => onChange("challenge")}
        >
          <LabIcon name="scan" />
          <strong>Challenge</strong>
          <span>Same architecture. No Recommended label. You see the change and the trade-off. Full consequences show in the campaign.</span>
        </button>
      </div>
      <div className="lab-setup__start">
        <p className="lab-kicker">Ready to begin</p>
        <p className="lab-setup__start-copy">
          Ten decisions. Each one changes the live architecture. Then the Red Team tests the system
          you built — not to promise that attacks can be avoided, but to see how the design holds.
        </p>
        <button type="button" className="lab-primary lab-setup__start-button" onClick={onBegin}>
          Start the ten decisions
        </button>
      </div>
    </section>
  );
}
