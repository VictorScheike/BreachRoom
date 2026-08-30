import { LAB_MISSION, optionForChoice } from "./catalog";
import { CORE_VISIBLE_NODES, edgesForVisible } from "./map-layout";
import type {
  AttackTechniqueId,
  ControlStatus,
  DecisionId,
  LabChoices,
  MapNodeId,
  OptionId,
  ResolvedStage,
  StageOutcomeKind,
} from "./types";
import { DECISION_IDS } from "./types";

export type ControlStrength = "strong" | "medium" | "weak";

const LATER_OFFENSIVE: readonly AttackTechniqueId[] = [
  "api-call",
  "unrelated-claims",
  "extract-modify",
  "payout-manipulation",
];

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

function continues(outcome: StageOutcomeKind): boolean {
  return outcome === "succeeded" || outcome === "compromised" || outcome === "limited";
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
  controlStatus: ControlStatus | null;
}

function notReached(
  id: AttackTechniqueId,
  testedDecisionId: DecisionId,
  stopNode: MapNodeId,
  reason: string,
): StageDraft {
  return {
    id,
    outcome: "not-reached",
    attackerAction: "This step was not attempted.",
    controlResponse: reason,
    explanation: reason,
    impact: "No additional access was obtained.",
    stopNode,
    responsibleNode: stopNode,
    path: [stopNode],
    testedDecisionId,
    controlStatus: null,
  };
}

export function resolveCampaignStages(choices: LabChoices): ResolvedStage[] {
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
    initialFoothold(identity, exposure),
    claimsPortal(identity, exposure),
  ];

  const document = poisonedDocument(input);
  drafts.push(document);
  const documentReachedAi = continues(document.outcome);

  const ai = documentReachedAi
    ? aiManipulation(input, retrieval, dataAccess)
    : notReached(
        "ai-manipulation",
        "retrieval",
        "app",
        "The poisoned document did not reach the AI workflow, so manipulation was not attempted.",
      );
  drafts.push(ai);

  let offensiveStopped = !continues(ai.outcome);
  const later: StageDraft[] = offensiveStopped
    ? LATER_OFFENSIVE.map((id) => laterNotReached(id, "The attack was blocked at the AI Claims App."))
    : [apiCall(gateway, secrets, network)];

  if (!offensiveStopped) {
    const api = later[0]!;
    if (!continues(api.outcome)) {
      offensiveStopped = true;
      later.push(
        laterNotReached("unrelated-claims", "The Claims API was not reached."),
        laterNotReached("extract-modify", "The Claims API was not reached."),
        laterNotReached("payout-manipulation", "The Claims API was not reached."),
      );
    } else {
      const unrelated = unrelatedClaims(retrieval, dataAccess);
      later.push(unrelated);
      const extract = extractModify(dataAccess, network, secrets);
      later.push(extract);
      later.push(
        continues(extract.outcome)
          ? payoutManipulation(dataAccess)
          : laterNotReached("payout-manipulation", "Write access to claims data was not obtained."),
      );
    }
  }
  drafts.push(...later);

  const impact = drafts.some(
    (item) =>
      (item.id === "extract-modify" || item.id === "payout-manipulation") && continues(item.outcome),
  );
  const monitor = monitoring(detection, drafts);
  drafts.push(monitor);
  drafts.push(containRecover(recovery, monitor.outcome, impact));

  return drafts.map((draft, index) => toResolved(choices, draft, index));
}

function laterNotReached(id: AttackTechniqueId, reason: string): StageDraft {
  const stop: MapNodeId =
    id === "api-call" ? "app" : id === "unrelated-claims" ? "api" : "database";
  const tested: DecisionId =
    id === "api-call" ? "gateway" : id === "unrelated-claims" ? "retrieval" : "data-access";
  return notReached(id, tested, stop, reason);
}

