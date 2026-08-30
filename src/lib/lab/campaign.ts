import { LAB_MISSION, optionForChoice } from "./catalog";
import { CORE_VISIBLE_NODES, edgesForVisible } from "./map-layout";
import type {
  AttackTechniqueId,
  DecisionId,
  LabChoices,
  MapNodeId,
  OptionId,
  ResolvedStage,
  StageOutcomeKind,
} from "./types";
import { DECISION_IDS } from "./types";

export type ControlStrength = "strong" | "medium" | "weak";

export function strengthOf(choices: LabChoices, id: DecisionId): ControlStrength {
  return optionForChoice(choices, id)?.strength ?? "weak";
}

export function rankOf(strength: ControlStrength): number {
  if (strength === "strong") {
    return 2;
  }
  if (strength === "medium") {
    return 1;
  }
  return 0;
}

export function optionFromPreview(previewOptionId?: OptionId | null) {
  if (!previewOptionId) {
    return null;
  }
  return LAB_MISSION.decisions.flatMap((item) => [...item.options]).find((item) => item.id === previewOptionId) ?? null;
}

export function visibleNodeIds(choices: LabChoices, previewOptionId?: OptionId | null): Set<MapNodeId> {
  const visible = new Set<MapNodeId>(CORE_VISIBLE_NODES);
  for (const decisionId of DECISION_IDS) {
    const chosen = optionForChoice(choices, decisionId);
    if (!chosen) {
      continue;
    }
    for (const nodeId of chosen.addsNodes) {
      visible.add(nodeId);
    }
  }
  const preview = optionFromPreview(previewOptionId);
  if (preview) {
    for (const nodeId of preview.addsNodes) {
      visible.add(nodeId);
    }
  }
  return visible;
}

export function visibleEdges(choices: LabChoices, previewOptionId?: OptionId | null) {
  return edgesForVisible(visibleNodeIds(choices, previewOptionId));
}

function pathUntil(path: readonly MapNodeId[], stopNode: MapNodeId): MapNodeId[] {
  const index = path.indexOf(stopNode);
  if (index < 0) {
    return [...path];
  }
  return path.slice(0, index + 1);
}

function visibleRoute(path: readonly MapNodeId[], visible: ReadonlySet<MapNodeId>, fallback: readonly MapNodeId[]): MapNodeId[] {
  const kept = path.filter((id) => visible.has(id));
  if (kept.length >= 2) {
    return kept;
  }
  const backup = fallback.filter((id) => visible.has(id));
  return backup.length >= 1 ? backup : [...kept];
}

function firstVisible(candidates: readonly MapNodeId[], visible: ReadonlySet<MapNodeId>, fallback: MapNodeId): MapNodeId {
  return candidates.find((id) => visible.has(id)) ?? fallback;
}

interface StageDraft {
  id: AttackTechniqueId;
  outcome: StageOutcomeKind;
  attackerAction: string;
  controlResponse: string;
  explanation: string;
  impact: string;
  stopNode: MapNodeId;
  responsibleNode: MapNodeId;
  path: readonly MapNodeId[];
  testedDecisionId: DecisionId;
}

