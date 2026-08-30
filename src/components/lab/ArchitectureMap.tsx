"use client";

import { useEffect, useState } from "react";
import { LabIcon } from "@/components/lab/LabIcon";
import { LAB_MISSION, optionForChoice } from "@/lib/lab/catalog";
import { deriveBoardVisual, nodeLabel, type NodeVisualStatus } from "@/lib/lab/animation";
import { CONTROL_STATUS_LABELS, SYSTEM_STATUS_LABELS } from "@/lib/lab/copy";
import {
  BADGE_NODE_IDS,
  LAB_ZONE_LABELS,
  PRIMARY_SYSTEM_IDS,
  SIEM_NODE_ID,
  edgePath,
  nodePoint,
  type BoardLayout,
} from "@/lib/lab/map-layout";
import type {
  AttackSimulation,
  ControlStatus,
  LabChoices,
  LabPhase,
  MapNodeId,
  OptionId,
  SystemStatus,
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
  if (kind === "live") {
    return "active";
  }
  if (kind === "history-block") {
    return "held";
  }
  if (kind === "history-limited") {
    return "limited";
  }
  if (kind === "history-detected") {
    return "detected";
  }
  if (kind === "history") {
    return "exposed";
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

function systemCaption(status: SystemStatus | undefined): string {
  return SYSTEM_STATUS_LABELS[status ?? "normal"];
}

function controlCaption(status: ControlStatus | undefined, visual: NodeVisualStatus | undefined): string {
  if (status) {
    return CONTROL_STATUS_LABELS[status];
  }
  if (visual === "blocked" || visual === "history-block") {
    return CONTROL_STATUS_LABELS.effective;
  }
  if (visual === "success" || visual === "history-hit") {
    return CONTROL_STATUS_LABELS.bypassed;
  }
  if (visual === "partial" || visual === "history-partial" || visual === "detected") {
    return CONTROL_STATUS_LABELS.triggered;
  }
  return CONTROL_STATUS_LABELS.active;
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
  const network = optionForChoice(choices, "network");
  const segmentation = network?.strength === "strong" ? "segmented" : network?.strength === "weak" ? "flat" : network ? "partial" : "unset";
  const privilege = optionForChoice(choices, "data-access") ?? (
    previewOptionId
      ? LAB_MISSION.decisions.flatMap((item) => [...item.options]).find((item) => item.id === previewOptionId && item.decisionId === "data-access")
      : null
  );
  const siemVisible = visible.has(SIEM_NODE_ID);
  const siemChoice = optionForChoice(choices, "detection");
  const siemStatus = visual.controlStatus.detection ?? (visual.nodeStatus.detection === "detected" ? "effective" : "active");

  return (
    <div className="lab-map-wrap">
    <div
      className={[
        "lab-map",
        "architecture-canvas",
        compact ? "lab-map--compact" : "",
        `lab-map--${layout}`,
        `is-${segmentation}`,
      ].filter(Boolean).join(" ")}
      aria-label="Nordic Shield claims architecture"
    >
      <div className="lab-map__zones" aria-hidden="true">
        {LAB_ZONE_LABELS.map((zone) => (
          <span key={zone.id} className={`lab-zone-band lab-zone-band--${zone.id}`}>
            <span className="lab-zone-band__label">{zone.label}</span>
            {zone.id === "application" && network ? <span className="lab-zone-band__note">{network.mapTitle}</span> : null}
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
          const unusedDuringFocus = Boolean(focused) && !focusedEdge;
          const state = unusedDuringFocus ? "idle" : edgeState(edge.kind);
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
        {siemVisible ? (
          <path
            className="lab-siem-line"
            data-state={visual.nodeStatus.detection === "detected" || visual.nodeStatus.detection === "partial" ? "detected" : "idle"}
            d={layout === "mobile" ? "M 180 560 L 820 560" : "M 80 520 L 920 520"}
          />
        ) : null}
        {motionPath && visual.markerMoving && !paused && !reducedMotion ? (
          <circle r="7" className="lab-signal-svg" data-testid="lab-signal">
            <animateMotion key={liveEdge?.id ?? motionPath} dur="1.1s" fill="freeze" path={motionPath} />
          </circle>
        ) : null}
      </svg>
      {PRIMARY_SYSTEM_IDS.map((id) => {
        const node = LAB_MISSION.nodes.find((item) => item.id === id);
        if (!node || !visible.has(id)) {
          return null;
        }
        const choice = node.decisionId ? optionForChoice(choices, node.decisionId) : null;
        const point = nodePoint(node, layout);
        const status = visual.nodeStatus[node.id];
        const sys = visual.systemStatus[node.id] ?? "normal";
        const dimmed = focused
          ? !focused.travelledPath.includes(node.id) && focused.stopNode !== node.id && focused.responsibleNode !== node.id
          : false;
        const className = [
          "lab-node",
          "architecture-node",
          `lab-node--${node.kind}`,
          `architecture-node--${node.kind}`,
          visual.enteringNode === node.id || visual.affectedNodes.includes(node.id) ? "is-entering" : "",
          selectedNodeId === node.id ? "is-selected" : "",
          dimmed ? "is-dimmed" : "",
          sys !== "normal" ? `is-${sys}` : "",
          status && status !== "idle" ? `is-${status}` : "",
        ]
          .filter(Boolean)
          .join(" ");
        const caption = systemCaption(sys);
        const label = nodeLabel(choices, node.id, previewOptionId);
        const body = (
          <>
            <span className="architecture-node__domain">{node.kind === "actor" ? "Actor" : node.kind === "asset" ? "Asset" : "System"}</span>
            <LabIcon name={node.icon} />
            <strong>{label}</strong>
            <span className="architecture-node__caption">{caption}</span>
            {id === "api" && privilege ? (
              <span className="lab-inline-badge" data-node-id="api-privilege">
                {privilege.mapTitle}
              </span>
            ) : null}
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
              data-state={sys === "compromised" || sys === "impacted" || sys === "reached" ? "active" : sys === "protected" || sys === "contained" ? "held" : "idle"}
              style={style}
              aria-label={`${label}. ${caption}. ${choice?.tradeOff ?? node.description}`}
              onClick={() => onSelectNode(node.id)}
            >
              {body}
            </button>
          );
        }
        return (
          <div key={node.id} className={className} data-node-id={node.id} data-state={sys === "compromised" || sys === "impacted" || sys === "reached" ? "active" : sys === "protected" || sys === "contained" ? "held" : "idle"} style={style}>
            {body}
          </div>
        );
      })}
      {BADGE_NODE_IDS.map((id) => {
        const node = LAB_MISSION.nodes.find((item) => item.id === id);
        if (!node || !visible.has(id)) {
          return null;
        }
        const choice = node.decisionId ? optionForChoice(choices, node.decisionId) : null;
        const point = nodePoint(node, layout);
        const status = visual.nodeStatus[node.id];
        const control = visual.controlStatus[node.id];
        const previewOption =
          visual.enteringNode === node.id && previewOptionId
            ? LAB_MISSION.decisions.flatMap((item) => [...item.options]).find((item) => item.id === previewOptionId)
            : null;
        const weak = (previewOption ?? choice)?.strength === "weak";
        const label = nodeLabel(choices, node.id, previewOptionId);
        const icon = previewOption?.icon ?? choice?.icon ?? node.icon;
        const caption = controlCaption(control, status);
        const dimmed = focused
          ? focused.responsibleNode !== node.id && !focused.travelledPath.includes(node.id)
          : false;
        const className = [
          "lab-badge",
          weak ? "is-weak" : "",
          visual.enteringNode === node.id || visual.affectedNodes.includes(node.id) ? "is-entering" : "",
          selectedNodeId === node.id ? "is-selected" : "",
          dimmed ? "is-dimmed" : "",
          control ? `is-${control}` : "",
          status && status !== "idle" ? `is-${status}` : "",
        ]
          .filter(Boolean)
          .join(" ");
        const style = { left: `${point.x}%`, top: `${point.y}%` };
        const body = (
          <>
            <LabIcon name={icon} />
            <strong>{label}</strong>
            <span>{caption}</span>
          </>
        );
        if (inspectable && onSelectNode) {
          return (
            <button
              key={node.id}
              type="button"
              className={className}
              data-node-id={node.id}
              data-state={control === "effective" ? "held" : control === "failed" || control === "bypassed" ? "exposed" : control === "triggered" ? "limited" : "idle"}
              style={style}
              aria-label={`${label}. ${caption}. ${choice?.tradeOff ?? node.description}`}
              onClick={() => onSelectNode(node.id)}
            >
              {body}
            </button>
          );
        }
        return (
          <div key={node.id} className={className} data-node-id={node.id} data-state={control === "effective" ? "held" : control === "failed" || control === "bypassed" ? "exposed" : control === "triggered" ? "limited" : "idle"} style={style}>
            {body}
          </div>
        );
      })}
      {siemVisible ? (
        <div
          className={["lab-siem", visual.nodeStatus.detection === "detected" ? "is-detected" : ""].filter(Boolean).join(" ")}
          data-node-id="detection"
          data-state={siemStatus === "effective" ? "detected" : "idle"}
          style={{ left: `${nodePoint(LAB_MISSION.nodes.find((item) => item.id === "detection")!, layout).x}%`, top: `${nodePoint(LAB_MISSION.nodes.find((item) => item.id === "detection")!, layout).y}%` }}
        >
          <span className="architecture-node__domain">Monitoring</span>
          <LabIcon name={siemChoice?.icon ?? "radar"} />
          <strong>{siemChoice?.mapTitle ?? "SIEM"}</strong>
          <span>{CONTROL_STATUS_LABELS[siemStatus]}</span>
        </div>
      ) : null}
      {visual.stopBadge
        ? (() => {
            const stop = LAB_MISSION.nodes.find((item) => item.id === visual.stopBadge?.nodeId);
            if (!stop || !visual.stopBadge) {
              return null;
            }
            const point = nodePoint(stop, layout);
            return (
              <span className={`lab-stop is-${visual.stopBadge.label.toLowerCase().replace(" ", "-")}`} style={{ left: `${point.x}%`, top: `${point.y}%` }}>
                {visual.stopBadge.label}
              </span>
            );
          })()
        : null}
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