function toResolved(choices: LabChoices, draft: StageDraft, index: number): ResolvedStage {
  const technique = LAB_MISSION.techniques[index];
  if (!technique) {
    throw new Error(`Missing campaign technique at index ${index}`);
  }
  const chosen = optionForChoice(choices, draft.testedDecisionId);
  const travelled =
    draft.outcome === "not-reached" || draft.outcome === "not-required"
      ? [draft.stopNode]
      : pathUntil(draft.path.length > 0 ? draft.path : technique.path, draft.stopNode);
  return {
    id: technique.id,
    number: technique.number,
    name: technique.name,
    role: technique.role,
    outcome: draft.outcome,
    requiredAccess: technique.requiredAccess,
    target: technique.target,
    attemptedAction: technique.attemptedAction,
    controlTested: technique.controlTested,
    accessIfSuccessful: technique.accessIfSuccessful,
    nextStageIds: technique.nextStageIds,
    attackerAction: draft.attackerAction,
    controlResponse: draft.controlResponse,
    explanation: draft.explanation,
    impact: draft.impact,
    entryNode: travelled[0] ?? technique.entryNode,
    stopNode: draft.stopNode,
    responsibleNode: draft.responsibleNode,
    travelledPath: travelled,
    blocked: draft.outcome === "blocked" || draft.outcome === "contained",
    isPivot: false,
    pivotLabel: null,
    testedDecisionId: draft.testedDecisionId,
    influencingDecisionIds: technique.influencingDecisionIds,
    choiceId: chosen?.id ?? "",
    choiceTitle: chosen?.title ?? "No control selected",
    controlStatus: draft.controlStatus,
  };
}

function initialFoothold(identity: ControlStrength, exposure: ControlStrength): StageDraft {
  const mfaNote =
    identity === "strong"
      ? "MFA prevented direct password replay and RBAC limits this session to a low-privilege claims-handler role. MFA cannot invalidate an active session before suspicious behaviour is detected."
      : identity === "medium"
        ? "SSO and group roles still bound the account. Device MFA would have stopped a new browser, but this session is already authenticated."
        : "A shared staff password and a wide role make the stolen session more powerful, but the foothold itself is the scenario assumption.";
  return {
    id: "initial-foothold",
    outcome: "succeeded",
    attackerAction: "Use a stolen authenticated claims-handler session.",
    controlResponse: mfaNote,
    explanation:
      "The Red Team starts with an already authenticated low-privilege claims-handler session. This foothold always succeeds. It is the scenario assumption, not the result of a wrong architecture choice.",
    impact:
      exposure === "strong"
        ? "The attacker has a working staff session. The Claims API is still off the public internet."
        : "The attacker has a working staff session.",
    stopNode: "employee",
    responsibleNode: "identity",
    path: ["employee", "portal"],
    testedDecisionId: "identity",
    controlStatus: identity === "weak" ? "bypassed" : "effective",
  };
}

function claimsPortal(identity: ControlStrength, exposure: ControlStrength): StageDraft {
  return {
    id: "claims-portal",
    outcome: "compromised",
    attackerAction: "Open the Claims Portal with the stolen authenticated session.",
    controlResponse:
      exposure === "strong"
        ? "The WAF does not treat a valid staff session as an anonymous probe. The portal accepts the session."
        : "The portal accepts the valid session. Edge filtering, if present, does not revoke it.",
    explanation:
      identity === "strong"
        ? "The Claims Portal is reached. RBAC still limits the attacker to claims-handler privileges."
        : "The Claims Portal is reached and treats the attacker as a logged-in member of staff.",
    impact: "The attacker can use portal functions available to that session, including document upload.",
    stopNode: "portal",
    responsibleNode: "portal",
    path: ["employee", "portal"],
    testedDecisionId: "identity",
    controlStatus: identity === "strong" ? "effective" : identity === "medium" ? "bypassed" : "failed",
  };
}