export function resolveCampaignStages(choices: LabChoices): ResolvedStage[] {
  const visible = visibleNodeIds(choices);
  const identity = strengthOf(choices, "identity");
  const exposure = strengthOf(choices, "exposure");
  const input = strengthOf(choices, "input");
  const retrieval = strengthOf(choices, "retrieval");
  const gateway = strengthOf(choices, "gateway");
  const secrets = strengthOf(choices, "secrets");
  const network = strengthOf(choices, "network");
  const dataAccess = strengthOf(choices, "data-access");
  const detection = strengthOf(choices, "detection");
  const recovery = strengthOf(choices, "recovery");

  const drafts: StageDraft[] = [
    stolenCredentials(visible, identity, exposure),
    poisonedDocument(visible, input, exposure),
  ];
  const payloadHeld = drafts[1]?.outcome === "blocked";
  drafts.push(aiManipulation(visible, retrieval, payloadHeld, input));
  const sessionHeld = drafts[0]?.outcome === "blocked";
  const aiHeld = drafts[2]?.outcome === "blocked";
  const noFoothold = sessionHeld && payloadHeld;
  drafts.push(apiCall(visible, gateway, secrets, network, noFoothold));
  const apiHeld = drafts[3]?.outcome === "blocked";
  drafts.push(unrelatedClaims(visible, retrieval, dataAccess, apiHeld));
  drafts.push(extractModify(visible, dataAccess, network, secrets, apiHeld));
  const priorCompromised = drafts.some((item) => item.outcome === "compromised");
  drafts.push(monitoring(visible, detection, priorCompromised, sessionHeld && payloadHeld && aiHeld && apiHeld));
  const extractOutcome = drafts[5]?.outcome ?? "compromised";
  drafts.push(containRecover(visible, recovery, extractOutcome));

  const stages: ResolvedStage[] = [];
  let previousBlocked = false;
  for (const [index, draft] of drafts.entries()) {
    const technique = LAB_MISSION.techniques[index];
    if (!technique) {
      continue;
    }
    const chosen = optionForChoice(choices, draft.testedDecisionId);
    const isPivot = stages.length > 0 && previousBlocked;
    stages.push({
      id: technique.id,
      number: technique.number,
      name: technique.name,
      outcome: draft.outcome,
      attackerAction: draft.attackerAction,
      controlResponse: draft.controlResponse,
      explanation: draft.explanation,
      impact: draft.impact,
      entryNode: draft.path[0] ?? technique.entryNode,
      stopNode: draft.stopNode,
      responsibleNode: draft.responsibleNode,
      travelledPath: pathUntil(draft.path, draft.stopNode),
      blocked: draft.outcome === "blocked" || draft.outcome === "recovered",
      isPivot,
      pivotLabel: isPivot ? "Blocked. Red Team changes technique." : null,
      testedDecisionId: draft.testedDecisionId,
      influencingDecisionIds: technique.influencingDecisionIds,
      choiceId: chosen?.id ?? "",
      choiceTitle: chosen?.title ?? "No control selected",
    });
    previousBlocked = draft.outcome === "blocked";
  }
  return stages;
}

function stolenCredentials(
  visible: ReadonlySet<MapNodeId>,
  identity: ControlStrength,
  exposure: ControlStrength,
): StageDraft {
  const path = visibleRoute(["employee", "waf", "portal", "identity"], visible, ["employee", "portal", "identity"]);
  const identityNode = firstVisible(["identity", "portal"], visible, "portal");
  const wafNode = firstVisible(["waf", "portal"], visible, "portal");
  if (identity === "strong") {
    return {
      id: "stolen-credentials",
      outcome: "blocked",
      attackerAction: "Reuse a stolen claims-handler password at the Claims Portal.",
      controlResponse: "The Identity Provider demands a second factor and refuses the password.",
      explanation: "MFA stops the stolen password. This technique ends at the Identity Provider.",
      impact: "No working staff session from password replay.",
      stopNode: identityNode,
      responsibleNode: identityNode,
      path,
      testedDecisionId: "identity",
    };
  }
  if (identity === "medium" && exposure === "strong") {
    return {
      id: "stolen-credentials",
      outcome: "limited",
      attackerAction: "Try the stolen password from the internet against the portal.",
      controlResponse: "The WAF and private edge slow remote use. Device MFA still lets a remembered browser through.",
      explanation: "The attacker may still obtain a session from a trusted device, but the public API is not sitting on the open internet.",
      impact: "A limited staff session is possible. Direct API exposure is reduced.",
      stopNode: identityNode,
      responsibleNode: wafNode,
      path,
      testedDecisionId: "identity",
    };
  }
  if (identity === "medium") {
    return {
      id: "stolen-credentials",
      outcome: "limited",
      attackerAction: "Reuse a stolen password on a remembered claims-handler browser.",
      controlResponse: "SSO accepts the password. New devices would have seen MFA. This one does not.",
      explanation: "Group roles still bound the account, but the thief now has a working portal session.",
      impact: "The portal treats the attacker as a returning staff member.",
      stopNode: identityNode,
      responsibleNode: identityNode,
      path,
      testedDecisionId: "identity",
    };
  }
  if (exposure === "strong") {
    return {
      id: "stolen-credentials",
      outcome: "limited",
      attackerAction: "Use the shared staff password from the internet.",
      controlResponse: "The password works, but the WAF and private API endpoint keep the Claims API off the open internet.",
      explanation: "Identity did not hold. Exposure still stops the thief from calling the API as if it were a public service.",
      impact: "A portal session exists. The public blast radius is smaller.",
      stopNode: wafNode,
      responsibleNode: wafNode,
      path,
      testedDecisionId: "identity",
    };
  }
  return {
    id: "stolen-credentials",
    outcome: "compromised",
    attackerAction: "Reuse the shared claims-desk password against the public portal.",
    controlResponse: "The Identity Provider accepts the password and a wide staff role.",
    explanation: "The attacker now has a working claims session on an internet-facing portal.",
    impact: "The portal treats the thief as a staff member.",
    stopNode: identityNode,
    responsibleNode: identityNode,
    path,
    testedDecisionId: "identity",
  };
}

