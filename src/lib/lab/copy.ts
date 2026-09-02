import type { ControlStatus, LabDifficulty, StageOutcomeKind, SystemStatus } from "./types";

export const OUTCOME_LABELS: Record<StageOutcomeKind, string> = {
  succeeded: "SUCCEEDED",
  compromised: "COMPROMISED",
  limited: "LIMITED",
  blocked: "BLOCKED",
  detected: "DETECTED",
  contained: "CONTAINED",
  "not-reached": "NOT REACHED",
  "not-required": "NOT REQUIRED",
  recovered: "RECOVERED",
};

export const SYSTEM_STATUS_LABELS: Record<SystemStatus, string> = {
  normal: "NORMAL",
  reached: "REACHED",
  compromised: "COMPROMISED",
  protected: "PROTECTED",
  contained: "CONTAINED",
  impacted: "IMPACTED",
};

export const CONTROL_STATUS_LABELS: Record<ControlStatus, string> = {
  active: "ACTIVE",
  triggered: "TRIGGERED",
  effective: "EFFECTIVE",
  bypassed: "BYPASSED",
  failed: "FAILED",
};

export const DIFFICULTY_CAPTION = "Difficulty";

export function difficultyLabel(difficulty: LabDifficulty): string {
  return difficulty === "challenge" ? "Challenging" : "Beginner";
}

export const LAB_SETUP_BLURB =
  "Nordic Shield Insurance needs a claims system. You choose the controls. Then a stolen staff login tries to walk from the front door to the customer database.";

export const LAB_CARD_TITLE = "Architecture Defence Lab";
export const LAB_CARD_KICKER = "Beginner or Challenging";
export const LAB_CARD_META = "BEGINNER OR CHALLENGING";
export const LAB_CARD_CTA = "Enter the lab";
export const LAB_CARD_HREF = "/lab/";
export const LAB_CARD_DESTINATION = "Nordic Shield";
export const LAB_CARD_SCENARIO = "The Poisoned Claim";
export const LAB_CARD_LEARNING = "AI security · Secure architecture";
export const LAB_CARD_FRAMEWORKS = "Defence in depth";
export const LAB_CARD_TOPICS = ["AI security", "Secure architecture", "Defence in depth"] as const;
export const LAB_CARD_SUMMARY =
  "Ten questions build a claims system. Then one attack walks the path you chose.";
export const LAB_CARD_DESCRIPTION =
  "You are the architect. Ten questions add controls to a claims system — front door, AI, and customer data. Then one attack walks the path you built.";
export const LAB_PLAY_INTRO =
  "The Architecture Defence Lab lets you design a claims system, then watch one attack walk it. Secure Solution Builder is 15 security decisions from the first idea to production. The maps are workplaces under pressure — after you pick a map, you choose a relevant role or the standard version.";
export const LAB_HOME_INTRO =
  "Architecture Defence Lab and Secure Solution Builder sit on their own. One lets you build a system and test it. The other is 15 security decisions from idea to launch. The maps below are workplaces under pressure — phishing, ransomware, a risky AI launch, a poisoned build, a lockout.";
