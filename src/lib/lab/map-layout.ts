import type { BoardZoneId, MapEdgeDefinition, MapNodeDefinition, MapNodeId, NodeKind } from "./types";

export const LAB_NODES: readonly MapNodeDefinition[] = [
  {
    id: "portal",
    name: "Claims Portal",
    kind: "core",
    decisionId: null,
    description: "Staff login and document upload.",
    icon: "portal",
    zone: "user-input",
    x: 14,
    y: 42,
    mobileX: 50,
    mobileY: 16,
  },
  {
    id: "identity",
    name: "Identity",
    kind: "control",
    decisionId: "identity",
    description: "Who can sign in, and with what proof.",
    icon: "shield",
    zone: "user-input",
    x: 14,
    y: 16,
    mobileX: 50,
    mobileY: 6,
  },
  {
    id: "input",
    name: "Document Upload",
    kind: "control",
    decisionId: "input",
    description: "What happens to a claims file before the AI reads it.",
    icon: "file",
    zone: "user-input",
    x: 14,
    y: 68,
    mobileX: 50,
    mobileY: 26,
  },
  {
    id: "app",
    name: "AI Claims App",
    kind: "core",
    decisionId: null,
    description: "Summarises cases and drafts replies.",
    icon: "cpu",
    zone: "ai-services",
    x: 40,
    y: 42,
    mobileX: 50,
    mobileY: 40,
  },
  {
    id: "model",
    name: "AI Model",
    kind: "control",
    decisionId: "model",
    description: "Where prompts are processed.",
    icon: "cpu",
    zone: "ai-services",
    x: 40,
    y: 16,
    mobileX: 24,
    mobileY: 50,
  },
  {
    id: "retrieval",
    name: "Retrieval",
    kind: "control",
    decisionId: "retrieval",
    description: "What the model is allowed to search.",
    icon: "lock",
    zone: "ai-services",
    x: 57,
    y: 20,
    mobileX: 76,
    mobileY: 50,
  },
  {
    id: "secrets",
    name: "Managed Identity",
    kind: "control",
    decisionId: "secrets",
    description: "How the app proves itself to internal services.",
    icon: "vault",
    zone: "ai-services",
    x: 57,
    y: 42,
    mobileX: 50,
    mobileY: 60,
  },
  {
    id: "supply-chain",
    name: "Signed Builds",
    kind: "control",
    decisionId: "supply-chain",
    description: "How code and dependencies reach production.",
    icon: "pipeline",
    zone: "ai-services",
    x: 40,
    y: 68,
    mobileX: 24,
    mobileY: 70,
  },
  {
    id: "data-access",
    name: "Claims API",
    kind: "control",
    decisionId: "data-access",
    description: "What the assistant may read or change.",
    icon: "lock",
    zone: "protected",
    x: 75,
    y: 30,
    mobileX: 50,
    mobileY: 76,
  },
  {
    id: "database",
    name: "Claims Database",
    kind: "asset",
    decisionId: null,
    description: "Customer and payout data.",
    icon: "database",
    zone: "protected",
    x: 90,
    y: 42,
    mobileX: 50,
    mobileY: 86,
  },
  {
    id: "oversight",
    name: "Human Approval",
    kind: "control",
    decisionId: "oversight",
    description: "Who can turn a draft into a payout.",
    icon: "person",
    zone: "protected",
    x: 90,
    y: 68,
    mobileX: 24,
    mobileY: 94,
  },
  {
    id: "network",
    name: "Network Segmentation",
    kind: "control",
    decisionId: "network",
    description: "How AI services reach the rest of the estate.",
    icon: "network",
    zone: "secops",
    x: 26,
    y: 88,
    mobileX: 76,
    mobileY: 70,
  },
  {
    id: "detection",
    name: "SIEM",
    kind: "control",
    decisionId: "detection",
    description: "Whether events become one incident.",
    icon: "radar",
    zone: "secops",
    x: 75,
    y: 88,
    mobileX: 76,
    mobileY: 94,
  },
];

export const LAB_EDGES: readonly MapEdgeDefinition[] = [
  { id: "portal-identity", from: "portal", to: "identity" },
  { id: "portal-input", from: "portal", to: "input" },
  { id: "identity-app", from: "identity", to: "app" },
  { id: "input-app", from: "input", to: "app" },
  { id: "portal-network", from: "portal", to: "network" },
  { id: "network-app", from: "network", to: "app" },
  { id: "app-model", from: "app", to: "model" },
  { id: "app-retrieval", from: "app", to: "retrieval" },
  { id: "model-retrieval", from: "model", to: "retrieval" },
  { id: "app-secrets", from: "app", to: "secrets" },
  { id: "secrets-api", from: "secrets", to: "data-access" },
  { id: "retrieval-api", from: "retrieval", to: "data-access" },
  { id: "api-database", from: "data-access", to: "database" },
  { id: "app-oversight", from: "app", to: "oversight" },
  { id: "oversight-database", from: "oversight", to: "database" },
  { id: "app-supply", from: "app", to: "supply-chain" },
  { id: "app-detection", from: "app", to: "detection" },
];

export const LAB_ZONE_LABELS: readonly { id: BoardZoneId; label: string }[] = [
  { id: "user-input", label: "User and Input" },
  { id: "ai-services", label: "AI Services" },
  { id: "protected", label: "Protected Systems" },
  { id: "secops", label: "Security Operations" },
];

export type BoardLayout = "desktop" | "mobile";

export interface NodePoint {
  x: number;
  y: number;
}

export function nodePoint(node: MapNodeDefinition, layout: BoardLayout): NodePoint {
  return layout === "mobile" ? { x: node.mobileX, y: node.mobileY } : { x: node.x, y: node.y };
}

export function nodeRadii(kind: NodeKind, layout: BoardLayout): { rx: number; ry: number } {
  if (layout === "mobile") {
    if (kind === "control") {
      return { rx: 14, ry: 4.2 };
    }
    return { rx: 16, ry: 4.8 };
  }
  if (kind === "control") {
    return { rx: 6.4, ry: 5.4 };
  }
  return { rx: 7.6, ry: 6.2 };
}

export function ellipseEdge(from: NodePoint, to: NodePoint, radii: { rx: number; ry: number }): NodePoint {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const magnitude = Math.hypot(dx / radii.rx, dy / radii.ry) || 1;
  return {
    x: from.x + dx / magnitude,
    y: from.y + dy / magnitude,
  };
}

export function edgeEndpoints(
  fromNode: MapNodeDefinition,
  toNode: MapNodeDefinition,
  layout: BoardLayout,
): { x1: number; y1: number; x2: number; y2: number } {
  const from = nodePoint(fromNode, layout);
  const to = nodePoint(toNode, layout);
  const start = ellipseEdge(from, to, nodeRadii(fromNode.kind, layout));
  const end = ellipseEdge(to, from, nodeRadii(toNode.kind, layout));
  return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };
}

export function findEdge(from: MapNodeId, to: MapNodeId): MapEdgeDefinition | undefined {
  return LAB_EDGES.find(
    (edge) => (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from),
  );
}