function poisonedDocument(
  visible: ReadonlySet<MapNodeId>,
  input: ControlStrength,
  exposure: ControlStrength,
): StageDraft {
  const path = visibleRoute(["portal", "waf", "scanner", "app"], visible, ["portal", "app"]);
  const scannerNode = firstVisible(["scanner", "portal"], visible, "portal");
  const wafNode = firstVisible(["waf", "portal"], visible, "portal");
  if (input === "strong") {
    return {
      id: "poisoned-document",
      outcome: "blocked",
      attackerAction: "Upload a claims PDF that hides prompt-injection text.",
      controlResponse: "The Document Scanner validates, scans and isolates the file before the AI Claims App.",
      explanation: "The poisoned document never becomes trusted input for the AI workflow.",
      impact: "This upload route is closed.",
      stopNode: scannerNode,
      responsibleNode: scannerNode,
      path,
      testedDecisionId: "input",
    };
  }
  if (input === "medium") {
    return {
      id: "poisoned-document",
      outcome: "limited",
      attackerAction: "Upload a clean-looking PDF with hidden instructions.",
      controlResponse: "Malware scanning lets the file through. Hidden instructions are not stripped.",
      explanation: "Known malware would have been caught. Prompt-injection text still enters the AI workflow.",
      impact: "The assistant will later retrieve untrusted file content.",
      stopNode: scannerNode,
      responsibleNode: scannerNode,
      path,
      testedDecisionId: "input",
    };
  }
  if (exposure === "strong") {
    return {
      id: "poisoned-document",
      outcome: "limited",
      attackerAction: "Push a poisoned claim through the public portal.",
      controlResponse: "The WAF filters some edge traffic. File-type checks still accept the PDF.",
      explanation: "There is no document scanner. Edge filtering only reduces, not removes, the upload path.",
      impact: "A crafted document can still reach the AI Claims App.",
      stopNode: wafNode,
      responsibleNode: wafNode,
      path,
      testedDecisionId: "input",
    };
  }
  return {
    id: "poisoned-document",
    outcome: "compromised",
    attackerAction: "Upload a claims file that only needs an allowed extension.",
    controlResponse: "The type check accepts the file. Hidden content survives.",
    explanation: "The weaponised document is now in the processing path.",
    impact: "The AI will retrieve untrusted file content.",
    stopNode: firstVisible(["app", "portal"], visible, "app"),
    responsibleNode: firstVisible(["portal", "app"], visible, "portal"),
    path,
    testedDecisionId: "input",
  };
}

