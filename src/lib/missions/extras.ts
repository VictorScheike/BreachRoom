import { option, question, scoreTriple } from "./build";
import type { AnswerOption, AnswerQuality, Question, ScorePoints, StoryPhase } from "./types";

function extra(
  missionId: "locked-out" | "ai-forge" | "dependency-depths",
  id: string,
  phase: StoryPhase,
  title: string,
  situation: string,
  npcLine: string,
  frameworks: readonly string[],
  scenarioIds: readonly string[],
  options: readonly [AnswerOption, AnswerOption, AnswerOption],
): Question {
  return question(missionId, id, phase, scenarioIds, title, situation, npcLine, frameworks, options);
}

function makeOption(
  keys: readonly [string, string, string],
  id: string,
  quality: AnswerQuality,
  title: string,
  summary: string,
  scores: [ScorePoints, ScorePoints, ScorePoints],
  consequence: string,
  explanation: string,
  recommendedAction: string,
  whyRecommended: string,
  learningPoint: string,
  npcReaction: string,
): AnswerOption {
  return option(
    id,
    quality,
    title,
    summary,
    scoreTriple(scores[0], scores[1], scores[2], keys),
    consequence,
    explanation,
    recommendedAction,
    whyRecommended,
    learningPoint,
    npcReaction,
  );
}

const LO: readonly [string, string, string] = ["containment", "operations", "trust"];
const AF: readonly [string, string, string] = ["aiSafety", "enablement", "customerTrust"];
const DD: readonly [string, string, string] = ["buildIntegrity", "deliveryResilience", "visibility"];

export const LOCKED_OUT_EXTRAS: Question[] = [
  extra("locked-out", "lo-31", "assess", "The printer that started faxing threats",
    "A warehouse printer is spewing pages that say PAY NOW in Comic Sans. Someone wants to unplug the building.",
    "If we unplug the building the pages will stop.",
    ["NIST CSF Detect"],
    ["lo-campus", "lo-warehouse", "lo-friday"],
    [
      makeOption(LO, "lo-31-a", "high-risk", "Kill site power", "Nuclear option as IR.", [0, 0, 0], "You halt life safety systems and lose telemetry.", "Printers are not a reason to black out a campus.", "Isolate the print VLAN and keep evidence.", "Contain the device, not the oxygen.", "Blast radius still matters when the font is silly.", "The lifts become a new incident."),
      makeOption(LO, "lo-31-b", "strong", "Isolate the print network, photograph a page", "Keep the rest of the lights.", [3, 2, 3], "You have a sample. The warehouse can still pick by torch if needed.", "Segment first.", "Isolate the print VLAN and keep evidence.", "This is proportional.", "Silly delivery, serious isolation.", "Comic Sans is bagged as evidence."),
      makeOption(LO, "lo-31-c", "weak", "Tweet a photo for awareness", "The people should know.", [1, 1, 1], "You publish an IOC to the timeline.", "Do not livestream incidents.", "Isolate the print VLAN and keep evidence.", "Internal report, not a campaign.", "Awareness is not a press conference.", "The intern has a draft tweet. It is worse."),
    ]),
  extra("locked-out", "lo-32", "close", "Who tells the warehouse the truth",
    "Pickers want a sentence they can repeat. Legal wants no sentence. The banner is still a little yellow.",
    "Can we say 'scheduled maintenance'?",
    ["crisis communication"],
    ["lo-campus", "lo-warehouse", "lo-friday"],
    [
      makeOption(LO, "lo-32-a", "high-risk", "Call it maintenance", "Calm through fiction.", [1, 2, 0], "Staff invent a better rumour.", "Do not lie to the people doing the work.", "Honest holding statement, next update time.", "Trust is an operations control.", "Maintenance that encrypts files is not maintenance.", "The rumour involves raccoons and a nation state."),
      makeOption(LO, "lo-32-b", "strong", "Holding statement plus next update", "We had a security incident. Here is what to do until 16:00.", [3, 3, 3], "People stop improvising from WhatsApp.", "A timeboxed truth beats a polished myth.", "Honest holding statement, next update time.", "This is how you close the human loop.", "Clarity is containment.", "The megaphone intern finally has a script."),
      makeOption(LO, "lo-32-c", "defensible", "Say nothing until Legal writes a novel", "Perfect is coming.", [2, 1, 1], "The gap fills with fiction anyway.", "Speed with a short approved line.", "Honest holding statement, next update time.", "Legal can still review a paragraph.", "Silence is also a message.", "Legal's novel arrives on Thursday."),
    ]),
];

