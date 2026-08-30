"use client";

import { useEffect, useState } from "react";
import { LabIcon } from "@/components/lab/LabIcon";
import { LAB_MISSION, optionForChoice } from "@/lib/lab/catalog";
import { deriveBoardVisual, nodeLabel, type NodeVisualStatus } from "@/lib/lab/animation";
import { LAB_ZONE_LABELS, edgePath, nodePoint, type BoardLayout } from "@/lib/lab/map-layout";
import type {
  AttackSimulation,
  LabChoices,
  LabPhase,
  MapNodeId,
  NodeKind,
  OptionId,
} from "@/lib/lab/types";

function useBoardLayout(): BoardLayout {
  const [layout, setLayout] = useState<BoardLayout>("desktop");
  useEffect(() => {
    const media = window.matchMedia("(max-width: 719px)");
    const update = () => setLayout(media.matches ? "mobile" : "desktop");
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return layout;
}

function edgeState(kind: string): string {
  if (kind === "live" || kind === "pivot-live") {
    return "active";
  }
  if (kind === "history-block") {
    return "held";
  }
  if (kind === "history-limited") {
    return "limited";
  }
  if (kind === "history") {
    return "exposed";
  }
  if (kind === "pivot") {
    return "pivot";
  }
  return "idle";
}

function pathHasHop(path: readonly MapNodeId[], from: MapNodeId, to: MapNodeId): boolean {
  for (let index = 1; index < path.length; index += 1) {
    const a = path[index - 1];
    const b = path[index];
    if ((a === from && b === to) || (a === to && b === from)) {
      return true;
    }
  }
  return false;
}

function nodeCaption(status: NodeVisualStatus | undefined, kind: NodeKind): { state: string; caption: string } {
  if (status === "blocked" || status === "history-block") {
    return { state: "held", caption: "Blocked" };
  }
  if (status === "entry" || status === "attack") {
    return { state: "active", caption: "Active attack" };
  }
  if (status === "success" || status === "history-hit") {
    return { state: "exposed", caption: "Exposed" };
  }
  if (status === "partial" || status === "history-partial") {
    return { state: "limited", caption: "Limited" };
  }
  if (kind === "actor") {
    return { state: "idle", caption: "External actor" };
  }
  if (kind === "asset") {
    return { state: "idle", caption: "Protected asset" };
  }
  if (kind === "system") {
    return { state: "idle", caption: "System" };
  }
  return { state: "idle", caption: "Control" };
}

export function ArchitectureMap({
  choices,
  previewOptionId,
  simulation,
  revealedStageCount = 0,
  attackBeat = 0,
  phase = "review",
  selectedNodeId,
  onSelectNode,
  compact = false,
  inspectable = true,
  layout: layoutProp,
  focusedStageId,
  reducedMotion = false,
  paused = false,
}: {
  choices: LabChoices;
  previewOptionId?: OptionId | null;
  simulation?: AttackSimulation | null;
  revealedStageCount?: number;
  attackBeat?: number;
  phase?: LabPhase;
  selectedNodeId?: MapNodeId | null;
  onSelectNode?: (id: MapNodeId) => void;
  compact?: boolean;
  inspectable?: boolean;
  layout?: BoardLayout;
  focusedStageId?: string | null;
  reducedMotion?: boolean;
  paused?: boolean;
}) {
  const detected = useBoardLayout();
  const layout = layoutProp ?? detected;
  const visual = deriveBoardVisual({
    choices,
    previewOptionId,
    simulation: simulation ?? null,
    revealedStageCount,
    attackBeat,
    phase,
  });
  const visible = new Set(visual.visible);
  const focused = focusedStageId ? simulation?.stages.find((item) => item.id === focusedStageId) : null;
  const inspectNode = selectedNodeId ? LAB_MISSION.nodes.find((item) => item.id === selectedNodeId) : null;
  const inspectChoice = inspectNode?.decisionId ? optionForChoice(choices, inspectNode.decisionId) : null;
  const inspectTechnique = inspectNode
    ? LAB_MISSION.techniques.find(
        (item) =>
          item.primaryDecisionId === inspectNode.decisionId ||
          item.influencingDecisionIds.some((id) => id === inspectNode.decisionId) ||
          item.path.includes(inspectNode.id),
      )
    : null;
  const liveEdge = visual.edges.find((item) => item.kind === "live");
  const liveFrom = liveEdge ? LAB_MISSION.nodes.find((item) => item.id === liveEdge.from) : null;
  const liveTo = liveEdge ? LAB_MISSION.nodes.find((item) => item.id === liveEdge.to) : null;
  const motionPath = liveFrom && liveTo ? edgePath(liveFrom, liveTo, layout) : null;

  return (
    <div className="lab-map-wrap">
    <div
      className={["lab-map", "architecture-canvas", compact ? "lab-map--compact" : "", `lab-map--${layout}`].filter(Boolean).join(" ")}
      aria-label="Nordic Shield claims architecture"
    >
      <div className="lab-map__zones" aria-hidden="true">
        {LAB_ZONE_LABELS.map((zone) => (
          <span key={zone.id} className={`lab-zone lab-zone--${zone.id}`}>
            {zone.label}
          </span>
        ))}
      </div>
      <svg className="lab-map__edges architecture-edges" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
        {visual.edges.map((edge) => {
          const from = LAB_MISSION.nodes.find((item) => item.id === edge.from);
          const to = LAB_MISSION.nodes.find((item) => item.id === edge.to);
          if (!from || !to) {
            return null;
          }
          const focusedEdge = focused ? pathHasHop(focused.travelledPath, edge.from, edge.to) : false;
          const state = focused && !focusedEdge ? "idle" : edgeState(edge.kind);
          return (
            <path
              key={edge.id}
              data-edge-id={edge.id}
              data-state={state}
              d={edgePath(from, to, layout)}
              className={["lab-map__edge", "architecture-edge", `is-${edge.kind}`].join(" ")}
            />
          );
        })}
        {motionPath && visual.markerMoving && !paused && !reducedMotion ? (
          <circle r="7" className="lab-signal-svg" data-testid="lab-signal">
            <animateMotion key={liveEdge?.id ?? motionPath} dur="1.1s" fill="freeze" path={motionPath} />
          </circle>
        ) : null}
      </svg>
      {LAB_MISSION.nodes.map((node) => {
        if (!visible.has(node.id)) {
          return null;
        }
        const choice = node.decisionId ? optionForChoice(choices, node.decisionId) : null;
        const point = nodePoint(node, layout);
        const status = visual.nodeStatus[node.id];
        const previewOption =
          visual.enteringNode === node.id && previewOptionId
            ? LAB_MISSION.decisions.flatMap((item) => [...item.options]).find((item) => item.id === previewOptionId)
            : null;
        const weak = (previewOption ?? choice)?.strength === "weak";
        const label = nodeLabel(choices, node.id, previewOptionId);
        const icon = previewOption?.icon ?? choice?.icon ?? node.icon;
        const mapped = nodeCaption(status, node.kind);
        const dimmed = focused ? !focused.travelledPath.includes(node.id) && focused.stopNode !== node.id && focused.responsibleNode !== node.id : false;
        const nodeState = dimmed ? "idle" : mapped.state;
        const className = [
          "lab-node",
          "architecture-node",
          `lab-node--${node.kind}`,
          `architecture-node--${node.kind}`,
          weak ? "is-weak" : "",
          visual.enteringNode === node.id || visual.affectedNodes.includes(node.id) ? "is-entering" : "",
          selectedNodeId === node.id ? "is-selected" : "",
          dimmed ? "is-dimmed" : "",
          nodeState !== "idle" ? `is-${nodeState}` : "",
          status && status !== "idle" ? `is-${status}` : "",
        ]
          .filter(Boolean)
          .join(" ");
        const body = (
          <>
            <span className="architecture-node__domain">
              {node.kind === "actor" ? "Actor" : node.kind === "asset" ? "Asset" : node.kind === "system" ? "System" : "Control"}
            </span>
            <LabIcon name={icon} />
            <strong>{label}</strong>
            <span className="architecture-node__caption">{mapped.caption}</span>
          </>
        );
        const style = { left: `${point.x}%`, top: `${point.y}%` };
        if (inspectable && onSelectNode) {
          return (
            <button
              key={node.id}
              type="button"
              className={className}
              data-node-id={node.id}
              data-state={nodeState}
              style={style}
              aria-label={`${label}. ${mapped.caption}. ${choice?.tradeOff ?? node.description}`}
              onClick={() => onSelectNode(node.id)}
            >
              {body}
            </button>
          );
        }
        return (
          <div key={node.id} className={className} data-node-id={node.id} data-state={nodeState} style={style}>
            {body}
          </div>
        );
      })}
      {visual.stopBadge
        ? (() => {
            const stop = LAB_MISSION.nodes.find((item) => item.id === visual.stopBadge?.nodeId);
            if (!stop || !visual.stopBadge) {
              return null;
            }
            const point = nodePoint(stop, layout);
            return (
              <span className={`lab-stop is-${visual.stopBadge.label.toLowerCase()}`} style={{ left: `${point.x}%`, top: `${point.y}%` }}>
                {visual.stopBadge.label}
              </span>
            );
          })()
        : null}
      {visual.pivotBanner ? (
        <p className="lab-pivot-banner" role="status">
          Blocked — Red Team changes technique
        </p>
      ) : null}
    </div>
      {inspectNode && inspectable ? (
        <article className="lab-node-pop lab-node-pop--below" aria-live="polite">
          <p className="lab-kicker">{inspectNode.name}</p>
          <h2>{inspectChoice?.title ?? inspectNode.name}</h2>
          <p>{inspectChoice?.tradeOff ?? inspectNode.description}</p>
          {inspectTechnique ? <p>Tested by {inspectTechnique.name}.</p> : null}
        </article>
      ) : null}
    </div>
  );
}