function poisonedDocument(input: ControlStrength): StageDraft {
  if (input === "strong") {
    return {
      id: "poisoned-document",
      outcome: "limited",
      attackerAction: "Upload a claims document that hides semantic prompt-injection text.",
      controlResponse:
        "The employee account is allowed to upload a claims document. The scanner confirms that it contains no executable malware and isolates its processing. Semantic prompt-injection text may still reach the AI workflow.",
      explanation: "Malware is stopped. Untrusted wording in the file can still be retrieved by the assistant.",
      impact: "The file is in the processing path, with reduced executable risk.",
      stopNode: "app",
      responsibleNode: "scanner",
      path: ["portal", "app"],
      testedDecisionId: "input",
      controlStatus: "triggered",
    };
  }
  if (input === "medium") {
    return {
      id: "poisoned-document",
      outcome: "limited",
      attackerAction: "Upload a clean-looking PDF with hidden instructions.",
      controlResponse: "Malware scanning lets the file through. Hidden instructions are not stripped.",
      explanation: "Known malware would have been caught. Prompt-injection text still enters the AI workflow.",
      impact: "The assistant will retrieve untrusted file content.",
      stopNode: "app",
      responsibleNode: "scanner",
      path: ["portal", "app"],
      testedDecisionId: "input",
      controlStatus: "bypassed",
    };
  }
  return {
    id: "poisoned-document",
    outcome: "succeeded",
    attackerAction: "Upload a claims file that only needs an allowed extension.",
    controlResponse: "The type check accepts the file. Hidden content survives.",
    explanation: "The weaponised document is now in the processing path.",
    impact: "The AI will retrieve untrusted file content.",
    stopNode: "app",
    responsibleNode: "portal",
    path: ["portal", "app"],
    testedDecisionId: "input",
    controlStatus: "failed",
  };
}

function aiManipulation(input: ControlStrength, retrieval: ControlStrength, dataAccess: ControlStrength): StageDraft {
  const toolsRestricted = dataAccess === "strong";
  if (input === "strong" && retrieval === "strong") {
    return {
      id: "ai-manipulation",
      outcome: "blocked",
      attackerAction: "Steer the AI Claims App into unauthorised actions with the uploaded text.",
      controlResponse:
        toolsRestricted
          ? "AI input controls, case-scoped retrieval and restricted tools prevent the document from causing unauthorised actions."
          : "AI input controls and case-scoped retrieval prevent the document from causing unauthorised actions.",
      explanation: "The assistant cannot be turned into an attack tool from this file. The offensive path ends here.",
      impact: "No unauthorised AI action is taken. Later API and data stages are not reached.",
      stopNode: "app",
      responsibleNode: "retrieval",
      path: ["app"],
      testedDecisionId: "retrieval",
      controlStatus: "effective",
    };
  }
  if (retrieval === "strong") {
    return {
      id: "ai-manipulation",
      outcome: "limited",
      attackerAction: "Ask the assistant to search neighbouring claims and take further action.",
      controlResponse: "Case-scoped retrieval refuses other customers’ documents. Hostile text can still colour the open case.",
      explanation: "The injection cannot widen the search. It may still influence the current claim.",
      impact: "Context stays on the current claim. The workflow can still attempt in-scope tool calls.",
      stopNode: "app",
      responsibleNode: "retrieval",
      path: ["app"],
      testedDecisionId: "retrieval",
      controlStatus: "triggered",
    };
  }
  if (retrieval === "medium" || input === "medium") {
    return {
      id: "ai-manipulation",
      outcome: "limited",
      attackerAction: "Use retrieved file text to pull related policies and drive tool use.",
      controlResponse: "Related policy files are in scope. The shared claims index is not.",
      explanation: "The injection works on the open case and its linked policies, not the whole book.",
      impact: "Neighbouring policy text can enter the prompt. Internal calls may still be attempted.",
      stopNode: "app",
      responsibleNode: "retrieval",
      path: ["app"],
      testedDecisionId: "retrieval",
      controlStatus: "bypassed",
    };
  }
  return {
    id: "ai-manipulation",
    outcome: "succeeded",
    attackerAction: "Tell the assistant to search the shared claims index and call internal tools.",
    controlResponse: "The retrieval service treats the injection as an ordinary request.",
    explanation: "Hostile instructions now shape what the assistant retrieves and which tools it tries.",
    impact: "The AI workflow is steered and can attempt Claims API calls.",
    stopNode: "app",
    responsibleNode: "app",
    path: ["app"],
    testedDecisionId: "retrieval",
    controlStatus: "failed",
  };
}

