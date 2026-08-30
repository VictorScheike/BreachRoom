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

const identitySource = node("source", "Stolen password", "source", 70, 140);
const identityControl = node("identity", "Identity", "control", 300, 140);
const identityPortal = node("portal", "Claims Portal", "core", 560, 140);
const identityApp = node("app", "AI Claims App", "core", 860, 140);

const uploadSource = node("source", "Poisoned file", "source", 70, 140);
const uploadControl = node("input", "Document upload", "control", 300, 140);
const uploadApp = node("app", "AI Claims App", "core", 560, 140);
const uploadModel = node("model", "AI model", "control", 860, 140);

const modelApp = node("app", "AI Claims App", "core", 160, 140);
const modelControl = node("model", "AI model", "control", 430, 140);
const modelRetrieval = node("retrieval", "Retrieval", "control", 700, 80);
const modelPortal = node("portal", "Claims Portal", "core", 700, 200);

const retrievalApp = node("app", "AI Claims App", "core", 140, 140);
const retrievalControl = node("retrieval", "Retrieval", "control", 400, 140);
const retrievalApi = node("data-access", "Claims API", "control", 660, 140);
const retrievalDb = node("database", "Claims Database", "asset", 900, 140);

const secretsApp = node("app", "AI Claims App", "core", 160, 140);
const secretsControl = node("secrets", "Secrets + tools", "control", 450, 140);
const secretsApi = node("data-access", "Claims API", "control", 760, 140);

const apiApp = node("app", "AI Claims App", "core", 140, 140);
const apiControl = node("data-access", "Claims API", "control", 430, 140);
const apiDb = node("database", "Claims Database", "asset", 720, 80);
const apiOversight = node("oversight", "Human approval", "control", 720, 200);

const oversightApp = node("app", "AI Claims App", "core", 160, 140);
const oversightControl = node("oversight", "Human approval", "control", 450, 140);
const oversightDb = node("database", "Claims Database", "asset", 760, 140);

const networkApp = node("app", "AI Claims App", "core", 160, 90);
const networkControl = node("network", "Network", "control", 450, 140);
const networkDb = node("database", "Internal systems", "asset", 760, 90);
const networkSupply = node("supply-chain", "Software delivery", "control", 760, 200);

const supplyApp = node("app", "AI Claims App", "core", 160, 140);
const supplyControl = node("supply-chain", "Software delivery", "control", 470, 140);
const supplyProd = node("database", "Production", "asset", 780, 140);

const detectApp = node("app", "AI Claims App", "core", 160, 90);
const detectPortal = node("portal", "Claims Portal", "core", 160, 200);
const detectControl = node("detection", "Monitoring", "control", 500, 140);
const detectDb = node("database", "Claims Database", "asset", 820, 140);

