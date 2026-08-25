import { AI_FORGE_QUESTIONS } from "@/lib/missions/ai-forge/questions";
import { DEPENDENCY_DEPTHS_QUESTIONS } from "@/lib/missions/dependency-depths/questions";
import { LOCKED_OUT_QUESTIONS } from "@/lib/missions/locked-out/questions";
import type { MissionDefinition, MissionId } from "@/lib/missions/types";

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
    questions: LOCKED_OUT_QUESTIONS,
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
    questions: AI_FORGE_QUESTIONS,
  },
  "dependency-depths": {
    id: "dependency-depths",
    title: "Dependency Depths",
    tagline: "Follow a weakness through packages, pipelines and cloud.",
    story:
      "Carry a torch through the dark. Mine tracks are the deployment pipeline. The Trusted Build Vault only opens for work you can actually trust.",
    learningAreas: [
      "Application security",
      "Cloud security",
      "DevSecOps",
      "Software supply chain",
    ],
    frameworks: ["NIST SSDF", "NIST CSF", "OWASP", "SLSA"],
    difficulty: "Intermediate",
    environment: "Dark cave with a torch",
    destination: "Trusted Build Vault",
    objective: "Reach the Trusted Build Vault without losing the plot — or the pipeline.",
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
    questions: DEPENDENCY_DEPTHS_QUESTIONS,
  },
};

export const MISSION_LIST: MissionDefinition[] = [
  MISSIONS["locked-out"],
  MISSIONS["ai-forge"],
  MISSIONS["dependency-depths"],
];

export function requireMission(id: MissionId): MissionDefinition {
  return MISSIONS[id];
}
