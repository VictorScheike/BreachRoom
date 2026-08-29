import { LAB_MISSION, nodeById, optionForChoice } from "./catalog";
import { findEdge } from "./map-layout";
import type {
  AttackBeatKind,
  AttackSimulation,
  LabChoices,
  LabPhase,
  MapNodeId,
  OptionId,
  ResolvedStage,
  StageOutcomeKind,
} from "./types";

export const ATTACK_STEP_MS = 2200;
export const ATTACK_TRAVEL_MS = 1100;

export interface AttackBeat {
  kind: AttackBeatKind;
  markerNode: MapNodeId | null;
  fromNode: MapNodeId | null;
  toNode: MapNodeId | null;
  showResult: boolean;
}

export interface IncidentLogEvent {
  id: string;
  text: string;
  tone: "block" | "pivot" | "attack" | "partial" | "success";
}

export type NodeVisualStatus =
  | "idle"
  | "entry"
  | "attack"
  | "blocked"
  | "partial"
  | "success"
  | "history-block"
  | "history-partial"
  | "history-hit";

export type EdgeVisualKind = "idle" | "live" | "history" | "history-block" | "pivot" | "pivot-live";

export interface BoardEdgeVisual {
  id: string;
  from: MapNodeId;
  to: MapNodeId;
  kind: EdgeVisualKind;
}

export interface BoardVisualState {
  visible: readonly MapNodeId[];
  nodeStatus: Record<MapNodeId, NodeVisualStatus>;
  edges: readonly BoardEdgeVisual[];
  markerNode: MapNodeId | null;
  markerVisible: boolean;
  markerMoving: boolean;
  stopBadge: { nodeId: MapNodeId; label: "BLOCKED" | "PARTIAL" | "SUCCESS" } | null;
  pivotBanner: boolean;
  enteringNode: MapNodeId | null;
}

export function beatsForStage(stage: ResolvedStage): AttackBeat[] {
  const beats: AttackBeat[] = [];
  const path = stage.travelledPath;
  const entry = path[0] ?? stage.entryNode;
  if (stage.isPivot) {
    beats.push({
      kind: "pivot",
      markerNode: null,
      fromNode: null,
      toNode: null,
      showResult: false,
    });
  }
  beats.push({
    kind: "entry",
    markerNode: entry,
    fromNode: null,
    toNode: null,
    showResult: false,
  });
  for (let index = 1; index < path.length; index += 1) {
    const fromNode = path[index - 1];
    const toNode = path[index];
    if (!fromNode || !toNode) {
      continue;
    }
    beats.push({
      kind: "travel",
      markerNode: toNode,
      fromNode,
      toNode,
      showResult: false,
    });
  }
  beats.push({
    kind: "result",
    markerNode: stage.stopNode,
    fromNode: path.length > 1 ? path[path.length - 2] ?? null : null,
    toNode: stage.stopNode,
    showResult: true,
  });
  return beats;
}

export function currentBeat(stage: ResolvedStage | null, attackBeat: number): AttackBeat | null {
  if (!stage) {
    return null;
  }
  const beats = beatsForStage(stage);
  if (beats.length === 0) {
    return null;
  }
  const index = Math.max(0, Math.min(beats.length - 1, attackBeat));
  return beats[index] ?? null;
}

export function hudStatus(args: {
  phase: LabPhase;
  stage: ResolvedStage | null;
  beat: AttackBeat | null;
  resultLabel?: string;
}): string {
  if (args.phase === "review") {
    return "Ready";
  }
  if (args.phase === "result") {
    return args.resultLabel ?? "Contained";
  }
  if (!args.stage || !args.beat) {
    return "Ready";
  }
  if (args.beat.kind === "pivot") {
    return "Pivot";
  }
  if (args.beat.kind === "result") {
    if (args.stage.outcome === "successful") {
      return "Attacking";
    }
    if (args.stage.outcome === "partial") {
      return "Partial";
    }
    if (args.stage.outcome === "detected" || args.stage.outcome === "contained") {
      return "Contained";
    }
    return "Blocked";
  }
  return "Attacking";
}

export function compactOutcome(outcome: StageOutcomeKind): "BLOCKED" | "PARTIAL" | "SUCCESS" {
  if (outcome === "successful") {
    return "SUCCESS";
  }
  if (outcome === "partial") {
    return "PARTIAL";
  }
  return "BLOCKED";
}

