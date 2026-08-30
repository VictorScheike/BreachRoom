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
      <p className="lab-kicker">How it works</p>
      <h2 id="lab-setup-heading">You build the picture. Then an attack walks through it.</h2>
      <p>
        The diagram has three layers: <strong>Edge</strong> is the front door,{" "}
        <strong>Application</strong> is where the AI works, and <strong>Protected data</strong> is
        where customer records live. Each question adds one control. Same ten questions in both
        modes.
      </p>
      <div className="lab-setup__choices">
        <button
          type="button"
          className={difficulty === "guided" ? "is-active" : ""}
          aria-pressed={difficulty === "guided"}
          onClick={() => onChange("guided")}
        >
          <LabIcon name="shield" />
          <strong>Beginner</strong>
          <span>Short hints on the diagram and on what each choice changes. You still pick. The attack result stays hidden until the Red Team runs.</span>
        </button>
        <button
          type="button"
          className={difficulty === "challenge" ? "is-active" : ""}
          aria-pressed={difficulty === "challenge"}
          onClick={() => onChange("challenge")}
        >
          <LabIcon name="scan" />
          <strong>Challenging</strong>
          <span>Same questions, less help. Trade-offs appear after you pick. Full consequences show in the campaign.</span>
        </button>
      </div>
      <div className="lab-setup__start">
        <p className="lab-kicker">Ready to begin</p>
        <p className="lab-setup__start-copy">
          Ten choices. Each one changes the live architecture. Then one attack tests the system you
          built.
        </p>
        <button type="button" className="lab-primary lab-setup__start-button" onClick={onBegin}>
          Start the ten decisions
        </button>
      </div>
    </section>
  );
}
