import { LAB_DECISIONS } from "./decisions";
import { LAB_EDGES, LAB_NODES } from "./map-layout";
import { labMissionSchema } from "./schemas";
import { LAB_TECHNIQUES } from "./techniques";
import type {
  ArchitectureDecision,
  ArchitectureOption,
  DecisionId,
  LabChoices,
  MapNodeId,
  OptionId,
} from "./types";
import { DECISION_IDS } from "./types";

const rawMission = {
  id: "lab-poisoned-claim",
  title: "The Poisoned Claim",
  missionLabel: "Architecture Defence Lab",
  company: "Nordic Shield Insurance",
  fictionalNote:
    "Nordic Shield Insurance and this incident are fictional. They exist so you can practise architecture choices, not to describe a real insurer.",
  tagline: "Build it. Then let the attack loose.",
  scenario:
    "Nordic Shield Insurance is building a claims-handling architecture. An AI assistant sits inside that system to summarise cases and search documents — one component, not the whole design. You configure ten architecture controls. Then one connected Red Team chain tests the exact system you built: a stolen authenticated session, how far that foothold can travel, where it is blocked, what is detected, and whether the session can be contained.",
  decisions: LAB_DECISIONS,
  nodes: LAB_NODES,
  edges: LAB_EDGES,
  techniques: LAB_TECHNIQUES,
};

export const LAB_MISSION = labMissionSchema.parse(rawMission);
export const LAB_MISSION_ID = LAB_MISSION.id;
export const DECISION_COUNT = LAB_MISSION.decisions.length;
export const TECHNIQUE_COUNT = LAB_MISSION.techniques.length;

export function decisionById(id: DecisionId): ArchitectureDecision {
  const found = LAB_MISSION.decisions.find((item) => item.id === id);
  if (!found) {
    throw new Error(`Unknown architecture decision: ${id}`);
  }
  return found;
}

export function optionById(id: OptionId): ArchitectureOption {
  for (const decision of LAB_MISSION.decisions) {
    const found = decision.options.find((item) => item.id === id);
    if (found) {
      return found;
    }
  }
  throw new Error(`Unknown architecture option: ${id}`);
}

export function optionForChoice(choices: LabChoices, decisionId: DecisionId): ArchitectureOption | null {
  const id = choices[decisionId];
  return id ? optionById(id) : null;
}

export function nodeById(id: MapNodeId) {
  const found = LAB_MISSION.nodes.find((item) => item.id === id);
  if (!found) {
    throw new Error(`Unknown map node: ${id}`);
  }
  return found;
}

export function isComplete(choices: LabChoices): boolean {
  return DECISION_IDS.every((id) => typeof choices[id] === "string");
}

export function chosenCount(choices: LabChoices): number {
  return DECISION_IDS.filter((id) => typeof choices[id] === "string").length;
}
