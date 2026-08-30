import { optionFromPreview, visibleNodeIds } from "./campaign";
import { LAB_MISSION, nodeById, optionForChoice } from "./catalog";
import { edgesForVisible, findEdge, isPrimarySystem, PRIMARY_SYSTEM_IDS } from "./map-layout";
import type {
  AttackBeatKind,
  AttackSimulation,
  ControlStatus,
  LabChoices,
  LabPhase,
  MapNodeId,
  OptionId,
  ResolvedStage,
  StageOutcomeKind,
  SystemStatus,
} from "./types";

export const ATTACK_STEP_MS = 1800;
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
  tone: "block" | "attack" | "partial" | "success";
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
  | "history-hit"
  | "contained"
  | "detected";

export type EdgeVisualKind = "idle" | "live" | "history" | "history-block" | "history-limited" | "history-detected";

export interface BoardEdgeVisual {
  id: string;
  from: MapNodeId;
  to: MapNodeId;
  kind: EdgeVisualKind;
}

export interface BoardVisualState {
  visible: readonly MapNodeId[];
  nodeStatus: Record<MapNodeId, NodeVisualStatus>;
  systemStatus: Partial<Record<MapNodeId, SystemStatus>>;
  controlStatus: Partial<Record<MapNodeId, ControlStatus>>;
  edges: readonly BoardEdgeVisual[];
  markerNode: MapNodeId | null;
  markerVisible: boolean;
  markerMoving: boolean;
  stopBadge: { nodeId: MapNodeId; label: string } | null;
  pivotBanner: boolean;
  enteringNode: MapNodeId | null;
  affectedNodes: readonly MapNodeId[];
  faded: boolean;
}

export function beatsForStage(stage: ResolvedStage): AttackBeat[] {
  if (stage.outcome === "not-reached" || stage.outcome === "not-required") {
    return [
      {
        kind: "result",
        markerNode: stage.stopNode,
        fromNode: null,
        toNode: stage.stopNode,
        showResult: true,
      },
    ];
  }
  const beats: AttackBeat[] = [];
  const path = stage.travelledPath;
  const entry = path[0] ?? stage.entryNode;
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
  if (args.beat.kind === "result") {
    if (args.stage.outcome === "compromised" || args.stage.outcome === "succeeded") {
      return "Attacking";
    }
    if (args.stage.outcome === "limited") {
      return "Limited";
    }
    if (args.stage.outcome === "detected") {
      return "Detected";
    }
    if (args.stage.outcome === "contained") {
      return "Contained";
    }
    if (args.stage.outcome === "recovered") {
      return "Recovered";
    }
    if (args.stage.outcome === "not-reached") {
      return "Not reached";
    }
    return "Blocked";
  }
  return "Attacking";
}

export function compactOutcome(outcome: StageOutcomeKind): string {
  if (outcome === "compromised") {
    return "COMPROMISED";
  }
  if (outcome === "succeeded") {
    return "SUCCEEDED";
  }
  if (outcome === "limited") {
    return "LIMITED";
  }
  if (outcome === "detected") {
    return "DETECTED";
  }
  if (outcome === "recovered") {
    return "RECOVERED";
  }
  if (outcome === "contained") {
    return "CONTAINED";
  }
  if (outcome === "not-reached") {
    return "NOT REACHED";
  }
  if (outcome === "not-required") {
    return "NOT REQUIRED";
  }
  return "BLOCKED";
}

function pathPairs(path: readonly MapNodeId[]): Array<{ from: MapNodeId; to: MapNodeId }> {
  const pairs: Array<{ from: MapNodeId; to: MapNodeId }> = [];
  for (let index = 1; index < path.length; index += 1) {
    const from = path[index - 1];
    const to = path[index];
    if (from && to && findEdge(from, to)) {
      pairs.push({ from, to });
    }
  }
  return pairs;
}

function edgeId(from: MapNodeId, to: MapNodeId, fallback: string): string {
  return findEdge(from, to)?.id ?? fallback;
}