function aiManipulation(
  visible: ReadonlySet<MapNodeId>,
  retrieval: ControlStrength,
  payloadHeld: boolean,
  input: ControlStrength,
): StageDraft {
  const path = visibleRoute(["scanner", "app", "retrieval"], visible, ["portal", "app"]);
  const retrievalNode = firstVisible(["retrieval", "app"], visible, "app");
  const scannerNode = firstVisible(["scanner", "app"], visible, "app");
  if (payloadHeld) {
    return {
      id: "ai-manipulation",
      outcome: "blocked",
      attackerAction: "Steer the AI Claims App with instructions hidden in the claim.",
      controlResponse: "The Document Scanner already removed the payload. The assistant is not given hostile retrieved content.",
      explanation: "There is no injected instruction left for the model to obey.",
      impact: "The AI workflow is not steered by this file.",
      stopNode: scannerNode,
      responsibleNode: scannerNode,
      path,
      testedDecisionId: "input",
    };
  }
  if (retrieval === "strong") {
    return {
      id: "ai-manipulation",
      outcome: "limited",
      attackerAction: "Ask the assistant to search neighbouring claims.",
      controlResponse: "Case-scoped retrieval refuses other customers’ documents.",
      explanation: "Hostile text can still colour the open case, but it cannot widen the search.",
      impact: "Context stays on the current claim.",
      stopNode: retrievalNode,
      responsibleNode: retrievalNode,
      path,
      testedDecisionId: "retrieval",
    };
  }
  if (retrieval === "medium" || input === "medium") {
    return {
      id: "ai-manipulation",
      outcome: "limited",
      attackerAction: "Use retrieved file text to pull related policies.",
      controlResponse: "Related policy files are in scope. The shared claims index is not.",
      explanation: "The injection works on the open case and its linked policies, not the whole book.",
      impact: "Neighbouring policy text can enter the prompt.",
      stopNode: retrievalNode,
      responsibleNode: retrievalNode,
      path,
      testedDecisionId: "retrieval",
    };
  }
  return {
    id: "ai-manipulation",
    outcome: "compromised",
    attackerAction: "Tell the assistant to search the shared claims index.",
    controlResponse: "The retrieval service treats the injection as an ordinary request.",
    explanation: "Hostile instructions now shape what the assistant retrieves.",
    impact: "Unrelated customer documents can enter the prompt.",
    stopNode: retrievalNode,
    responsibleNode: retrievalNode,
    path,
    testedDecisionId: "retrieval",
  };
}

