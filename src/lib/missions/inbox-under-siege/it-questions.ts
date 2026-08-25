import { option, question, scoreTriple } from "../build";
import type { AnswerOption, AnswerQuality, Question, RoleId, ScorePoints, StoryPhase } from "../types";

const KEYS = ["threatRecognition", "safeResponse", "reporting"] as const;
const recVerify = "Verify through a second known channel before money, credentials or access move.";
const recReport = "Report in the official channel, do not interact with the lure, and preserve the message.";

function pts(a: ScorePoints, b: ScorePoints, c: ScorePoints): Record<string, ScorePoints> {
  return scoreTriple(a, b, c, KEYS);
}

function o(
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
  return option(id, quality, title, summary, pts(...scores), consequence, explanation, recommendedAction, whyRecommended, learningPoint, npcReaction);
}

function packQuestion(
  id: string,
  scenarioId: string,
  phase: StoryPhase,
  title: string,
  situation: string,
  npcLine: string,
  roles: readonly RoleId[],
  topics: readonly string[],
  tools: readonly string[],
  options: readonly [AnswerOption, AnswerOption, AnswerOption],
): Question {
  return question("inbox-under-siege", id, phase, [scenarioId], title, situation, npcLine, ["NIST CSF Protect", "incident reporting"], options, {
    roleIds: roles,
    departmentIds: [scenarioId],
    topicIds: topics,
    toolIds: tools,
    learningObjectiveIds: ["recognise-phishing", "report-safely"],
    difficulty: "Beginner",
  });
}