function historyStatus(outcome: StageOutcomeKind): NodeVisualStatus {
  if (outcome === "compromised" || outcome === "succeeded") {
    return "history-hit";
  }
  if (outcome === "limited" || outcome === "detected") {
    return "history-partial";
  }
  if (outcome === "contained") {
    return "contained";
  }
  if (outcome === "not-reached" || outcome === "not-required") {
    return "idle";
  }
  return "history-block";
}

const SYSTEM_RANK: Record<SystemStatus, number> = {
  normal: 0,
  reached: 1,
  protected: 2,
  contained: 3,
  compromised: 4,
  impacted: 5,
};

function assignSystem(
  systemStatus: Partial<Record<MapNodeId, SystemStatus>>,
  id: MapNodeId,
  next: SystemStatus,
): void {
  const current = systemStatus[id] ?? "normal";
  if (SYSTEM_RANK[next] >= SYSTEM_RANK[current]) {
    systemStatus[id] = next;
  }
}

function systemFromOutcome(outcome: StageOutcomeKind, id: MapNodeId, stop: boolean): SystemStatus {
  if (outcome === "contained") {
    return "contained";
  }
  if (outcome === "blocked" && stop) {
    return "protected";
  }
  if ((outcome === "succeeded" || outcome === "compromised") && (id === "database" || stop)) {
    return id === "database" ? "impacted" : "compromised";
  }
  if (outcome === "limited") {
    return id === "database" ? "impacted" : "reached";
  }
  if (outcome === "not-reached") {
    return "protected";
  }
  return "reached";
}

