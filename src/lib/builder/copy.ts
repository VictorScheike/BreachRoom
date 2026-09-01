import type { BuilderCategory, BuilderResultLevel } from "./types";
import { BUILDER_MISSION_ID } from "./types";

export const BUILDER_TITLE = "Secure Solution Builder";
export const BUILDER_SUBTITLE = "15 decisions from idea to launch";
export const BUILDER_SUMMARY =
  "Build security into a digital solution before it reaches production. Make 15 decisions about data, cloud, applications, AI and secure development.";
export const BUILDER_CARD_DESCRIPTION =
  "Learn how to build security into a digital solution from the first idea to production.";
export const BUILDER_CARD_LABEL = "BEGINNER · 15 DECISIONS";
export const BUILDER_CARD_TAGS = ["Security by Design", "AI Security", "Cloud", "DevSecOps"] as const;
export const BUILDER_TOPIC_CHIPS = [
  "Security by Design",
  "Data Protection",
  "Cloud & Application Security",
  "AI Security",
  "Secure Delivery",
] as const;

export const BUILDER_INTRO_BODY =
  "You are helping a product team build a new digital service. Your job is to make security part of the solution from the beginning — without unnecessarily blocking the business.";

export const BUILDER_INTRO_ARCHITECT =
  "I’ll guide you through 15 decisions. You do not need to know every framework — focus on understanding the risk and choosing a practical response.";

export const BUILDER_ROUTE = "/secure-solution-builder/";
export const BUILDER_STORAGE_KEY = "breachroom_secure_solution_builder_v1";
export const BUILDER_SCHEMA_VERSION = 1;
export const BUILDER_PROGRESS_SESSION_ID = `${BUILDER_MISSION_ID}:builder`;

export const BUILDER_CATEGORIES: readonly BuilderCategory[] = [
  {
    id: "security-by-design",
    label: "Security by Design",
    recommendation:
      "Involve security while the solution can still be shaped. Start by understanding the purpose and risk.",
    questionIds: ["ssb-01", "ssb-02"],
  },
  {
    id: "data-protection",
    label: "Data Protection",
    recommendation: "Classify, minimise and map data before deciding how it should be protected.",
    questionIds: ["ssb-03", "ssb-04", "ssb-05"],
  },
  {
    id: "identity-access",
    label: "Identity & Access",
    recommendation:
      "Use personal identities, least privilege and managed secrets instead of broad or shared access.",
    questionIds: ["ssb-06", "ssb-07"],
  },
  {
    id: "cloud-application",
    label: "Cloud & Application Security",
    recommendation:
      "Use secure defaults, private connectivity and layered protection for applications and APIs.",
    questionIds: ["ssb-08", "ssb-09", "ssb-10"],
  },
  {
    id: "ai-security",
    label: "AI Security",
    recommendation:
      "Enforce access before retrieval and keep accountable humans involved in high-impact decisions.",
    questionIds: ["ssb-11", "ssb-12"],
  },
  {
    id: "secure-delivery",
    label: "Secure Delivery",
    recommendation: "Automate security checks, verify dependencies and continue monitoring after launch.",
    questionIds: ["ssb-13", "ssb-14", "ssb-15"],
  },
];

export const BUILDER_RESULT_LEVELS: readonly BuilderResultLevel[] = [
  {
    id: "ready",
    minCorrect: 13,
    maxCorrect: 15,
    title: "Security by Design ready",
    text: "You consistently included security early and selected controls based on the actual risk.",
  },
  {
    id: "strong",
    minCorrect: 10,
    maxCorrect: 12,
    title: "Strong security foundation",
    text: "You understand the main principles. Review the missed decisions to make your approach more consistent.",
  },
  {
    id: "gaps",
    minCorrect: 7,
    maxCorrect: 9,
    title: "Good start — strengthen the gaps",
    text: "You recognised several important controls, but some security decisions were made too late or without enough context.",
  },
  {
    id: "foundations",
    minCorrect: 0,
    maxCorrect: 6,
    title: "Start with the foundations",
    text: "Focus on understanding the purpose, data and risk before selecting controls. Security becomes easier when it starts early.",
  },
];

export function categoryById(id: BuilderCategory["id"]): BuilderCategory {
  const found = BUILDER_CATEGORIES.find((item) => item.id === id);
  if (!found) {
    throw new Error(`Unknown builder category: ${id}`);
  }
  return found;
}
