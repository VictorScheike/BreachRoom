import { LAB_MISSION, requireComponent, slotById } from "./catalog";
import type {
  ArchitectureComponent,
  ArchitectureReview,
  AttackSimulation,
  AttackStageId,
  FinalResultKind,
  LabDifficulty,
  LabPlacements,
  ReadinessVector,
  ResolvedStage,
  SlotId,
  StageOutcomeKind,
} from "./types";
import { SLOT_IDS } from "./types";

const OUTCOME_STRENGTH: Record<StageOutcomeKind, number> = {
  successful: 0,
  detected: 1,
  contained: 2,
  blocked: 3,
};

const RESULT_RANK: Record<FinalResultKind, number> = {
  "architecture-breached": 0,
  "partial-breach": 1,
  "attack-contained": 2,
  "architecture-holds": 3,
};

const RESULT_LABEL: Record<FinalResultKind, string> = {
  "architecture-holds": "Architecture Holds",
  "attack-contained": "Attack Contained",
  "partial-breach": "Partial Breach",
  "architecture-breached": "Architecture Breached",
};

const RESULT_SCORE: Record<FinalResultKind, number> = {
  "architecture-holds": 92,
  "attack-contained": 74,
  "partial-breach": 48,
  "architecture-breached": 22,
};

export function canPlace(componentId: string, slotId: SlotId, difficulty: LabDifficulty): boolean {
  try {
    const component = requireComponent(componentId);
    return component.slotId === slotId && component.difficulties.includes(difficulty);
  } catch {
    return false;
  }
}

export function placeComponent(
  placements: LabPlacements,
  componentId: string,
  slotId: SlotId,
  difficulty: LabDifficulty,
): LabPlacements {
  if (!canPlace(componentId, slotId, difficulty)) {
    return placements;
  }
  return { ...placements, [slotId]: componentId };
}

export function missingSlots(placements: LabPlacements, difficulty: LabDifficulty): SlotId[] {
  return SLOT_IDS.filter((slotId) => {
    const id = placements[slotId];
    return !id || !canPlace(id, slotId, difficulty);
  });
}

export function placedComponents(placements: LabPlacements): ArchitectureComponent[] {
  return SLOT_IDS.flatMap((slotId) => {
    const id = placements[slotId];
    return id ? [requireComponent(id)] : [];
  });
}

export function readinessFor(placements: LabPlacements): ReadinessVector & { overall: number } {
  const components = placedComponents(placements);
  const sums: ReadinessVector = {
    prevention: 0,
    dataProtection: 0,
    containment: 0,
    detection: 0,
  };
  for (const component of components) {
    sums.prevention += component.readiness.prevention;
    sums.dataProtection += component.readiness.dataProtection;
    sums.containment += component.readiness.containment;
    sums.detection += component.readiness.detection;
  }
  const cap = 12;
  const prevention = Math.round((Math.min(sums.prevention, cap) / cap) * 100);
  const dataProtection = Math.round((Math.min(sums.dataProtection, cap) / cap) * 100);
  const containment = Math.round((Math.min(sums.containment, cap) / cap) * 100);
  const detection = Math.round((Math.min(sums.detection, cap) / cap) * 100);
  const overall = Math.round(prevention * 0.3 + dataProtection * 0.25 + containment * 0.25 + detection * 0.2);
  return { prevention, dataProtection, containment, detection, overall };
}

export function readinessBand(score: number): "developing" | "moderate" | "strong" {
  if (score >= 70) {
    return "strong";
  }
  if (score >= 40) {
    return "moderate";
  }
  return "developing";
}

function strongerOutcome(left: StageOutcomeKind, right: StageOutcomeKind): StageOutcomeKind {
  return OUTCOME_STRENGTH[right] > OUTCOME_STRENGTH[left] ? right : left;
}

function weakerOutcome(left: StageOutcomeKind, right: StageOutcomeKind): StageOutcomeKind {
  return OUTCOME_STRENGTH[right] < OUTCOME_STRENGTH[left] ? right : left;
}