export function deriveBoardVisual(args: {
  choices: LabChoices;
  previewOptionId?: OptionId | null;
  simulation: AttackSimulation | null;
  revealedStageCount: number;
  attackBeat: number;
  phase: LabPhase;
}): BoardVisualState {
  const visible = visibleNodeIds(args.choices, args.previewOptionId);
  const preview = optionFromPreview(args.previewOptionId);
  let enteringNode: MapNodeId | null = null;
  const affectedNodes: MapNodeId[] = [];
  if (preview) {
    const alreadyChosen = args.choices[preview.decisionId] === preview.id;
    for (const nodeId of preview.addsNodes) {
      if (!alreadyChosen) {
        enteringNode = enteringNode ?? nodeId;
      }
    }
    affectedNodes.push(...preview.highlightNodes.filter((id) => visible.has(id)));
  }

  const nodeStatus = {} as Record<MapNodeId, NodeVisualStatus>;
  const systemStatus: Partial<Record<MapNodeId, SystemStatus>> = {};
  const controlStatus: Partial<Record<MapNodeId, ControlStatus>> = {};
  for (const node of LAB_MISSION.nodes) {
    nodeStatus[node.id] = "idle";
    if (isPrimarySystem(node.id)) {
      systemStatus[node.id] = "normal";
    }
  }

  const edgeKinds = new Map<string, EdgeVisualKind>();
  const stages = args.simulation?.stages ?? [];
  const completedCount = args.phase === "result" ? stages.length : Math.max(0, args.revealedStageCount - 1);
  const history = stages.slice(0, completedCount).filter((item) => item.outcome !== "not-reached" && item.outcome !== "not-required");
  const current = args.phase === "attack" && args.revealedStageCount > 0 ? stages[args.revealedStageCount - 1] ?? null : null;
  const beat = currentBeat(current && current.outcome !== "not-reached" ? current : null, args.attackBeat);
  const faded = Boolean(current && beat);

  for (const stage of history) {
    for (const pair of pathPairs(stage.travelledPath)) {
      const id = edgeId(pair.from, pair.to, `${stage.id}-${pair.from}-${pair.to}`);
      const last = pair.to === stage.stopNode;
      const kind =
        last && stage.outcome === "blocked"
          ? "history-block"
          : stage.outcome === "detected"
            ? "history-detected"
            : stage.outcome === "limited" || stage.outcome === "contained"
              ? "history-limited"
              : "history";
      edgeKinds.set(id, kind);
    }
    for (const nodeId of stage.travelledPath) {
      if (!isPrimarySystem(nodeId) && nodeId !== stage.responsibleNode) {
        continue;
      }
      if (nodeId === stage.stopNode) {
        nodeStatus[nodeId] = historyStatus(stage.outcome);
      } else if (nodeStatus[nodeId] === "idle") {
        nodeStatus[nodeId] = "history-hit";
      }
      if (isPrimarySystem(nodeId)) {
        assignSystem(systemStatus, nodeId, systemFromOutcome(stage.outcome, nodeId, nodeId === stage.stopNode));
      }
    }
    if (stage.controlStatus && stage.responsibleNode) {
      controlStatus[stage.responsibleNode] = stage.controlStatus;
    }
  }

  let markerNode: MapNodeId | null = null;
  let markerVisible = false;
  let markerMoving = false;
  let stopBadge: BoardVisualState["stopBadge"] = null;

  if (current && beat && current.outcome !== "not-reached") {
    const hops = pathPairs(current.travelledPath);
    const liveCount = beat.kind === "entry" ? 0 : beat.kind === "result" ? hops.length : hops.findIndex((pair) => pair.to === beat.toNode) + 1;
    hops.slice(0, Math.max(0, liveCount)).forEach((pair, hopIndex) => {
      const id = edgeId(pair.from, pair.to, `${current.id}-${pair.from}-${pair.to}`);
      const isCurrentHop = hopIndex === liveCount - 1 && beat.kind === "travel";
      const terminal = current.outcome === "blocked" && pair.to === current.stopNode && beat.kind === "result";
      const detected = current.outcome === "detected" && beat.kind === "result";
      const limited = (current.outcome === "limited" || current.outcome === "contained") && beat.kind === "result";
      edgeKinds.set(
        id,
        terminal ? "history-block" : detected ? "history-detected" : limited ? "history-limited" : isCurrentHop ? "live" : "live",
      );
    });
    for (const nodeId of current.travelledPath) {
      const reached =
        beat.kind === "result" || current.travelledPath.indexOf(nodeId) <= current.travelledPath.indexOf(beat.markerNode ?? nodeId);
      if (!reached) {
        continue;
      }
      if (nodeId === current.stopNode && beat.kind === "result") {
        if (current.outcome === "detected") {
          nodeStatus[current.responsibleNode] = "detected";
          if (isPrimarySystem(nodeId)) {
            nodeStatus[nodeId] = nodeStatus[nodeId] === "idle" ? "history-hit" : nodeStatus[nodeId];
            assignSystem(systemStatus, nodeId, systemStatus[nodeId] ?? "reached");
          }
        } else if (current.outcome === "compromised" || current.outcome === "succeeded") {
          nodeStatus[nodeId] = "success";
          if (isPrimarySystem(nodeId)) {
            assignSystem(systemStatus, nodeId, nodeId === "database" ? "impacted" : "compromised");
          }
        } else if (current.outcome === "limited") {
          nodeStatus[nodeId] = "partial";
          if (isPrimarySystem(nodeId)) {
            assignSystem(systemStatus, nodeId, "reached");
          }
        } else if (current.outcome === "contained") {
          nodeStatus[nodeId] = "contained";
          if (isPrimarySystem(nodeId)) {
            assignSystem(systemStatus, nodeId, "contained");
          }
        } else if (current.outcome === "blocked") {
          nodeStatus[nodeId] = "blocked";
          if (isPrimarySystem(nodeId)) {
            assignSystem(systemStatus, nodeId, "protected");
          }
          if (current.controlStatus) {
            controlStatus[current.responsibleNode] = current.controlStatus;
          }
        } else {
          nodeStatus[nodeId] = "partial";
        }
      } else if (nodeId === beat.markerNode) {
        nodeStatus[nodeId] = beat.kind === "entry" ? "entry" : "attack";
        if (isPrimarySystem(nodeId)) {
          assignSystem(systemStatus, nodeId, "reached");
        }
      } else if (nodeStatus[nodeId] === "idle") {
        nodeStatus[nodeId] = "history-hit";
        if (isPrimarySystem(nodeId)) {
          assignSystem(systemStatus, nodeId, "reached");
        }
      }
    }
    if (current.controlStatus) {
      controlStatus[current.responsibleNode] = beat.kind === "result" ? current.controlStatus : "triggered";
    }
    markerNode = beat.markerNode;
    markerVisible = beat.kind !== "result" || !current.blocked;
    if (beat.kind === "result" && current.blocked) {
      markerVisible = false;
    }
    markerMoving = beat.kind === "travel";
    if (beat.showResult) {
      const badgeNode = current.outcome === "blocked" ? current.stopNode : current.stopNode;
      stopBadge = { nodeId: badgeNode, label: compactOutcome(current.outcome) };
    }
  }

  if (args.phase === "result") {
    const lastActive =
      [...stages].reverse().find((item) => item.outcome !== "not-reached" && item.outcome !== "not-required") ?? stages[stages.length - 1];
    if (lastActive) {
      stopBadge = { nodeId: lastActive.stopNode, label: compactOutcome(lastActive.outcome) };
    }
    const blocked = stages.find((item) => item.outcome === "blocked");
    if (blocked) {
      stopBadge = { nodeId: blocked.stopNode, label: "BLOCKED" };
    }
  }

  for (const id of PRIMARY_SYSTEM_IDS) {
    if (args.phase === "result" || args.phase === "attack") {
      const later = stages.filter((item) => item.outcome === "not-reached" && item.travelledPath.includes(id));
      if (later.length > 0 && systemStatus[id] === "normal") {
        systemStatus[id] = "protected";
      }
    }
  }

  const edges: BoardEdgeVisual[] = [];
  for (const edge of edgesForVisible(visible)) {
    edges.push({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      kind: edgeKinds.get(edge.id) ?? "idle",
    });
  }

  return {
    visible: [...visible],
    nodeStatus,
    systemStatus,
    controlStatus,
    edges,
    markerNode,
    markerVisible,
    markerMoving,
    stopBadge,
    pivotBanner: false,
    enteringNode,
    affectedNodes,
    faded,
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
    if (stage.outcome === "not-reached") {
      continue;
    }
    events.push({
      id: `${stage.id}-result`,
      text: logText(stage),
      tone: logTone(stage.outcome),
    });
  }
  const current = args.phase === "attack" ? args.simulation.stages[args.revealedStageCount - 1] ?? null : null;
  const beat = currentBeat(current, args.attackBeat);
  if (current && beat && current.outcome !== "not-reached") {
    if (beat.kind === "entry") {
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
  if (outcome === "compromised" || outcome === "succeeded") {
    return "success";
  }
  if (outcome === "limited" || outcome === "detected" || outcome === "contained") {
    return "partial";
  }
  return "block";
}

function logText(stage: ResolvedStage): string {
  return `${stage.name} ${compactOutcome(stage.outcome).toLowerCase()}`;
}

export function nodeLabel(choices: LabChoices, nodeId: MapNodeId, previewOptionId?: OptionId | null): string {
  const node = nodeById(nodeId);
  if (isPrimarySystem(nodeId) || !node.decisionId) {
    return node.name;
  }
  const chosen = optionForChoice(choices, node.decisionId);
  if (chosen) {
    return chosen.mapTitle;
  }
  if (previewOptionId) {
    const preview = LAB_MISSION.decisions.flatMap((item) => [...item.options]).find((item) => item.id === previewOptionId);
    if (preview?.decisionId === node.decisionId) {
      return preview.mapTitle;
    }
  }
  return node.name;
}
