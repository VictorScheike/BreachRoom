import { z } from "zod";
import { DECISION_IDS, type DecisionId, type OptionId } from "./types";

const nonEmpty = z.string().trim().min(1);

export const SUBGRAPH_NODE_KINDS = ["source", "control", "core", "asset"] as const;
export type SubgraphNodeKind = (typeof SUBGRAPH_NODE_KINDS)[number];

export interface SubgraphNode {
  id: string;
  label: string;
  kind: SubgraphNodeKind;
  x: number;
  y: number;
}

export interface SubgraphEdge {
  id: string;
  from: string;
  to: string;
  path: string;
}

export interface SubgraphOutcome {
  headline: string;
  explanation: string;
  controlStatus: "held" | "exposed";
  controlLabel: string;
  downstreamLabel: string;
}

export interface DecisionSubgraph {
  decisionId: DecisionId;
  domain: string;
  nodes: readonly SubgraphNode[];
  edges: readonly SubgraphEdge[];
  controlNodeId: string;
  downstreamNodeIds: readonly string[];
  held: SubgraphOutcome;
  exposed: SubgraphOutcome;
}

function curve(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const bulge = Math.min(36, len * 0.12);
  return `M ${x1} ${y1} Q ${mx - (dy / len) * bulge} ${my + (dx / len) * bulge} ${x2} ${y2}`;
}

function node(id: string, label: string, kind: SubgraphNodeKind, x: number, y: number): SubgraphNode {
  return { id, label, kind, x, y };
}

function edge(id: string, from: SubgraphNode, to: SubgraphNode): SubgraphEdge {
  return { id, from: from.id, to: to.id, path: curve(from.x, from.y, to.x, to.y) };
}

function slice(
  decisionId: DecisionId,
  domain: string,
  control: SubgraphNode,
  upstream: SubgraphNode,
  downstream: SubgraphNode,
  held: SubgraphOutcome,
  exposed: SubgraphOutcome,
): DecisionSubgraph {
  return {
    decisionId,
    domain,
    nodes: [upstream, control, downstream],
    edges: [edge(`${upstream.id}-${control.id}`, upstream, control), edge(`${control.id}-${downstream.id}`, control, downstream)],
    controlNodeId: control.id,
    downstreamNodeIds: [downstream.id],
    held,
    exposed,
  };
}

