import { AI_FORGE_QUESTIONS } from "@/lib/missions/ai-forge/questions";
import { DEPENDENCY_DEPTHS_QUESTIONS } from "@/lib/missions/dependency-depths/questions";
import {
  AI_FORGE_EXTRAS,
  DEPENDENCY_DEPTHS_EXTRAS,
  LOCKED_OUT_EXTRAS,
} from "@/lib/missions/extras";
import { INBOX_UNDER_SIEGE_QUESTIONS } from "@/lib/missions/inbox-under-siege/questions";
import { NORTHSTAR_ZERO_HOUR_QUESTIONS, ZERO_HOUR_PHASES } from "@/lib/missions/northstar-zero-hour/questions";
import { LOCKED_OUT_QUESTIONS } from "@/lib/missions/locked-out/questions";
import type { MissionDefinition, MissionId, Question, RoleId, StoryPhase } from "@/lib/missions/types";

const PHASE_ROLES: Record<MissionId, Partial<Record<StoryPhase, readonly RoleId[]>>> = {
  "locked-out": {
    start: ["incident-responder", "it-support", "employee", "business-leader"],
    assess: ["incident-responder", "it-support", "security-architect"],
    contain: ["incident-responder", "it-support"],
    control: ["incident-responder", "security-architect", "it-support"],
    evidence: ["incident-responder", "risk-governance"],
    communicate: ["business-leader", "risk-governance", "incident-responder"],
    recover: ["incident-responder", "business-leader", "it-support"],
    close: ["incident-responder", "business-leader", "risk-governance"],
  },
  "ai-forge": {
    start: ["security-architect", "business-leader", "developer"],
    assess: ["security-architect", "developer"],
    contain: ["security-architect", "developer", "devops"],
    control: ["security-architect", "developer"],
    evidence: ["security-architect", "risk-governance"],
    communicate: ["business-leader", "risk-governance", "security-architect"],
    recover: ["security-architect", "developer", "devops"],
    close: ["security-architect", "business-leader"],
  },
  "dependency-depths": {
    start: ["developer", "devops", "security-architect"],
    assess: ["developer", "security-architect"],
    contain: ["devops", "developer"],
    control: ["devops", "security-architect"],
    evidence: ["devops", "security-architect"],
    communicate: ["developer", "business-leader", "security-architect"],
    recover: ["devops", "developer"],
    close: ["security-architect", "devops", "developer"],
  },
  "inbox-under-siege": {},
  "northstar-zero-hour": {},
};

function annotate(missionId: MissionId, questions: readonly Question[]): Question[] {
  return questions.map((item) => {
    if (item.roleIds && item.roleIds.length > 0) {
      return item;
    }
    return {
      ...item,
      roleIds: PHASE_ROLES[missionId][item.phase] ?? ["incident-responder"],
      difficulty: item.difficulty ?? (missionId === "locked-out" || missionId === "inbox-under-siege"
        ? "Beginner"
        : "Intermediate"),
    };
  });
}

