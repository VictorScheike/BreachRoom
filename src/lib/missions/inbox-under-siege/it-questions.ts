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
  prompt: string,
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
    prompt,
  });
}

export const INBOX_IT_QUESTIONS: Question[] = [
  packQuestion("ius-i01", "inbox-it", "start", "Unsolicited remote-support call",
    "A calm caller has your asset tag and wants you to start Quick Assist because patching failed. The number is not the published internal IT line.",
    "They had the asset tag and they used the correct Wi-Fi name. It sounded like our service desk.",
    "How should you handle this remote-support request before sharing your screen?",
    ["it-support"], ["social-engineering"], ["Internal applications"],
    [
      o("ius-i01-a", "high-risk", "Share the screen and start Quick Assist", "They already have the asset tag, so treat them as part of the IT team.", [0, 0, 0], "A stranger now has an interactive session on an administrative workstation.", "Identity is confirmed by calling the published IT number, not by knowledge of an asset tag.", recVerify, "Verify the caller before any remote-support tool is used.", "Knowing a name or an asset tag is not the same as being a colleague. Attackers study the intranet.", "The published service desk confirms they did not place the call and asks you to log the attempt."),
      o("ius-i01-b", "strong", "Hang up and call the published service-desk number", "If the request is genuine, the real desk will still be able to help you.", [3, 3, 3], "The real service desk never called. The attempt is logged as social engineering.", "Verification is a callback to a number you already publish, not a judgement of how professional the caller sounded.", recVerify, "Use only published numbers for IT identity checks.", "Helpful attackers research internal details so the first minutes feel routine.", "The service desk records the callback, confirms no ticket exists, and opens an incident for the impersonation."),
      o("ius-i01-c", "weak", "Ask for their employee number and manager before sharing", "Do a quick identity check in the same call, then continue if the answers sound right.", [1, 1, 1], "They give plausible directory details. You still have not confirmed them independently, and the session should not start.", "Directory trivia collected on the inbound call is not an identity process. Call the published number.", recVerify, "Use the directory callback process, not questions the attacker can research.", "Social questions asked of the inbound caller are not a control.", "The caller answers the manager's name correctly. The published desk later confirms that person never requested remote support."),
    ]),
  packQuestion("ius-i02", "inbox-it", "assess", "Password reset for a travelling director",
    "A ticket from a lookalike address asks you to reset a director's password and read the new password aloud in this chat because they are in a taxi and cannot complete MFA.",
    "The director is travelling and needs the password read out in this chat so they can join the next meeting.",
    "How should you handle this password-reset request that asks you to send the password in chat?",
    ["it-support"], ["identity", "phishing"], ["Microsoft 365"],
    [
      o("ius-i02-a", "high-risk", "Reset the password and paste it in the chat", "Complete the request in the same thread so the director can join the meeting.", [0, 0, 0], "You handed a privileged account to whoever controls the lookalike address.", "Never send passwords in the same channel as an untrusted request. Service-desk impersonation is common.", recVerify, "Follow official identity proof, then let the account owner complete a reset they initiate.", "A travel story does not replace identity procedure, and chat is not a password envelope.", "The real director still has access and did not raise a ticket. Sign-in logs show a reset they did not request."),
      o("ius-i02-b", "strong", "Follow identity procedure and do not send passwords in chat", "Close the lookalike ticket. If the director needs a reset, they complete it after proof on a trusted path.", [3, 3, 3], "The lookalike is reported. The director's account is unchanged.", "Resets are for the account owner after proof. If they cannot complete MFA, that fact belongs in a trusted ticket, not a chat paste.", recVerify, "Procedure first: verify the person, then a reset the user performs.", "Inability to complete MFA is a reason to stop, not a reason to read a password aloud.", "The director is reached on a known number and confirms they did not request a reset."),
      o("ius-i02-c", "defensible", "Reset the account but email the password to the known address", "Use a safer channel for the secret while still actioning the ticket.", [1, 2, 1], "You still performed a reset that the lookalike requested. The known mailbox is confused, then alarmed.", "Do not action an untrusted ticket at all. Close it as fraudulent and start only from a trusted request.", recVerify, "Close the fraudulent ticket. Start from a request the director makes through a known channel.", "A safer delivery channel does not make a hostile request legitimate.", "The real mailbox receives a password they did not ask for and contacts security."),
    ]),
  packQuestion("ius-i03", "inbox-it", "contain", "MFA fatigue on the helpdesk line",
    "A user says approval prompts will not stop. They approved two of them so the phone would go quiet, and they are calling because they now feel unsure.",
    "They already feel foolish. We should help them without making this harder than it is.",
    "How should you treat this account after the user approved unexpected MFA prompts?",
    ["it-support", "incident-responder"], ["mfa"], ["Microsoft 365"],
    [
      o("ius-i03-a", "high-risk", "Tell them to keep approving until the prompts stop", "Advise them to clear the queue so they can get back to work.", [0, 0, 0], "The attacker keeps the session. Each further approval extends the compromise.", "Approved prompts are the incident. Fatigue is the payload.", recReport, "Revoke sessions, reset the account, and enable number matching if it is available.", "An unexpected prompt is a signal to deny and report, not to tap through the list.", "Sign-in logs show continued success from an unexpected location after the extra approvals."),
      o("ius-i03-b", "strong", "Treat it as compromise: revoke sessions and reset", "Two accidental approvals are still approvals. Contain the identity first.", [3, 3, 3], "Sessions are ended. The user is walked through a clean sign-in.", "Kindness is a reset and a clear explanation, not a lecture and not more approvals.", recReport, "Contain the identity: revoke, reset, then a supervised sign-in.", "Human error plus a playbook is still recoverable if you treat the approvals as a live incident.", "The user signs in after the reset, and the unexpected prompts stop."),
      o("ius-i03-c", "weak", "Disable MFA so they can keep working", "Remove the prompts for now and restore MFA when things are calmer.", [1, 0, 1], "You remove the remaining control on an account that may already be in an attacker's hands.", "Do not fix MFA fatigue by turning MFA off. Contain, then improve the method.", recReport, "Contain the account, then move them to a stronger MFA method such as number matching or a phishing-resistant option.", "Less MFA is not more support when the account may already be compromised.", "The account continues to sign in from the unexpected location with no second factor in the way."),
    ]),
  packQuestion("ius-i04", "inbox-it", "control", "OAuth consent for an out-of-office dashboard",
    "A colleague asks you to click Accept on an OAuth app that reads mail so it can show a shared out-of-office dashboard. You do not recognise the publisher.",
    "It is only a status dashboard. The consent screen looks like our other Microsoft apps.",
    "Should this unknown mail-reading app receive admin consent?",
    ["it-support", "security-architect"], ["identity", "phishing"], ["Microsoft 365", "SaaS platforms"],
    [
      o("ius-i04-a", "high-risk", "Accept now and plan to review the permissions later", "Grant consent so the dashboard works today, then revoke if the publisher looks wrong.", [0, 0, 0], "Mail is copied to a third party. Later never arrives as a scheduled review.", "Consent is access. OAuth phishing skips the password box.", recReport, "Review the publisher, require least privilege, or refuse and report the prompt.", "An app that needs mail.read should already be in the approved catalogue if it is genuine.", "Mail items begin appearing in an external tenant associated with the publisher name on the consent screen."),
      o("ius-i04-b", "strong", "Refuse consent, check the catalogue, and report the prompt", "Unknown publishers do not receive mail.read. If the app is real it is already approved.", [3, 3, 3], "The consent prompt is treated as a lure. The colleague uses the official out-of-office process.", "A dashboard is not a permission model. Catalogue or nothing for mail access.", recReport, "Check the approved-app catalogue. If it is absent, refuse and report.", "If the organisation already needed this tool, it would be listed and scoped.", "Application governance confirms the publisher is not in the catalogue and files the consent prompt as a lure."),
      o("ius-i04-c", "weak", "Accept on a dummy mailbox to see what the app does", "Test the consent on an unused mailbox in the production tenant before rolling it out.", [1, 2, 1], "You still granted a tenant trust signal and gave the app a foothold in production.", "Do not test live consent on the production tenant. Sandbox tenants exist for that.", recReport, "Refuse in production. If a test is needed, use an isolated tenant with no real mail.", "A dummy mailbox is still a door, and the consent is still a tenant-level decision.", "The dummy mailbox starts forwarding copies, and the publisher now appears as a consented app in the tenant."),
    ]),
  packQuestion("ius-i05", "inbox-it", "evidence", "Reimage requested before logs are collected",
    "Someone wants the suspected laptop reimaged before you export browser and authentication logs. The user wants their machine back the same day.",
    "The user needs a working laptop today. We can rebuild first and look at logs if anything else comes up.",
    "What should you collect before the laptop is rebuilt?",
    ["it-support", "incident-responder"], ["incident-response"], ["Internal applications"],
    [
      o("ius-i05-a", "high-risk", "Reimage immediately and reconstruct events later", "Return a clean device now and write the incident story from memory afterwards.", [0, 1, 0], "You destroy the only copy of the consent grant and browser artefacts.", "Evidence before rebuild. Speed without artefacts repeats the same week.", recReport, "Snapshot or export artefacts, then rebuild. Offer a loaner if the user cannot wait.", "A rebuild is a control only after you have a picture of what left the device.", "Responders cannot see which tokens were issued, and a second device shows the same consent the next day."),
      o("ius-i05-b", "strong", "Collect artefacts, then rebuild, with a loaner in between", "Export browser and auth logs first. Give the user a loaner so work continues.", [3, 3, 3], "You can see what tokens left the device. The user then receives a clean kit.", "Support can be fast and forensic: isolate, collect, then rebuild.", recReport, "Follow the order: network isolation, artefacts, then rebuild.", "A rebuild without a snapshot deletes the only explanation of how far the incident went.", "The loaner goes out the same afternoon, and the original disk image shows the OAuth grant."),
      o("ius-i05-c", "defensible", "Leave the laptop on the desk until tomorrow's review", "Keep the device powered and connected so you can think about evidence in the morning.", [1, 1, 1], "The session continues from home overnight.", "Delay is not preservation if the device stays online.", recReport, "Take it off the network now, then collect evidence. Do not leave a live session until morning.", "Overnight is a long window for tokens if the laptop remains joined to the network.", "Sign-in logs show activity from the same account after close of play, while the laptop sat on the desk."),
    ]),
  packQuestion("ius-i06", "inbox-it", "communicate", "Staff message that nothing needs to change",
    "Communications wants a one-line note that this was only phishing and that nobody needs to change their behaviour, so the floor does not become unsettled.",
    "Keep the message calm. We should not cause a stir on the floor.",
    "What should the internal message tell staff after this phishing incident?",
    ["it-support", "business-leader"], ["incident-reporting"], ["Microsoft 365"],
    [
      o("ius-i06-a", "high-risk", "Tell staff that nothing happened and no action is required", "Reassure people so they keep working exactly as before.", [0, 1, 0], "People keep approving unexpected prompts.", "Understatement becomes a second incident.", recReport, "Say what to do if an unexpected prompt appears, and how to report it.", "Calm is not empty. Staff still need one concrete behaviour.", "A further round of MFA prompts is approved because staff were told they did not need to change anything."),
      o("ius-i06-b", "strong", "Send a short note: unexpected prompts, how to report, no blame", "Tell people the next action, not a verdict that the incident is over.", [3, 3, 3], "Staff know to deny unexpected prompts and where to report them.", "IT communications can be specific and still calm: behaviour first, then optional detail.", recReport, "Lead with what to do, how to report, and that reporting is expected rather than punished.", "You can be calm and useful in the same paragraph.", "The message includes the report path and a line that unexpected MFA prompts should be denied and reported."),
      o("ius-i06-c", "weak", "Publish the full attacker infrastructure to all staff", "Share every indicator of compromise on the intranet so people can hunt for themselves.", [2, 1, 2], "Most readers needed a behaviour. They receive a threat-feed they cannot use.", "Audience matters. Behaviour first; indicators belong on a technical list.", recReport, "Give staff the action. Put indicators on the SOC or IT list, not the all-staff page.", "Most employees cannot parse infrastructure indicators, and some will click to 'check'.", "The intranet page fills with domains and hashes, and the helpdesk still receives questions about whether to approve prompts."),
    ]),
  packQuestion("ius-i07", "inbox-it", "recover", "Temporary local admin left after the fake call",
    "A technician granted local-admin rights during the impersonated support call so they could 'finish patching'. The extra rights are still in place in case the caller tries again.",
    "Leave the extra rights for now. They said they might need to call back.",
    "What should happen to the extra local-admin rights granted during the fake call?",
    ["it-support"], ["identity"], ["Internal applications"],
    [
      o("ius-i07-a", "high-risk", "Leave the extra admin rights in place", "Keep the elevation until you are sure the caller will not need it again.", [0, 0, 0], "The extra rights remain available to anyone who still has a foothold on the device.", "Temporary elevation needs an expiry. Helpdesk privileges are a prize for an attacker.", recReport, "Remove the extra local-admin rights now and raise a proper request only if the work is still required.", "Standing extra rights after a social-engineering call are part of the incident, not a convenience.", "A later review finds the account still in the local administrators group with no ticket and no end date."),
      o("ius-i07-b", "strong", "Remove the extra rights and raise a proper request if needed", "Return the device to baseline privilege. If admin is still required, ticket it with an expiry.", [3, 3, 3], "Rights return to the baseline. The lesson is written on the incident record.", "Recovery includes identity hygiene. Temporary must actually end.", recReport, "End the elevation, then request privilege through the normal process if the job still needs it.", "You can complete genuine support work without leaving souvenir admin after a scare.", "The technician confirms the extra group membership is gone and any further work will go through a time-bound request."),
      o("ius-i07-c", "weak", "Rename the elevated account and leave the rights attached", "Change the account name so a casual review will not see the extra admin.", [1, 1, 0], "The rights remain. Logs become harder to follow.", "Renames are not revocation.", recReport, "Remove the rights. Do not disguise the account.", "Obscurity is not a control when the permission still exists.", "Audit still finds local-admin rights, now under a different name, with no matching ticket."),
    ]),
  packQuestion("ius-i08", "inbox-it", "close", "IT incident recorded only with a colleague",
    "The hub needs call metadata, tools requested, accounts touched, and whether admin was granted. Someone already told a friend in the security team in a private chat.",
    "I already told a friend in security. They will pick it up from there.",
    "Where should the IT facts about this incident be recorded?",
    ["it-support", "incident-responder"], ["incident-reporting"], ["Internal applications"],
    [
      o("ius-i08-a", "weak", "Treat the private chat with security as the record", "Assume the colleague will write it up, so you do not duplicate the hub form.", [1, 1, 1], "The colleague is in a meeting. The next shift has a conversation fragment, not a ticket.", "Official tickets beat informal notice. Friends are not an audit trail.", recReport, "Complete the hub report yourself with times and accounts.", "A verbal or chat heads-up is not a substitute for the form the next analyst will open.", "The morning analyst cannot find call metadata or which account was elevated."),
      o("ius-i08-b", "strong", "Complete the hub form with times, tools, and accounts", "Write what the next shift needs: who called, which tools, which accounts, whether admin was granted.", [3, 3, 3], "Token hunting and account review have a starting point.", "Service-desk notes are useful when they exist in the official system.", recReport, "Close with a structured hub report even if you already spoke to security.", "You already work in tickets. Use one more so the incident survives the shift change.", "SOC can see the call time, the remote-support tool, and the elevated account from the hub record."),
      o("ius-i08-c", "high-risk", "Close the ticket as user error with no further detail", "Use a simple category so the queue stays clear.", [0, 1, 0], "The pattern is invisible. The next impersonation call succeeds because nothing was learned.", "Blame without facts helps the attacker. Error is a start, not a close.", recReport, "Record the facts, then coach if needed. Do not close on a label alone.", "User error is not a root cause by itself and hides repeatable tradecraft.", "A second technician takes a similar call the following week because the first ticket had no indicators."),
    ]),
];