export const LAB_SUBGRAPHS: readonly DecisionSubgraph[] = [
  slice(
    "exposure",
    "External exposure",
    node("waf", "WAF", "control", 400, 140),
    node("employee", "Internet", "source", 80, 140),
    node("portal", "Claims Portal", "core", 720, 140),
    {
      headline: "API stays off the public internet",
      explanation: "A WAF and private endpoint keep scanners off the Claims API.",
      controlStatus: "held",
      controlLabel: "Limited",
      downstreamLabel: "Still gated",
    },
    {
      headline: "Portal and API are internet-facing",
      explanation: "Anything that can reach the internet can try both services.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  ),
  slice(
    "identity",
    "Identity and access",
    node("identity", "Identity Provider", "control", 400, 140),
    node("employee", "Stolen password", "source", 80, 140),
    node("portal", "Claims Portal", "core", 720, 140),
    {
      headline: "Stolen credentials stop at identity",
      explanation: "MFA refuses the password before a claims session opens.",
      controlStatus: "held",
      controlLabel: "Blocked",
      downstreamLabel: "Not reached",
    },
    {
      headline: "Valid attacker session",
      explanation: "The attacker enters as a staff user. Later controls still get their own chance.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  ),
  slice(
    "network",
    "Network segmentation",
    node("network", "Network zones", "control", 400, 140),
    node("app", "AI Claims App", "core", 80, 140),
    node("database", "Claims Database", "asset", 720, 140),
    {
      headline: "East-west movement is refused",
      explanation: "Separate zones stop a foothold in the assistant becoming a tour of the estate.",
      controlStatus: "held",
      controlLabel: "Limited",
      downstreamLabel: "Not reached",
    },
    {
      headline: "Internal trust lets the attempt through",
      explanation: "A flat network lets one compromised service move toward others.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  ),
  slice(
    "gateway",
    "API protection",
    node("gateway", "API Gateway", "control", 400, 140),
    node("portal", "Claims Portal", "core", 80, 140),
    node("api", "Claims API", "core", 720, 140),
    {
      headline: "Requests meet a gateway",
      explanation: "Authentication, validation and rate limiting sit on the portal-to-API path.",
      controlStatus: "held",
      controlLabel: "Limited",
      downstreamLabel: "Still gated",
    },
    {
      headline: "Direct API with an application token",
      explanation: "A leaked token is a working key to the Claims API.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  ),
  slice(
    "secrets",
    "Service authentication",
    node("secrets", "Secrets Vault", "control", 400, 140),
    node("app", "AI Claims App", "core", 80, 140),
    node("api", "Claims API", "core", 720, 140),
    {
      headline: "No reusable key to steal",
      explanation: "Managed identity issues a short-lived token.",
      controlStatus: "held",
      controlLabel: "Blocked",
      downstreamLabel: "Not reached",
    },
    {
      headline: "Static key can be reused",
      explanation: "A leaked key works outside the application.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  ),
  slice(
    "data-access",
    "Database permissions",
    node("api", "Claims API", "control", 400, 140),
    node("app", "AI Claims App", "core", 80, 140),
    node("database", "Claims Database", "asset", 720, 140),
    {
      headline: "Bulk reads are refused",
      explanation: "The API allows only the open claim and approved reads.",
      controlStatus: "held",
      controlLabel: "Blocked",
      downstreamLabel: "Not reached",
    },
    {
      headline: "Broad service account accepts the call",
      explanation: "A steered workflow can read widely.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  ),
  slice(
    "retrieval",
    "AI retrieval",
    node("retrieval", "Retrieval Service", "control", 400, 140),
    node("app", "AI Claims App", "core", 80, 140),
    node("database", "Claims Database", "asset", 720, 140),
    {
      headline: "Search stays on the current claim",
      explanation: "Case-scoped retrieval refuses neighbouring customer documents.",
      controlStatus: "held",
      controlLabel: "Blocked",
      downstreamLabel: "Not reached",
    },
    {
      headline: "Shared index is searchable",
      explanation: "One manipulated request may pull unrelated claims.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  ),
  slice(
    "input",
    "Malicious input",
    node("scanner", "Document Scanner", "control", 400, 140),
    node("portal", "Claims Portal", "core", 80, 140),
    node("app", "AI Claims App", "core", 720, 140),
    {
      headline: "Poisoned document stops at the scanner",
      explanation: "The file is validated, scanned and isolated before the AI reads it.",
      controlStatus: "held",
      controlLabel: "Blocked",
      downstreamLabel: "Not reached",
    },
    {
      headline: "Hidden content survives",
      explanation: "A type check lets the file through to the AI Claims App.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  ),
  slice(
    "detection",
    "Logging and detection",
    node("detection", "Monitoring / SIEM", "control", 400, 140),
    node("app", "AI Claims App", "core", 80, 90),
    node("database", "Claims Database", "asset", 720, 140),
    {
      headline: "Events become one incident",
      explanation: "The SIEM correlates identity, API, AI and database traces.",
      controlStatus: "held",
      controlLabel: "Detected",
      downstreamLabel: "Containment possible",
    },
    {
      headline: "Each service keeps its own log",
      explanation: "Isolated events may be reconstructable later. They do not show a campaign now.",
      controlStatus: "exposed",
      controlLabel: "Blind",
      downstreamLabel: "Uncorrelated",
    },
  ),
  slice(
    "recovery",
    "Containment and recovery",
    node("backup", "Protected Backup", "control", 400, 140),
    node("database", "Claims Database", "asset", 80, 140),
    node("detection", "Monitoring", "core", 720, 140),
    {
      headline: "Isolation and restore are practised",
      explanation: "Credential revocation and protected backups reduce lasting damage.",
      controlStatus: "held",
      controlLabel: "Recovered",
      downstreamLabel: "Damage reduced",
    },
    {
      headline: "No practised isolation path",
      explanation: "Live-account copies do not give Nordic Shield a clean restore.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Damage remains",
    },
  ),
];

const subgraphSchema = z
  .object({
    decisionId: z.enum(DECISION_IDS),
    domain: nonEmpty,
    nodes: z.array(z.object({
      id: nonEmpty,
      label: nonEmpty,
      kind: z.enum(SUBGRAPH_NODE_KINDS),
      x: z.number(),
      y: z.number(),
    })).min(3),
    edges: z.array(z.object({
      id: nonEmpty,
      from: nonEmpty,
      to: nonEmpty,
      path: nonEmpty,
    })).min(2),
    controlNodeId: nonEmpty,
    downstreamNodeIds: z.array(nonEmpty).min(1),
    held: z.object({
      headline: nonEmpty,
      explanation: nonEmpty,
      controlStatus: z.literal("held"),
      controlLabel: nonEmpty,
      downstreamLabel: nonEmpty,
    }),
    exposed: z.object({
      headline: nonEmpty,
      explanation: nonEmpty,
      controlStatus: z.literal("exposed"),
      controlLabel: nonEmpty,
      downstreamLabel: nonEmpty,
    }),
  })
  .strict();

export const DECISION_SUBGRAPHS: readonly DecisionSubgraph[] = LAB_SUBGRAPHS.map((item) => subgraphSchema.parse(item));

export function subgraphFor(decisionId: DecisionId): DecisionSubgraph {
  const found = DECISION_SUBGRAPHS.find((item) => item.decisionId === decisionId);
  if (!found) {
    throw new Error(`Missing architecture subgraph for ${decisionId}`);
  }
  return found;
}

export function subgraphOutcome(subgraph: DecisionSubgraph, optionId: OptionId | null, isStrong: boolean): SubgraphOutcome | null {
  if (!optionId) {
    return null;
  }
  return isStrong ? subgraph.held : subgraph.exposed;
}