function combineReactions(
  components: readonly ArchitectureComponent[],
  stageId: AttackStageId,
): {
  outcome: StageOutcomeKind;
  attackerAction: string;
  controlReaction: string;
  explanation: string;
  architectDetail: string;
} | null {
  const hits = components.flatMap((component) => {
    const reaction = component.reactions[stageId];
    return reaction ? [{ component, reaction }] : [];
  });
  if (hits.length === 0) {
    return null;
  }
  const outcome = hits.reduce<StageOutcomeKind>(
    (current, hit) => strongerOutcome(current, hit.reaction.outcome),
    hits[0]?.reaction.outcome ?? "successful",
  );
  const chosen =
    hits.find((hit) => hit.reaction.outcome === outcome)?.reaction ?? hits[0]?.reaction;
  if (!chosen) {
    return null;
  }
  return {
    outcome,
    attackerAction: chosen.attackerAction,
    controlReaction: hits.map((hit) => hit.reaction.controlReaction).join(" "),
    explanation: chosen.explanation,
    architectDetail: hits.map((hit) => hit.reaction.architectDetail).join(" "),
  };
}

export function simulateAttack(placements: LabPlacements): AttackSimulation {
  const components = placedComponents(placements);
  let attackerInside = false;
  let payloadActive = false;
  let dataAccessed = false;
  let dataLeft = false;
  let systemHealth = 100;
  let dataExposure: ResolvedStage["dataExposure"] = "none";
  let attackerProgress = 0;
  const stages: ResolvedStage[] = [];

  for (const definition of LAB_MISSION.attack.stages) {
    const needsPayload = definition.id === "model-data" || definition.id === "unsafe-action";
    const reached: boolean =
      (!definition.requiresAttackerInside || attackerInside) && (!needsPayload || payloadActive);
    let resolved = combineReactions(components, definition.id);

    if (!reached) {
      resolved = {
        outcome: "blocked",
        attackerAction: definition.summary,
        controlReaction: "The attacker never reached this part of the system.",
        explanation:
          "Earlier controls stopped the chain. This stage is not available to the attacker.",
        architectDetail:
          "Defence in depth: a failed later control is irrelevant if the attacker never arrived.",
      };
    } else if (definition.legitimateActivity) {
      resolved = {
        outcome: "successful",
        attackerAction: "Upload a claims document through the normal portal function.",
        controlReaction:
          "The portal accepts the file because uploading claims is ordinary work.",
        explanation:
          "The upload succeeds as a legitimate business function. Files and retrieved content must still be treated as untrusted input.",
        architectDetail:
          "A permitted business action can still carry a hostile payload. Do not score the upload itself as a control failure.",
      };
    } else if (!resolved) {
      resolved = {
        outcome: "successful",
        attackerAction: definition.summary,
        controlReaction: "No control in this layer answers the attempt.",
        explanation: "Nothing in the current architecture reacts at this stage.",
        architectDetail: "An empty reaction set means the stage proceeds.",
      };
    }

    if (definition.id === "model-data" && reached) {
      const model = combineReactions(components, "model-data");
      const data = components.filter((item) => item.slotId === "data-access");
      const secrets = components.filter((item) => item.slotId === "secrets");
      const modelOutcome = model?.outcome ?? "successful";
      const dataOutcome = combineReactions(data, "model-data")?.outcome ?? "successful";
      const secretsOutcome = combineReactions(secrets, "model-data")?.outcome ?? "successful";
      const combined = weakerOutcome(weakerOutcome(modelOutcome, dataOutcome), secretsOutcome);
      resolved = {
        ...resolved,
        outcome: combined,
        controlReaction: [model?.controlReaction, combineReactions(data, "model-data")?.controlReaction, combineReactions(secrets, "model-data")?.controlReaction]
          .filter(Boolean)
          .join(" "),
        explanation:
          combined === "successful"
            ? "Sensitive context and extra claims data become available to the manipulated assistant."
            : resolved.explanation,
      };
      if (combined === "successful" || combined === "contained") {
        dataAccessed = combined === "successful" || dataOutcome === "successful";
      }
      if (modelOutcome === "successful") {
        dataExposure = "external";
      } else if (dataOutcome === "successful" || secretsOutcome === "successful") {
        dataExposure = dataExposure === "external" ? "external" : "internal";
      }
    }

    if (definition.id === "initial-access") {
      attackerInside = resolved.outcome !== "blocked";
    }
    if (definition.id === "poisoned-document") {
      payloadActive = reached && attackerInside;
    }
    if (definition.id === "prompt-injection") {
      payloadActive = reached && resolved.outcome !== "blocked";
    }
    if (definition.id === "unsafe-action" && reached) {
      dataLeft = resolved.outcome === "successful";
      if (dataLeft) {
        dataExposure = "external";
      }
    }

    if (resolved.outcome === "successful" && !definition.legitimateActivity) {
      systemHealth = Math.max(12, systemHealth - 16);
      attackerProgress += 1;
    } else if (resolved.outcome === "contained" || resolved.outcome === "detected") {
      systemHealth = Math.max(20, systemHealth - 7);
    } else {
      systemHealth = Math.min(100, systemHealth);
    }

    stages.push({
      id: definition.id,
      number: definition.number,
      name: definition.name,
      outcome: resolved.outcome,
      attackerAction: resolved.attackerAction,
      controlReaction: resolved.controlReaction,
      explanation: resolved.explanation,
      architectDetail: resolved.architectDetail,
      highlight: definition.highlight,
      chainReached: reached,
      legitimateActivity: definition.legitimateActivity === true,
      systemHealth,
      dataExposure,
      attackerProgress,
    });
  }

  const stageById = (id: AttackStageId) => stages.find((item) => item.id === id);
  const entry = stageById("initial-access");
  const injection = stageById("prompt-injection");
  const modelData = stageById("model-data");
  const action = stageById("unsafe-action");
  const detection = stageById("detection");
  const entered = entry?.outcome !== "blocked";
  const injectionOk = injection?.outcome === "successful";
  const detected =
    detection?.outcome === "detected" ||
    detection?.outcome === "contained" ||
    detection?.outcome === "blocked";
  dataAccessed = dataAccessed || modelData?.outcome === "successful";
  dataLeft = action?.outcome === "successful";

  let result: FinalResultKind;
  if (!entered && !dataLeft) {
    result = "architecture-holds";
  } else if (!injectionOk && !dataLeft) {
    result = "architecture-holds";
  } else if (!dataLeft) {
    result = "attack-contained";
  } else if (detected) {
    result = "partial-breach";
  } else {
    result = "architecture-breached";
  }

  const review = buildReview(placements, stages, result, {
    entered,
    injectionOk,
    dataAccessed,
    dataLeft,
    detected,
  });

  return {
    stages,
    result,
    resultLabel: RESULT_LABEL[result],
    resultSummary: summaryFor(result, { entered, injectionOk, dataAccessed, dataLeft, detected }),
    review,
    score: RESULT_SCORE[result],
  };
}