function apiCall(
  visible: ReadonlySet<MapNodeId>,
  gateway: ControlStrength,
  secrets: ControlStrength,
  network: ControlStrength,
  noFoothold: boolean,
): StageDraft {
  const path = visibleRoute(["app", "secrets", "gateway", "api"], visible, ["app", "api"]);
  const gatewayNode = firstVisible(["gateway", "api"], visible, "api");
  const secretsNode = firstVisible(["secrets", "app"], visible, "app");
  const networkNode = firstVisible(["network", "api"], visible, "api");
  if (noFoothold) {
    return {
      id: "api-call",
      outcome: "blocked",
      attackerAction: "Have the AI Claims App call the Claims API with hostile intent.",
      controlResponse: "There is no stolen session and no poisoned document left to drive a malicious call.",
      explanation: "Earlier controls left the attacker without a foothold in the AI workflow.",
      impact: "The Claims API is not reached by this campaign.",
      stopNode: firstVisible(["app", "portal"], visible, "app"),
      responsibleNode: firstVisible(["app", "portal"], visible, "app"),
      path,
      testedDecisionId: "gateway",
    };
  }
  const pressure = rankOf(gateway) + rankOf(secrets);
  if (pressure >= 4) {
    return {
      id: "api-call",
      outcome: "blocked",
      attackerAction: "Call the Claims API with a stolen or prompted service identity.",
      controlResponse: "The private API gateway and managed identity refuse the unauthorised call.",
      explanation: "Request protection and short-lived service identity both hold.",
      impact: "The AI cannot take a portable shortcut into the Claims API.",
      stopNode: gatewayNode,
      responsibleNode: gatewayNode,
      path,
      testedDecisionId: "gateway",
    };
  }
  if (gateway === "strong") {
    return {
      id: "api-call",
      outcome: "limited",
      attackerAction: "Send a burst of prompted API requests.",
      controlResponse: "The API gateway authenticates, validates and rate-limits the path.",
      explanation: "Some calls may still be well-formed. Volume and anonymous abuse are contained.",
      impact: "The API is reachable only through the gateway’s rules.",
      stopNode: gatewayNode,
      responsibleNode: gatewayNode,
      path,
      testedDecisionId: "gateway",
    };
  }
  if (secrets === "strong") {
    return {
      id: "api-call",
      outcome: "limited",
      attackerAction: "Copy a reusable key out of the AI Claims App.",
      controlResponse: "There is no static key to steal. Managed identity issues a short-lived token.",
      explanation: "Compromising the app does not hand over a portable credential. The live identity can still call what the API allows.",
      impact: "No reusable key leaves the environment.",
      stopNode: secretsNode,
      responsibleNode: secretsNode,
      path,
      testedDecisionId: "secrets",
    };
  }
  if (network === "strong" || pressure >= 2) {
    return {
      id: "api-call",
      outcome: "limited",
      attackerAction: "Walk from the AI Claims App toward the Claims API.",
      controlResponse: "Segmentation or partial API protection slows the call path.",
      explanation: "The request is not free-form, but a well-formed call from the app can still proceed.",
      impact: "Lateral movement is reduced. The API is not wide open.",
      stopNode: network === "strong" ? networkNode : gatewayNode,
      responsibleNode: network === "strong" ? networkNode : gatewayNode,
      path,
      testedDecisionId: network === "strong" ? "network" : "gateway",
    };
  }
  return {
    id: "api-call",
    outcome: "compromised",
    attackerAction: "Call the public Claims API with the application token from the AI app.",
    controlResponse: "The token is accepted. There is no gateway in the path.",
    explanation: "The manipulated workflow now has a working service call into the Claims API.",
    impact: "The API treats the attacker as the application.",
    stopNode: firstVisible(["api", "app"], visible, "api"),
    responsibleNode: firstVisible(["api", "app"], visible, "api"),
    path,
    testedDecisionId: "gateway",
  };
}

function unrelatedClaims(
  visible: ReadonlySet<MapNodeId>,
  retrieval: ControlStrength,
  dataAccess: ControlStrength,
  apiHeld: boolean,
): StageDraft {
  const path = visibleRoute(["retrieval", "api", "database"], visible, ["app", "api", "database"]);
  const retrievalNode = firstVisible(["retrieval", "api"], visible, "api");
  const apiNode = firstVisible(["api", "database"], visible, "database");
  if (apiHeld) {
    return {
      id: "unrelated-claims",
      outcome: "blocked",
      attackerAction: "Ask for customer records that are not the open case.",
      controlResponse: "The Claims API was not reached, so unrelated records cannot be queried this way.",
      explanation: "API protection stopped the call before retrieval could widen.",
      impact: "Other customers’ claims stay out of this path.",
      stopNode: apiNode,
      responsibleNode: apiNode,
      path,
      testedDecisionId: "gateway",
    };
  }
  if (retrieval === "strong" || dataAccess === "strong") {
    const responsible = retrieval === "strong" ? retrievalNode : apiNode;
    return {
      id: "unrelated-claims",
      outcome: "blocked",
      attackerAction: "Search or query claims that belong to other customers.",
      controlResponse:
        retrieval === "strong"
          ? "The retrieval service returns only the open claim."
          : "The Claims API refuses anything beyond approved reads on the open claim.",
      explanation: "Least privilege on retrieval or the API keeps the blast radius on the current case.",
      impact: "Unrelated customer records are not returned.",
      stopNode: responsible,
      responsibleNode: responsible,
      path,
      testedDecisionId: retrieval === "strong" ? "retrieval" : "data-access",
    };
  }
  if (retrieval === "medium" || dataAccess === "medium") {
    return {
      id: "unrelated-claims",
      outcome: "limited",
      attackerAction: "Pull neighbouring policy files and related claims.",
      controlResponse: "Related policies or the active claim are in scope. The full book is not.",
      explanation: "The attacker gets more than one case, not a bulk export of every customer.",
      impact: "Linked records can leak. The shared index is still bounded.",
      stopNode: retrieval === "medium" ? retrievalNode : apiNode,
      responsibleNode: retrieval === "medium" ? retrievalNode : apiNode,
      path,
      testedDecisionId: retrieval === "medium" ? "retrieval" : "data-access",
    };
  }
  return {
    id: "unrelated-claims",
    outcome: "compromised",
    attackerAction: "Search the shared claims index and read across the book.",
    controlResponse: "The broad service account and shared index accept the request.",
    explanation: "One steered workflow now reaches unrelated customers.",
    impact: "Customer records beyond the open case are readable.",
    stopNode: firstVisible(["database", "api"], visible, "database"),
    responsibleNode: apiNode,
    path,
    testedDecisionId: "data-access",
  };
}