export const INBOX_IT_QUESTIONS: Question[] = [
  packQuestion("ius-i01", "inbox-it", "start", "Remote support that already knows your name",
    "A calm caller has your asset tag and wants Quick Assist because patching failed. The number is not the internal IT line.",
    "They pronounced the wifi correctly. That is rare.",
    ["it-support"], ["social-engineering"], ["Internal applications"],
    [
      o("ius-i01-a", "high-risk", "Share the screen", "They are clearly on the team.", [0, 0, 0], "A stranger now has a guided tour of admin land.", "Callback the published IT number.", recVerify, "Identity before remote tools.", "Knowing a name is not knowing a colleague.", "The caller is very grateful, which is the problem."),
      o("ius-i01-b", "strong", "Hang up, call the published number", "If they are real, the desk still exists.", [3, 3, 3], "The real service desk never called. The attempt is logged.", "Verification is a callback, not a vibe.", recVerify, "Published numbers only.", "Helpful attackers study the intranet.", "The fake caller's voicemail is now a teaching aid."),
      o("ius-i01-c", "weak", "Ask canteen trivia first", "Soup as identity.", [1, 1, 1], "They guess the soup. You still should not share the screen.", "Trivia is not identity.", recVerify, "Use the directory process.", "Social questions are not a control.", "They also know the soup. Unsettling."),
    ]),
  packQuestion("ius-i02", "inbox-it", "assess", "Password reset for a director",
    "A ticket from a lookalike address asks you to reset a director's password and read it out in this chat, they are in a taxi.",
    "Directors are always in taxis.",
    ["it-support"], ["identity", "phishing"], ["Microsoft 365"],
    [
      o("ius-i02-a", "high-risk", "Reset and paste the password in chat", "Service with a smile.", [0, 0, 0], "You handed a privileged account to a taxi that does not exist.", "Never send passwords in the same channel as the request.", recVerify, "Official identity proof, then a reset the user performs.", "Service desk is a favourite impersonation.", "The taxi is a metaphor and a crime."),
      o("ius-i02-b", "strong", "Follow identity procedure, no passwords in chat", "Taxis are not a control.", [3, 3, 3], "The lookalike is reported. The director still has their weekend.", "Resets are for the account owner, after proof.", recVerify, "Procedure beats taxis.", "If they cannot complete MFA, that is the story.", "The real director was eating crisps, not hailing a cab."),
      o("ius-i02-c", "defensible", "Reset but email the known address", "Safer channel, same bad ticket.", [1, 2, 1], "You still reset on a hostile ticket.", "Do not action the untrusted ticket at all.", recVerify, "Close as fraudulent, start from a trusted request.", "A safer channel does not bless a bad request.", "The known address is confused, then alarmed."),
    ]),
  packQuestion("ius-i03", "inbox-it", "contain", "MFA fatigue on the helpdesk phone",
    "A user says prompts will not stop. They approved two so it would shut up.",
    "We should not make people feel stupid.",
    ["it-support", "incident-responder"], ["mfa"], ["Microsoft 365"],
    [
      o("ius-i03-a", "high-risk", "Tell them to keep approving", "Until it calms down.", [0, 0, 0], "The attacker keeps the session.", "Approved prompts are the incident.", recReport, "Revoke, reset, number-matching if available.", "Fatigue is the payload.", "The prompts were not shy."),
      o("ius-i03-b", "strong", "Treat it as compromise: revoke and reset", "Two accidental yeses are still yeses.", [3, 3, 3], "Sessions die. The user is walked through a clean sign-in.", "Kindness is a reset, not a lecture.", recReport, "Contain identity first.", "Human error plus a playbook is still recoverable.", "The phone becomes boring again."),
      o("ius-i03-c", "weak", "Disable MFA so they can work", "Supportive.", [1, 0, 1], "You remove the remaining brake.", "Do not fix fatigue by deleting MFA.", recReport, "Contain, then improve the MFA method.", "Less MFA is not more support.", "Attackers send a fruit basket."),
    ]),
  packQuestion("ius-i04", "inbox-it", "control", "Admin consent for a status app",
    "A colleague wants you to click Accept on an OAuth app that reads mail to show a nice out-of-office dashboard.",
    "Dashboards are professional.",
    ["it-support", "security-architect"], ["identity", "phishing"], ["Microsoft 365", "SaaS platforms"],
    [
      o("ius-i04-a", "high-risk", "Accept, revoke later", "Later is a plan.", [0, 0, 0], "Mail is copied to a third party that loves later.", "Consent is access.", recReport, "Review publishers, least privilege, or refuse.", "OAuth phishing skips the password box.", "Later never arrives."),
      o("ius-i04-b", "strong", "Refuse, check the catalog, report", "Unknown publishers do not get mail.read.", [3, 3, 3], "The consent prompt is treated as a lure.", "Pretty dashboards are not a permission model.", recReport, "Catalog or nothing.", "If the app is real, it is already approved.", "The colleague discovers the official OOO."),
      o("ius-i04-c", "weak", "Accept on a dummy mailbox", "Science.", [1, 2, 1], "You still granted a tenant trust signal.", "Do not test live consent on production tenants.", recReport, "Sandbox tenants exist for a reason.", "Dummy is still a door.", "The dummy mailbox becomes popular."),
    ]),
  packQuestion("ius-i05", "inbox-it", "evidence", "Logs before the wipe",
    "Someone wants the infected laptop reimaged before you export browser and auth logs. Users want their machine back.",
    "Rebuild energy is high.",
    ["it-support", "incident-responder"], ["incident-response"], ["Internal applications"],
    [
      o("ius-i05-a", "high-risk", "Reimage now, stories later", "Shiny laptop diplomacy.", [0, 1, 0], "You destroy the only copy of the consent grant.", "Evidence before rebuild.", recReport, "Snapshot, then rebuild.", "Speed without artefacts repeats the week.", "The laptop is shiny and mute."),
      o("ius-i05-b", "strong", "Collect artefacts, then rebuild", "Loaner in between if needed.", [3, 3, 3], "You can see what tokens left. Then the user gets a clean kit.", "Support can be fast and forensic.", recReport, "Order of operations.", "A rebuild is a control after a picture.", "The user gets a loaner, which is almost kindness."),
      o("ius-i05-c", "defensible", "Leave it on the desk overnight", "Think tomorrow.", [1, 1, 1], "The session continues from home.", "Isolation now, not later.", recReport, "Network-off, then evidence.", "Delay is not preservation if it stays online.", "Overnight is a long time in token-land."),
    ]),
  packQuestion("ius-i06", "inbox-it", "communicate", "Tell staff it was just phishing",
    "Comms wants a one-liner that nobody needs to change behaviour. We should not cause a stir.",
    "Calm is the brand.",
    ["it-support", "business-leader"], ["incident-reporting"], ["Microsoft 365"],
    [
      o("ius-i06-a", "high-risk", "Say nothing happened", "No stir.", [0, 1, 0], "People keep approving prompts.", "Understatement becomes a second incident.", recReport, "Say what to do if a prompt appears.", "Calm is not empty.", "The stir arrives as a breach notification."),
      o("ius-i06-b", "strong", "Short: unexpected prompts, how to report, no blame", "Actions, not vibes.", [3, 3, 3], "Staff know the next click is the control.", "IT comms can be specific.", recReport, "Behaviour first.", "You can be calm and useful.", "The one-liner grows a second sentence, correctly."),
      o("ius-i06-c", "weak", "Publish the full attacker infrastructure", "Transparency maximalist.", [2, 1, 2], "You dump indicators on people who needed a behaviour.", "Audience matters.", recReport, "Behaviour first, indicators for the technical list.", "Staff cannot parse a threat feed.", "The intranet looks like a hunt board."),
    ]),
  packQuestion("ius-i07", "inbox-it", "recover", "Privileges after the helpful attacker",
    "A technician granted local admin temporarily during the fake call. Temporary is becoming a lifestyle.",
    "They might call back.",
    ["it-support"], ["identity"], ["Internal applications"],
    [
      o("ius-i07-a", "high-risk", "Leave admin in place", "Just in case.", [0, 0, 0], "The extra rights stay for the real attacker too.", "Temporary needs an expiry.", recReport, "Remove standing admin, re-request properly.", "Helpdesk privileges are a prize.", "The callback is not from friends."),
      o("ius-i07-b", "strong", "Remove standing admin, ticket a proper request", "Least privilege after a scare.", [3, 3, 3], "Rights collapse to the baseline. The lesson is written down.", "Recovery includes identity hygiene.", recReport, "Temporary must actually end.", "You can still do the job without souvenir admin.", "The technician is still allowed to use a keyboard."),
      o("ius-i07-c", "weak", "Rename the admin account", "Hide and seek.", [1, 1, 0], "You play costume games with logs.", "Renames are not revocation.", recReport, "Revoke, do not costume.", "Obscurity is not a control here.", "The logs become modern art."),
    ]),
  packQuestion("ius-i08", "inbox-it", "close", "IT hub report",
    "Need call metadata, tools requested, accounts touched, whether admin was granted. Someone already told a friend in security.",
    "Friends are fast.",
    ["it-support", "incident-responder"], ["incident-reporting"], ["Internal applications"],
    [
      o("ius-i08-a", "weak", "Friend-in-security as the record", "They know.", [1, 1, 1], "The friend is in a meeting. The record is a shrug.", "Official tickets beat folklore.", recReport, "Write the hub report.", "Friends are not an audit trail.", "The friend did not consent to being infrastructure."),
      o("ius-i08-b", "strong", "Complete the hub form with times and accounts", "The next shift should not need a seance.", [3, 3, 3], "Token hunting has a starting point.", "Service desk notes are gold when they exist.", recReport, "Structured close.", "You already live in tickets. Use one more.", "The hub stops pinging like a microwave."),
      o("ius-i08-c", "high-risk", "Close as user error, no detail", "Simple taxonomy.", [0, 1, 0], "The pattern is invisible. The next call succeeds.", "Blame without facts helps the attacker.", recReport, "Facts, then coaching.", "Error is a start, not a close.", "User error is not a root cause by itself."),
    ]),
];