function apiCall(gateway: ControlStrength, secrets: ControlStrength, network: ControlStrength): StageDraft {
  const pressure = rankOf(gateway) + rankOf(secrets);
  if (pressure >= 4) {
    return {
      id: "api-call",
      outcome: "blocked",
      attackerAction: "Have the AI Claims App call the Claims API with hostile intent.",
      controlResponse: "The private API gateway and managed identity refuse the unauthorised call.",
      explanation: "Request protection and short-lived service identity both hold. The Claims API is not reached.",
      impact: "Later data stages are not reached.",
      stopNode: "app",
      responsibleNode: "gateway",
      path: ["app", "api"],
      testedDecisionId: "gateway",
      controlStatus: "effective",
    };
  }
  if (gateway === "strong") {
    return {
      id: "api-call",
      outcome: "limited",
      attackerAction: "Send prompted API requests from the AI Claims App.",
      controlResponse: "The API gateway authenticates, validates and rate-limits the path.",
      explanation: "Some well-formed in-scope calls may still proceed. Anonymous abuse is contained.",
      impact: "The API is reachable only through the gateway’s rules.",
      stopNode: "api",
      responsibleNode: "gateway",
      path: ["app", "api"],
      testedDecisionId: "gateway",
      controlStatus: "triggered",
    };
  }
  if (secrets === "strong") {
    return {
      id: "api-call",
      outcome: "limited",
      attackerAction: "Copy a reusable key out of the AI Claims App.",
      controlResponse: "There is no static key to steal. Managed identity issues a short-lived token.",
      explanation: "Compromising the app does not hand over a portable credential. The live identity can still call what the API allows.",
      impact: "No reusable key leaves the environment. In-scope API calls remain possible.",
      stopNode: "api",
      responsibleNode: "secrets",
      path: ["app", "api"],
      testedDecisionId: "secrets",
      controlStatus: "effective",
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
      stopNode: "api",
      responsibleNode: network === "strong" ? "network" : "gateway",
      path: ["app", "api"],
      testedDecisionId: network === "strong" ? "network" : "gateway",
      controlStatus: "triggered",
    };
  }
  return {
    id: "api-call",
    outcome: "succeeded",
    attackerAction: "Call the public Claims API with the application token from the AI app.",
    controlResponse: "The token is accepted. There is no gateway in the path.",
    explanation: "The manipulated workflow now has a working service call into the Claims API.",
    impact: "The API treats the attacker as the application.",
    stopNode: "api",
    responsibleNode: "api",
    path: ["app", "api"],
    testedDecisionId: "gateway",
    controlStatus: "failed",
  };
}

function unrelatedClaims(retrieval: ControlStrength, dataAccess: ControlStrength): StageDraft {
  if (retrieval === "strong" || dataAccess === "strong") {
    const retrievalHolds = retrieval === "strong";
    return {
      id: "unrelated-claims",
      outcome: "blocked",
      attackerAction: "Search or query claims that belong to other customers.",
      controlResponse: retrievalHolds
        ? "The retrieval service returns only the open claim."
        : "The Claims API refuses anything beyond approved reads on the open claim.",
      explanation: "Least privilege on retrieval or the API keeps the blast radius on the current case.",
      impact: "Unrelated customer records are not returned. The current claim may still be in scope.",
      stopNode: retrievalHolds ? "app" : "api",
      responsibleNode: retrievalHolds ? "retrieval" : "api",
      path: ["api", "database"],
      testedDecisionId: retrievalHolds ? "retrieval" : "data-access",
      controlStatus: "effective",
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
      stopNode: "database",
      responsibleNode: retrieval === "medium" ? "retrieval" : "api",
      path: ["api", "database"],
      testedDecisionId: retrieval === "medium" ? "retrieval" : "data-access",
      controlStatus: "bypassed",
    };
  }
  return {
    id: "unrelated-claims",
    outcome: "succeeded",
    attackerAction: "Search the shared claims index and read across the book.",
    controlResponse: "The broad service account and shared index accept the request.",
    explanation: "One steered workflow now reaches unrelated customers.",
    impact: "Customer records beyond the open case are readable.",
    stopNode: "database",
    responsibleNode: "database",
    path: ["api", "database"],
    testedDecisionId: "data-access",
    controlStatus: "failed",
  };
}

