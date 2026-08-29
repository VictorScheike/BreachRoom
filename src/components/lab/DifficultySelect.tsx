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
        You will make ten architecture decisions for fictional Nordic Shield Insurance. Then one
        adaptive Red Team campaign tests the system you actually chose.
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
          <span>Short explanations, a Recommended label, and the practical trade-off on every option.</span>
        </button>
        <button
          type="button"
          className={difficulty === "challenge" ? "is-active" : ""}
          aria-pressed={difficulty === "challenge"}
          onClick={() => onChange("challenge")}
        >
          <LabIcon name="scan" />
          <strong>Challenge</strong>
          <span>Same architecture. No Recommended label. Consequences show in the campaign, not while you pick.</span>
        </button>
      </div>
      <div className="lab-setup__start">
        <p className="lab-kicker">Ready to begin</p>
        <p className="lab-setup__start-copy">
          Ten decisions. Pick a control and press Next. The path stays neutral so the answer is not
          given away. Then the Red Team tests the live path toward the Claims Database.
        </p>
        <button type="button" className="lab-primary lab-setup__start-button" onClick={onBegin}>
          Start the ten decisions
        </button>
      </div>
    </section>
  );
}
