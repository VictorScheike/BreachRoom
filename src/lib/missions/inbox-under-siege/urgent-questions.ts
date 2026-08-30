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

export const INBOX_URGENT_QUESTIONS: Question[] = [
  packQuestion("ius-u01", "inbox-urgent", "start", "Courier SMS for a parcel you did not order",
    "A parcel SMS says your badge holder is waiting. The tracking link is almost the courier's domain, with an extra hyphen. You did not order a badge holder.",
    "Facilities might have ordered it. The tracking link will confirm.",
    "How should you handle this courier text for a parcel you did not order?",
    ["employee"], ["phishing", "suspicious-links"], ["SaaS platforms"],
    [
      o("ius-u01-a", "high-risk", "Open the tracking link in the SMS", "Check the delivery status in case Facilities ordered the badge holder.", [0, 0, 0], "A login page asks for Microsoft credentials. Those details go to the operator of the hyphenated domain.", "Unexpected parcels plus a login page are lures. You cannot track a delivery you did not buy.", recReport, "Ignore the link. Use the courier app you already installed, or report the SMS and delete it.", "A lookalike tracking domain is counting on curiosity about a parcel you never requested.", "You did not have a delivery. Identity later flags a sign-in attempt from the page that opened."),
      o("ius-u01-b", "strong", "Ignore the link and report the SMS in the portal", "Do not click. File the message through the official reporting path, including SMS.", [3, 3, 3], "The campaign is visible to security. Your password is unused on the fake page.", "Reporting unsolicited delivery texts still helps. The official report path covers SMS as well as email.", recReport, "Use the report function. Do not open the link to 'check'.", "Curiosity is how hyphenated courier domains collect credentials on a weekday morning.", "Security confirms other staff received the same SMS and that Facilities did not order badge holders."),
      o("ius-u01-c", "weak", "Paste the link in the team chat and ask if anyone ordered it", "Check with colleagues before deciding whether the tracking page is safe.", [1, 2, 1], "Three people open the live link to check it on behalf of the group.", "Do not crowd-source a live lure. Report it, then mention it without the working URL if needed.", recReport, "Report first. If you mention it to the team, do not paste the link.", "Awareness is not a group click on the same phishing URL.", "Two colleagues enter credentials on the page that was shared in the chat."),
    ]),
  packQuestion("ius-u02", "inbox-urgent", "assess", "Payment QR sticker on the parking meter",
    "A sticker covering the real meter says Pay here and shows a QR code. The print quality is unusually sharp compared with the city signage. Your ticket expires in four minutes.",
    "My ticket expires in four minutes. I do not have time to open the official app.",
    "How should you pay for parking when a QR sticker has been placed over the meter?",
    ["employee", "business-leader"], ["phishing", "suspicious-links"], ["SaaS platforms"],
    [
      o("ius-u02-a", "high-risk", "Scan the sticker QR so you are not towed", "Use the code on the overlay because it is the only payment option still visible.", [0, 0, 0], "The page harvests card details. The real meter still requires payment through the city channel.", "Stickers on meters are not the city. Urgency plus a QR code is the product.", recReport, "Use the official parking app or the meter interface that is not covered by the sticker.", "A last-minute fine risk is how quishing works in car parks.", "The card issuer later flags a transaction that did not go to the city, and the vehicle is still unpaid at the real meter."),
      o("ius-u02-b", "strong", "Pay in the official app and photograph the sticker", "Four minutes is enough to use the city app and capture the overlay as evidence.", [3, 3, 2], "You pay the city. The sticker is reported as a physical lure.", "Known apps beat surprise codes. Physical lures still get reported.", recReport, "Pay through the official app or untouched meter UI, then report the sticker.", "Parking payment is not an identity or card-data experiment. Use the channel you already trust.", "Facilities or site security collect the sticker and log it with your photograph."),
      o("ius-u02-c", "weak", "Pay the person in a high-visibility vest who offers to take the card", "Hand the card to someone who says the meter is out of order and they can process payment.", [0, 1, 0], "There is no attendant employed at this meter. The vest is not a control.", "Random helpers are not the parking authority. Official channel only.", recReport, "Use the official app or the real meter. Do not hand a card to an unverified person.", "Social engineering works in car parks as well as in inboxes.", "The person leaves with card details. The city meter still shows the session as unpaid."),
    ]),
  packQuestion("ius-u03", "inbox-urgent", "contain", "Browser pop-up says the account will lock",
    "A browser pop-up says your Microsoft 365 account will lock in 90 seconds unless you re-enter your password. You were reading a newsletter in that tab.",
    "The padlock on the pop-up looks legitimate. If we wait, the account might lock.",
    "How should you respond to this unexpected lock warning in the newsletter tab?",
    ["employee"], ["phishing", "mfa"], ["Microsoft 365"],
    [
      o("ius-u03-a", "high-risk", "Type your password into the pop-up", "Re-authenticate so you can keep working and avoid the lock.", [0, 0, 0], "The newsletter tab was hosting a fake window. The password is captured.", "Unexpected lock warnings inside a page are not IT. Real locks happen on the sign-in page you chose.", recReport, "Close the tab, sign in only from a bookmark you already trust, and report the page.", "A countdown on a page you did not navigate to on purpose is a costume, not a directory.", "A sign-in alert arrives from a location you were not using, timed to the password you typed in the pop-up."),
      o("ius-u03-b", "strong", "Close the tab, use your bookmark, and report the page", "If the warning is genuine, the bookmarked Microsoft 365 URL will still work.", [3, 3, 3], "The fake window is gone. IT can see the pattern from your report.", "You choose the URL. The page does not. Bookmarks beat pop-ups.", recReport, "Close the tab, open only the known URL, and file a report.", "Countdown timers and padlock graphics in a newsletter tab are not the real sign-in service.", "IT confirms other readers of the same newsletter saw the pop-up and that the real account was not about to lock."),
      o("ius-u03-c", "weak", "Call the telephone number shown in the pop-up", "Speak to the support line on the warning so the lock can be prevented.", [0, 1, 1], "You reach the operator of the pop-up, who then asks for a one-time code.", "Do not call numbers supplied by the lure. Use the IT number on the intranet.", recReport, "Close the tab and call IT only on a number you already have.", "The pop-up is not a directory. Any number it displays belongs to the attacker.", "The person on the line asks you to read an authenticator code to 'stop the lock'."),
    ]),
  packQuestion("ius-u04", "inbox-urgent", "control", "Partner calendar app requests mail access",
    "An email from a real partner offers a calendar-sync tool. Accepting asks for mail.readwrite. The partner organisation is genuine. The app publisher is listed as Syncly-llc-not-the-partner.",
    "The partner is real and they need this meeting. Accepting the calendar tool will unblock the diary.",
    "Should you accept this calendar app's request to read and write your mail?",
    ["employee", "business-leader", "developer"], ["phishing", "identity"], ["Microsoft 365", "SaaS platforms"],
    [
      o("ius-u04-a", "high-risk", "Accept consent so the meeting can go ahead", "Grant the permissions to avoid delaying the partner relationship.", [0, 0, 0], "Mail begins to be accessible to a publisher the partner does not own.", "The publisher name is the control. Real companies are impersonated by apps.", recReport, "Refuse consent and ask the partner on a known email or phone number which app, if any, they actually use.", "You can keep the meeting without granting mail.readwrite to an unknown publisher.", "The partner's IT team later says they do not publish that app, and mail items have already been accessed."),
      o("ius-u04-b", "strong", "Refuse consent and ask the partner on a known channel", "If they need calendar sync, they can name the real app from an address or number you already use.", [3, 3, 3], "Consent never happens. The partner confirms they did not send that publisher.", "You can hold the meeting without the app. Consent screens are decisions, not formalities.", recReport, "Verify the publisher with the partner on a channel you already trust.", "A genuine partner can still be used as cover for a malicious OAuth app.", "The partner's IT team sends a meeting link that does not request mail.readwrite."),
      o("ius-u04-c", "weak", "Accept, assuming the app only needs read-only calendar access", "Tell yourself the scope is calendar-only, then click Accept on the screen in front of you.", [0, 1, 0], "The screen asked for mail.readwrite. That is what you granted.", "Read the permission list. If the scope is wrong, the answer is no.", recReport, "Refuse any consent whose listed permissions do not match what you intended.", "Intending a narrower permission does not grant a narrower permission. The screen is the contract.", "The app is listed with mail.readwrite on your account, not calendar-only."),
    ]),
  packQuestion("ius-u05", "inbox-urgent", "evidence", "Screenshot sent instead of the original email",
    "You reported a suspect message in chat with a screenshot. SOC asks for the original email. The chat thread is about to be archived.",
    "I already posted the screenshot in chat. That should be enough for security.",
    "How should you provide evidence of the phishing email to SOC?",
    ["employee"], ["incident-reporting"], ["Microsoft 365"],
    [
      o("ius-u05-a", "weak", "Say the screenshot is enough and leave the chat as it is", "Treat the image in the thread as the official sample.", [1, 2, 1], "Headers and the true sender are missing. Responders cannot hunt from a picture alone.", "Originals beat pictures. Use the report button on the message in the mailbox.", recReport, "Report the original from the mailbox even if you already shared a screenshot.", "A screenshot is a heads-up. The original in the tenant is the file.", "SOC asks again for the message-id and headers that a JPEG cannot provide."),
      o("ius-u05-b", "strong", "Report the original message from your mailbox", "Use the official report action on the email so responders receive headers and the sender.", [3, 3, 3], "Responders get the original. The chat screenshot was only an early notice.", "The official control is the report action on the message, not a picture in chat.", recReport, "Keep the original in the tenant and submit it through the report button.", "Chat tells people something happened. The mailbox report is what they can act on.", "The ticket now includes headers, the real sender, and the sample location."),
      o("ius-u05-c", "high-risk", "Delete the email so nobody else in the team sees it", "Clear the lure from the mailbox after the screenshot has gone to chat.", [0, 1, 0], "The sample vanishes before anyone can hash it or collect headers.", "Deletion is not reporting. Hiding the lure hides the campaign.", recReport, "Report the original, then leave it in place for responders.", "Protecting colleagues by deleting the only copy also protects the attacker.", "SOC cannot retrieve the message, and another person in the same distribution list still has an unreported copy."),
    ]),
  packQuestion("ius-u06", "inbox-urgent", "communicate", "Lookalike executive asks for gift cards in Slack",
    "A Slack direct message from a lookalike executive account asks you to buy gift cards for a client workshop and to keep the purchase quiet.",
    "They asked me to keep it quiet and they used the word workshop. It sounds like our language.",
    "How should you handle this Slack request to buy gift cards for a workshop?",
    ["employee", "business-leader"], ["social-engineering"], ["SaaS platforms"],
    [
      o("ius-u06-a", "high-risk", "Buy the cards and expense them afterwards", "Follow the request so the workshop is not delayed, then claim it through expenses.", [0, 0, 0], "You fund an account you cannot recover.", "Gift cards plus a secrecy request are the standard tell.", recVerify, "Do not buy. Call the executive on a known number, then report the direct message.", "Quiet spending outside the procurement path is not a client workshop.", "The real executive confirms they did not send the message. Finance cannot reverse the gift-card purchase."),
      o("ius-u06-b", "strong", "Do not buy, verify on a known number, and report the message", "The workshop can wait for a callback. Impersonation is a report, not a purchase.", [3, 3, 3], "The lookalike account is removed. No funds move.", "Helpfulness still needs a second channel. Known voice, then the official report.", recVerify, "Call the number you already have for that executive, then report the Slack message.", "A request for secrecy about money is a reason to stop, not a reason to comply.", "The executive confirms they did not message you, and the lookalike account is taken down."),
      o("ius-u06-c", "weak", "Ask in a public channel whether the request is genuine", "Check with the wider team in Slack before buying, using the same workspace.", [2, 2, 1], "The lookalike may answer first. You might still buy before a trusted person sees the thread.", "Verify privately on a known path. Do not debate the attacker in public.", recVerify, "Call, do not pay, and report. A public ping is optional only after you have not purchased.", "A public check can help later, but it is not the control if the impersonator is in the channel.", "The lookalike replies in the public thread confirming the purchase and repeating the request for secrecy."),
    ]),
  packQuestion("ius-u07", "inbox-urgent", "recover", "Password typed into a fake login page",
    "The sign-in page looked identical to Microsoft 365. You entered your password and stopped before approving MFA. You have not told anyone yet.",
    "If I do not report it, perhaps nothing will come of the password I typed.",
    "What should you do now that you have entered your password on a page you no longer trust?",
    ["employee"], ["incident-reporting", "mfa"], ["Microsoft 365"],
    [
      o("ius-u07-a", "high-risk", "Say nothing and change the password tomorrow", "Wait overnight and handle a reset when you have more time.", [0, 1, 0], "The password is already in someone else's list. Delay is the attacker's friend.", "Same-day reset and a report. Shame is not a reason to wait.", recReport, "Tell IT now, reset now, and do not approve any MFA prompt you did not start.", "A password typed today is usable today. Tomorrow's change is too late.", "IT later finds a password-spray attempt against the account that began the same afternoon."),
      o("ius-u07-b", "strong", "Report now, reset now, and do not approve MFA prompts", "Treat the typed password as a live incident even though you stopped before MFA.", [3, 3, 3], "The account is locked to the attacker. You remain employed.", "Early reporting is the recovery.", recReport, "Use the official path immediately: report, reset, deny unexpected prompts.", "You do not need to have been perfect. You need to be fast after a suspected credential entry.", "IT resets the account the same hour and asks you to deny any prompt you did not initiate."),
      o("ius-u07-c", "weak", "Search the web to see whether other people marked the site as a scam", "Research the URL before involving IT, in case the page was legitimate.", [1, 1, 1], "You lose an hour. A session may already exist.", "Search results are not containment.", recReport, "Contact IT first. Look up the site later if they ask you to.", "Internal reporting beats public folklore, including ads that sit above the real results.", "The first search result is an advertisement. By the time you finish reading, IT still has no ticket."),
    ]),
  packQuestion("ius-u08", "inbox-urgent", "close", "Security Hub still needs the campaign report",
    "Departments have been checked. The hub wants one report so the campaign can be contained for everyone else. You are not in the security team.",
    "I am not in security. Someone else will file the hub report.",
    "Should you submit the Security Hub report for what you saw in this campaign?",
    ["employee", "business-leader", "finance", "hr"], ["incident-reporting"], ["Microsoft 365"],
    [
      o("ius-u08-a", "weak", "Assume someone else has already filed it", "Leave the hub form empty because other teams were involved.", [1, 1, 0], "Nobody filed it. The next shift repeats the same morning.", "If you saw it, you can report it. Somebody else is not a control.", recReport, "Submit one hub report from you. That is enough to start containment for others.", "Witnessing is a reason to file, not a reason to wait for a security job title.", "The next shift finds no hub record and has to reconstruct the campaign from scratch."),
      o("ius-u08-b", "strong", "File the hub report with what you saw", "Your role does not matter. A witness report is enough for the centre to mark the campaign.", [3, 3, 3], "The campaign is marked contained from the hub with a usable witness account.", "Reporting is a normal employee control. You do not need a security job title to close the loop.", recReport, "Submit from the Security Hub with facts, times, and who else might have the lure.", "One complete witness report is more useful than several people assuming each other filed it.", "The hub shows a submitted report, and SOC can see which departments still need a warning."),
      o("ius-u08-c", "high-risk", "Post a public warning on a social network instead", "Describe the lure on a public profile so other organisations are aware.", [0, 1, 1], "You amplify the template and may include internal detail.", "Public posts are not incident reports.", recReport, "File internally. Do not circulate the sample or a running commentary outside the company.", "The internet does not need the working lure, and the hub still has no record.", "External posts pick up the wording, and Legal asks why internal incident detail left the organisation."),
    ]),
];