function extractModify(
  dataAccess: ControlStrength,
  network: ControlStrength,
  secrets: ControlStrength,
): StageDraft {
  if (dataAccess === "strong") {
    return {
      id: "extract-modify",
      outcome: "blocked",
      attackerAction: "Export the book or change a payout through the Claims API.",
      controlResponse: "The API is read-only on the open claim. Writes and bulk export are refused.",
      explanation: "Least privilege stops extraction and modification even if the assistant was steered.",
      impact: "Protected database records are not changed.",
      stopNode: "api",
      responsibleNode: "api",
      path: ["api", "database"],
      testedDecisionId: "data-access",
      controlStatus: "effective",
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
      impact: "The open claim in the Claims Database can be changed.",
      stopNode: "database",
      responsibleNode: "database",
      path: ["api", "database"],
      testedDecisionId: dataAccess === "medium" ? "data-access" : network === "strong" ? "network" : "secrets",
      controlStatus: "bypassed",
    };
  }
  return {
    id: "extract-modify",
    outcome: "succeeded",
    attackerAction: "Read and update claims through the shared service account.",
    controlResponse: "The Claims API allows the write. The database accepts it.",
    explanation: "A manipulated instruction became a real change in the Claims Database.",
    impact: "Customer records can be extracted or modified.",
    stopNode: "database",
    responsibleNode: "database",
    path: ["api", "database"],
    testedDecisionId: "data-access",
    controlStatus: "failed",
  };
}

function payoutManipulation(dataAccess: ControlStrength): StageDraft {
  if (dataAccess === "medium") {
    return {
      id: "payout-manipulation",
      outcome: "limited",
      attackerAction: "Change payout fields on the open claim without a separate human approval step.",
      controlResponse: "The API allows updates on the active claim. High-impact payout review is not enforced here.",
      explanation: "Payout values on the open case can be altered. Other customers are still out of reach.",
      impact: "The open claim’s payout can be manipulated.",
      stopNode: "database",
      responsibleNode: "database",
      path: ["api", "database"],
      testedDecisionId: "data-access",
      controlStatus: "bypassed",
    };
  }
  return {
    id: "payout-manipulation",
    outcome: "succeeded",
    attackerAction: "Change payouts across reachable claims without human approval.",
    controlResponse: "The shared service account can update payout fields.",
    explanation: "Missing human approval lets a steered workflow change money movement.",
    impact: "Payout functions were reached and used.",
    stopNode: "database",
    responsibleNode: "database",
    path: ["api", "database"],
    testedDecisionId: "data-access",
    controlStatus: "failed",
  };
}

function monitoring(detection: ControlStrength, drafts: readonly StageDraft[]): StageDraft {
  const reachedApp = drafts.some((item) => item.id === "poisoned-document" && continues(item.outcome));
  const blockedAi = drafts.some((item) => item.id === "ai-manipulation" && item.outcome === "blocked");
  if (detection === "strong") {
    return {
      id: "monitoring",
      outcome: "detected",
      attackerAction: "Leave traces across the stolen session, document processing and attempted AI activity.",
      controlResponse:
        blockedAi
          ? "The SIEM correlates unusual session behaviour, document processing and attempted AI manipulation."
          : "The SIEM correlates those events and the playbook names one incident.",
      explanation: "Detection still runs after a blocked attempt when telemetry exists. The organisation can see the attack as one story.",
      impact: "Responders have a usable incident picture.",
      stopNode: "detection",
      responsibleNode: "detection",
      path: reachedApp ? ["portal", "app"] : ["portal"],
      testedDecisionId: "detection",
      controlStatus: "effective",
    };
  }
  if (detection === "medium") {
    return {
      id: "monitoring",
      outcome: "limited",
      attackerAction: "Scatter events across services and hope nobody joins them.",
      controlResponse: "Central logs exist. Nobody owns a joined-up response playbook.",
      explanation: "Evidence exists. A timely alert is not guaranteed.",
      impact: "The organisation may reconstruct this later rather than contain it now.",
      stopNode: "detection",
      responsibleNode: "detection",
      path: ["portal", "app"],
      testedDecisionId: "detection",
      controlStatus: "triggered",
    };
  }
  return {
    id: "monitoring",
    outcome: "limited",
    attackerAction: "Leave a breadcrumb in each service log.",
    controlResponse: "Each service kept its own events. Nobody joined them in time.",
    explanation: "There is not enough correlated telemetry for a campaign-level alert.",
    impact: "Detection does not help while the session is still live.",
    stopNode: "portal",
    responsibleNode: "detection",
    path: ["portal"],
    testedDecisionId: "detection",
    controlStatus: "failed",
  };
}