export const MISSIONS: Record<MissionId, MissionDefinition> = {
  "locked-out": {
    id: "locked-out",
    title: "Locked Out",
    tagline: "Ransomware has the campus lights doing an unfriendly dance.",
    story:
      "Northstar Logistics is locked out of its own systems. Cross the forest campus, handle the incident, and reach the Core Server Room before the ransomware core writes the last chapter.",
    learningAreas: ["Ransomware", "Incident response", "Crisis communication"],
    frameworks: ["NIST CSF", "DORA"],
    difficulty: "Beginner",
    environment: "Forest and Northstar Logistics campus",
    destination: "Core Server Room",
    objective: "Reach the Core Server Room and contain the ransomware.",
    estimatedMinutes: 20,
    intendedRoles: ["incident-responder", "it-support", "business-leader", "risk-governance"],
    topics: ["Ransomware", "Incident response", "Recovery", "DORA", "NIST CSF"],
    dimensions: [
      { id: "containment", label: "Containment" },
      { id: "operations", label: "Operations" },
      { id: "trust", label: "Trust" },
    ],
    scenarios: [
      {
        id: "lo-campus",
        title: "Campus morning",
        setup: "It starts at reception. Helpdesks, warehouses and a very confident intern all light up at once.",
      },
      {
        id: "lo-warehouse",
        title: "Warehouse floor",
        setup: "Pickers, mystery VLANs and a lucky scanner are already writing their own incident plan.",
      },
      {
        id: "lo-friday",
        title: "Friday deploy",
        setup: "A tiny afternoon change and a ransomware banner arrive in the same hour. Awkward.",
      },
    ],
    questions: annotate("locked-out", [...LOCKED_OUT_QUESTIONS, ...LOCKED_OUT_EXTRAS]),
    published: true,
    summary:
      "Work a ransomware morning across the Northstar campus and reach the Core Server Room.",
  },
  "ai-forge": {
    id: "ai-forge",
    title: "The AI Forge",
    tagline: "Help them launch the model without launching a incident.",
    story:
      "Cross volcanic islands and cooling pipes to the Model Launch Gateway. Security is not here to smash the AI. You are here to help the organisation ship it with rails.",
    learningAreas: ["AI security", "Secure architecture", "Responsible automation"],
    frameworks: ["NIST AI RMF", "OWASP GenAI"],
    difficulty: "Intermediate",
    environment: "Lava world",
    destination: "Model Launch Gateway",
    objective: "Reach the Model Launch Gateway and launch the AI system securely.",
    estimatedMinutes: 20,
    intendedRoles: ["security-architect", "developer", "business-leader"],
    topics: ["AI Security", "Secure AI architecture", "NIST AI RMF", "OWASP GenAI"],
    dimensions: [
      { id: "aiSafety", label: "AI Safety" },
      { id: "enablement", label: "Business Enablement" },
      { id: "customerTrust", label: "Customer Trust" },
    ],
    scenarios: [
      {
        id: "ai-chatbot",
        title: "Policy chatbot",
        setup: "A customer-facing insurance chatbot can see policy and claims text — and is trying to be a little too helpful.",
      },
      {
        id: "ai-claims",
        title: "Claims and fraud model",
        setup: "A model that supports claims assessment and fraud detection is one enthusiastic threshold away from auto-declining humans.",
      },
      {
        id: "ai-coding",
        title: "Internal coding agent",
        setup: "A coding agent wants your repos, your docs and, while it is here, production.",
      },
    ],
    questions: annotate("ai-forge", [...AI_FORGE_QUESTIONS, ...AI_FORGE_EXTRAS]),
    published: true,
    summary: "Help the organisation launch an AI system with rails, not accidents.",
  },
  "dependency-depths": {
    id: "dependency-depths",
    title: "Dependency Depths",
    tagline: "Follow a weakness through packages, pipelines and cloud.",
    story:
      "Carry a torch through the dark. Mine tracks are the deployment pipeline. The Trusted Build Exit only opens for work you can actually trust.",
    learningAreas: [
      "Application security",
      "Cloud security",
      "DevSecOps",
      "Software supply chain",
    ],
    frameworks: ["NIST SSDF", "NIST CSF", "OWASP", "SLSA"],
    difficulty: "Intermediate",
    environment: "Dark cave with a torch",
    destination: "Trusted Build Exit",
    objective: "Reach the Trusted Build Exit without losing the plot — or the pipeline.",
    estimatedMinutes: 20,
    intendedRoles: ["developer", "devops", "security-architect"],
    topics: [
      "Application Security",
      "Cloud Security",
      "DevSecOps",
      "Software supply chain",
      "NIST SSDF",
      "OWASP",
      "SLSA",
    ],
    dimensions: [
      { id: "buildIntegrity", label: "Build Integrity" },
      { id: "deliveryResilience", label: "Delivery Resilience" },
      { id: "visibility", label: "Visibility" },
    ],
    scenarios: [
      {
        id: "cave-package",
        title: "Smiling package",
        setup: "A third-party helper in a customer-facing app changed personality overnight.",
      },
      {
        id: "cave-secret",
        title: "Echo in CI",
        setup: "A leaked cloud key and a haunted builder are taking the pipeline on a tour.",
      },
      {
        id: "cave-cloud",
        title: "Quiet cloud launch",
        setup: "A cloud app is nearly released with generous IAM, shy logs and a root-shaped container.",
      },
    ],
    questions: annotate("dependency-depths", [...DEPENDENCY_DEPTHS_QUESTIONS, ...DEPENDENCY_DEPTHS_EXTRAS]),
    published: true,
    summary: "Trace a weakness through packages, pipelines and cloud until the build can be trusted.",
  },
  "inbox-under-siege": {
    id: "inbox-under-siege",
    title: "Inbox Under Siege",
    tagline: "The campaign is coming in through email, Teams, QR codes and fake login pages.",
    story:
      "Start in the Security Hub, check the departments around you, and come back to submit the incident report. Funny enough to stay human. Real enough that the lures are not all wearing clown shoes.",
    learningAreas: ["Phishing", "Social engineering", "Business email compromise", "Safe reporting"],
    frameworks: ["NIST CSF", "incident reporting"],
    difficulty: "Beginner",
    environment: "Office inbox network",
    destination: "Security Hub — submit incident report",
    objective: "Investigate each department, then return to the Security Hub and submit the incident report.",
    estimatedMinutes: 15,
    intendedRoles: ["employee", "finance", "hr", "business-leader", "it-support"],
    topics: ["Phishing", "Social engineering", "Business email compromise", "Credential theft", "Safe reporting"],
    dimensions: [
      { id: "threatRecognition", label: "Threat Recognition" },
      { id: "safeResponse", label: "Safe Response" },
      { id: "reporting", label: "Reporting" },
    ],
    scenarios: [
      {
        id: "inbox-finance",
        title: "The invoice switch",
        setup: "Finance is drowning in almost-right invoices, CEO chats and a PDF that wants a new IBAN.",
      },
      {
        id: "inbox-hr",
        title: "The employee document trap",
        setup: "CVs, payroll changes and a benefits bot that did not get the memo from actual HR.",
      },
      {
        id: "inbox-it",
        title: "The helpful attacker",
        setup: "Someone is already on the phone, already knows your name, and already wants Quick Assist.",
      },
      {
        id: "inbox-urgent",
        title: "The urgent message",
        setup: "Gift cards, parking QRs, fake lock warnings and a parcel you did not order.",
      },
    ],
    questions: INBOX_UNDER_SIEGE_QUESTIONS,
    published: true,
    summary: "Investigate suspicious activity across email, Teams and fake login pages.",
  },
  "northstar-zero-hour": {
    id: "northstar-zero-hour",
    title: "Northstar: Zero Hour",
    subtitle: "A full-scale cyberattack exercise",
    organisation: "Northstar Logistics",
    tagline: "Coordinate Northstar’s response before the incident coordinates you.",
    story:
      "It is Monday at 06:55. Northstar Logistics is preparing for the morning delivery run when several employees report locked files and unusual login prompts. The helpdesk sees an increasing number of affected devices, warehouse systems are becoming unstable, and an endpoint-security alert suggests malicious activity is moving through the network. It is not yet clear how the attackers entered, whether data has been stolen or how far the compromise has spread. You are part of Northstar’s incident coordination team. Your job is to help the organisation contain the attack, protect evidence, keep essential operations moving and coordinate the people needed for recovery.",
    learningAreas: ["Ransomware", "Incident coordination", "Business continuity"],
    frameworks: ["NIST CSF 2.0", "NIST IR", "DORA"],
    difficulty: "Intermediate",
    environment: "Northstar Logistics campus during an escalating incident",
    destination: "Incident Coordination Room",
    objective: "Stabilise Northstar and reach the Incident Coordination Room",
    estimatedMinutes: 35,
    intendedRoles: [],
    topics: ["Ransomware", "Malware", "Incident response", "Coordination", "Continuity", "NIST CSF 2.0", "DORA"],
    dimensions: [
      { id: "containment", label: "Containment" },
      { id: "operations", label: "Operations" },
      { id: "coordination", label: "Coordination & Trust" },
    ],
    scenarios: [
      {
        id: "zh-monday",
        title: "Monday 06:55",
        setup: "The picture will change as you move. Do not expect the whole attack to be visible from the first desk.",
      },
    ],
    questions: NORTHSTAR_ZERO_HOUR_QUESTIONS,
    published: true,
    summary:
      "Coordinate Northstar’s response as ransomware spreads across the organisation.",
    audienceMode: "general",
    audienceLabel: "Organisation-wide",
    requiresRoleSelection: false,
    decisionsPerSession: 15,
    questionPoolSize: 45,
    sessionPhases: ZERO_HOUR_PHASES,
  },
};

export const MISSION_LIST: MissionDefinition[] = [
  MISSIONS["inbox-under-siege"],
  MISSIONS["locked-out"],
  MISSIONS["northstar-zero-hour"],
  MISSIONS["ai-forge"],
  MISSIONS["dependency-depths"],
];

export function publishedMissions(): MissionDefinition[] {
  return MISSION_LIST.filter((mission) => mission.published);
}

export function requireMission(id: MissionId): MissionDefinition {
  return MISSIONS[id];
}

export function findMission(id: string): MissionDefinition | null {
  return MISSION_LIST.find((mission) => mission.id === id) ?? null;
}

export function missionsForRole(roleId: RoleId): MissionDefinition[] {
  return MISSION_LIST.filter((mission) => mission.intendedRoles.includes(roleId));
}
