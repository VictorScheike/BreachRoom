import { LabIcon } from "@/components/lab/LabIcon";
import type { AttackSimulation } from "@/lib/lab/types";

export function AttackResultBanner({ simulation }: { simulation: AttackSimulation }) {
  return (
    <section className={`lab-result is-${simulation.result}`} aria-label="Final attack result">
      <p className="lab-result__kicker">Final result</p>
      <h2>{simulation.resultLabel}</h2>
      <p>{simulation.resultSummary}</p>
      <p className="lab-result__score">Practice score {simulation.score}</p>
      <p className={`lab-outcome is-${resultTone(simulation.result)}`}>
        <LabIcon name={resultIcon(simulation.result)} />
        <span>{simulation.resultLabel}</span>
      </p>
    </section>
  );
}

function resultTone(result: AttackSimulation["result"]): "blocked" | "contained" | "detected" | "successful" {
  if (result === "architecture-holds") {
    return "blocked";
  }
  if (result === "attack-contained") {
    return "contained";
  }
  if (result === "partial-breach") {
    return "detected";
  }
  return "successful";
}

function resultIcon(result: AttackSimulation["result"]): string {
  if (result === "architecture-holds") {
    return "shield";
  }
  if (result === "attack-contained") {
    return "contained";
  }
  if (result === "partial-breach") {
    return "detected";
  }
  return "successful";
}
