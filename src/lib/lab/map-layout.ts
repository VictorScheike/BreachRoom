import type { BoardZoneId, MapEdgeDefinition, MapNodeDefinition, MapNodeId, NodeKind } from "./types";

export const LAB_NODES: readonly MapNodeDefinition[] = [
  {
    id: "employee",
    name: "Employee",
    kind: "actor",
    decisionId: null,
    description: "A claims handler, or someone using a stolen staff session.",
    icon: "person",
    zone: "external",
    x: 10,
    y: 22,
    mobileX: 50,
    mobileY: 5,
  },
  {
    id: "identity",
    name: "Identity Provider",
    kind: "control",
    decisionId: "identity",
    description: "How staff authenticate and how portal access is assigned.",
    icon: "shield",
    zone: "external",
    x: 10,
    y: 50,
    mobileX: 50,
    mobileY: 13,
  },
  {
    id: "waf",
    name: "Web Application Firewall",
    kind: "control",
    decisionId: "exposure",
    description: "What internet traffic is allowed to reach the portal and API.",
    icon: "shield",
    zone: "external",
    x: 28,
    y: 18,
    mobileX: 50,
    mobileY: 21,
  },
  {
    id: "portal",
    name: "Claims Portal",
    kind: "system",
    decisionId: null,
    description: "Staff login and document upload.",
    icon: "portal",
    zone: "external",
    x: 28,
    y: 50,
    mobileX: 50,
    mobileY: 29,
  },
  {
    id: "scanner",
    name: "Document Scanner",
    kind: "control",
    decisionId: "input",
    description: "What happens to a claims file before the AI reads it.",
    icon: "scan",
    zone: "application",
    x: 28,
    y: 78,
    mobileX: 50,
    mobileY: 37,
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
    y: 34,
    mobileX: 50,
    mobileY: 45,
  },
  {
    id: "retrieval",
    name: "Retrieval Service",
    kind: "control",
    decisionId: "retrieval",
    description: "What the assistant is allowed to search.",
    icon: "lock",
    zone: "application",
    x: 50,
    y: 12,
    mobileX: 24,
    mobileY: 53,
  },
  {
    id: "secrets",
    name: "Secrets Vault",
    kind: "control",
    decisionId: "secrets",
    description: "How the AI app proves itself to internal services.",
    icon: "vault",
    zone: "application",
    x: 66,
    y: 34,
    mobileX: 76,
    mobileY: 53,
  },
  {
    id: "gateway",
    name: "API Gateway",
    kind: "control",
    decisionId: "gateway",
    description: "Authentication, validation and rate limiting on the Claims API path.",
    icon: "filter",
    zone: "protected",
    x: 66,
    y: 58,
    mobileX: 50,
    mobileY: 61,
  },
  {
    id: "api",
    name: "Claims API",
    kind: "system",
    decisionId: "data-access",
    description: "What the assistant may read or change.",
    icon: "lock",
    zone: "protected",
    x: 82,
    y: 46,
    mobileX: 50,
    mobileY: 69,
  },
  {
    id: "network",
    name: "Network Zones",
    kind: "control",
    decisionId: "network",
    description: "Whether portal, AI, API and database are separated.",
    icon: "network",
    zone: "secops",
    x: 50,
    y: 78,
    mobileX: 24,
    mobileY: 77,
  },
  {
    id: "detection",
    name: "Monitoring / SIEM",
    kind: "control",
    decisionId: "detection",
    description: "Whether events become one incident.",
    icon: "radar",
    zone: "secops",
    x: 82,
    y: 78,
    mobileX: 76,
    mobileY: 77,
  },
  {
    id: "database",
    name: "Claims Database",
    kind: "asset",
    decisionId: null,
    description: "Customer and payout data.",
    icon: "database",
    zone: "protected",
    x: 94,
    y: 46,
    mobileX: 50,
    mobileY: 86,
  },
  {
    id: "backup",
    name: "Protected Backup",
    kind: "control",
    decisionId: "recovery",
    description: "Isolation, revocation and restore after an incident.",
    icon: "contained",
    zone: "secops",
    x: 94,
    y: 78,
    mobileX: 50,
    mobileY: 95,
  },
];

export const LAB_EDGES: readonly MapEdgeDefinition[] = [
  { id: "employee-waf", from: "employee", to: "waf" },
  { id: "waf-portal", from: "waf", to: "portal" },
  { id: "employee-portal", from: "employee", to: "portal", hiddenWhen: ["waf"] },
  { id: "employee-identity", from: "employee", to: "identity" },
  { id: "identity-portal", from: "identity", to: "portal" },
  { id: "portal-scanner", from: "portal", to: "scanner" },
  { id: "scanner-app", from: "scanner", to: "app" },
  { id: "portal-app", from: "portal", to: "app", hiddenWhen: ["scanner"] },
  { id: "portal-gateway", from: "portal", to: "gateway" },
  { id: "gateway-api", from: "gateway", to: "api" },
  { id: "portal-api", from: "portal", to: "api", hiddenWhen: ["gateway"] },
  { id: "app-retrieval", from: "app", to: "retrieval" },
  { id: "app-secrets", from: "app", to: "secrets" },
  { id: "secrets-api", from: "secrets", to: "api" },
  { id: "app-gateway", from: "app", to: "gateway" },
  { id: "app-api", from: "app", to: "api", hiddenWhen: ["gateway"] },
  { id: "retrieval-api", from: "retrieval", to: "api" },
  { id: "api-database", from: "api", to: "database" },
  { id: "network-app", from: "network", to: "app" },
  { id: "network-api", from: "network", to: "api" },
  { id: "network-database", from: "network", to: "database" },
  { id: "app-detection", from: "app", to: "detection" },
  { id: "api-detection", from: "api", to: "detection" },
  { id: "identity-detection", from: "identity", to: "detection" },
  { id: "database-backup", from: "database", to: "backup" },
  { id: "detection-backup", from: "detection", to: "backup" },
];

export const CORE_VISIBLE_NODES: readonly MapNodeId[] = ["employee", "portal", "app", "api", "database"];

export const LAB_ZONE_LABELS: readonly { id: BoardZoneId; label: string }[] = [
  { id: "external", label: "People and edge" },
  { id: "application", label: "Application services" },
  { id: "protected", label: "Protected systems" },
  { id: "secops", label: "Detection and recovery" },
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

export function curvePath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const bulge = Math.min(48, len * 0.14);
  return `M ${x1} ${y1} Q ${mx - (dy / len) * bulge} ${my + (dx / len) * bulge} ${x2} ${y2}`;
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
  return curvePath(start.x, start.y, end.x, end.y);
}

export function findEdge(from: MapNodeId, to: MapNodeId): MapEdgeDefinition | undefined {
  return LAB_EDGES.find(
    (edge) => (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from),
  );
}

export function edgesForVisible(visible: ReadonlySet<MapNodeId>): MapEdgeDefinition[] {
  return LAB_EDGES.filter((edge) => {
    if (!visible.has(edge.from) || !visible.has(edge.to)) {
      return false;
    }
    if (edge.hiddenWhen?.some((id) => visible.has(id))) {
      return false;
    }
    return true;
  });
}
