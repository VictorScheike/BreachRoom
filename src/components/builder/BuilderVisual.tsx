import type { BuilderVisual, BuilderVisualNode } from "@/lib/builder/types";

function nodeClass(node: BuilderVisualNode, extra = ""): string {
  return [
    "builder-node",
    extra,
    node.highlight ? "is-highlight" : "",
    node.warning ? "is-warning" : "",
    node.blocked ? "is-blocked" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function NodeCard({ node }: { node: BuilderVisualNode }) {
  return (
    <div className={nodeClass(node)}>
      <strong>{node.label}</strong>
      {node.detail ? <span>{node.detail}</span> : null}
    </div>
  );
}

function Flow({ nodes, arrow = "→" }: { nodes: readonly BuilderVisualNode[]; arrow?: string }) {
  return (
    <ol className="builder-flow">
      {nodes.map((node, index) => (
        <li key={node.id}>
          {index > 0 ? <span className="builder-flow__arrow" aria-hidden="true">{arrow}</span> : null}
          <NodeCard node={node} />
        </li>
      ))}
    </ol>
  );
}

export function BuilderVisual({ visual }: { visual: BuilderVisual }) {
  return (
    <aside className={`builder-visual is-${visual.kind}`} aria-label={visual.title}>
      <p className="builder-kicker">{visual.title}</p>
      {visual.kind === "classification" ? (
        <ol className="builder-stack">
          {visual.nodes.map((node) => (
            <li key={node.id} className={nodeClass(node, "builder-stack__item")}>
              <strong>{node.label}</strong>
              {node.detail ? <span>{node.detail}</span> : null}
            </li>
          ))}
        </ol>
      ) : visual.kind === "funnel" ? (
        <div className="builder-funnel">
          {visual.nodes.map((node) => (
            <div key={node.id} className={nodeClass(node, "builder-funnel__item")}>
              <strong>{node.label}</strong>
            </div>
          ))}
        </div>
      ) : visual.kind === "role-matrix" ? (
        <ul className="builder-matrix">
          {visual.nodes.map((node) => (
            <li key={node.id} className={nodeClass(node)}>
              <strong>{node.label}</strong>
              {node.detail ? <span>{node.detail}</span> : null}
            </li>
          ))}
        </ul>
      ) : visual.kind === "cloud-storage" ? (
        <div className="builder-compare">
          {visual.nodes.map((node) => (
            <NodeCard key={node.id} node={node} />
          ))}
        </div>
      ) : visual.kind === "human-review" ? (
        <div className="builder-review-visual">
          <Flow nodes={visual.nodes.filter((node) => node.id !== "log")} />
          {visual.nodes
            .filter((node) => node.id === "log")
            .map((node) => (
              <div key={node.id} className={nodeClass(node, "builder-log")}>
                <strong>{node.label}</strong>
                {node.detail ? <span>{node.detail}</span> : null}
              </div>
            ))}
        </div>
      ) : visual.kind === "lifecycle" ? (
        <div className="builder-loop">
          <Flow nodes={visual.nodes} arrow="→" />
          <p className="builder-loop__note">Then improve and repeat.</p>
        </div>
      ) : visual.kind === "context-cards" ? (
        <ul className="builder-context">
          {visual.nodes.map((node) => (
            <li key={node.id} className={nodeClass(node)}>
              {node.label}
            </li>
          ))}
        </ul>
      ) : (
        <Flow nodes={visual.nodes} />
      )}
    </aside>
  );
}