function pathPairs(path: readonly MapNodeId[]): Array<{ from: MapNodeId; to: MapNodeId }> {
  const pairs: Array<{ from: MapNodeId; to: MapNodeId }> = [];
  for (let index = 1; index < path.length; index += 1) {
    const from = path[index - 1];
    const to = path[index];
    if (from && to) {
      pairs.push({ from, to });
    }
  }
  return pairs;
}

function edgeId(from: MapNodeId, to: MapNodeId, fallback: string): string {
  return findEdge(from, to)?.id ?? fallback;
}

function historyStatus(outcome: StageOutcomeKind): NodeVisualStatus {
  if (outcome === "successful") {
    return "history-hit";
  }
  if (outcome === "partial") {
    return "history-partial";
  }
  return "history-block";
}

export function deriveBoardVisual(args: {
  choices: LabChoices;
  previewOptionId?: OptionId | null;
  simulation: AttackSimulation | null;
  revealedStageCount: number;
  attackBeat: number;
  phase: LabPhase;
}): BoardVisualState {
  const visible = new Set<MapNodeId>(["portal", "app", "database"]);
  for (const node of LAB_MISSION.nodes) {
    if (node.decisionId && args.choices[node.decisionId]) {
      visible.add(node.id);
    }
  }
  let enteringNode: MapNodeId | null = null;
  if (args.previewOptionId) {
    const option = LAB_MISSION.decisions.flatMap((item) => [...item.options]).find((item) => item.id === args.previewOptionId);
    if (option) {
      const node = LAB_MISSION.nodes.find((item) => item.decisionId === option.decisionId);
      if (node) {
        visible.add(node.id);
        if (!args.choices[option.decisionId]) {
          enteringNode = node.id;
        }
      }
    }
  }

  const nodeStatus = {} as Record<MapNodeId, NodeVisualStatus>;
  for (const node of LAB_MISSION.nodes) {
    nodeStatus[node.id] = "idle";
  }

  const edgeKinds = new Map<string, EdgeVisualKind>();
  const stages = args.simulation?.stages ?? [];
  const completedCount = args.phase === "result" ? stages.length : Math.max(0, args.revealedStageCount - 1);
  const history = stages.slice(0, completedCount);
  const current = args.phase === "attack" && args.revealedStageCount > 0 ? stages[args.revealedStageCount - 1] ?? null : null;
  const beat = currentBeat(current, args.attackBeat);

  for (const [index, stage] of history.entries()) {
    for (const pair of pathPairs(stage.travelledPath)) {
      const id = edgeId(pair.from, pair.to, `${stage.id}-${pair.from}-${pair.to}`);
      const last = pair.to === stage.stopNode;
      edgeKinds.set(id, last && stage.blocked ? "history-block" : "history");
    }
    for (const nodeId of stage.travelledPath) {
      if (nodeId === stage.stopNode) {
        nodeStatus[nodeId] = historyStatus(stage.outcome);
      } else if (nodeStatus[nodeId] === "idle") {
        nodeStatus[nodeId] = "history-hit";
      }
    }
    if (stage.isPivot && index > 0) {
      const previous = history[index - 1];
      if (previous) {
      edgeKinds.set(`pivot|${previous.id}|${stage.id}`, "pivot");
      }
    }
  }

  let markerNode: MapNodeId | null = null;
  let markerVisible = false;
  let markerMoving = false;
  let stopBadge: BoardVisualState["stopBadge"] = null;
  let pivotBanner = false;

  if (current && beat) {
    if (current.isPivot && beat.kind !== "pivot" && history.length > 0) {
      const previous = history[history.length - 1];
      if (previous) {
        edgeKinds.set(`pivot|${previous.id}|${current.id}`, "pivot");
      }
    }
    if (beat.kind === "pivot") {
      pivotBanner = true;
      const previous = history[history.length - 1];
      if (previous) {
        edgeKinds.set(`pivot|${previous.id}|${current.id}`, "pivot-live");
      }
    } else {
      const hops = pathPairs(current.travelledPath);
      const liveCount = beat.kind === "entry" ? 0 : beat.kind === "result" ? hops.length : hops.findIndex((pair) => pair.to === beat.toNode) + 1;
      hops.slice(0, Math.max(0, liveCount)).forEach((pair, hopIndex) => {
        const id = edgeId(pair.from, pair.to, `${current.id}-${pair.from}-${pair.to}`);
        const isCurrentHop = hopIndex === liveCount - 1 && beat.kind === "travel";
        edgeKinds.set(id, isCurrentHop ? "live" : current.blocked && pair.to === current.stopNode ? "history-block" : "live");
      });
      for (const nodeId of current.travelledPath) {
        const reached = beat.kind === "result" || current.travelledPath.indexOf(nodeId) <= current.travelledPath.indexOf(beat.markerNode ?? nodeId);
        if (!reached) {
          continue;
        }
        if (nodeId === current.stopNode && beat.kind === "result") {
          nodeStatus[nodeId] =
            current.outcome === "successful" ? "success" : current.outcome === "partial" ? "partial" : "blocked";
        } else if (nodeId === beat.markerNode) {
          nodeStatus[nodeId] = beat.kind === "entry" ? "entry" : "attack";
        } else if (nodeStatus[nodeId] === "idle") {
          nodeStatus[nodeId] = "history-hit";
        }
      }
      markerNode = beat.markerNode;
      markerVisible = beat.kind !== "result" || !current.blocked;
      if (beat.kind === "result" && current.blocked) {
        markerVisible = false;
      }
      markerMoving = beat.kind === "travel";
      if (beat.showResult) {
        stopBadge = { nodeId: current.stopNode, label: compactOutcome(current.outcome) };
      }
    }
  }

  if (args.phase === "result") {
    const last = stages[stages.length - 1];
    if (last) {
      stopBadge = { nodeId: last.stopNode, label: compactOutcome(last.outcome) };
    }
  }

  const edges: BoardEdgeVisual[] = [];
  for (const edge of LAB_MISSION.edges) {
    if (!visible.has(edge.from) || !visible.has(edge.to)) {
      continue;
    }
    edges.push({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      kind: edgeKinds.get(edge.id) ?? "idle",
    });
  }
  for (const [id, kind] of edgeKinds) {
    if (!id.startsWith("pivot|")) {
      continue;
    }
    const [, previousId, nextId] = id.split("|");
    const previous = stages.find((item) => item.id === previousId);
    const next = stages.find((item) => item.id === nextId);
    if (!previous || !next) {
      continue;
    }
    edges.push({
      id,
      from: previous.stopNode,
      to: next.entryNode,
      kind,
    });
  }

  return {
    visible: [...visible],
    nodeStatus,
    edges,
    markerNode,
    markerVisible,
    markerMoving,
    stopBadge,
    pivotBanner,
    enteringNode,
  };
}

