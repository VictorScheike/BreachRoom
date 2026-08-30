import type { BoardZoneId, MapEdgeDefinition, MapNodeDefinition, MapNodeId, NodeKind } from "./types";

export const PRIMARY_SYSTEM_IDS: readonly MapNodeId[] = ["employee", "portal", "app", "api", "database"];

export const BADGE_NODE_IDS: readonly MapNodeId[] = [
  "identity",
  "waf",
  "scanner",
  "retrieval",
  "secrets",
  "gateway",
  "backup",
];

export const SIEM_NODE_ID: MapNodeId = "detection";
export const ZONE_NODE_ID: MapNodeId = "network";

export const PRIMARY_EDGE_IDS = ["employee-portal", "portal-app", "app-api", "api-database"] as const;
export type PrimaryEdgeId = (typeof PRIMARY_EDGE_IDS)[number];

export const LAB_NODES: readonly MapNodeDefinition[] = [
  {
    id: "employee",
    name: "Employee",
    kind: "actor",
    decisionId: null,
    description: "A claims handler, or someone using a stolen staff session.",
    icon: "person",
    zone: "external",
    x: 8,
    y: 40,
    mobileX: 50,
    mobileY: 8,
  },
  {
    id: "portal",
    name: "Claims Portal",
    kind: "system",
    decisionId: null,
    description: "Staff login and document upload.",
    icon: "portal",
    zone: "external",
    x: 29,
    y: 40,
    mobileX: 50,
    mobileY: 26,
  },
  {
    id: "app",
    name: "AI Claims App",
    kind: "system",
    decisionId: null,
    description: "Summarises cases and drafts replies.",
    icon: "cpu",
    zone: "application",
    x: 50,
    y: 40,
    mobileX: 50,
    mobileY: 44,
  },
  {
    id: "api",
    name: "Claims API",
    kind: "system",
    decisionId: "data-access",
    description: "What the assistant may read or change.",
    icon: "lock",
    zone: "protected",
    x: 71,
    y: 40,
    mobileX: 50,
    mobileY: 62,
  },
  {
    id: "database",
    name: "Claims Database",
    kind: "asset",
    decisionId: null,
    description: "Customer and payout data.",
    icon: "database",
    zone: "protected",
    x: 92,
    y: 40,
    mobileX: 50,
    mobileY: 80,
  },
  {
    id: "identity",
    name: "MFA + RBAC",
    kind: "control",
    decisionId: "identity",
    description: "How staff authenticate and how portal access is assigned.",
    icon: "shield",
    zone: "external",
    x: 29,
    y: 58,
    mobileX: 78,
    mobileY: 26,
  },
  {
    id: "waf",
    name: "WAF",
    kind: "control",
    decisionId: "exposure",
    description: "What internet traffic is allowed to reach the portal.",
    icon: "shield",
    zone: "external",
    x: 18.5,
    y: 28,
    mobileX: 22,
    mobileY: 17,
  },
  {
    id: "scanner",
    name: "Document Scanner",
    kind: "control",
    decisionId: "input",
    description: "What happens to a claims file before the AI reads it.",
    icon: "scan",
    zone: "application",
    x: 39.5,
    y: 28,
    mobileX: 22,
    mobileY: 35,
  },
  {
    id: "retrieval",
    name: "Case-scoped RAG",
    kind: "control",
    decisionId: "retrieval",
    description: "What the assistant is allowed to search.",
    icon: "lock",
    zone: "application",
    x: 50,
    y: 58,
    mobileX: 78,
    mobileY: 44,
  },
  {
    id: "secrets",
    name: "Managed Identity",
    kind: "control",
    decisionId: "secrets",
    description: "How the AI app proves itself to internal services.",
    icon: "vault",
    zone: "application",
    x: 60.5,
    y: 31,
    mobileX: 22,
    mobileY: 53,
  },
  {
    id: "gateway",
    name: "Private API Gateway",
    kind: "control",
    decisionId: "gateway",
    description: "Authentication, validation and rate limiting on the Claims API path.",
    icon: "filter",
    zone: "protected",
    x: 60.5,
    y: 49,
    mobileX: 78,
    mobileY: 53,
  },
  {
    id: "network",
    name: "Network zones",
    kind: "control",
    decisionId: "network",
    description: "Whether portal, AI, API and database are separated.",
    icon: "network",
    zone: "application",
    x: 50,
    y: 12,
    mobileX: 22,
    mobileY: 8,
  },
  {
    id: "detection",
    name: "SIEM",
    kind: "control",
    decisionId: "detection",
    description: "Whether events become one incident.",
    icon: "radar",
    zone: "secops",
    x: 50,
    y: 86,
    mobileX: 50,
    mobileY: 94,
  },
  {
    id: "backup",
    name: "Protected Backup",
    kind: "control",
    decisionId: "recovery",
    description: "Isolation, revocation and restore after an incident.",
    icon: "contained",
    zone: "protected",
    x: 92,
    y: 58,
    mobileX: 78,
    mobileY: 80,
  },
];

