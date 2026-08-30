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
  prompt: string,
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
      prompt,
    },
  );
}

const recVerify = "Verify through a second known channel before money, credentials or access move.";
const recReport = "Report in the official channel, do not interact with the lure, and preserve the message.";

const FINANCE: Question[] = [
  packQuestion("ius-f01", "inbox-finance", "start", "Supplier invoice with a new IBAN",
    "A supplier invoice matches a real purchase order, but the IBAN is new and the PDF asks you to update master data today so the early-payment discount is not lost.",
    "If we miss the discount window we will have to explain the extra cost.",
    "How should you handle this bank-detail change before any payment is released?",
    ["finance"], ["phishing", "third-party-risk"], ["Financial data", "SAP"],
    [
      o("ius-f01-a", "high-risk", "Release payment from the PDF details", "The purchase-order amount matches, so process the new IBAN today.", [0, 0, 0], "Funds leave on a Friday. The genuine supplier still invoices for the same amount.", "Supplier bank changes must be confirmed on a channel you already trust, not the invoice that requested them.", recVerify, "A callback to a known number stops invoice-switch fraud before money moves.", "Matching amounts are not matching identities. Bank-detail changes are a classic business-email-compromise move.", "Accounts payable reports the payment has already cleared to an account the supplier does not recognise."),
      o("ius-f01-b", "strong", "Call the known number and hold the change", "Use the number from last month's statement, not any number printed in the PDF.", [3, 3, 3], "The supplier confirms the IBAN is not theirs. The message is quarantined and the payment is held.", "Out-of-band verification on a known number is the control for payment-detail changes.", recVerify, "A number you already hold is the check; the PDF is only a claim.", "Do not update master data from an unexpected invoice, even when the amount is correct.", "The supplier's accounts team confirms they did not change banks and asks you to report the message."),
      o("ius-f01-c", "weak", "Reply to the invoice email to confirm the IBAN", "Ask the sender whether the new bank details are genuine.", [1, 1, 1], "The attacker confirms the change and presses for same-day payment.", "Do not verify a lure by using the lure. Reply-to on a fraudulent invoice belongs to the attacker.", recVerify, "A phone number already on file is the check, not a reply in the same thread.", "Confirmation from the message that asked for the change is not independent verification.", "The sender replies within minutes confirming the new IBAN and copying a lookalike finance address."),
    ]),
  packQuestion("ius-f02", "inbox-finance", "assess", "CEO asks for a confidential transfer",
    "A WhatsApp message from an account using the CEO's name and last year's offsite photo asks you to send a confidential supplier bonus within twelve minutes and not to involve anyone else.",
    "Do not loop anyone in. This has to stay confidential.",
    "How should you handle this WhatsApp payment request before any funds move?",
    ["finance", "business-leader"], ["phishing", "social-engineering"], ["Financial data"],
    [
      o("ius-f02-a", "high-risk", "Send the transfer as requested", "The CEO asked for speed and secrecy, so process it on the chat instructions.", [0, 0, 0], "The money leaves. The real CEO is in a meeting and did not send the message.", "Urgency plus a request for secrecy is the standard pattern in executive impersonation fraud.", recVerify, "Payment authority is exercised through approved channels, not a chat app.", "CEO fraud works because staff want to be helpful under time pressure.", "The CEO's office confirms they did not request a supplier bonus and asks Finance to start a recall."),
      o("ius-f02-b", "strong", "Use the payment callback list before sending", "Call the CEO on the published number. If the request is genuine it will still be valid after verification.", [3, 3, 3], "The callback reaches the real CEO, who did not send the chat. The WhatsApp account is reported.", "Dual control and known numbers defeat chat urgency.", recVerify, "The callback list exists so confidential payments are still verified.", "Confidential is not the same as unverified. Secrecy requested by the payer is a warning sign.", "The CEO confirms they are not on WhatsApp for payments and asks you to report the account."),
      o("ius-f02-c", "defensible", "Send a smaller holding amount while you check", "Reduce the value as a compromise until the request can be confirmed.", [2, 1, 1], "You still paid the attacker, only a smaller sum.", "A partial payment to an unverified account is still fraud. Verification is binary for first-time chat payment requests.", recVerify, "Hold the full amount until a known-channel confirmation exists.", "Splitting a suspicious payment does not turn it into an approved control.", "Treasury records a loss on the reduced amount and still has to explain why the callback list was not used first."),
    ]),
  packQuestion("ius-f03", "inbox-finance", "contain", "Audit workbook asks you to sign in",
    "A OneDrive link titled Q3_controls_review.xlsx asks you to sign in with your Microsoft 365 account to enable macros for audit. You were not expecting a file from this sender.",
    "Audit always wants macros on these reviews. We should not hold them up.",
    "How should you handle this unexpected sign-in prompt on the audit workbook?",
    ["finance"], ["phishing", "file-sharing"], ["Microsoft 365", "Financial data"],
    [
      o("ius-f03-a", "high-risk", "Sign in through the link to help audit", "Enter your Microsoft 365 details so the workbook can open.", [0, 0, 0], "Credentials go to a fake login page. The mailbox is then used to send further invoices.", "Unexpected Microsoft sign-in pages attached to files steal sessions.", recReport, "Report the link and do not authenticate to it.", "A login prompt inside an unexpected file is the attack, not a document feature.", "Identity confirms a sign-in from an unknown location a few minutes after you submitted the form."),
      o("ius-f03-b", "strong", "Report the link and do not open the file", "Contact the audit mailbox you already use, not the address on this message.", [3, 3, 3], "The fake tenant is blocked. Nobody else in Finance signs in.", "Unexpected sign-in pages are not workbooks. Treat the message as a lure until the real audit team confirms it.", recReport, "Preserve the message, report it, and verify the requester on a known channel.", "If a spreadsheet needs your password, it is not a spreadsheet you should open.", "Internal audit confirms they do not send unsolicited macro-enabled workbooks by OneDrive link."),
      o("ius-f03-c", "weak", "Forward it to a personal mailbox to scan it", "Copy the file to a personal account and run consumer antivirus before opening it at work.", [1, 1, 0], "You copy a live lure into another mail estate and still have not verified the sender.", "Do not move suspected malware through a personal mailbox. That is not analysis.", recReport, "Official reporting keeps the sample in the tenant where responders can use it.", "Forwarding a suspect file is not a substitute for a sandbox or a phishing report.", "The personal mailbox now holds the sample, and work IT cannot see whether anyone else received the same link."),
    ]),
  packQuestion("ius-f04", "inbox-finance", "control", "QR code on a canteen receipt",
    "A printed QR code labelled updated supplier portal has been left on a canteen receipt at your desk. It promises faster invoice-status checks if you sign in.",
    "I already have my phone out. Scanning it will only take a moment.",
    "How should you treat this unexpected supplier-portal QR code?",
    ["finance"], ["phishing", "suspicious-links"], ["SAP"],
    [
      o("ius-f04-a", "high-risk", "Scan the code and sign in", "The receipt is physical, so the portal looks official enough to use.", [0, 0, 0], "The phone opens a convincing supplier site. The credentials are captured.", "QR codes are links you cannot read before you open them. An unexpected login is still phishing.", recReport, "Type the known portal address yourself or use an existing bookmark.", "Unexpected QR plus a login request is quishing: the paper is only the delivery method.", "Your authenticator shows a new sign-in you did not start from the bookmarked portal."),
      o("ius-f04-b", "strong", "Keep the receipt, report it, use the bookmark", "Open the real supplier portal from the browser bookmark you already have.", [3, 3, 2], "The QR is logged as a physical lure. Nobody else on the floor is asked to scan it.", "Known URLs beat surprise codes. Physical lures still belong in an official report.", recReport, "Report the artefact, then use the system you already trust.", "If you did not expect a new portal, do not open one from a slip of paper.", "Facilities collect the receipt as evidence and point staff to the existing bookmark."),
      o("ius-f04-c", "weak", "Photograph the QR and share it in the finance chat", "Ask colleagues whether the new portal looks legitimate before anyone uses it.", [1, 2, 1], "Several people scan the live code to check it for the group.", "Do not redistribute a live lure. A screenshot in an official ticket is different from a group scan.", recReport, "Report first, and attach a photograph only inside the incident ticket.", "Awareness is not sending a working QR to the whole team.", "Two colleagues open the page from the chat. Security now has a wider set of possible sign-ins to review."),
    ]),
  packQuestion("ius-f05", "inbox-finance", "evidence", "Colleague wants the phishing email deleted",
    "You did not click. A colleague wants the email deleted from the shared mailbox so it does not look messy if an auditor reviews the folder.",
    "If we cannot see it, it will not become a finding.",
    "What should happen to the original phishing message now?",
    ["finance", "risk-governance"], ["incident-reporting"], ["Microsoft 365"],
    [
      o("ius-f05-a", "high-risk", "Delete it from the shared mailbox", "Clear the message so the folder looks tidy for any review.", [0, 1, 0], "The original is gone, including the headers and hash that the SOC needed.", "Phishing reports require the original message. Tidying is not containment.", recReport, "Report the message and leave it in place for responders.", "Deleting a lure to look organised removes the evidence the next shift needs.", "SOC asks for the original and is told the shared mailbox no longer holds it."),
      o("ius-f05-b", "strong", "Report the message and leave the original in place", "Keep the intact email where responders can collect headers and the sample.", [3, 2, 3], "The sample is preserved. Other staff see a warning banner on similar mail.", "Original messages beat screenshots. Evidence is part of the response.", recReport, "File the official report and do not tidy the evidence away.", "A reported, preserved message is more useful than a clean folder.", "SOC confirms they have the original and will handle retention with the mailbox owner."),
      o("ius-f05-c", "defensible", "Forward a copy to your personal mailbox as backup", "Keep a spare outside the work tenant in case the shared folder is cleared.", [1, 1, 1], "The lure now sits in a personal mailbox alongside unrelated mail.", "Do not copy incidents to personal accounts. Work-tenant retention is the evidence locker.", recReport, "Keep the original in the work tenant and report it there.", "Personal archives are not an evidence process and may breach handling rules.", "Legal asks why a live phishing sample was copied to a personal account."),
    ]),
  packQuestion("ius-f06", "inbox-finance", "communicate", "Warning every supplier about the fake invoice",
    "Someone drafts a mass email to every supplier, attaching the fake invoice so they will recognise it if they see it.",
    "We should be transparent with every supplier we pay.",
    "How should Finance warn suppliers about this invoice fraud?",
    ["finance", "business-leader"], ["incident-reporting"], ["Third-party technology providers"],
    [
      o("ius-f06-a", "high-risk", "Send the sample invoice to the full supplier list", "Attach the file so every vendor can see exactly what to look for.", [0, 1, 1], "The live payload is mailed to hundreds of external organisations.", "Do not distribute a live phishing sample. Describe the pattern; do not attach it.", recReport, "Send a short notice without attachments and name a known contact number.", "Awareness must not amplify the malware or the template.", "Procurement asks you to retract the mail. Several suppliers opened the attachment."),
      o("ius-f06-b", "strong", "Send a short notice with no attachment and a named owner", "Describe the fraud and tell suppliers to call the known accounts number if they are unsure.", [3, 3, 3], "Suppliers are cautioned without receiving a second copy of the lure.", "You can warn specifically and still keep the sample inside the incident process.", recReport, "Describe what to watch for; do not attach the file.", "A named callback path is safer than circulating the invoice.", "Supplier communications send a text-only note and keep the sample in the incident ticket."),
      o("ius-f06-c", "weak", "Do not contact suppliers, to avoid embarrassment", "Keep the incident internal so it does not affect commercial relationships.", [1, 2, 0], "Two further changed-bank invoices are almost paid by other staff who were not told.", "Silence lets the campaign continue with the people most likely to pay.", recReport, "Tell the people who might release funds, without attaching the sample.", "Embarrassment is not a reason to withhold a practical warning.", "Another buyer asks whether anyone had mentioned a new IBAN on a familiar invoice."),
    ]),
  packQuestion("ius-f07", "inbox-finance", "recover", "Changed-bank payment already sent",
    "A junior processed one changed-bank payment before you reviewed the invoice. They have told you what happened and are waiting to know the next step.",
    "If we leave it overnight, the receiving bank may reverse it on their side.",
    "What should you do first now that a changed-bank payment has already gone out?",
    ["finance"], ["incident-response"], ["Financial data"],
    [
      o("ius-f07-a", "high-risk", "Wait to see whether the bank reverses it", "Do not start a recall yet. Monitor the account in case the funds come back.", [0, 0, 0], "The recall window closes. The funds are not returned.", "Speed still matters after a bad payment. Hope is not a recovery plan.", recReport, "Start the recall, notify the bank and the genuine supplier, and record the incident.", "Waiting for the other bank to notice is how recoverable fraud becomes a loss.", "Treasury confirms the payment has left the recall window and the supplier is still unpaid."),
      o("ius-f07-b", "strong", "Start a recall, notify the bank and supplier, and log it", "Follow the payment-fraud playbook and record what happened without blaming the junior in public.", [3, 3, 3], "A recall is attempted in time. The junior remains at work and the incident has an owner.", "Recovery is a playbook: recall, notify, document, then review the process.", recReport, "Act on the payment first, then capture the lessons.", "Blameless reporting still requires a logged incident. Hiding the payment fails twice.", "The bank acknowledges the recall request and the genuine supplier is told their invoice is still outstanding."),
      o("ius-f07-c", "weak", "Warn the team in chat before contacting the bank", "Tell colleagues what happened, then pick up the recall after the conversation.", [1, 1, 1], "The team is informed, but the bank has still not been called and time is passing.", "Informal warning is not a recall. The ticket and the bank notice come first.", recReport, "Open the incident and contact the bank, then brief the team without the live sample.", "Chat is not a substitute for the recovery playbook.", "By the time the chat thread ends, the payments team still has no recall reference."),
    ]),
  packQuestion("ius-f08", "inbox-finance", "close", "Security Hub wants the incident report",
    "Security Hub asks for one report covering what you saw, whether anyone clicked, what money moved, and who else might still have the lure.",
    "Can we keep it to a short note? We already told the security chat.",
    "What belongs in the Security Hub incident report for this campaign?",
    ["finance", "incident-responder"], ["incident-reporting"], ["Microsoft 365"],
    [
      o("ius-f08-a", "weak", "File a one-line report that it was phishing", "Enter the word phishing and assume SOC can reconstruct the rest from chat.", [1, 1, 1], "Responders start from almost no facts and have to re-interview Finance.", "A report is a handover. Vague labels waste the next hour of response time.", recReport, "Record facts, times, actions taken, and where the sample is.", "If the next shift cannot act from the form, the report is not finished.", "The on-call analyst asks for times, amounts, and the mailbox path that were never written down."),
      o("ius-f08-b", "strong", "Record facts, times, money moved, and the sample location", "Give someone at 02:00 enough to contain the campaign without a verbal briefing.", [3, 3, 3], "The campaign is contained with a usable record for the next shift.", "Reporting is the last control you own on this incident. Complete it in the hub.", recReport, "Finish the hub report with enough detail for independent action.", "A complete report is itself an act of containment.", "SOC confirms they can see the sample path, the payment status, and who else received the lure."),
      o("ius-f08-c", "high-risk", "Skip the form because you already messaged SOC", "Treat the chat thread as the official record.", [0, 1, 0], "The chat scrolls away. The next shift has no ticket and repeats the same questions.", "Chat is not the record. If it is not in the hub report, it did not happen for the next person.", recReport, "Write the facts in the official place even if you already spoke to SOC.", "Informal notice does not survive a shift change.", "The morning analyst cannot find a ticket and does not know a payment recall is in flight."),
    ]),
];