function extractModify(
  visible: ReadonlySet<MapNodeId>,
  dataAccess: ControlStrength,
  network: ControlStrength,
  secrets: ControlStrength,
  apiHeld: boolean,
): StageDraft {
  const path = visibleRoute(["api", "network", "database"], visible, ["api", "database"]);
  const apiNode = firstVisible(["api", "database"], visible, "database");
  const dataNode = firstVisible(["database", "api"], visible, "database");
  const networkNode = firstVisible(["network", "database"], visible, "database");
  if (apiHeld) {
    return {
      id: "extract-modify",
      outcome: "blocked",
      attackerAction: "Extract or change records in the Claims Database.",
      controlResponse: "The Claims API never accepted the hostile call.",
      explanation: "Without an API foothold, the database is not reached on this path.",
      impact: "Payout and customer records are not changed by this campaign.",
      stopNode: apiNode,
      responsibleNode: apiNode,
      path,
      testedDecisionId: "gateway",
    };
  }
  if (dataAccess === "strong") {
    return {
      id: "extract-modify",
      outcome: "blocked",
      attackerAction: "Export the book or change a payout through the Claims API.",
      controlResponse: "The API is read-only on the open claim. Writes and bulk export are refused.",
      explanation: "Least privilege stops the last step even if the assistant was steered.",
      impact: "The Claims Database is not rewritten on this path.",
      stopNode: apiNode,
      responsibleNode: apiNode,
      path,
      testedDecisionId: "data-access",
    };
  }
  if (dataAccess === "medium" || network === "strong" || secrets === "strong") {
    return {
      id: "extract-modify",
      outcome: "limited",
      attackerAction: "Change payout fields or copy extra records from the database.",
      controlResponse:
        dataAccess === "medium"
          ? "Read-write is allowed on the open claim only."
          : "Segmentation or managed identity keeps the change from becoming a bulk export.",
      explanation: "The open case can still be harmed. The rest of the book is harder to reach.",
      impact: "Blast radius is reduced to the active claim or a constrained zone.",
      stopNode: dataAccess === "medium" ? dataNode : network === "strong" ? networkNode : apiNode,
      responsibleNode: dataAccess === "medium" ? apiNode : network === "strong" ? networkNode : apiNode,
      path,
      testedDecisionId: dataAccess === "medium" ? "data-access" : network === "strong" ? "network" : "secrets",
    };
  }
  return {
    id: "extract-modify",
    outcome: "compromised",
    attackerAction: "Read and update claims through the shared service account.",
    controlResponse: "The Claims API allows the write. The database accepts it.",
    explanation: "A manipulated instruction became a real change in the Claims Database.",
    impact: "Customer records can be extracted or modified.",
    stopNode: dataNode,
    responsibleNode: dataNode,
    path,
    testedDecisionId: "data-access",
  };
}