export const LAB_EDGES: readonly MapEdgeDefinition[] = [
  { id: "employee-portal", from: "employee", to: "portal" },
  { id: "portal-app", from: "portal", to: "app" },
  { id: "app-api", from: "app", to: "api" },
  { id: "api-database", from: "api", to: "database" },
];

export const CORE_VISIBLE_NODES: readonly MapNodeId[] = [...PRIMARY_SYSTEM_IDS];

export const LAB_ZONE_LABELS: readonly { id: BoardZoneId; label: string; note: string }[] = [
  { id: "external", label: "Edge zone", note: "Front door. Staff and the internet meet the company here." },
  { id: "application", label: "Application zone", note: "The AI reads claims and drafts replies here." },
  { id: "protected", label: "Protected data zone", note: "Customer records and payouts live here." },
];

export const EDGE_CONTROL_IDS: Record<PrimaryEdgeId, readonly MapNodeId[]> = {
  "employee-portal": ["waf"],
  "portal-app": ["scanner"],
  "app-api": ["secrets", "gateway"],
  "api-database": [],
};

export const SYSTEM_CONTROL_IDS: Partial<Record<MapNodeId, readonly MapNodeId[]>> = {
  portal: ["identity"],
  app: ["retrieval"],
  database: ["backup"],
};

export type BoardLayout = "desktop" | "mobile";

export interface NodePoint {
  x: number;
  y: number;
}

export function isPrimarySystem(id: MapNodeId): boolean {
  return PRIMARY_SYSTEM_IDS.includes(id);
}

export function isBadgeNode(id: MapNodeId): boolean {
  return BADGE_NODE_IDS.includes(id);
}

export function nodePoint(node: MapNodeDefinition, layout: BoardLayout): NodePoint {
  return layout === "mobile" ? { x: node.mobileX, y: node.mobileY } : { x: node.x, y: node.y };
}

export function nodeRadii(kind: NodeKind, layout: BoardLayout): { rx: number; ry: number } {
  if (layout === "mobile") {
    if (kind === "control") {
      return { rx: 10, ry: 3.4 };
    }
    return { rx: 16, ry: 5.2 };
  }
  if (kind === "control") {
    return { rx: 5.2, ry: 3.6 };
  }
  return { rx: 8.4, ry: 7 };
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

export function scaledPoint(node: MapNodeDefinition, layout: BoardLayout): NodePoint {
  const point = nodePoint(node, layout);
  return { x: point.x * 10, y: point.y * 6.2 };
}

export function edgePath(fromNode: MapNodeDefinition, toNode: MapNodeDefinition, layout: BoardLayout): string {
  const from = scaledPoint(fromNode, layout);
  const to = scaledPoint(toNode, layout);
  const start = ellipseEdge(from, to, {
    rx: nodeRadii(fromNode.kind, layout).rx * 10,
    ry: nodeRadii(fromNode.kind, layout).ry * 6.2,
  });
  const end = ellipseEdge(to, from, {
    rx: nodeRadii(toNode.kind, layout).rx * 10,
    ry: nodeRadii(toNode.kind, layout).ry * 6.2,
  });
  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
}

export function findEdge(from: MapNodeId, to: MapNodeId): MapEdgeDefinition | undefined {
  return LAB_EDGES.find(
    (edge) => (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from),
  );
}

export function edgesForVisible(visible: ReadonlySet<MapNodeId>): MapEdgeDefinition[] {
  return LAB_EDGES.filter((edge) => visible.has(edge.from) && visible.has(edge.to));
}

export function hopUsesPrimaryEdge(from: MapNodeId, to: MapNodeId): MapEdgeDefinition | undefined {
  return findEdge(from, to);
}