export const AI_FORGE_EXTRAS: Question[] = [
  extra("ai-forge", "af-31", "control", "The model wants production logs for 'vibes'",
    "Engineering says the eval set is too clean. They want a week of production prompts, including customers who swore.",
    "Realism.",
    ["NIST AI RMF Measure"],
    ["ai-chatbot", "ai-claims", "ai-coding"],
    [
      makeOption(AF, "af-31-a", "high-risk", "Dump production into the eval bucket", "More data, more science.", [0, 2, 0], "Customer language becomes training folklore.", "Evals need a lawful, minimised set.", "Sample with approval, strip secrets, time-box access.", "Enablement is not a data leak.", "Realism is not a blank cheque.", "The lava hisses in a GDPR accent."),
      makeOption(AF, "af-31-b", "strong", "Approved sample, secrets stripped, expiry", "A week with rails.", [3, 3, 3], "You get messy language without a souvenir warehouse.", "Measure with a permit.", "Sample with approval, strip secrets, time-box access.", "This is how evals stay honest.", "Production is not a playground.", "A small robot labels the bucket TEMP."),
      makeOption(AF, "af-31-c", "weak", "Ban all evals", "If we cannot have everything, we have nothing.", [2, 0, 1], "They eval in a notebook named final_final.", "Offer a path.", "Sample with approval, strip secrets, time-box access.", "Security that only says no gets bypassed.", "You still need to know if the model is terrible.", "The notebook is already on a laptop."),
    ]),
  extra("ai-forge", "af-32", "close", "Who owns the kill switch after launch",
    "Product wants the kill switch in a slide. Operations wants it in a runbook. Nobody wants the night phone.",
    "It will probably be fine.",
    ["NIST AI RMF Manage"],
    ["ai-chatbot", "ai-claims", "ai-coding"],
    [
      makeOption(AF, "af-32-a", "high-risk", "Leave it on the slide", "Documentation as a service.", [0, 2, 0], "At 02:00 nobody can find the button.", "Ownership is a named human and a tested control.", "Name an owner, test the switch, put it in the runbook.", "A slide is not a control.", "Launch without a night owner is a vibe.", "The slide is very pretty in the dark."),
      makeOption(AF, "af-32-b", "strong", "Named owner, tested switch, runbook", "Someone answers the night phone on purpose.", [3, 3, 3], "You can stop the model without a treasure hunt.", "Manage means operate.", "Name an owner, test the switch, put it in the runbook.", "This is the close that lets you launch.", "Accountability is a roster.", "The small robot gets a lanyard."),
      makeOption(AF, "af-32-c", "defensible", "Shared inbox 'ai-oncall'", "Everybody owns it.", [2, 1, 2], "Everybody means nobody at 02:00.", "A mailbox is not a person.", "Name an owner, test the switch, put it in the runbook.", "Shared is a start, still name a primary.", "If everyone is accountable, the lava stays on.", "The inbox out-of-office is poetic."),
    ]),
];

export const DEPENDENCY_DEPTHS_EXTRAS: Question[] = [
  extra("dependency-depths", "dd-31", "start", "The lockfile that wanted a hug",
    "A PR 'refreshes lockfile' and also adds a postinstall that phones home. The diff is huge because 'npm did it'.",
    "Lockfiles are basically receipts.",
    ["NIST SSDF", "OWASP"],
    ["cave-package", "cave-secret", "cave-cloud"],
    [
      makeOption(DD, "dd-31-a", "high-risk", "Merge, lockfiles are boring", "Trust the receipt.", [0, 2, 0], "The postinstall runs in CI as you.", "Huge lockfile diffs hide extra scripts.", "Review scripts, pin, and require review on install hooks.", "Receipts can lie.", "Boring files are still code.", "The cave answers a phone you did not hear."),
      makeOption(DD, "dd-31-b", "strong", "Block, inspect postinstall, split the PR", "Huge diffs are a smell.", [3, 2, 3], "The hug is declined. CI stays local.", "Install hooks are code review.", "Review scripts, pin, and require review on install hooks.", "This is supply chain hygiene.", "Lockfiles are not above suspicion.", "The torch finds a curl in the dark."),
      makeOption(DD, "dd-31-c", "weak", "Ask the bot that opened the PR", "It seems nice.", [1, 1, 1], "The bot confirms in fluent confidence.", "Do not take assurance from the change under review.", "Review scripts, pin, and require review on install hooks.", "Humans read hooks.", "Automation is not an authorisation.", "The bot sends a heart emoji. Unsettling."),
    ]),
  extra("dependency-depths", "dd-32", "close", "The elevator needs a signature",
    "The Trusted Build Exit will move a signed artefact. Someone wants to 'just this once' promote an unsigned hotfix because customers are loud.",
    "Loud is a priority.",
    ["SLSA", "NIST SSDF"],
    ["cave-package", "cave-secret", "cave-cloud"],
    [
      makeOption(DD, "dd-32-a", "high-risk", "Promote unsigned, apologise in Slack", "Customers first.", [0, 3, 0], "The elevator carries a mystery box into production.", "Emergency still needs a signature path.", "Signed emergency path, or rollback, not folklore.", "Loud is not a signing key.", "Once is how unsigned becomes policy.", "The exit light turns a colour you do not like."),
      makeOption(DD, "dd-32-b", "strong", "Use the signed emergency lane or roll back", "Customers get a known artefact.", [3, 2, 3], "You can explain the artefact in the morning.", "Urgency has a procedure.", "Signed emergency path, or rollback, not folklore.", "This is the vault's whole personality.", "Integrity is the product.", "The elevator hums in a documented way."),
      makeOption(DD, "dd-32-c", "defensible", "Ship unsigned to 5% with extra logs", "Science.", [1, 2, 1], "Five percent of customers become the canary mine.", "Canaries do not replace signatures.", "Signed emergency path, or rollback, not folklore.", "Observe after you can name the bits.", "Partial unsigned is still unsigned.", "The 5% write in."),
    ]),
];
