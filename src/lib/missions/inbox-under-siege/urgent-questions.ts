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

export const INBOX_URGENT_QUESTIONS: Question[] = [
  packQuestion("ius-u01", "inbox-urgent", "start", "Delivery note with a busy link",
    "A parcel SMS says your badge holder is waiting. The link is almost the courier, with an extra hyphen. You did not order a badge holder.",
    "Maybe facilities did.",
    ["employee"], ["phishing", "suspicious-links"], ["SaaS platforms"],
    [
      o("ius-u01-a", "high-risk", "Open the tracking link", "It might be the good pens.", [0, 0, 0], "A login page wants Microsoft. So does a stranger.", "Unexpected parcels plus logins are lures.", recReport, "Use the courier app you already installed, or ignore.", "You cannot track a parcel you did not buy.", "Facilities have never ordered this badge holder."),
      o("ius-u01-b", "strong", "Ignore, report the SMS in the portal", "No click, no drama.", [3, 3, 3], "The campaign is visible. Your password stays yours.", "Reporting junk still helps.", recReport, "The official report button exists for texts too.", "Curiosity is how hyphen-domains eat mornings.", "The real courier remains boring."),
      o("ius-u01-c", "weak", "Ask the team chat if anyone ordered pens", "Crowd verification.", [1, 2, 1], "Three people click to 'check for you'.", "Do not crowd-source live lures.", recReport, "Report, then optionally mention it without the link.", "Awareness is not a group click.", "The chat becomes a second SMS gateway."),
    ]),
  packQuestion("ius-u02", "inbox-urgent", "assess", "QR on the parking meter",
    "A sticker over the real meter says Pay here with a QR. The print quality is slightly too proud.",
    "My ticket expires in four minutes.",
    ["employee", "business-leader"], ["phishing", "suspicious-links"], ["SaaS platforms"],
    [
      o("ius-u02-a", "high-risk", "Scan, you will be towed otherwise", "Parking anxiety as a service.", [0, 0, 0], "The page harvests card details. The real meter still wants coins.", "Stickers on meters are not the city.", recReport, "Use the official app or the untouched meter UI.", "Urgency plus QR is the whole product.", "You are both poorer and still parked illegally, spiritually."),
      o("ius-u02-b", "strong", "Use the official app, photograph the sticker", "Four minutes is enough for the real button.", [3, 3, 2], "You pay the city. The sticker becomes evidence.", "Known apps beat surprise codes.", recReport, "Report physical lures too.", "Parking is not an identity provider.", "Facilities later peel it like a trophy."),
      o("ius-u02-c", "weak", "Pay cash to a person who 'works here'", "Human QR.", [0, 1, 0], "There is no person who works here. There is a hi-vis vest.", "Random helpers are not meters.", recReport, "Official channel only.", "Social engineering works in car parks too.", "The vest was from a Halloween box."),
    ]),
  packQuestion("ius-u03", "inbox-urgent", "contain", "Account lock warning",
    "A browser pop-up says your Microsoft 365 account will lock in 90 seconds unless you re-enter your password. You were reading a newsletter.",
    "The padlock icon looks expensive.",
    ["employee"], ["phishing", "mfa"], ["Microsoft 365"],
    [
      o("ius-u03-a", "high-risk", "Type the password into the pop-up", "Keep working.", [0, 0, 0], "The newsletter tab was a stage. The password leaves.", "Unexpected lock warnings in the page are not IT.", recReport, "Close the tab, sign in only via the bookmark.", "Real locks happen at the real sign-in page you chose.", "The newsletter is now a crime scene."),
      o("ius-u03-b", "strong", "Close the tab, use the bookmark, report", "If it is real, the bookmark still works.", [3, 3, 3], "The fake window dies. IT sees the pattern.", "You choose the URL. The page does not.", recReport, "Bookmarks beat pop-ups.", "Countdown timers are a costume.", "The padlock was clip art."),
      o("ius-u03-c", "weak", "Call the number in the pop-up", "Proactive.", [0, 1, 1], "You reach the operator of the pop-up.", "Do not call numbers supplied by the lure.", recReport, "Use the IT number on the intranet.", "The pop-up is not a directory.", "The hold music is ironically soothing."),
    ]),
  packQuestion("ius-u04", "inbox-urgent", "control", "OAuth consent for a calendar helper",
    "An email from a partner offers a calendar sync. Accepting asks for mail.readwrite. The partner is real. The app publisher is 'Syncly-llc-not-the-partner'.",
    "Partners like tools.",
    ["employee", "business-leader", "developer"], ["phishing", "identity"], ["Microsoft 365", "SaaS platforms"],
    [
      o("ius-u04-a", "high-risk", "Accept so the meeting happens", "Unblock the relationship.", [0, 0, 0], "Mail starts forwarding itself into a startup nobody hired.", "Publisher name is the control.", recReport, "Refuse and ask the partner via a known email.", "Real companies get impersonated by apps.", "The meeting still needed a human."),
      o("ius-u04-b", "strong", "Refuse, ask the partner on a known channel", "If they need sync, they can name the real app.", [3, 3, 3], "The consent never happens. The partner is embarrassed for the right reasons.", "You can keep the meeting without the app.", recReport, "Verify publishers.", "Consent screens are decisions.", "The partner's real IT sends a boring link later."),
      o("ius-u04-c", "weak", "Accept read-only in your head, click accept anyway", "Intent counts.", [0, 1, 0], "The screen asked for write. You granted write.", "Read the permission list.", recReport, "If the scope is wrong, it is a no.", "Imagination is not least privilege.", "Syncly-llc sends a welcome pack."),
    ]),
  packQuestion("ius-u05", "inbox-urgent", "evidence", "Screenshot or original?",
    "You reported in chat with a screenshot. SOC asks for the original email. Chat wants to archive and forget.",
    "I already did my bit.",
    ["employee"], ["incident-reporting"], ["Microsoft 365"],
    [
      o("ius-u05-a", "weak", "Screenshot is enough", "Pixels are evidence.", [1, 2, 1], "Headers and the real sender are gone.", "Originals beat pictures.", recReport, "Use the report button on the message.", "You did part of the bit. Do the rest.", "SOC squints at JPEG compression."),
      o("ius-u05-b", "strong", "Report the original from the mailbox", "The button exists for this.", [3, 3, 3], "Responders get headers. You are done honestly.", "The official control is the report action.", recReport, "Original message in the tenant.", "Chat is a heads-up, not the file.", "The ticket writes itself, almost."),
      o("ius-u05-c", "high-risk", "Delete it so nobody else sees", "Protect the team.", [0, 1, 0], "The sample vanishes before anyone hashes it.", "Deletion is not reporting.", recReport, "Report, then leave it.", "Hiding lures hides the campaign.", "Nobody else sees it, including the people who needed to."),
    ]),
  packQuestion("ius-u06", "inbox-urgent", "communicate", "Executive impersonation in Slack",
    "A Slack DM from a lookalike exec asks you to buy gift cards for a client workshop and keep it quiet.",
    "They used the word workshop. Very us.",
    ["employee", "business-leader"], ["social-engineering"], ["SaaS platforms"],
    [
      o("ius-u06-a", "high-risk", "Buy the cards, expense later", "Helpful.", [0, 0, 0], "You funded a stranger's steam library.", "Gift cards plus secrecy is the tell.", recVerify, "Call the exec on a known number.", "Quiet spending is not a workshop.", "The real exec does not want mango gift cards."),
      o("ius-u06-b", "strong", "Do not buy, verify, report the DM", "Workshop can wait twenty minutes.", [3, 3, 3], "The lookalike is removed. Finance does not cry.", "Impersonation is a report, not a purchase.", recVerify, "Known voice, then official report.", "Helpfulness needs a second channel.", "Slack gets a better display name policy, eventually."),
      o("ius-u06-c", "weak", "Ask in the public channel if this is real", "Sunlight.", [2, 2, 1], "You still might buy if the lookalike answers first.", "Verify privately with a known path.", recVerify, "Call, do not debate the attacker in public.", "Public ping can help, after you have not paid.", "The lookalike loves public channels."),
    ]),
  packQuestion("ius-u07", "inbox-urgent", "recover", "You already typed the fake login",
    "The page looked perfect. You stopped before MFA. Your stomach has opinions.",
    "If I do not tell anyone it might un-happen.",
    ["employee"], ["incident-reporting", "mfa"], ["Microsoft 365"],
    [
      o("ius-u07-a", "high-risk", "Say nothing and change your password tomorrow", "Future you will handle it.", [0, 1, 0], "The password is already in someone else's list.", "Same-day reset and a report.", recReport, "Tell IT now.", "Shame delays are the attacker's friend.", "Tomorrow's password change is a sequel."),
      o("ius-u07-b", "strong", "Report now, reset now, do not approve prompts", "Stomachs can be correct.", [3, 3, 3], "The account is locked to the attacker. You are still employed.", "Early reporting is the recovery.", recReport, "Official path immediately.", "You do not need to be perfect. You need to be fast.", "IT has seen this twice before breakfast."),
      o("ius-u07-c", "weak", "Google whether the site was legit", "Research.", [1, 1, 1], "You lose an hour. The session may already exist.", "Internal report beats internet folklore.", recReport, "IT first, curiosity later.", "Search results are not containment.", "The first result is an ad, poetically."),
    ]),
  packQuestion("ius-u08", "inbox-urgent", "close", "Submit incident report from the hub",
    "All departments have been checked. The hub wants one report so the campaign can be contained for everyone else.",
    "I am not security though.",
    ["employee", "business-leader", "finance", "hr"], ["incident-reporting"], ["Microsoft 365"],
    [
      o("ius-u08-a", "weak", "Assume someone else filed it", "There are adults here.", [1, 1, 0], "Nobody filed it. The next shift repeats your morning.", "If you saw it, you can report it.", recReport, "One hub report from you is enough.", "Somebody else is not a control.", "The adults were waiting for you, rudely."),
      o("ius-u08-b", "strong", "File the hub report with what you saw", "Role is irrelevant. Witnessing is enough.", [3, 3, 3], "The campaign is marked contained from the centre.", "Reporting is a normal employee control.", recReport, "Submit from the Security Hub.", "You do not need a security job title to close the loop.", "The hub light behaves."),
      o("ius-u08-c", "high-risk", "Post the lure in a public LinkedIn rant", "Accountability culture.", [0, 1, 1], "You amplify the template and maybe some internal detail.", "Public rants are not incident reports.", recReport, "Internal report, not a campaign sequel.", "The internet does not need the sample.", "LinkedIn would like you to log off."),
    ]),
];
