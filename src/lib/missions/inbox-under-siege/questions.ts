import { option, question, scoreTriple } from "../build";
import type { AnswerOption, AnswerQuality, Question, RoleId, ScorePoints, StoryPhase } from "../types";
import { INBOX_IT_QUESTIONS } from "./it-questions";
import { INBOX_URGENT_QUESTIONS } from "./urgent-questions";

const KEYS = ["threatRecognition", "safeResponse", "reporting"] as const;

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
  return option(
    id,
    quality,
    title,
    summary,
    pts(...scores),
    consequence,
    explanation,
    recommendedAction,
    whyRecommended,
    learningPoint,
    npcReaction,
  );
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
  return question(
    "inbox-under-siege",
    id,
    phase,
    [scenarioId],
    title,
    situation,
    npcLine,
    ["NIST CSF Protect", "incident reporting"],
    options,
    {
      roleIds: roles,
      departmentIds: [scenarioId],
      topicIds: topics,
      toolIds: tools,
      learningObjectiveIds: ["recognise-phishing", "report-safely"],
      difficulty: "Beginner",
    },
  );
}

const recVerify = "Verify through a second known channel before money, credentials or access move.";
const recReport = "Report in the official channel, do not interact with the lure, and preserve the message.";

const FINANCE: Question[] = [
  packQuestion("ius-f01", "inbox-finance", "start", "The invoice that changed banks",
    "A supplier invoice looks familiar except the IBAN is new and the PDF asks you to 'update the master data today'. The amount matches a real purchase order.",
    "If we miss the discount window, that is also a risk.",
    ["finance"], ["phishing", "third-party-risk"], ["Financial data", "SAP"],
    [
      o("ius-f01-a", "high-risk", "Pay from the PDF", "The PO matches. Speed is a control.", [0, 0, 0], "Funds leave on a Friday. The real supplier still wants paying.", "Bank changes need a second channel.", recVerify, "Callback beats a polished PDF.", "Supplier payment changes are a classic BEC move.", "Treasury is now doing archaeology."),
      o("ius-f01-b", "strong", "Call the known number, freeze the change", "Use the number on last month's statement, not the PDF.", [3, 3, 3], "The IBAN is a trap. The message is quarantined.", "Out-of-band verification stops invoice switch fraud.", recVerify, "Known channel, then report.", "Matching amounts are not matching identities.", "The real supplier is confused, then grateful."),
      o("ius-f01-c", "weak", "Email the PDF back asking 'is this you?'", "They will confirm.", [1, 1, 1], "You talk to the attacker, who confirms enthusiastically.", "Do not verify a lure using the lure.", recVerify, "A phone number you already trust is the check.", "Reply-to is not a control.", "The thread now has 14 thumbs-up emojis from a stranger."),
    ]),
  packQuestion("ius-f02", "inbox-finance", "assess", "CEO needs a transfer in 12 minutes",
    "A WhatsApp from 'the CEO' demands a confidential supplier bonus. The tone is busy. The profile photo is last year's offsite.",
    "Do not loop in anyone. This is sensitive.",
    ["finance", "business-leader"], ["phishing", "social-engineering"], ["Financial data"],
    [
      o("ius-f02-a", "high-risk", "Send it, she is clearly stressed", "Executives hate process.", [0, 0, 0], "The money is gone and the CEO is in a meeting about biscuits.", "Urgency plus secrecy is the con.", recVerify, "Payment authority is not a chat app.", "CEO fraud works because people are helpful.", "There is now a very sincere all-hands."),
      o("ius-f02-b", "strong", "Use the payment callback list", "If it is real, she will still be CEO in 20 minutes.", [3, 3, 3], "The callback reaches the real person. The chat is reported.", "Dual control and known numbers beat chat urgency.", recVerify, "Process is how finance protects the company.", "Confidential is not the same as unverified.", "The intern labels the chat 'not-the-CEO'."),
      o("ius-f02-c", "defensible", "Pay a smaller 'holding' amount", "Compromise.", [2, 1, 1], "You still paid the attacker, just less.", "Partial fraud is still fraud.", recVerify, "Zero until verified.", "Splitting a scam does not make it a control.", "Treasury invents a new spreadsheet named Why."),
    ]),
  packQuestion("ius-f03", "inbox-finance", "contain", "Shared workbook from 'Audit'",
    "A OneDrive link titled Q3_controls_review.xlsx wants you to sign in with your Microsoft 365 account to 'enable macros for audit'.",
    "Audit always wants macros. It is tradition.",
    ["finance"], ["phishing", "file-sharing"], ["Microsoft 365", "Financial data"],
    [
      o("ius-f03-a", "high-risk", "Sign in to be helpful", "Auditors are waiting.", [0, 0, 0], "Credentials go to a fake login. The inbox becomes a launch pad.", "Fake Microsoft logins steal sessions.", recReport, "Report the link, do not authenticate to it.", "Login prompts in unexpected files are the attack.", "Your account starts sending invoices in Romanian."),
      o("ius-f03-b", "strong", "Report the link, open nothing", "Check with the real audit mailbox you already have.", [3, 3, 3], "The fake tenant is blocked. Nobody else signs in.", "Unexpected sign-in pages are not documents.", recReport, "Preserve, report, verify the requester.", "If it needed your password, it was not a spreadsheet.", "Audit confirms they do not send surprise macros."),
      o("ius-f03-c", "weak", "Upload it to a personal Gmail to 'scan it'", "Shadow IT as antivirus.", [1, 1, 0], "You copy a lure into another estate.", "Do not launder malware through personal mail.", recReport, "Official reporting keeps the sample useful.", "Forwarding is not analysis.", "Personal Gmail would like a word."),
    ]),
  packQuestion("ius-f04", "inbox-finance", "control", "QR on the canteen receipt",
    "A printed 'updated supplier portal' QR appears on a receipt left at your desk. It promises faster invoice status.",
    "I already have my phone out.",
    ["finance"], ["phishing", "suspicious-links"], ["SAP"],
    [
      o("ius-f04-a", "high-risk", "Scan and log in", "Paper cannot lie.", [0, 0, 0], "The phone opens a convincing portal. So does the attacker.", "QR codes are just links you cannot read.", recReport, "Type the known portal yourself.", "Unexpected QR plus login is quishing.", "Your phone now has a new authenticator it did not ask for."),
      o("ius-f04-b", "strong", "Bag it, report it, use the bookmark", "The real portal is already in the browser.", [3, 3, 2], "The QR is logged. Nobody else scans the lunch receipt.", "Known URLs beat mystery codes.", recReport, "Physical lures still get reported.", "If you did not expect a portal, do not open one.", "Facilities bin the receipt like a celebrity."),
      o("ius-f04-c", "weak", "Photograph it for the team chat", "Awareness.", [1, 2, 1], "Half the team scans it 'just to see'.", "Do not redistribute live lures.", recReport, "Report first, screenshot in the ticket.", "Awareness is not a QR blast.", "The chat is now a second campaign."),
    ]),
  packQuestion("ius-f05", "inbox-finance", "evidence", "Keep the lure or tidy up?",
    "You did not click. A colleague wants the email deleted so 'it does not look messy for the auditor'.",
    "If we cannot see it, it did not happen.",
    ["finance", "risk-governance"], ["incident-reporting"], ["Microsoft 365"],
    [
      o("ius-f05-a", "high-risk", "Delete for everyone", "Clean mailbox, clean conscience.", [0, 1, 0], "Evidence vanishes. So does the hash the SOC wanted.", "Phishing reports need the original.", recReport, "Report then leave it for responders.", "Tidying is not containment.", "The auditor would like the opposite of this."),
      o("ius-f05-b", "strong", "Report and leave it in place", "Messy is a feature.", [3, 2, 3], "The sample is preserved. Others get a warning banner.", "Original messages beat screenshots.", recReport, "Official report plus preservation.", "Evidence is part of the response.", "SOC sends a tiny thank-you sticker."),
      o("ius-f05-c", "defensible", "Forward to your personal archive", "Belt and braces.", [1, 1, 1], "The lure now lives in a mailbox with holiday photos.", "Do not copy incidents home.", recReport, "Keep it in the work tenant.", "Personal archives are not evidence lockers.", "Your phone storage weeps."),
    ]),
  packQuestion("ius-f06", "inbox-finance", "communicate", "Should we warn all vendors?",
    "Someone drafts a mass email to every supplier attaching the fake invoice 'so they know'.",
    "Transparency.",
    ["finance", "business-leader"], ["incident-reporting"], ["Third-party technology providers"],
    [
      o("ius-f06-a", "high-risk", "Send the sample to 400 suppliers", "They will learn.", [0, 1, 1], "You mail the payload to the extended family of Northstar.", "Do not distribute live phishing.", recReport, "A short notice without attachments.", "Awareness without malware attached.", "Procurement would like to sit down."),
      o("ius-f06-b", "strong", "Short notice, no attachment, named owner", "If they need detail, they call the known number.", [3, 3, 3], "Suppliers are cautioned without a second campaign.", "Communication can be specific and safe.", recReport, "Describe, do not attach.", "You can warn without amplifying.", "The draft loses its attachment and gains a spine."),
      o("ius-f06-c", "weak", "Say nothing, it is embarrassing", "Brand.", [1, 2, 0], "Two more invoices almost go out.", "Silence lets the campaign continue.", recReport, "Tell the people who might pay.", "Embarrassment is not a control.", "The rumour mill writes a worse version."),
    ]),
  packQuestion("ius-f07", "inbox-finance", "recover", "The payment already left",
    "A junior processed one changed-bank payment before you arrived. They are hiding behind a plant.",
    "If we ignore it, maybe the bank will too.",
    ["finance"], ["incident-response"], ["Financial data"],
    [
      o("ius-f07-a", "high-risk", "Wait and hope", "Banks like surprises.", [0, 0, 0], "The recall window closes.", "Speed still matters after a bad click.", recReport, "Recall, notify, document.", "Hope is not a recovery plan.", "The plant is not a control either."),
      o("ius-f07-b", "strong", "Recall, notify bank and supplier, log it", "Name what happened without a public hanging.", [3, 3, 3], "A recall is attempted. The junior is still employed.", "Recovery is a playbook, not a mood.", recReport, "Act, then learn.", "Blameless is not consequence-free, but hiding fails.", "The plant is returned to facilities."),
      o("ius-f07-c", "weak", "Post it in the meme channel", "Culture.", [1, 1, 1], "Everyone laughs. The bank still has not been called.", "Humour is allowed after the ticket exists.", recReport, "Ticket first.", "Comedy is not a recall.", "The meme is funny and late."),
    ]),
  packQuestion("ius-f08", "inbox-finance", "close", "Submit the incident report",
    "Security Hub wants one report: what you saw, what you clicked, what money moved, who else might have the lure.",
    "Can we just write 'phishing lol'?",
    ["finance", "incident-responder"], ["incident-reporting"], ["Microsoft 365"],
    [
      o("ius-f08-a", "weak", "One-word report", "Phishing.", [1, 1, 1], "Responders start from zero.", "A report is a handover.", recReport, "Facts, times, actions.", "Vague reports waste the next hour.", "The form stares back."),
      o("ius-f08-b", "strong", "Facts, times, money, sample location", "Enough for someone else to act at 02:00.", [3, 3, 3], "The campaign is contained with a usable record.", "Reporting is the last control you own.", recReport, "Complete the hub report.", "A good report is an act of containment.", "The hub light goes from amber to something calmer."),
      o("ius-f08-c", "high-risk", "Skip it, you already chatted SOC", "They know.", [0, 1, 0], "The chat scrolls away. The next shift does not know.", "Chat is not the record.", recReport, "Write it down in the official place.", "If it is not in the report, it did not happen for the next person.", "SOC's group chat has 600 unread."),
    ]),
];

