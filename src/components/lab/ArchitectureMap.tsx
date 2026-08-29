"use client";

import { useEffect, useState } from "react";
import { LabIcon } from "@/components/lab/LabIcon";
import { LAB_MISSION, optionForChoice } from "@/lib/lab/catalog";
import { deriveBoardVisual, nodeLabel } from "@/lib/lab/animation";
import { LAB_ZONE_LABELS, edgeEndpoints, nodePoint, type BoardLayout } from "@/lib/lab/map-layout";
import type {
  AttackSimulation,
  LabChoices,
  LabPhase,
  MapNodeId,
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

export function ArchitectureMap({
  choices,
  previewOptionId,
  simulation,
  revealedStageCount = 0,
  attackBeat = 0,
  phase = "decide",
  selectedNodeId,
  onSelectNode,
  compact = false,
  inspectable = true,
  layout: layoutProp,
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
  const marker = visual.markerNode ? LAB_MISSION.nodes.find((item) => item.id === visual.markerNode) : null;
  const markerPoint = marker ? nodePoint(marker, layout) : null;
  const inspectNode = selectedNodeId ? LAB_MISSION.nodes.find((item) => item.id === selectedNodeId) : null;
  const inspectChoice = inspectNode?.decisionId ? optionForChoice(choices, inspectNode.decisionId) : null;
  const inspectTechnique = inspectNode?.decisionId
    ? LAB_MISSION.techniques.find((item) => item.checks.some((check) => check.decisionId === inspectNode.decisionId))
    : null;

  return (
    <div
      className={["lab-map", compact ? "lab-map--compact" : "", `lab-map--${layout}`].filter(Boolean).join(" ")}
      aria-label="Nordic Shield claims AI architecture"
    >
      <div className="lab-map__zones" aria-hidden="true">
        {LAB_ZONE_LABELS.map((zone) => (
          <span key={zone.id} className={`lab-zone lab-zone--${zone.id}`}>
            {zone.label}
          </span>
        ))}
      </div>
      <svg className="lab-map__edges" viewBox="0 0 100 100" preserveAspectRatio="none" role="presentation">
        {visual.edges.map((edge) => {
          const from = LAB_MISSION.nodes.find((item) => item.id === edge.from);
          const to = LAB_MISSION.nodes.find((item) => item.id === edge.to);
          if (!from || !to) {
            return null;
          }
          const line = edgeEndpoints(from, to, layout);
          const pivot = edge.kind === "pivot" || edge.kind === "pivot-live";
          return (
            <line
              key={edge.id}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className={["lab-map__edge", `is-${edge.kind}`].join(" ")}
              strokeDasharray={pivot ? "1.8 1.4" : undefined}
            />
          );
        })}
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
        const className = [
          "lab-node",
          `lab-node--${node.kind}`,
          weak ? "is-weak" : "",
          visual.enteringNode === node.id ? "is-entering" : "",
          selectedNodeId === node.id ? "is-selected" : "",
          status && status !== "idle" ? `is-${status}` : "",
        ]
          .filter(Boolean)
          .join(" ");
        const body = (
          <>
            <LabIcon name={icon} />
            <strong>{label}</strong>
            <span className="lab-node__status" aria-hidden="true" />
          </>
        );
        const style = { left: `${point.x}%`, top: `${point.y}%` };
        if (inspectable && onSelectNode) {
          return (
            <button
              key={node.id}
              type="button"
              className={className}
              style={style}
              aria-label={`${label}. ${choice?.tradeOff ?? node.description}`}
              onClick={() => onSelectNode(node.id)}
            >
              {body}
            </button>
          );
        }
        return (
          <div key={node.id} className={className} style={style}>
            {body}
          </div>
        );
      })}
      {visual.markerVisible && markerPoint ? (
        <span
          className={["lab-signal", visual.markerMoving ? "is-moving" : "is-appear"].filter(Boolean).join(" ")}
          style={{ left: `${markerPoint.x}%`, top: `${markerPoint.y}%` }}
          aria-hidden="true"
        />
      ) : null}
      {visual.stopBadge
        ? (() => {
            const stop = LAB_MISSION.nodes.find((item) => item.id === visual.stopBadge?.nodeId);
            if (!stop || !visual.stopBadge) {
              return null;
            }
            const point = nodePoint(stop, layout);
            return (
              <span
                className={`lab-stop is-${visual.stopBadge.label.toLowerCase()}`}
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              >
                {visual.stopBadge.label}
              </span>
            );
          })()
        : null}
      {visual.pivotBanner ? (
        <p className="lab-pivot-banner" role="status">
          Red Team pivots
        </p>
      ) : null}
      {inspectNode && inspectable ? (
        <article className="lab-node-pop" aria-live="polite">
          <p className="lab-kicker">{inspectNode.name}</p>
          <h2>{inspectChoice?.title ?? inspectNode.name}</h2>
          <p>{inspectChoice?.tradeOff ?? inspectNode.description}</p>
          {inspectTechnique ? <p>Tested by {inspectTechnique.name}.</p> : null}
        </article>
      ) : null}
    </div>
  );
}