function containRecover(
  recovery: ControlStrength,
  monitorOutcome: StageOutcomeKind,
  impact: boolean,
): StageDraft {
  const detected = monitorOutcome === "detected";
  if (recovery === "strong" && (detected || monitorOutcome === "limited")) {
    if (!impact) {
      return {
        id: "contain-recover",
        outcome: "contained",
        attackerAction: "Keep using the stolen session after the offensive path has stopped.",
        controlResponse: "The session is revoked, the affected case is isolated and the document is preserved for investigation.",
        explanation: "No protected data was changed or destroyed. Backups were not needed.",
        impact: "The stolen session is cut off. Recovery was prepared, but not required.",
        stopNode: "portal",
        responsibleNode: "backup",
        path: ["portal"],
        testedDecisionId: "recovery",
        controlStatus: "effective",
      };
    }
    return {
      id: "contain-recover",
      outcome: "recovered",
      attackerAction: "Keep using the foothold, including changes already made to claims data.",
      controlResponse: "Isolation, credential revocation and protected backups are executed from a tested process.",
      explanation: "The organisation cut the path and restored from a backup the attacker did not hold.",
      impact: "Lasting damage is reduced. Some open claims still need review.",
      stopNode: "database",
      responsibleNode: "backup",
      path: ["portal", "database"],
      testedDecisionId: "recovery",
      controlStatus: "effective",
    };
  }
  if (recovery === "medium") {
    return {
      id: "contain-recover",
      outcome: impact ? "limited" : "contained",
      attackerAction: "Rely on the live incident lasting long enough to matter.",
      controlResponse: "Backups exist. Isolation and incident response are untested.",
      explanation: impact
        ? "Records can be restored later. The live attacker may not be cut off quickly."
        : "The offensive path already stopped. Isolation of the live session is slow.",
      impact: impact ? "Recovery is possible. Containment is slow." : "The session may remain live longer than it should.",
      stopNode: impact ? "database" : "portal",
      responsibleNode: "backup",
      path: [impact ? "database" : "portal"],
      testedDecisionId: "recovery",
      controlStatus: "triggered",
    };
  }
  if (!impact) {
    return {
      id: "contain-recover",
      outcome: "contained",
      attackerAction: "Keep the stolen session if nobody revokes it.",
      controlResponse: "There is no practised isolation or revocation path.",
      explanation: "The offensive path already ended. The session may still be live because nobody isolated it.",
      impact: "No protected data was changed. The session is not cleanly revoked.",
      stopNode: "portal",
      responsibleNode: "portal",
      path: ["portal"],
      testedDecisionId: "recovery",
      controlStatus: "failed",
    };
  }
  return {
    id: "contain-recover",
    outcome: "succeeded",
    attackerAction: "Treat the live account — including its database copies — as the whole estate.",
    controlResponse: "There is no practised isolation or revocation path.",
    explanation: "The Claims Database was changed, and the live-account copy does not give Nordic Shield a clean restore.",
    impact: "Damage that reached production is likely to stay.",
    stopNode: "database",
    responsibleNode: "database",
    path: ["database"],
    testedDecisionId: "recovery",
    controlStatus: "failed",
  };
}

export function hasDataImpact(stages: readonly ResolvedStage[]): boolean {
  return stages.some(
    (item) =>
      (item.id === "extract-modify" || item.id === "payout-manipulation") && continues(item.outcome),
  );
}

export function nextPlayableStageIndex(stages: readonly ResolvedStage[], current1Based: number): number | null {
  for (let index = current1Based; index < stages.length; index += 1) {
    if (stages[index]?.outcome !== "not-reached" && stages[index]?.outcome !== "not-required") {
      return index;
    }
  }
  return null;
}

export function previousPlayableStageIndex(stages: readonly ResolvedStage[], current1Based: number): number | null {
  for (let index = current1Based - 2; index >= 0; index -= 1) {
    if (stages[index]?.outcome !== "not-reached" && stages[index]?.outcome !== "not-required") {
      return index;
    }
  }
  return null;
}