function summaryFor(
  result: FinalResultKind,
  flags: {
    entered: boolean;
    injectionOk: boolean;
    dataAccessed: boolean;
    dataLeft: boolean;
    detected: boolean;
  },
): string {
  if (result === "architecture-holds") {
    return flags.entered
      ? "The attacker reached the door, but later controls stopped the injection before data left."
      : "The attacker never gained a working session. The architecture held at the front door.";
  }
  if (result === "attack-contained") {
    return "Part of the chain succeeded, but defence in depth stopped sensitive data leaving the trusted environment.";
  }
  if (result === "partial-breach") {
    return "Some sensitive data left, but monitoring still produced a usable signal.";
  }
  return "The attacker reached customer data and exported it without a timely, useful detection.";
}

function buildReview(
  placements: LabPlacements,
  stages: readonly ResolvedStage[],
  result: FinalResultKind,
  flags: {
    entered: boolean;
    injectionOk: boolean;
    dataAccessed: boolean;
    dataLeft: boolean;
    detected: boolean;
  },
): ArchitectureReview {
  const names = Object.fromEntries(
    SLOT_IDS.map((slotId) => [slotId, placements[slotId] ? requireComponent(placements[slotId]!).name : "Unfilled"]),
  ) as Record<SlotId, string>;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const blockedControls: string[] = [];
  const failedControls: string[] = [];

  for (const stage of stages) {
    const slot = LAB_MISSION.attack.stages.find((item) => item.id === stage.id)?.controllingSlots[0];
    const label = slot ? names[slot] : "";
    if (stage.legitimateActivity) {
      continue;
    }
    if (stage.outcome === "blocked" || stage.outcome === "contained") {
      if (label) {
        blockedControls.push(`${label} (${stage.name})`);
        strengths.push(`${label} limited ${stage.name.toLowerCase()}.`);
      }
    }
    if (stage.outcome === "successful" && label) {
      failedControls.push(`${label} (${stage.name})`);
      weaknesses.push(`${label} did not stop ${stage.name.toLowerCase()}.`);
    }
  }

  const supply = names["supply-chain"];
  if (placements["supply-chain"] === "supply-protected") {
    strengths.push(`${supply} improves release integrity even though this attack is a poisoned document, not a second plot.`);
  } else if (placements["supply-chain"] === "supply-open") {
    weaknesses.push(`${supply} leaves residual risk in what you deploy.`);
  }

  const improvement =
    flags.dataLeft && placements.agency !== "agency-human"
      ? "Require human approval before sensitive exports."
      : flags.injectionOk && placements.guardrails !== "guard-full"
        ? "Inspect retrieved documents, not only the chat box."
        : flags.entered && placements.identity !== "identity-mfa-rbac"
          ? "Put MFA and role separation on the claims portal."
          : !flags.detected
            ? "Correlate AI, identity and data-access events in active monitoring."
            : "Tighten least privilege on the claims data path.";

  const best =
    blockedControls[0] ??
    (placements.identity === "identity-mfa-rbac" ? names.identity : names.guardrails);

  return {
    strengths: strengths.slice(0, 6),
    weaknesses: weaknesses.slice(0, 6),
    dataExposed: flags.dataLeft
      ? "Sensitive claim information left the trusted environment."
      : flags.dataAccessed
        ? "Additional claims data was readable inside the environment, but not exported."
        : "No customer dataset was shown to have left the trusted environment.",
    blockedControls,
    failedControls,
    bestDecision: best,
    mostImportantImprovement: improvement,
    residualRisk: flags.detected
      ? "Detection quality still depends on people following the alert."
      : "Without a timely signal, the next attempt could finish before anyone looks.",
    businessTradeOffs:
      "Faster handling, public APIs and automatic actions reduce cost. They also increase agency for a manipulated model. Isolation, approval and monitoring cost more and buy time.",
    defenceInDepth:
      result === "architecture-holds" || result === "attack-contained"
        ? "One weak control did not decide the day. Later layers still had a chance to contain the chain."
        : "When several layers were thin at once — identity, retrieved content, data path and agency — the attack had a clear run.",
    nextSteps: [
      improvement,
      "Treat retrieved documents as untrusted input.",
      "Keep sensitive tool calls behind a person.",
      "Give detection enough AI context to explain an export attempt.",
    ],
    mappings: [
      { label: "Security by Design", note: "Choices about identity, data path and agency were made before the attack ran." },
      { label: "Defence in depth", note: "No single control is the whole story. Later gates can still save a weak front door." },
      { label: "Least privilege", note: "A restricted Claims API limits what a manipulated assistant can read." },
      { label: "Zero Trust", note: "Stolen credentials and retrieved files are not trusted just because they arrived through a normal workflow." },
      { label: "NIST AI RMF", note: "Map, measure and manage GenAI risks: data exposure, abuse of agency, and monitoring." },
      { label: "OWASP LLM / GenAI", note: "Indirect prompt injection (LLM01-class) plus overly powerful tools and weak output handling." },
      { label: "NIST SSDF", note: "The pipeline choice is about how the assistant is built, not a second live attack in this mission." },
    ],
  };
}

export function compareResults(left: FinalResultKind | null, right: FinalResultKind): FinalResultKind {
  if (!left) {
    return right;
  }
  return RESULT_RANK[right] > RESULT_RANK[left] ? right : left;
}

export function resultLabel(kind: FinalResultKind): string {
  return RESULT_LABEL[kind];
}

export function slotPurpose(slotId: SlotId, difficulty: LabDifficulty): string {
  const slot = slotById(slotId);
  return difficulty === "architect" ? slot.architectPurpose : slot.purpose;
}

export { RESULT_LABEL, RESULT_SCORE, RESULT_RANK };