export function incidentLog(args: {
  simulation: AttackSimulation | null;
  revealedStageCount: number;
  attackBeat: number;
  phase: LabPhase;
}): IncidentLogEvent[] {
  if (!args.simulation) {
    return [];
  }
  const events: IncidentLogEvent[] = [];
  const completedCount = args.phase === "result" ? args.simulation.stages.length : Math.max(0, args.revealedStageCount - 1);
  for (const stage of args.simulation.stages.slice(0, completedCount)) {
    if (stage.isPivot) {
      events.push({ id: `${stage.id}-pivot`, text: "Red Team pivots", tone: "pivot" });
    }
    events.push({
      id: `${stage.id}-result`,
      text: logText(stage),
      tone: logTone(stage.outcome),
    });
  }
  const current = args.phase === "attack" ? args.simulation.stages[args.revealedStageCount - 1] ?? null : null;
  const beat = currentBeat(current, args.attackBeat);
  if (current && beat) {
    if (beat.kind === "pivot") {
      events.push({ id: `${current.id}-pivot`, text: "Red Team pivots", tone: "pivot" });
    } else if (beat.kind === "entry") {
      events.push({ id: `${current.id}-entry`, text: `${current.name} begins`, tone: "attack" });
    } else if (beat.kind === "travel") {
      events.push({
        id: `${current.id}-travel-${beat.toNode ?? "node"}`,
        text: `Moving toward ${nodeById(beat.toNode ?? current.stopNode).name}`,
        tone: "attack",
      });
    } else {
      events.push({
        id: `${current.id}-result`,
        text: logText(current),
        tone: logTone(current.outcome),
      });
    }
  }
  return events;
}

function logTone(outcome: StageOutcomeKind): IncidentLogEvent["tone"] {
  if (outcome === "successful") {
    return "success";
  }
  if (outcome === "partial") {
    return "partial";
  }
  return "block";
}

function logText(stage: ResolvedStage): string {
  if (stage.outcome === "successful") {
    return `${stage.name} succeeded`;
  }
  if (stage.outcome === "partial") {
    return `${stage.name} partially held`;
  }
  return `${stage.name} blocked`;
}

export function nodeLabel(choices: LabChoices, nodeId: MapNodeId): string {
  const node = nodeById(nodeId);
  if (!node.decisionId) {
    return node.name;
  }
  return optionForChoice(choices, node.decisionId)?.mapTitle ?? node.name;
}