const HR: Question[] = [
  packQuestion("ius-h01", "inbox-hr", "start", "The CV that runs",
    "A candidate sends intern_cv_final.iso and says they could not upload to the portal. They are very keen.",
    "ISO is basically PDF's cousin.",
    ["hr"], ["phishing", "privacy"], ["Customer data"],
    [
      o("ius-h01-a", "high-risk", "Open it on the HR laptop", "We owe them a fair process.", [0, 0, 0], "The laptop joins a botnet named after a sandwich.", "Unexpected archives are not CVs.", recReport, "Portal only, report the file.", "Recruitment is a favourite delivery path.", "IT would like the laptop back, philosophically."),
      o("ius-h01-b", "strong", "Reject the file, invite the portal", "If they are real, they can click the real link.", [3, 3, 3], "The sample is reported. The candidate is still a maybe.", "HR systems exist so laptops do not run strangers.", recReport, "Known upload path only.", "Kindness is not executing attachments.", "The portal remains boring, which is the point."),
      o("ius-h01-c", "weak", "Ask IT to 'just have a look' on any PC", "Shared curiosity.", [1, 2, 1], "Someone almost runs it on a jump box.", "Look means a sandbox, not a tour.", recReport, "Report as a sample.", "Informal analysis still needs isolation.", "IT puts on gloves, then policies."),
    ]),
  packQuestion("ius-h02", "inbox-hr", "assess", "Payroll change from an employee",
    "An email from a lookalike domain asks to change bank details before payday, with a scanned passport photo.",
    "They will be sad if we miss payday.",
    ["hr", "finance"], ["phishing", "privacy"], ["Financial data"],
    [
      o("ius-h02-a", "high-risk", "Update payroll from the email", "The passport looks official-ish.", [0, 0, 0], "Salary leaves for a stranger. The real person is unpaid and loud.", "Payroll changes need a known process.", recVerify, "Call the number on file.", "Lookalike domains eat paydays.", "The helpdesk queue becomes a ballad."),
      o("ius-h02-b", "strong", "Use the HR change form and call the person", "Email is not the process.", [3, 3, 3], "The real employee never sent it. The lure is reported.", "Identity proof is a process, not an attachment.", recVerify, "Known form plus voice confirm.", "Photos in inboxes are not ID checks.", "Payday remains boring."),
      o("ius-h02-c", "defensible", "Delay all payroll until next month", "Safety.", [2, 0, 1], "Nobody is paid. The attacker still has the template.", "Do not punish the whole company for one lure.", recVerify, "Stop that change, not the payroll run.", "Contain the request, not the workforce.", "The union learns a new song."),
    ]),
  packQuestion("ius-h03", "inbox-hr", "contain", "Urgent benefits enrolment link",
    "A Teams message from 'HR-bot' drops a short link for same-day pension changes. It was not on the comms calendar.",
    "Bots are very 2026.",
    ["hr", "employee"], ["phishing", "suspicious-links"], ["Microsoft 365"],
    [
      o("ius-h03-a", "high-risk", "Click, it is benefits", "People love pensions.", [0, 0, 1], "A fake login harvests HR admin plus curiosity.", "Unscheduled bots are not the intranet.", recReport, "Use the bookmarked HR system.", "If it was not announced, it is not benefits.", "The bot has a lot of feelings about your password."),
      o("ius-h03-b", "strong", "Report the Teams message", "Calendar first, then links.", [3, 3, 3], "The app registration behind the bot is reviewed.", "Unexpected OAuth and bots get reported.", recReport, "Official channel, official URL.", "Teams is still email with extra steps.", "Internal comms confirm they did not send a gremlin."),
      o("ius-h03-c", "weak", "Reply 'unsubscribe'", "Manners.", [1, 1, 1], "You confirm a live mailbox to the operator.", "Do not converse with lures.", recReport, "Report, do not reply.", "Unsubscribe is for newsletters you asked for.", "The bot unsubscribes you from caution."),
    ]),
  packQuestion("ius-h04", "inbox-hr", "control", "Shared performance pack",
    "A manager shares a Google Doc 'feedback pack' from a personal account because 'the tenant was slow'.",
    "Speed is empathy.",
    ["hr", "business-leader"], ["file-sharing", "privacy"], ["Google Workspace", "Customer data"],
    [
      o("ius-h04-a", "high-risk", "Open it, people are waiting", "Personal Google is basically work.", [0, 1, 0], "The doc phishes SSO. Reviews leak to a personal drive.", "People data stays in the tenant.", recReport, "Reshare in the approved system.", "Convenience is how HR data leaves.", "Legal develops a thousand-yard stare."),
      o("ius-h04-b", "strong", "Refuse, reshare in the HR system", "Slow tenant beats leaked reviews.", [3, 3, 3], "The personal doc is reported. Reviews stay inside.", "Approved systems exist for this exact afternoon.", recReport, "No personal clouds for employee files.", "Privacy is a location.", "The manager discovers the official button."),
      o("ius-h04-c", "weak", "Download and re-upload yourself", "You will sanitise it with vibes.", [1, 2, 1], "You still opened the lure, then copied it.", "Do not launder unknown files.", recReport, "Start from the official template.", "Re-hosting is not a control.", "Vibes fail the DPIA."),
    ]),
  packQuestion("ius-h05", "inbox-hr", "evidence", "Who else got the CV?",
    "The ISO file went to three recruiters. One already forwarded it to a hiring manager.",
    "We should not alarm talent acquisition.",
    ["hr"], ["incident-reporting"], ["Microsoft 365"],
    [
      o("ius-h05-a", "high-risk", "Ask them to delete quietly", "No tickets, no problems.", [0, 1, 0], "The hiring manager still has it. Reporting never starts.", "Quiet deletes hide scope.", recReport, "Tell SOC who received it.", "Scope is the first HR duty here.", "Talent acquisition is now an incident role."),
      o("ius-h05-b", "strong", "List recipients and report", "Names, times, who opened what.", [3, 3, 3], "The blast radius is visible. Machines can be checked.", "Reporting needs a recipient list.", recReport, "Facts over embarrassment.", "HR already knows how to count people.", "SOC loves a tidy list."),
      o("ius-h05-c", "defensible", "Only tell the manager who opened it", "Minimum drama.", [2, 2, 1], "The other two still forward it tomorrow.", "Partial scope is still a gap.", recReport, "All recipients.", "Minimum drama is not minimum reporting.", "Tomorrow's drama arrives anyway."),
    ]),
  packQuestion("ius-h06", "inbox-hr", "communicate", "Do we email all staff about CVs?",
    "Someone wants an all-staff: 'Never open CVs'. Recruiting would like a word.",
    "Clarity.",
    ["hr", "business-leader"], ["incident-reporting"], ["Microsoft 365"],
    [
      o("ius-h06-a", "weak", "Ban all attachments forever", "Simple.", [2, 0, 1], "Workaround culture invents USB CVs.", "Absolute bans create shadow paths.", recReport, "Ban unexpected files, keep the portal.", "Precision beats panic.", "Candidates apply via carrier pigeon."),
      o("ius-h06-b", "strong", "Short guidance: portal only, report odd files", "Recruiting can still recruit.", [3, 3, 3], "Staff know the rule without a taboo on hiring.", "Comms can be accurate.", recReport, "Explain the real process.", "You can be clear without being theatrical.", "The portal link is in the same paragraph."),
      o("ius-h06-c", "high-risk", "Name the candidate in the all-staff", "Accountability.", [0, 1, 0], "You publish personal data about a possibly innocent person.", "Do not dox a lure identity.", recReport, "Describe the pattern, not the person.", "Privacy still applies during incidents.", "Legal materialises from a cupboard."),
    ]),
  packQuestion("ius-h07", "inbox-hr", "recover", "A recruiter entered the fake login",
    "They feel terrible. MFA prompts are still buzzing on their phone.",
    "If we ignore the prompts they will stop.",
    ["hr", "it-support"], ["mfa", "incident-response"], ["Microsoft 365"],
    [
      o("ius-h07-a", "high-risk", "Approve one prompt so it goes quiet", "Then we can think.", [0, 0, 0], "The attacker inherits the session.", "MFA fatigue is the attack.", recReport, "Deny, report, reset.", "Never approve a prompt you did not start.", "The buzzing was a clue, not a nuisance."),
      o("ius-h07-b", "strong", "Deny, call IT, reset the account", "Feeling terrible is allowed. Approving is not.", [3, 3, 3], "The session is killed. The recruiter still has a job.", "Fatigue attacks fail if nobody taps yes.", recReport, "IT reset plus a report.", "Human error plus a playbook is still recoverable.", "The phone goes quiet for honest reasons."),
      o("ius-h07-c", "weak", "Turn the phone off", "No prompt, no problem.", [1, 1, 1], "The already-open session continues on a laptop.", "Powering off is not revocation.", recReport, "Revoke sessions properly.", "Hardware off is not identity off.", "The laptop continues being helpful to the wrong person."),
    ]),
  packQuestion("ius-h08", "inbox-hr", "close", "Hub report from HR",
    "The hub wants: lure type, systems, personal data at risk, who clicked.",
    "We would rather this stayed 'an HR thing'.",
    ["hr"], ["incident-reporting", "privacy"], ["Microsoft 365"],
    [
      o("ius-h08-a", "high-risk", "Keep it local", "Protect the function.", [0, 1, 0], "Security cannot see employee-data exposure.", "Privacy incidents still get reported.", recReport, "File the hub report.", "Local heroics hide harm.", "The function is not a bunker."),
      o("ius-h08-b", "strong", "File it with data-risk notes", "What data, whose, whether it left.", [3, 3, 3], "Privacy and security can act from the same page.", "HR reports are incident reports.", recReport, "Include the data angle.", "You already know how to talk about people data.", "The hub stops blinking quite so rudely."),
      o("ius-h08-c", "weak", "Use only first names in the ticket", "Privacy.", [1, 2, 2], "Responders cannot find the accounts.", "Need-to-know is not no-names.", recReport, "Use official identifiers in the secure tool.", "Over-redaction blocks help.", "The ticket reads like a mystery novel."),
    ]),
];

export const INBOX_UNDER_SIEGE_QUESTIONS: Question[] = [
  ...FINANCE,
  ...HR,
  ...INBOX_IT_QUESTIONS,
  ...INBOX_URGENT_QUESTIONS,
];