const HR: Question[] = [
  packQuestion("ius-h01", "inbox-hr", "start", "Candidate CV sent as an ISO file",
    "A candidate emails intern_cv_final.iso and says they could not upload to the careers portal. They ask you to open it on the HR laptop so the application is not delayed.",
    "The portal timed out for them. Opening the file seems the fair thing to do.",
    "How should you handle this CV that did not come through the careers portal?",
    ["hr"], ["phishing", "privacy"], ["Customer data"],
    [
      o("ius-h01-a", "high-risk", "Open the ISO on the HR laptop", "Give the candidate a fair process by reviewing the file they sent.", [0, 0, 0], "The laptop is infected. Unexpected disc images are not CVs.", "Recruitment mail is a common malware path. Unknown archives must not run on a business workstation.", recReport, "Refuse the file, direct them to the portal, and report the sample.", "Kindness to a candidate is not executing an unexpected attachment.", "IT isolates the laptop and asks HR to use only the careers portal for applications."),
      o("ius-h01-b", "strong", "Refuse the file and invite them to the portal", "If they are a genuine applicant they can submit through the real upload link.", [3, 3, 3], "The sample is reported. The candidate can still apply through the official path.", "HR systems exist so laptops do not run files from strangers.", recReport, "Use the known upload path only, and report anything that bypasses it.", "A real applicant can use the portal. An attacker is counting on you to open the attachment.", "The careers site remains the only accepted upload path, and the ISO is in the incident queue."),
      o("ius-h01-c", "weak", "Ask IT to open it on a spare workstation", "Forward the file and request an informal look on any available PC.", [1, 2, 1], "Someone nearly runs it on a jump box that is still connected to the estate.", "Informal analysis still needs isolation. Report it as a sample; do not tour it on spare hardware.", recReport, "Submit the file through the official malware-reporting path.", "A spare PC is not a sandbox unless IT treats it as one.", "IT asks you to use the sample-submission process instead of sending the ISO to a shared inbox."),
    ]),
  packQuestion("ius-h02", "inbox-hr", "assess", "Payroll bank change from a lookalike domain",
    "An email from a domain that almost matches the company asks to change an employee's bank details before payday and attaches a scanned passport photo.",
    "Payroll is tomorrow. They will not be paid if we delay this change.",
    "How should you handle this emailed request to change payroll bank details?",
    ["hr", "finance"], ["phishing", "privacy"], ["Financial data"],
    [
      o("ius-h02-a", "high-risk", "Update payroll from the email and attachment", "The passport image looks official, so process the change before the run.", [0, 0, 0], "Salary is paid to an account the employee does not control. The real person is unpaid.", "Payroll bank changes follow a known process, not an inbound email with an identity document attached.", recVerify, "Call the number on file and use the HR change form.", "Lookalike domains and passport scans in email are not an identity check.", "The employee reports they never requested a bank change and did not receive their pay."),
      o("ius-h02-b", "strong", "Use the HR change form and call the person on file", "Do not treat email as the process for a bank-detail change.", [3, 3, 3], "The real employee did not send the request. The lure is reported and payday is unchanged.", "Identity proof is a process: known form plus voice confirmation on a number you already hold.", recVerify, "Known form plus a call to the number on file, not the number in the email.", "Photos attached to an inbox message are not an ID check.", "The employee confirms they did not write, and payroll runs to the existing account."),
      o("ius-h02-c", "defensible", "Pause the entire payroll run until every change is verified", "Hold all salaries this month so no fraudulent change can slip through.", [2, 0, 1], "Nobody is paid. The attacker still has a working template for next time.", "Contain the suspicious request. Do not punish the whole workforce for one lure.", recVerify, "Stop that change, complete the rest of the payroll run, and report the email.", "Isolation of one request is not the same as cancelling payroll.", "Managers ask why staff who had no change on file are unpaid, while the lookalike message is still unreported."),
    ]),
  packQuestion("ius-h03", "inbox-hr", "contain", "Unscheduled benefits bot in Teams",
    "A Teams message from an account named HR-bot drops a shortened link for same-day pension changes. Nothing like it appears on the internal communications calendar.",
    "It is a same-day enrolment window. People will miss it if we wait for a calendar entry.",
    "How should you handle this unscheduled Teams link for pension changes?",
    ["hr", "employee"], ["phishing", "suspicious-links"], ["Microsoft 365"],
    [
      o("ius-h03-a", "high-risk", "Open the link and complete the enrolment", "Treat it as a benefits message because the bot used an HR name.", [0, 0, 1], "A fake login harvests credentials from HR and from staff who followed the same link.", "Unscheduled bots are not the intranet. Use the bookmarked HR system.", recReport, "Open benefits only from the official URL you already use.", "If it was not announced through the real communications calendar, it is not a genuine enrolment drive.", "Identity flags a new OAuth grant shortly after the Teams link was opened."),
      o("ius-h03-b", "strong", "Report the Teams message and ignore the link", "Check the communications calendar and the bookmarked HR system before any click.", [3, 3, 3], "The app registration behind the bot is reviewed. Staff are told to use the official portal.", "Unexpected bots and OAuth prompts in Teams get reported, not clicked.", recReport, "Official channel, official URL, official report.", "Teams is still a delivery path for phishing. A bot name is not a control.", "Internal communications confirm they did not send a benefits bot, and the message is removed."),
      o("ius-h03-c", "weak", "Reply asking the bot to confirm it is from HR", "Request written confirmation in the same Teams thread before clicking.", [1, 1, 1], "You confirm a live mailbox to the operator, who then sends a more convincing follow-up.", "Do not converse with a lure. Report it; do not reply.", recReport, "Report the message and use the bookmarked HR system if you need to change pensions.", "Unsubscribe or confirm-you-are-real replies are for mail you asked to receive, not for unexpected bots.", "The account replies with a new link and copies two other people from the HR directory."),
    ]),
  packQuestion("ius-h04", "inbox-hr", "control", "Performance reviews in a personal Google Doc",
    "A manager shares a Google Doc feedback pack from a personal account because the company tenant felt slow, and asks you to open it so reviews are not delayed.",
    "The tenant was slow this afternoon. Using a personal account got the reviews out today.",
    "How should you handle employee performance files shared from a personal account?",
    ["hr", "business-leader"], ["file-sharing", "privacy"], ["Google Workspace", "Customer data"],
    [
      o("ius-h04-a", "high-risk", "Open the personal Google Doc so reviews can proceed", "Treat the personal account as close enough to the work tenant for this afternoon.", [0, 1, 0], "The document phishes single sign-on. Review comments sit on a personal drive outside company control.", "People data stays in the approved tenant. Convenience is how HR files leave.", recReport, "Refuse the personal link and reshare in the approved HR system.", "A personal cloud is not a work system for employee files, even when it is faster.", "Legal asks how performance reviews were stored on a personal Google account."),
      o("ius-h04-b", "strong", "Refuse the personal link and reshare in the HR system", "A slow tenant is preferable to leaked reviews. Use the official pack location.", [3, 3, 3], "The personal document is reported. Reviews stay inside the approved system.", "Approved systems exist for this exact pressure. Privacy is also a location.", recReport, "No personal clouds for employee files. Start from the official template.", "Speed does not override where personnel files may live.", "The manager uploads the pack through the HR system and withdraws the personal link."),
      o("ius-h04-c", "weak", "Download the file and upload it into the HR system yourself", "Move a copy into the official system after you have opened the personal document.", [1, 2, 1], "You still opened an untrusted file, then copied its contents into work systems.", "Do not launder an unknown file by re-hosting it. Start from the official template or a known-good export.", recReport, "Ask the manager to recreate the pack in the HR system without you opening the personal link.", "Re-uploading is not a security control if you already opened the lure.", "Data protection asks whether the personal document was opened before the HR-system copy was made."),
    ]),
  packQuestion("ius-h05", "inbox-hr", "evidence", "Malicious CV already forwarded",
    "The ISO file went to three recruiters. One of them has already forwarded it to a hiring manager.",
    "We should not alarm talent acquisition unless we are sure it is malicious.",
    "Who should be told, and what should you report, now that the file has been forwarded?",
    ["hr"], ["incident-reporting"], ["Microsoft 365"],
    [
      o("ius-h05-a", "high-risk", "Ask everyone to delete it quietly and skip a ticket", "Keep it off the incident log so talent acquisition is not disrupted.", [0, 1, 0], "The hiring manager still has the file. Reporting never starts, so machines are not checked.", "Quiet deletes hide scope. SOC needs names, times, and who opened what.", recReport, "List every recipient and file an official report.", "Scope is the first HR duty on a shared lure. Embarrassment is not a reason to skip the ticket.", "The hiring manager opens the file the next morning because nobody told security it had been forwarded."),
      o("ius-h05-b", "strong", "List every recipient and file the report", "Record names, times, and who opened or forwarded the file.", [3, 3, 3], "The blast radius is visible. Devices and mailboxes can be checked.", "A recipient list is what makes a phishing report useful.", recReport, "Facts over embarrassment: all recipients, including the hiring manager.", "HR already knows how to account for people. Use that skill on the incident.", "SOC uses the list to check mailboxes and endpoints and to warn the hiring manager through the official channel."),
      o("ius-h05-c", "defensible", "Tell only the manager who opened it", "Limit the conversation to the person most likely affected, to reduce disruption.", [2, 2, 1], "The other two recruiters still have the file and one forwards it again the next day.", "Partial scope is still a gap. All recipients belong in the report.", recReport, "Include every person who received or forwarded the file.", "Minimum disruption is not minimum reporting when a file is still in circulation.", "A second hiring panel receives the ISO because the other recruiters were left out of the notice."),
    ]),
  packQuestion("ius-h06", "inbox-hr", "communicate", "All-staff guidance after the malicious CV",
    "Someone wants an all-staff message saying never open CVs. Recruiting is concerned that wording will stop managers reviewing genuine applications.",
    "A simple company-wide rule would stop this happening again.",
    "How should you tell staff to handle CVs after this incident?",
    ["hr", "business-leader"], ["incident-reporting"], ["Microsoft 365"],
    [
      o("ius-h06-a", "weak", "Ban all email attachments across the company", "Tell staff that no attachments of any kind may be opened, including applications.", [2, 0, 1], "Hiring workarounds appear, including USB sticks and personal-mail forwards.", "Absolute bans create shadow paths. Ban unexpected files; keep the careers portal.", recReport, "Tell staff to use the portal and to report odd files, without forbidding legitimate hiring.", "Precision beats a blanket ban that people will route around.", "Recruiters start asking candidates to send files to personal addresses so work can continue."),
      o("ius-h06-b", "strong", "Issue short guidance: portal only, report unexpected files", "Explain the real process so recruiting can still recruit.", [3, 3, 3], "Staff know the rule without a taboo on hiring. The portal link sits in the same message.", "Communications can be accurate: unexpected attachments are reported; the official path remains open.", recReport, "Describe the careers portal process and how to report a suspect file.", "You can be clear without stopping the function that was targeted.", "Managers are told to decline off-portal CVs and to use the report button, and recruiting keeps a working path."),
      o("ius-h06-c", "high-risk", "Name the candidate in the all-staff message", "Identify the person who sent the ISO so staff know who to block.", [0, 1, 0], "You publish personal data about someone who may be an impersonated or innocent identity.", "Do not publish a lure identity. Describe the pattern, not the person.", recReport, "Explain the file type and the portal rule without naming the applicant.", "Privacy still applies during incidents, including when the name may be stolen.", "Legal asks for the all-staff to be withdrawn because it identified an individual."),
    ]),
  packQuestion("ius-h07", "inbox-hr", "recover", "Recruiter entered a fake login and MFA is buzzing",
    "A recruiter typed their password into a fake Microsoft page. They feel responsible. Approval prompts are still arriving on their phone.",
    "If they ignore the prompts long enough, the buzzing should stop on its own.",
    "What should you do about the recruiter's account while MFA prompts keep arriving?",
    ["hr", "it-support"], ["mfa", "incident-response"], ["Microsoft 365"],
    [
      o("ius-h07-a", "high-risk", "Approve one prompt so the phone goes quiet", "Clear a single prompt, then pause and decide what to do next.", [0, 0, 0], "The attacker inherits the session as soon as the prompt is approved.", "MFA fatigue is the attack. Never approve a prompt you did not start.", recReport, "Deny the prompts, call IT, and reset the account.", "A prompt you did not initiate is a compromise signal, not a nuisance to dismiss.", "Sign-in logs show a successful authentication from an unexpected location immediately after the approval."),
      o("ius-h07-b", "strong", "Deny the prompts, call IT, and reset the account", "Feeling responsible is understandable. Approving a prompt you did not start is not.", [3, 3, 3], "Sessions are revoked. The recruiter keeps their job and signs in cleanly afterwards.", "Fatigue attacks fail if nobody taps yes. Kindness here is a reset, not a lecture.", recReport, "IT reset plus an official report, then a clean sign-in.", "Human error plus a playbook is still recoverable if you act before an approval.", "IT revokes sessions, resets the password, and the prompts stop because the attacker no longer has a foothold."),
      o("ius-h07-c", "weak", "Switch the phone to airplane mode and wait", "Stop the prompts at the device and review the account later.", [1, 1, 1], "An already-open session on a laptop continues.", "Powering down the phone is not revocation.", recReport, "Revoke sessions in the identity system; do not rely on the handset being offline.", "Hardware off is not identity off. The session lives in the cloud.", "The recruiter's laptop remains signed in, and mail continues to send from the account."),
    ]),
  packQuestion("ius-h08", "inbox-hr", "close", "Hub report for an HR phishing incident",
    "The hub wants the lure type, systems involved, personal data at risk, and who clicked. A colleague would rather this stayed an HR matter.",
    "This should stay inside HR. We can handle our own people data.",
    "What should go into the Security Hub report for this HR incident?",
    ["hr"], ["incident-reporting", "privacy"], ["Microsoft 365"],
    [
      o("ius-h08-a", "high-risk", "Keep the incident inside HR and skip the hub", "Protect the function by handling it as an internal people-data issue only.", [0, 1, 0], "Security cannot see employee-data exposure or who clicked, so containment is delayed.", "Privacy incidents still get reported. Local handling hides harm from the people who can contain it.", recReport, "File the hub report, including the data-risk notes.", "Protecting the function is not a reason to hide an incident from security.", "A second recruiter clicks the same lure the next day because the hub never saw the first report."),
      o("ius-h08-b", "strong", "File the hub report with data-risk notes", "Record what data was involved, whose it was, and whether it left the tenant.", [3, 3, 3], "Privacy and security can act from the same record.", "HR reports are incident reports when people data or credentials are at risk.", recReport, "Include the data angle: type, subjects, and whether anything left.", "You already know how to describe people data. Put that in the official tool.", "The hub ticket lists the ISO, the mailboxes, and whether any personnel files were opened outside the tenant."),
      o("ius-h08-c", "weak", "Use only first names in the ticket", "Redact staff identities so the report feels more private.", [1, 2, 2], "Responders cannot find the accounts to reset or the mailboxes to check.", "Need-to-know is not no-names. Use official identifiers in the secure tool.", recReport, "Use work identifiers in the hub; that tool is already access-controlled.", "Over-redaction blocks help and leaves accounts live.", "SOC replies asking which accounts to reset, because first names do not match a directory uniquely."),
    ]),
];

export const INBOX_UNDER_SIEGE_QUESTIONS: Question[] = [
  ...FINANCE,
  ...HR,
  ...INBOX_IT_QUESTIONS,
  ...INBOX_URGENT_QUESTIONS,
];
