"use client";

import { optionForChoice } from "@/lib/lab/catalog";
import { LAB_MISSION } from "@/lib/lab/catalog";
import type {
  AttackSimulation,
  LabChoices,
  MapNodeId,
  OptionId,
} from "@/lib/lab/types";

function nodeCenter(column: number, row: number): { x: number; y: number } {
  return { x: 100 + column * 200, y: 90 + row * 180 };
}

export function ArchitectureMap({
  choices,
  previewOptionId,
  simulation,
  revealedStageCount,
  selectedNodeId,
  onSelectNode,
  compact = false,
  inspectable = true,
}: {
  choices: LabChoices;
  previewOptionId?: OptionId | null;
  simulation?: AttackSimulation | null;
  revealedStageCount?: number;
  selectedNodeId?: MapNodeId | null;
  onSelectNode?: (id: MapNodeId) => void;
  compact?: boolean;
  inspectable?: boolean;
}) {
  const revealed = simulation && revealedStageCount && revealedStageCount > 0
    ? simulation.stages.slice(0, revealedStageCount)
    : [];
  const active = revealed[revealed.length - 1] ?? null;
  const preview = previewOptionId ? previewOptionId : null;

  const visible = new Set<MapNodeId>(["portal", "app", "database"]);
  for (const node of LAB_MISSION.nodes) {
    if (node.decisionId && choices[node.decisionId]) {
      visible.add(node.id);
    }
  }
  if (preview) {
    const option = LAB_MISSION.decisions.flatMap((item) => [...item.options]).find((item) => item.id === preview);
    if (option) {
      const node = LAB_MISSION.nodes.find((item) => item.decisionId === option.decisionId);
      if (node) {
        visible.add(node.id);
      }
    }
  }

  const nodeStatus = (id: MapNodeId): string => {
    if (!active) {
      return "";
    }
    if (active.stopNode === id && active.blocked) {
      if (active.outcome === "partial") {
        return "is-partial";
      }
      if (active.outcome === "detected") {
        return "is-held";
      }
      return "is-held";
    }
    if (active.stopNode === id && !active.blocked) {
      return "is-attack";
    }
    if (active.travelledPath.includes(id) && active.travelledPath[active.travelledPath.length - 1] !== id) {
      return active.blocked ? "is-route" : "is-route-hit";
    }
    return "";
  };

  return (
    <div className={compact ? "lab-map lab-map--compact" : "lab-map"} aria-label="Nordic Shield claims AI architecture">
      <svg className="lab-map__edges" viewBox="0 0 1000 560" role="presentation">
        {LAB_MISSION.edges.map((edge) => {
          if (!visible.has(edge.from) || !visible.has(edge.to)) {
            return null;
          }
          const from = LAB_MISSION.nodes.find((item) => item.id === edge.from);
          const to = LAB_MISSION.nodes.find((item) => item.id === edge.to);
          if (!from || !to) {
            return null;
          }
          const a = nodeCenter(from.column, from.row);
          const b = nodeCenter(to.column, to.row);
          const live = Boolean(
            active &&
              active.travelledPath.includes(edge.from) &&
              active.travelledPath.includes(edge.to),
          );
          const pivot = Boolean(active?.isPivot && live);
          return (
            <line
              key={edge.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className={["lab-map__edge", live ? "is-live" : "", pivot ? "is-pivot" : ""].filter(Boolean).join(" ")}
            />
          );
        })}
      </svg>
      <div className="lab-map__grid">
        {LAB_MISSION.nodes.map((node) => {
          if (!visible.has(node.id)) {
            return <div key={node.id} className="lab-map__cell" style={{ gridColumn: node.column + 1, gridRow: node.row + 1 }} />;
          }
          const choice = node.decisionId ? optionForChoice(choices, node.decisionId) : null;
          const entering = preview && choice === null && node.decisionId
            ? LAB_MISSION.decisions.find((item) => item.id === node.decisionId)?.options.some((item) => item.id === preview)
            : false;
          const previewOption = entering
            ? LAB_MISSION.decisions.flatMap((item) => [...item.options]).find((item) => item.id === preview)
            : null;
          const status = nodeStatus(node.id);
          const weak = choice?.strength === "weak";
          const title = previewOption?.mapTitle ?? choice?.mapTitle ?? node.name;
          const detail = previewOption?.mapDetail ?? choice?.mapDetail ?? node.description;
          const className = [
            "lab-node",
            `lab-node--${node.kind}`,
            weak ? "is-weak" : "",
            entering ? "is-entering" : "",
            selectedNodeId === node.id ? "is-selected" : "",
            status,
          ]
            .filter(Boolean)
            .join(" ");
          const body = (
            <>
              <span className="lab-node__kind">
                {node.kind === "asset" ? "Protected asset" : node.kind === "core" ? "Core system" : "Control"}
              </span>
              <strong>{node.name}</strong>
              <span className="lab-node__choice">{title}</span>
              <span className="lab-node__detail">{detail}</span>
            </>
          );
          return (
            <div key={node.id} className="lab-map__cell" style={{ gridColumn: node.column + 1, gridRow: node.row + 1 }}>
              {inspectable && onSelectNode ? (
                <button
                  type="button"
                  className={className}
                  aria-label={`${node.name}. ${title}. ${detail}`}
                  onClick={() => onSelectNode(node.id)}
                >
                  {body}
                </button>
              ) : (
                <div className={className}>{body}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
