"use client";

import { LabIcon } from "@/components/lab/LabIcon";
import type { ArchitectureOption } from "@/lib/lab/types";
import type { DecisionSubgraph, SubgraphEdge, SubgraphOutcome } from "@/lib/lab/subgraphs";

export function LocalImpactGraph({
  subgraph,
  option,
  outcome,
}: {
  subgraph: DecisionSubgraph;
  option: ArchitectureOption | null;
  outcome: SubgraphOutcome | null;
}) {
  return (
    <div className="local-impact" aria-label={`${subgraph.domain} architecture slice`}>
      <ol className="local-impact__route">
        {subgraph.nodes.map((item) => {
          const view = nodeView(subgraph, item.id, item.kind, option, outcome);
          return (
            <li
              key={`route-${item.id}`}
              className={`architecture-node architecture-node--${item.kind} is-${view.state}`}
              data-node-id={item.id}
              data-state={view.state}
            >
              <LabIcon name={iconFor(item.kind, item.id === subgraph.controlNodeId)} />
              <strong>{view.title}</strong>
              <span className="architecture-node__caption">{view.caption}</span>
            </li>
          );
        })}
      </ol>
      <div className="local-impact__canvas">
        <svg className="local-impact__edges architecture-edges" viewBox="0 0 1000 280" preserveAspectRatio="none" aria-hidden="true">
          {subgraph.edges.map((item) => (
            <path
              key={item.id}
              data-edge-id={item.id}
              data-state={edgeState(item, subgraph, outcome)}
              d={item.path}
              className="architecture-edge"
            />
          ))}
        </svg>
        {subgraph.nodes.map((item) => {
          const view = nodeView(subgraph, item.id, item.kind, option, outcome);
          return (
            <div
              key={item.id}
              className={`architecture-node architecture-node--${item.kind} is-${view.state}`}
              data-node-id={item.id}
              data-state={view.state}
              style={{ left: `${item.x / 10}%`, top: `${item.y / 2.8}%` }}
            >
              <LabIcon name={iconFor(item.kind, item.id === subgraph.controlNodeId)} />
              <strong>{view.title}</strong>
              <span className="architecture-node__caption">{view.caption}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function nodeView(
  subgraph: DecisionSubgraph,
  id: string,
  kind: string,
  option: ArchitectureOption | null,
  outcome: SubgraphOutcome | null,
): { state: string; caption: string; title: string } {
  const isControl = id === subgraph.controlNodeId;
  const isDownstream = subgraph.downstreamNodeIds.includes(id);
  const title = isControl && option ? option.mapTitle : subgraph.nodes.find((item) => item.id === id)?.label ?? id;
  if (!outcome) {
    return {
      state: "idle",
      caption: kind === "source" ? "Attack" : kind === "asset" ? "Protected asset" : isControl ? "Control" : "System",
      title,
    };
  }
  if (isControl) {
    return { state: outcome.controlStatus === "held" ? "held" : "exposed", caption: outcome.controlLabel, title };
  }
  if (isDownstream) {
    return {
      state: outcome.controlStatus === "held" ? "muted" : "active",
      caption: outcome.downstreamLabel,
      title,
    };
  }
  if (kind === "source") {
    return { state: "active", caption: "Active attack", title };
  }
  return { state: "idle", caption: "System", title };
}

function edgeState(item: SubgraphEdge, subgraph: DecisionSubgraph, outcome: SubgraphOutcome | null): string {
  if (!outcome) {
    return "idle";
  }
  if (outcome.controlStatus === "held") {
    return item.to === subgraph.controlNodeId ? "held" : "muted";
  }
  return "active";
}

function iconFor(kind: string, isControl: boolean): string {
  if (kind === "source") {
    return "bolt";
  }
  if (kind === "asset") {
    return "database";
  }
  if (isControl) {
    return "shield";
  }
  return "cpu";
}
