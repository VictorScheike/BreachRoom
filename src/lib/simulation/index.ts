export type { AfterActionReport, Scenario, SimulationState } from "./types";
export { SCORE_DIMENSIONS } from "./types";
export { buildTimelineEvents } from "./timeline";
export { parseScenario, safeParseScenario, scenarioSchema } from "./schemas";
export { scenario, STAGE_COUNT } from "./scenario";
export {
  SCORING_CONFIG,
  applyImpacts,
  calculateOverallScore,
  clampScore,
  createInitialScores,
  getResultLabel,
  identifyCategoryGaps,
  identifyCategoryStrengths,
} from "./scoring";
export { calculateScores, generateReport } from "./report";
export {
  canConfirmDecision,
  createInitialState,
  simulationReducer,
} from "./reducer";
export { isComplete, requireStage } from "./lookups";
export {
  EDUCATIONAL_DISCLAIMER,
  LANDING_DESCRIPTION,
  LANDING_HEADLINE,
  PRACTICE_AREAS,
  PRODUCT_NAME,
} from "./copy";