function monitoring(
  visible: ReadonlySet<MapNodeId>,
  detection: ControlStrength,
  priorCompromised: boolean,
  quietCampaign: boolean,
): StageDraft {
  const path = visibleRoute(["identity", "app", "api", "detection"], visible, ["app", "detection"]);
  const detectNode = firstVisible(["detection", "app"], visible, "app");
  if (detection === "strong") {
    return {
      id: "monitoring",
      outcome: "detected",
      attackerAction: "Leave traces across identity, uploads, AI actions, API calls and database queries.",
      controlResponse: "The SIEM correlates those events and the playbook names one incident.",
      explanation: quietCampaign
        ? "Even the blocked attempts are visible as a campaign, not isolated log lines."
        : "Monitoring raises an alert while the architecture is still under pressure.",
      impact: "The organisation can see the attack as one story.",
      stopNode: detectNode,
      responsibleNode: detectNode,
      path,
      testedDecisionId: "detection",
    };
  }
  if (detection === "medium") {
    return {
      id: "monitoring",
      outcome: priorCompromised ? "detected" : "limited",
      attackerAction: "Scatter events across services and hope nobody joins them.",
      controlResponse: "Central logs exist. Nobody owns a joined-up response playbook.",
      explanation: priorCompromised
        ? "The noisier steps are reconstructable. Containment still depends on someone looking in time."
        : "Quiet blocked attempts may sit in the store without becoming an incident.",
      impact: "Evidence exists. A timely alert is not guaranteed.",
      stopNode: detectNode,
      responsibleNode: detectNode,
      path,
      testedDecisionId: "detection",
    };
  }
  return {
    id: "monitoring",
    outcome: "compromised",
    attackerAction: "Leave a breadcrumb in each service log.",
    controlResponse: "Each service kept its own events. Nobody joined them in time.",
    explanation: "The organisation may reconstruct this later. It does not see a campaign now.",
    impact: "Detection does not help while the attack is still moving.",
    stopNode: detectNode,
    responsibleNode: detectNode,
    path,
    testedDecisionId: "detection",
  };
}

function containRecover(
  visible: ReadonlySet<MapNodeId>,
  recovery: ControlStrength,
  extractOutcome: StageOutcomeKind,
): StageDraft {
  const path = visibleRoute(["detection", "backup", "database"], visible, ["database", "backup"]);
  const backupNode = firstVisible(["backup", "database"], visible, "database");
  if (recovery === "strong") {
    return {
      id: "contain-recover",
      outcome: "recovered",
      attackerAction: "Keep using the foothold, including any changes already made to claims data.",
      controlResponse: "Isolation, credential revocation and protected backups are executed from a tested process.",
      explanation:
        extractOutcome === "compromised"
          ? "The database was reached, then the organisation cut the path and restored from a backup the attacker did not hold."
          : "Little damage landed. The same controls would have contained a deeper foothold.",
      impact: "Lasting damage is reduced. Some open claims still need review.",
      stopNode: backupNode,
      responsibleNode: backupNode,
      path,
      testedDecisionId: "recovery",
    };
  }
  if (recovery === "medium") {
    return {
      id: "contain-recover",
      outcome: "limited",
      attackerAction: "Rely on the live incident lasting long enough to matter.",
      controlResponse: "Backups exist. Isolation and incident response are untested.",
      explanation: "Records can be restored later. The live attacker may not be cut off quickly.",
      impact: "Recovery is possible. Containment is slow.",
      stopNode: backupNode,
      responsibleNode: backupNode,
      path,
      testedDecisionId: "recovery",
    };
  }
  return {
    id: "contain-recover",
    outcome: "compromised",
    attackerAction: "Treat the live account — including its database copies — as the whole estate.",
    controlResponse: "There is no practised isolation or revocation path.",
    explanation:
      extractOutcome === "compromised"
        ? "The Claims Database remains exposed, and the live-account copy does not give Nordic Shield a clean restore."
        : "Earlier layers limited the hit, but there is still no practised way to isolate if the next attempt lands.",
    impact: "Damage that reached production is likely to stay.",
    stopNode: firstVisible(["database", "backup"], visible, "database"),
    responsibleNode: firstVisible(["database", "backup"], visible, "database"),
    path,
    testedDecisionId: "recovery",
  };
}
