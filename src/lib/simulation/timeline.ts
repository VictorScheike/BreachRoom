import { findOption } from "./lookups";
import type {
  RecordedDecision,
  Scenario,
  TimelineEvent,
} from "./types";

export function buildTimelineEvents(
  scenario: Scenario,
  decisions: readonly RecordedDecision[],
  currentStageId: string,
  variant: "live" | "report",
): TimelineEvent[] {
  const currentIndex = scenario.stages.findIndex(
    (stage) => stage.id === currentStageId,
  );
  const lastVisibleIndex =
    variant === "report" ? scenario.stages.length - 1 : Math.max(currentIndex, 0);

  const events: TimelineEvent[] = [];

  for (let index = 0; index <= lastVisibleIndex; index += 1) {
    const stage = scenario.stages[index];
    if (!stage) {
      continue;
    }

    const isCurrent = variant === "live" && stage.id === currentStageId;
    events.push({
      id: `${stage.id}-incident`,
      kind: "incident",
      eventType: stage.eventType,
      timestamp: stage.timestamp,
      clockTime: stage.clockTime,
      title: stage.title,
      detail: stage.incidentUpdate,
      isCurrent,
    });

    const recorded = decisions.find((decision) => decision.stageId === stage.id);
    if (!recorded) {
      continue;
    }

    const option = findOption(scenario, stage.id, recorded.optionId);
    events.push({
      id: `${stage.id}-decision`,
      kind: "decision",
      eventType: "Decision recorded",
      timestamp: stage.timestamp,
      clockTime: stage.clockTime,
      title: option.title,
      detail: `Response locked: ${option.title}`,
      isCurrent: false,
    });
  }

  return events;
}