export const LAB_SUBGRAPHS: readonly DecisionSubgraph[] = [
  {
    decisionId: "identity",
    domain: "Identity",
    nodes: [identitySource, identityControl, identityPortal, identityApp],
    edges: [
      edge("src-identity", identitySource, identityControl),
      edge("identity-portal", identityControl, identityPortal),
      edge("portal-app", identityPortal, identityApp),
    ],
    controlNodeId: "identity",
    downstreamNodeIds: ["portal", "app"],
    held: {
      headline: "Stolen credentials stop at Identity",
      explanation:
        "The attacker is stopped before reaching the Claims Portal. The next attack step will be a new technique, not a continuation through a control that already held.",
      controlStatus: "held",
      controlLabel: "Blocked",
      downstreamLabel: "Not reached",
    },
    exposed: {
      headline: "Valid attacker session",
      explanation: "The attacker enters as a valid staff user. Later controls still get their own chance to limit the damage.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  },
  {
    decisionId: "input",
    domain: "Document upload",
    nodes: [uploadSource, uploadControl, uploadApp, uploadModel],
    edges: [
      edge("src-input", uploadSource, uploadControl),
      edge("input-app", uploadControl, uploadApp),
      edge("app-model", uploadApp, uploadModel),
    ],
    controlNodeId: "input",
    downstreamNodeIds: ["app", "model"],
    held: {
      headline: "Poisoned document stops at upload",
      explanation: "The sandbox strips the payload before the AI Claims App retrieves it. A later technique must start from a new route.",
      controlStatus: "held",
      controlLabel: "Blocked",
      downstreamLabel: "Not reached",
    },
    exposed: {
      headline: "Hidden content survives",
      explanation: "A type check lets the file through. The model and retrieval layers still get their own chance to limit the blast radius.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  },
  {
    decisionId: "model",
    domain: "AI model",
    nodes: [modelApp, modelControl, modelRetrieval, modelPortal],
    edges: [
      edge("app-model", modelApp, modelControl),
      edge("model-retrieval", modelControl, modelRetrieval),
      edge("app-portal", modelApp, modelPortal),
    ],
    controlNodeId: "model",
    downstreamNodeIds: ["retrieval"],
    held: {
      headline: "Prompts stay inside the private model boundary",
      explanation: "A private endpoint limits where injected context can leak. Retrieval still decides how wide the search can go.",
      controlStatus: "held",
      controlLabel: "Limited",
      downstreamLabel: "Still gated",
    },
    exposed: {
      headline: "Prompts leave for a public model",
      explanation: "Less control over logs and retention. Later retrieval and API controls still get an independent chance.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  },
  {
    decisionId: "retrieval",
    domain: "Retrieval",
    nodes: [retrievalApp, retrievalControl, retrievalApi, retrievalDb],
    edges: [
      edge("app-retrieval", retrievalApp, retrievalControl),
      edge("retrieval-api", retrievalControl, retrievalApi),
      edge("api-db", retrievalApi, retrievalDb),
    ],
    controlNodeId: "retrieval",
    downstreamNodeIds: ["data-access", "database"],
    held: {
      headline: "Search stays on the current claim",
      explanation: "Case-scoped retrieval refuses neighbouring customer documents. The attacker cannot turn one claim into a book-wide search.",
      controlStatus: "held",
      controlLabel: "Blocked",
      downstreamLabel: "Not reached",
    },
    exposed: {
      headline: "Shared index is searchable",
      explanation: "One manipulated request may pull unrelated claims. The API and approval layers still get their own chance.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  },
  {
    decisionId: "secrets",
    domain: "Secrets and tools",
    nodes: [secretsApp, secretsControl, secretsApi],
    edges: [
      edge("app-secrets", secretsApp, secretsControl),
      edge("secrets-api", secretsControl, secretsApi),
    ],
    controlNodeId: "secrets",
    downstreamNodeIds: ["data-access"],
    held: {
      headline: "No reusable key to steal",
      explanation: "Managed identity issues a short-lived token. Compromising the app does not hand over a portable credential.",
      controlStatus: "held",
      controlLabel: "Blocked",
      downstreamLabel: "Not reached",
    },
    exposed: {
      headline: "Static key can be reused",
      explanation: "A leaked key works outside the application. API permissions still decide how far that key can read.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  },
  {
    decisionId: "data-access",
    domain: "Claims API",
    nodes: [apiApp, apiControl, apiDb, apiOversight],
    edges: [
      edge("app-api", apiApp, apiControl),
      edge("api-db", apiControl, apiDb),
      edge("api-oversight", apiControl, apiOversight),
    ],
    controlNodeId: "data-access",
    downstreamNodeIds: ["database", "oversight"],
    held: {
      headline: "Bulk reads are refused",
      explanation: "The restricted API allows only the active claim and approved reads. Least privilege stops the blast radius.",
      controlStatus: "held",
      controlLabel: "Blocked",
      downstreamLabel: "Not reached",
    },
    exposed: {
      headline: "Broad service account accepts the call",
      explanation: "A manipulated workflow can read widely. Human approval still gets an independent chance on payouts.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  },
  {
    decisionId: "oversight",
    domain: "Human oversight",
    nodes: [oversightApp, oversightControl, oversightDb],
    edges: [
      edge("app-oversight", oversightApp, oversightControl),
      edge("oversight-db", oversightControl, oversightDb),
    ],
    controlNodeId: "oversight",
    downstreamNodeIds: ["database"],
    held: {
      headline: "Payout changes wait for a person",
      explanation: "Manipulated output cannot become a business action on its own. This technique ends at human approval.",
      controlStatus: "held",
      controlLabel: "Blocked",
      downstreamLabel: "Not reached",
    },
    exposed: {
      headline: "The assistant can complete the payout",
      explanation: "Automatic execution treats a draft as an approved action. Monitoring still gets a later chance to see the campaign.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  },
  {
    decisionId: "network",
    domain: "Network segmentation",
    nodes: [networkApp, networkControl, networkDb, networkSupply],
    edges: [
      edge("app-network", networkApp, networkControl),
      edge("network-db", networkControl, networkDb),
      edge("network-supply", networkControl, networkSupply),
    ],
    controlNodeId: "network",
    downstreamNodeIds: ["database", "supply-chain"],
    held: {
      headline: "East-west movement is refused",
      explanation: "Private segments stop a foothold in the assistant becoming a tour of the estate.",
      controlStatus: "held",
      controlLabel: "Blocked",
      downstreamLabel: "Not reached",
    },
    exposed: {
      headline: "Internal trust lets the attempt through",
      explanation: "A flat network lets one compromised service move toward others. Supply-chain controls still get their own chance.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  },
  {
    decisionId: "supply-chain",
    domain: "Software delivery",
    nodes: [supplyApp, supplyControl, supplyProd],
    edges: [
      edge("app-supply", supplyApp, supplyControl),
      edge("supply-prod", supplyControl, supplyProd),
    ],
    controlNodeId: "supply-chain",
    downstreamNodeIds: ["database"],
    held: {
      headline: "Unsigned artefacts are rejected",
      explanation: "Pinned, scanned and signed builds stop a tainted package reaching production.",
      controlStatus: "held",
      controlLabel: "Blocked",
      downstreamLabel: "Not reached",
    },
    exposed: {
      headline: "Latest versions enter with light checks",
      explanation: "A compromised dependency may ship. Monitoring still gets a later chance to correlate the campaign.",
      controlStatus: "exposed",
      controlLabel: "Exposed",
      downstreamLabel: "Still reachable",
    },
  },
  {
    decisionId: "detection",
    domain: "Monitoring and response",
    nodes: [detectApp, detectPortal, detectControl, detectDb],
    edges: [
      edge("app-detect", detectApp, detectControl),
      edge("portal-detect", detectPortal, detectControl),
      edge("detect-db", detectControl, detectDb),
    ],
    controlNodeId: "detection",
    downstreamNodeIds: ["database"],
    held: {
      headline: "Events become one incident",
      explanation: "The SIEM correlates identity, upload, AI and API traces so the organisation can contain what is still in motion.",
      controlStatus: "held",
      controlLabel: "Detected",
      downstreamLabel: "Containment possible",
    },
    exposed: {
      headline: "Each service keeps its own log",
      explanation: "Isolated events may be reconstructable later. They do not show a campaign now.",
      controlStatus: "exposed",
      controlLabel: "Blind",
      downstreamLabel: "Uncorrelated",
    },
  },
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
