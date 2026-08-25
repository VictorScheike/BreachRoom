import { option, question, scoreTriple } from "../build";
import type { AnswerOption, AnswerQuality, Question, ScorePoints, StoryPhase } from "../types";

const KEYS = ["containment", "operations", "coordination"] as const;
const SCENARIO = ["zh-monday"] as const;

function pts(
  a: ScorePoints,
  b: ScorePoints,
  c: ScorePoints,
): Record<string, ScorePoints> {
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

function q(
  id: string,
  phase: StoryPhase,
  title: string,
  situation: string,
  npcLine: string,
  frameworks: readonly string[],
  options: readonly [AnswerOption, AnswerOption, AnswerOption],
  tags: {
    topicIds: readonly string[];
    learningObjectiveIds: readonly string[];
    departmentIds: readonly string[];
  },
): Question {
  return question(
    "northstar-zero-hour",
    id,
    phase,
    SCENARIO,
    title,
    situation,
    npcLine,
    frameworks,
    options,
    tags,
  );
}

export const ZERO_HOUR_PHASES = [
  { id: "detection" as const, label: "Detection and assessment", pick: 3 },
  { id: "containment" as const, label: "Containment", pick: 3 },
  { id: "escalation" as const, label: "Responsibility and escalation", pick: 3 },
  { id: "continuity" as const, label: "Communication and business continuity", pick: 3 },
  { id: "recovery" as const, label: "Recovery and lessons learned", pick: 3 },
];

const recDetectLock = "Stop further use of the locked workstation, capture what you see, and open a named incident with a coordinator.";
const recDetectEdr = "Treat the overnight EDR alert as a live incident, preserve the host, and look for related alerts before calling it a one-off.";
const recDetectScope = "Assume the first device is a lead, not the whole story, until you check nearby systems and accounts.";
const recDetectRecord = "Open one incident record with a time, a named lead, and a place for facts — tickets are not the incident.";
const recDetectLogs = "Stop log rotation or overwrites, snapshot what remains, and write down any missing window.";
const recDetectReboot = "Tell people not to reboot locked PCs, collect screenshots, and route reports to the incident channel.";
const recDetectMap = "Build a simple affected-versus-working list with owners before you declare the size of the incident.";
const recDetectLogin = "Disable or challenge the suspicious session, keep the log, and check whether other warehouse accounts moved the same way.";
const recDetectSev = "Set an initial severity from business impact plus signs of spread, then review it on a clock — do not wait for certainty.";
const recContainHost = "Isolate the encrypting host from the network, keep it powered for evidence, and watch neighbours for the same behaviour.";
const recContainSeg = "Cut the path between the infected warehouse segment and healthy file shares, with a named exception if a delivery path must stay.";
const recContainAcct = "Disable the compromised account, kill its sessions, and review what it could still reach.";
const recContainPriv = "Revoke standing privileged access used for convenience, keep a logged break-glass path, and record who still has admin.";
const recContainVpn = "Revoke risky remote sessions, pause bulk sync, and keep a watched path only for responders.";
const recContainVendorLink = "Pause or tightly restrict the third-party connection until you know it is not a highway, then reopen with an owner and a time limit.";
const recContainMail = "Block the malicious mail path, reset or freeze affected mailboxes, and warn staff through a channel the attacker does not control.";
const recContainClean = "Keep clean environments off the infected network and do not use them as a casual workaround.";
const recContainScope = "Isolate known-bad segments first; a site-wide shutdown needs an explicit business decision and an ops plan.";
const recEscLead = "Name one incident coordinator, a technical lead, and a scribe so orders and facts have a home.";
const recEscTech = "Give technical response a named owner with authority to isolate, and keep helpdesk as a reporting channel, not the commander.";
const recEscExec = "Brief executives with facts, options, and a next update time; payment and public statements wait for a logged decision path.";
const recEscOps = "Freeze routine IT changes, keep break-glass work ticketed, and put operations in the same clock as the incident.";
const recEscBiz = "Business owners decide which services stay open within the containment limits security sets — write the trade-off down.";
const recEscLegal = "Involve legal and privacy as soon as personal data may be involved; they advise on duties, they do not replace the incident lead.";
const recEscVendor = "Accept vendor help only through a ticketed, watched, time-bound path your organisation controls.";
const recEscInsure = "Notify cyber insurance through the agreed path without pausing containment; keep a record of what you told them.";
const recEscExternal = "Decide with counsel whether to involve law enforcement or a retained IR firm; do not wait for a perfect story, and do not freelance the call.";
const recContStaff = "Send one internal brief: what to do, what not to do, and where to report — then close unofficial polls.";
const recContMgmt = "Give management a short cadence of facts, impact, and next steps; voice notes are not the record.";
const recContCust = "Tell affected customers what you know, what still ships, and when the next update is, using approved words.";
const recContSupp = "Notify suppliers who may be blocked, without attaching samples or guessing about data theft.";
const recContPublic = "Hold public comment to an approved spokesperson; rumours get a factual holding line, not a novel.";
const recContSlots = "Decide delivery slots with the warehouse owner against a written impact picture, not against hope.";
const recContManual = "If you pick on paper, use a named manual procedure with later reconciliation — hero clipboards invent a second incident.";
const recContTheft = "Treat a theft claim as possible until checked; preserve evidence and involve privacy, and do not confirm a breach from the ransom note alone.";
const recContBreach = "Do not announce a personal-data breach until privacy and legal have a factual basis; silence with a holding line beats a wrong headline.";
const recRecBackup = "Locate backups, protect them, and test-restore a sample before promising a go-live time.";
const recRecPriority = "Restore in an order the business owner and incident lead agree: safety and core delivery first, nice-to-haves later.";
const recRecClean = "Restore onto a clean, isolated environment; do not pour good data back onto the same infected network.";
const recRecCreds = "Reset credentials after you control the identity path, kill old sessions, and do not send new secrets through a mailbox you still distrust.";
const recRecMonitor = "Reopen with heightened monitoring and a rollback; 'we are back' is not a detection control.";
const recRecRansom = "Do not pay from the warehouse floor; preserve the note, involve leadership and counsel, and treat payment as a last-resort decision with no guarantee.";
const recRecReconnect = "Reconnect partners only after the path is clean, monitored, and owned — speed without a check reimports the problem.";
const recRecReview = "Run a short, blameless review with facts and owners while memories are fresh.";
const recRecImprove = "Turn the review into a few dated actions: identity, segmentation, backups, and a better Monday playbook.";

export const NORTHSTAR_ZERO_HOUR_QUESTIONS: Question[] = [
  q(
    "zh-d01",
    "detection",
    "The dispatch workbook will not open",
    "On the Monday 06:40 dispatch desk, DISPATCH_MON.xlsx shows a lock banner and a countdown. The night planner says it was fine at handover. A picker asks if this is 'that virus from the news'.",
    "If I keep clicking Open, maybe it will change its mind.",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-d01-a", "high-risk", "Keep trying the file on other PCs", "Copy it to the next three desks until one works.", [0, 1, 0], "The lock banner follows the file onto healthy machines.", "Moving a locked file is how ransomware hitchhikes across a shift.", recDetectLock, "You need a sample in isolation, not a tour of the office.", "A lock banner on a shared workbook is a suspected compromise, not a spreadsheet glitch.", "Three more dispatch PCs now show the same countdown."),
      o("zh-d01-b", "strong", "Stop using it, photograph, open the incident", "Leave the PC on, stop copies, name a coordinator.", [3, 2, 3], "The desk is quarantined in practice and the morning has a clock.", "First minutes are for orientation and a named lead, not DIY recovery.", recDetectLock, "A shared picture beats twelve people improvising Excel.", "Locked business files on a Monday are an incident until proven otherwise.", "The night planner puts the kettle down and starts a timeline."),
      o("zh-d01-c", "defensible", "Switch to last week's printed run sheet", "Keep vans moving while IT 'looks later'.", [2, 2, 1], "A few loads leave, but nobody owns the cyber event and the file may still spread.", "Continuity is useful only if someone is also containing the compromise.", recDetectLock, "A workaround needs an incident owner beside it.", "Operations and detection have to run in the same hour.", "The yard is moving. The banner is also moving."),
    ],
    { topicIds: ["locked-files", "initial-detection"], learningObjectiveIds: ["zh-d01-treat-lock-banner-as-incident"], departmentIds: ["incident-lead", "it-operations", "business-owners"] },
  ),
  q(
    "zh-d02",
    "detection",
    "The packing PC that pinged at 02:17",
    "Endpoint protection flagged packing-station PS-14 overnight: suspicious encryption behaviour. The alert sat in a shared inbox because the weekend cover 'does not do security mail'. PS-14 is now the busiest station on the belt.",
    "If it packed all night, the alert was probably a false positive.",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-d02-a", "strong", "Pull PS-14 off the line and hunt siblings", "Preserve the host. Search for the same alert pattern.", [3, 2, 3], "You stop a likely patient-zero while the belt still has other stations.", "An untriaged encryption alert is a live lead, not junk mail.", recDetectEdr, "Endpoint alerts need a human owner on every shift.", "Detection fails when security mail is optional at weekends.", "The belt lead reroutes cartons and looks slightly heroic."),
      o("zh-d02-b", "high-risk", "Clear the alert so packing can fly", "Green ticks help morale.", [0, 0, 0], "Encryption continues under a clean dashboard.", "Closing an alert is not the same as understanding it.", recDetectEdr, "You cannot pack your way out of malicious activity.", "Unreviewed EDR alerts are how weekday incidents start on Sunday.", "The shared inbox is now empty and extremely proud."),
      o("zh-d02-c", "defensible", "Watch PS-14 for another hour while it packs", "Collect more telemetry, keep the SLA.", [2, 2, 1], "You may learn a bit and also lose another hour of files.", "Observation is only defensible with a kill switch and a short clock.", recDetectEdr, "Watching needs an abort, not a hope.", "Throughput is not evidence that a host is clean.", "Cartons fly. So does the alert count."),
    ],
    { topicIds: ["edr-alerts", "shift-handover"], learningObjectiveIds: ["zh-d02-triage-overnight-endpoint-alerts"], departmentIds: ["technical-response", "it-operations"] },
  ),
  q(
    "zh-d03",
    "detection",
    "Just the forklift tablet",
    "A forklift tablet in aisle G shows the same lock screen as dispatch. The driver says it is 'only this gun' because the other trucks still beep. Someone proposes labelling it a single-device fault and sending the driver to break.",
    "One tablet is a facilities ticket, not a crisis.",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-d03-a", "defensible", "Park that truck and keep the fleet up", "Isolate one asset, defer the wider hunt.", [2, 2, 1], "You buy time on the floor but may miss a shared account or update server.", "Narrow isolation helps only if someone still checks blast radius.", recDetectScope, "One quiet device is a clue, not a conclusion.", "Declaring 'single device' is a scope decision — make it on evidence.", "Aisle G is calm. Aisle H has not been asked."),
      o("zh-d03-b", "high-risk", "Call it a broken tablet and close the ticket", "Facilities can order a spare after lunch.", [0, 0, 0], "The same lock appears on the next tablet that syncs the aisle list.", "A matching lock screen on operational kit is suspected compromise, not wear and tear.", recDetectScope, "Same banner, same morning, same incident.", "Do not shrink an incident to fit the ticket category.", "The spare tablet arrives pre-locked. Impressive."),
      o("zh-d03-c", "strong", "Treat it as a lead: accounts, sync, neighbours", "Check what the tablet talks to and who signed in.", [3, 2, 3], "You find the shared aisle login used on three other guns.", "First seen is not the same as only affected.", recDetectScope, "Scope is a hunt, not a vibe.", "One device is how you start counting, not how you stop.", "The driver becomes an unexpectedly good witness."),
    ],
    { topicIds: ["incident-scope", "operational-devices"], learningObjectiveIds: ["zh-d03-one-device-is-not-the-incident"], departmentIds: ["incident-lead", "technical-response", "business-owners"] },
  ),
  q(
    "zh-d04",
    "detection",
    "Forty tickets, zero incident",
    "Helpdesk has a Monday pile: 'Excel locked', 'scanner slow', 'password loop', 'is the WMS down on purpose'. Nobody has opened an incident record. A well-meaning agent is closing them as 'known Wi-Fi issue'.",
    "If we put it in the ticket tool, it counts as handled.",
    ["NIST IR", "NIST CSF 2.0"],
    [
      o("zh-d04-a", "high-risk", "Keep closing them as Wi-Fi", "One category, less panic.", [0, 1, 0], "Related symptoms scatter and the timeline is fiction.", "Mis-tagging is how a cyberattack hides in a queue.", recDetectRecord, "An incident needs a spine, not a pile.", "Tickets without a parent incident are rumours with numbers.", "The known Wi-Fi issue is now a lifestyle."),
      o("zh-d04-b", "defensible", "Make a mega-ticket and keep taking calls", "One huge record, still no commander.", [2, 2, 1], "Facts land in one place, but nobody is empowered to contain.", "A record without a named lead is still a queue.", recDetectRecord, "The document is not the organisation.", "Incident records exist to coordinate people, not to store complaints.", "The mega-ticket has 90 comments and no decisions."),
      o("zh-d04-c", "strong", "Open one incident, name a lead, link the tickets", "Helpdesk feeds the room; the room decides.", [3, 2, 3], "Symptoms start telling one story and someone owns the next hour.", "Detection includes creating the organisational object you will run.", recDetectRecord, "This is how Monday noise becomes a response.", "If it is not in the incident record, the next person will not see it.", "A quiet intern is promoted to scribe. Growth."),
    ],
    { topicIds: ["incident-record", "helpdesk-triage"], learningObjectiveIds: ["zh-d04-tickets-are-not-the-incident"], departmentIds: ["incident-lead", "it-operations"] },
  ),
  q(
    "zh-d05",
    "detection",
    "The WMS log that made space",
    "The warehouse system disk was 94% full at 05:00. Night IT ran the usual 'clear old logs' job so Monday receiving would start. The job finished just as lock banners appeared on packing PCs.",
    "We always delete logs on Monday. It is tradition.",
    ["NIST IR", "NIST CSF 2.0"],
    [
      o("zh-d05-a", "strong", "Stop the job, snapshot what is left, note the gap", "Write the missing window on the board.", [3, 2, 3], "You keep remaining evidence and you are honest about the hole.", "A documented gap is still a fact; a silent wipe is a second problem.", recDetectLogs, "Evidence likes honesty more than perfect disks.", "Preserving logs is part of detection, not a later forensic hobby.", "The board gains a sad, useful blank hour."),
      o("zh-d05-b", "high-risk", "Run the cleaner again to be sure", "A tidy disk is a healthy disk.", [0, 0, 0], "The last useful hours of warehouse activity vanish.", "Do not wash the scene because the disk is embarrassed.", recDetectLogs, "Free space is not worth a missing attacker timeline.", "Routine maintenance can destroy incident evidence if nobody pauses it.", "The disk is now spacious and uninformative."),
      o("zh-d05-c", "defensible", "Copy logs to a USB from the stationery drawer", "Better than nothing, slightly sticky.", [2, 1, 2], "You may save files and also mix chain of custody with a mystery stick.", "Ad-hoc copies help only if you label, hash, and stop further deletion.", recDetectLogs, "A controlled snapshot beats a drawer souvenir.", "Preservation needs a method, not just enthusiasm.", "The USB is labelled 'MISC'. Of course it is."),
    ],
    { topicIds: ["log-preservation", "evidence"], learningObjectiveIds: ["zh-d05-stop-overwriting-logs-in-an-incident"], departmentIds: ["technical-response", "it-operations"] },
  ),
  q(
    "zh-d06",
    "detection",
    "Have you tried turning the lock off",
    "Three pickers have already hard-rebooted locked PCs because that is how the label printer gets its personality back. One machine now sits on a 'repairing disk' screen. Another came back locked faster.",
    "Reboots are free and spiritually cleansing.",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-d06-a", "defensible", "Allow one controlled restart on a spare, filmed", "Experiment on a sacrificial box, not the fleet.", [2, 1, 2], "You might learn a behaviour and still burn one evidence source.", "A single instrumented test is a trade-off; a floor-wide reboot is not.", recDetectReboot, "If you must test, do it once, logged, off the critical path.", "Curiosity needs a lab, not a pick face.", "Someone films the spare. The spare does not enjoy this."),
      o("zh-d06-b", "high-risk", "Tell everyone to reboot twice more", "Third time is the charm.", [0, 0, 0], "Encryption progresses and traces vanish across the aisle.", "Rebooting through ransomware is not a recovery plan.", recDetectReboot, "Stop the helpful damage first.", "User workarounds can finish what the malware started.", "A fourth picker has brought a power strip, uninvited."),
      o("zh-d06-c", "strong", "Hands off, screenshot, report in the incident channel", "Leave machines on. Stop the reboot folklore.", [3, 2, 3], "Remaining evidence stays put and the floor gets one instruction.", "People will keep 'fixing' unless you give them a better job.", recDetectReboot, "Staff are sensors when you tell them what good looks like.", "The first containment of many incidents is stopping helpful reboots.", "The power strip is gently retired."),
    ],
    { topicIds: ["user-behaviour", "evidence-preservation"], learningObjectiveIds: ["zh-d06-stop-reboots-on-locked-hosts"], departmentIds: ["incident-lead", "it-operations", "business-owners"] },
  ),
  q(
    "zh-d07",
    "detection",
    "What is actually broken this morning",
    "Yard gates still open. Payroll on the mezzanine looks fine. The warehouse management screens are locked. The customer portal is slow. Someone has drawn a red circle on a laminated map and called it 'the outage'.",
    "If the gates work, we are not in an incident.",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-d07-a", "high-risk", "Declare only WMS down and ignore the rest", "One system, one story, less paperwork.", [0, 1, 0], "You miss portal and identity symptoms that change the response.", "Partial maps create false confidence.", recDetectMap, "Name what works and what does not, with owners.", "You cannot coordinate what you have not listed.", "The laminated map is now legally misleading."),
      o("zh-d07-b", "strong", "Build affected versus working with named owners", "Gates, WMS, portal, payroll, scanners — each has a tick or a cross.", [3, 3, 3], "Leaders can choose what to protect without guessing.", "Impact mapping is how detection becomes a decision.", recDetectMap, "A shared picture is the cheapest coordination tool you have.", "Severity follows the business map, not the loudest room.", "The laminated map gets sticky notes. Official sticky notes."),
      o("zh-d07-c", "defensible", "Trust the green IT dashboard and walk the floor later", "The dashboard is very calm.", [1, 2, 1], "Agents on locked PCs are silent, so the dashboard stays green.", "Dashboards lie when the sensors are the patients.", recDetectMap, "Look at the floor and the accounts, not only the chart.", "Telemetry gaps are findings, not comfort.", "The dashboard congratulates itself quietly."),
    ],
    { topicIds: ["impact-mapping", "affected-systems"], learningObjectiveIds: ["zh-d07-inventory-affected-versus-working"], departmentIds: ["incident-lead", "business-owners", "it-operations"] },
  ),
  q(
    "zh-d08",
    "detection",
    "A supervisor signed in from somewhere else",
    "Warehouse supervisor N. Patel was badge-in at 05:55. Identity logs also show a successful login from an unfamiliar country at 05:41 using the same account, then a burst of file-share access. Patel is on the floor and looks confused, not criminal.",
    "Maybe they have a clever VPN. People travel.",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-d08-a", "strong", "Challenge the account, keep the log, hunt siblings", "Disable or reset, kill sessions, see who else jumped.", [3, 2, 3], "A likely stolen login stops walking the file share.", "Impossible travel on a privileged warehouse account is suspected compromise.", recDetectLogin, "Treat the person fairly and the credential as burned.", "Identity alerts are detection, even when the human is standing in front of you.", "Patel is relieved to be believed and slightly late for tea."),
      o("zh-d08-b", "high-risk", "Ask Patel to keep working, it is peak", "We need that login for the wave.", [0, 0, 0], "The other session keeps copying while the real human picks orders.", "A live person does not prove a live-only session.", recDetectLogin, "Operations cannot borrow a possibly stolen identity.", "Suspicious logins are not a staffing problem first.", "The unfamiliar country downloads another folder. Helpfully."),
      o("zh-d08-c", "defensible", "Watch the foreign session without touching it", "Maybe we learn the whole playbook.", [2, 1, 2], "You may collect intelligence and also lose more files.", "Monitoring without a short kill plan is a stall, not a strategy.", recDetectLogin, "Observe only with an abort and a clock.", "Attribution is optional; stopping the session is not.", "A dashboard named 'maybe-travel' appears. Nobody likes the name."),
    ],
    { topicIds: ["suspicious-logins", "identity"], learningObjectiveIds: ["zh-d08-treat-impossible-travel-as-compromise"], departmentIds: ["technical-response", "incident-lead", "hr"] },
  ),
  q(
    "zh-d09",
    "detection",
    "Still sending, so how bad can it be",
    "Two outbound lorries left on time. A shift manager wants the incident logged as 'low — business as usual' so the 08:30 ops call stays short. Endpoint alerts and locked finance shares arrived in the same hour.",
    "If the yard is moving, severity is a paperwork setting.",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-d09-a", "defensible", "Call it medium, review at 09:00", "Avoid panic, keep a clock.", [2, 2, 1], "You may under-call spread, but you at least refuse 'low forever'.", "A time-boxed severity is better than a comforting label.", recDetectSev, "Severity is a working hypothesis with an expiry.", "Under-classifying delays legal, vendor, and executive support.", "The ops call is shorter. The malware is not."),
      o("zh-d09-b", "strong", "Set high based on spread signs, then refine", "Trucks leaving does not cancel locked shares and EDR.", [3, 2, 3], "The right people join early; you can step down later with evidence.", "Initial severity should reflect worst plausible impact plus indicators of malicious activity.", recDetectSev, "It is cheaper to over-convene for an hour than to under-convene for a day.", "Business-as-usual is an outcome you earn, not a starting label.", "The 08:30 call gains a second slide. It is ugly and true."),
      o("zh-d09-c", "high-risk", "Mark low so nobody escalates", "Protect the morning atmosphere.", [0, 0, 0], "Containment waits for a meeting that will now never happen.", "Severity is a coordination tool, not a mood.", recDetectSev, "Do not hide a cyberattack in a calm agenda.", "Low severity is how specialists arrive after encryption finishes.", "The atmosphere is lovely. The file share is not."),
    ],
    { topicIds: ["severity", "escalation-threshold"], learningObjectiveIds: ["zh-d09-set-initial-severity-from-impact-and-spread"], departmentIds: ["incident-lead", "leadership", "business-owners"] },
  ),
  q(
    "zh-c01",
    "containment",
    "PS-14 is still packing and encrypting",
    "Packing-station PS-14 is isolated in theory: a handwritten 'DO NOT USE' sign. In practice the network cable is still in, the belt is still feeding it, and a supervisor wants it to finish the current wave 'because it is almost done'.",
    "Almost done is a containment strategy.",
    ["NIST IR", "NIST CSF 2.0"],
    [
      o("zh-c01-a", "high-risk", "Let it finish the wave", "Ninety minutes of SLA beats a cable.", [0, 1, 0], "Those ninety minutes become a highway onto the share.", "Availability without isolation is a gift to the attacker.", recContainHost, "A wave is not worth a wider incident.", "Containment is a now action, not an after-the-wave action.", "The wave finishes. So does another folder."),
      o("zh-c01-b", "strong", "Unplug the network, keep power, reroute the belt", "Evidence stays; the worm loses its road.", [3, 2, 3], "Encryption on neighbours slows and packing continues on other stations.", "Isolate the host; do not power it off unless you must.", recContainHost, "You can protect the line and the evidence at once.", "A sign is not a network control.", "The handwritten sign is joined by an actual unplugged cable. Luxury."),
      o("zh-c01-c", "defensible", "Power it off completely", "Dead machines do not encrypt.", [2, 1, 1], "Spread stops on that box and you may lose volatile evidence and a clean shutdown trail.", "Hard power-off is a trade-off when you cannot isolate any other way.", recContainHost, "Network isolation is usually enough and kinder to the investigation.", "Containment should be as precise as the minute allows.", "The station is very quiet. Forensics is slightly less so."),
    ],
    { topicIds: ["host-isolation", "warehouse-operations"], learningObjectiveIds: ["zh-c01-isolate-without-finishing-the-wave"], departmentIds: ["technical-response", "business-owners", "it-operations"] },
  ),
  q(
    "zh-c02",
    "containment",
    "The warehouse can still see Finance",
    "Aisle PCs still mount the finance invoice share because 'accounts need proof of delivery photos'. That share is where this morning's lock banners started. Network diagrams show one flat VLAN and a hopeful firewall rule from 2019.",
    "The share is basically a corridor. Corridors are friendly.",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-c02-a", "strong", "Cut warehouse-to-finance until proven clean", "Offer a manual photo drop with an owner if invoices must move.", [3, 2, 3], "A likely spread path closes; a slower invoice path stays honest.", "Segmentation during an incident is allowed to be temporary and ugly.", recContainSeg, "A named workaround is still a control.", "Flat networks turn one locked PC into a company tour.", "Finance discovers paperclips. They will survive."),
      o("zh-c02-b", "high-risk", "Leave the share up so invoices match", "Month-end is sacred.", [0, 1, 0], "Ransomware keeps walking a trusted corridor.", "Process continuity is not an excuse to keep the blast radius open.", recContainSeg, "Month-end can wait behind a door.", "If two teams share a drive, they share an incident.", "Month-end is now a crime scene with pivot tables."),
      o("zh-c02-c", "defensible", "Read-only the share for an hour", "Photos in, malware maybe out.", [2, 2, 1], "You reduce some risk and may still allow a write you did not mean, or block a responder.", "Read-only is a compromise that needs testing, not assuming.", recContainSeg, "If you cannot verify the control, prefer a cut with a workaround.", "Half-open doors are still doors.", "Someone's photo upload fails in a spiritually confusing way."),
    ],
    { topicIds: ["segmentation", "east-west-movement"], learningObjectiveIds: ["zh-c02-cut-flat-paths-between-functions"], departmentIds: ["technical-response", "business-owners", "it-operations"] },
  ),
  q(
    "zh-c03",
    "containment",
    "The picker account that will not clock off",
    "Shared aisle account PICK-WEST is still logged into WMS on six terminals. One of those sessions spawned the overnight encryption alert. Nobody wants to disable it because the west wave starts in twenty minutes and 'that is how west works'.",
    "Shared logins are a productivity feature.",
    ["NIST IR", "NIST CSF 2.0"],
    [
      o("zh-c03-a", "defensible", "Disable after the west wave", "Twenty minutes more, then hygiene.", [1, 2, 1], "Those twenty minutes may be the ones that matter.", "Delaying identity containment to protect a wave is a real trade-off — name the risk out loud.", recContainAcct, "If you delay, put a watcher on that account and a hard stop.", "Compromised identities do not honour your timetable.", "The west wave has never felt so expensive."),
      o("zh-c03-b", "strong", "Disable PICK-WEST, kill sessions, issue named logins", "Break-glass supervisor accounts for the wave.", [3, 2, 3], "The stolen identity stops multiplying; picking continues under people you can name.", "You can keep operations without keeping the hole.", recContainAcct, "Named logins are slower and survivable.", "Shared operational accounts turn one compromise into a shift-wide incident.", "West learns personal passwords exist. A renaissance."),
      o("zh-c03-c", "high-risk", "Reset the password on the projector so everyone sees it", "New shared secret, same shared account.", [0, 1, 0], "You re-invite everyone, including whoever already stole the old one, and you publish the new one.", "A projector is not an identity control.", recContainAcct, "Stop the account; do not rebrand it.", "Password theatre is not session kill.", "The projector password is also in a photo on three phones."),
    ],
    { topicIds: ["compromised-accounts", "shared-logins"], learningObjectiveIds: ["zh-c03-disable-shared-compromised-identities"], departmentIds: ["technical-response", "it-operations", "business-owners"] },
  ),
  q(
    "zh-c04",
    "containment",
    "Admin because the printer said so",
    "A floor supervisor used a domain-admin-style account at 07:10 to 'fix labels'. That account is still signed in on a PC that later locked. Printers at Northstar historically only behave for administrators, which is a personality flaw in the printers.",
    "The labels must flow.",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-c04-a", "strong", "Revoke standing admin, keep logged break-glass", "Printers get a local workaround, not the keys to the estate.", [3, 2, 3], "Lateral movement loses a favourite highway.", "Least privilege still needs an emergency hatch you can audit.", recContainPriv, "Convenience admin is how a label job becomes a domain job.", "Privileged access in an incident is a containment surface.", "The printer prints. Nobody can explain why. Fine."),
      o("zh-c04-b", "high-risk", "Leave admin so they can keep fixing PCs", "The floor knows the kit.", [0, 1, 0], "Malware inherits a helpful supervisor.", "Standing privilege is not customer service.", recContainPriv, "Do not staff an incident with extra admin.", "If everyone can be admin, everyone can be the blast radius.", "A supervisor downloads a 'printer helper' from a blog."),
      o("zh-c04-c", "defensible", "Keep admin on one jump PC only", "Concentrate the sin.", [2, 2, 1], "You shrink the footprint if the jump PC is actually isolated and watched; if not, you built a throne.", "A privileged island works only with monitoring and a time limit.", recContainPriv, "Name the owner and the expiry on that jump box.", "Concentrated privilege still needs a fence.", "The jump PC acquires a queue and a myth."),
    ],
    { topicIds: ["privileged-access", "least-privilege"], learningObjectiveIds: ["zh-c04-remove-standing-admin-during-response"], departmentIds: ["technical-response", "it-operations"] },
  ),
  q(
    "zh-c05",
    "containment",
    "Drivers still hugging the VPN",
    "Home-based planners and a few drivers are on the corporate VPN, cheerfully syncing delivery PDFs. One planner is on a train with a laptop sticker that says ADMIN-ISH. Bulk sync is still on because 'Monday packs are huge'.",
    "Remote is just the office with worse coffee.",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-c05-a", "high-risk", "Tell them to keep syncing so customers get PDFs", "Service is a feeling.", [0, 1, 0], "Home endpoints keep feeding or drawing from a sick estate.", "Remote access is part of the warehouse now.", recContainVpn, "A PDF is not worth a second site of infection.", "VPN without session control extends the incident to the train.", "The train tunnel has excellent malware coverage."),
      o("zh-c05-b", "defensible", "Ask people nicely to disconnect", "A Teams message with a please.", [1, 2, 1], "Half stay on for one more file.", "Voluntary disconnect is not a control.", recContainVpn, "Force the session end, then explain.", "Politeness is not network isolation.", "Fourteen people reply 'one sec'."),
      o("zh-c05-c", "strong", "Kill risky sessions, pause bulk sync, keep responder VPN", "Break-glass only, watched.", [3, 2, 3], "Home PCs stop amplifying the morning; responders can still work.", "Identity and remote access are containment, not afterthoughts.", recContainVpn, "You can pause sync without pausing the company forever.", "The edge of Northstar includes every laptop that dials in.", "The ADMIN-ISH sticker is retired with honours."),
    ],
    { topicIds: ["remote-access", "session-control"], learningObjectiveIds: ["zh-c05-contain-vpn-and-sync"], departmentIds: ["technical-response", "it-operations", "incident-lead"] },
  ),
  q(
    "zh-c06",
    "containment",
    "The carrier still wants the 08:00 file",
    "A scheduled SFTP drop still pushes today's routing file to a long-haul carrier. The job account lives on a server in the same subnet as locked packing PCs. The carrier's robot is already retrying.",
    "If we miss the drop, trailers sit. If we send it, we might send more than a route file.",
    ["DORA", "NIST CSF 2.0"],
    [
      o("zh-c06-a", "strong", "Pause the job, tell the carrier by phone, reopen later with an owner", "Human confirmation, no mystery payload.", [3, 2, 3], "You stop an unreviewed path and you do not ghost a partner.", "Third-party connections are part of containment, not background noise.", recContainVendorLink, "A phone call is cheaper than a contaminated drop.", "Vendor links inherit your incident whether you mention it or not.", "The carrier robot is asked to sit. It sits, eventually."),
      o("zh-c06-b", "high-risk", "Let the 08:00 file go, customers first", "The job has always been fine.", [0, 1, 0], "A trusted pipe carries whatever the sick server will give it.", "Always-fine is not a control on Monday.", recContainVendorLink, "Pause until someone vouches for the path.", "Automation will faithfully export your worst morning.", "The retry counter is very loyal."),
      o("zh-c06-c", "defensible", "Send a tiny test file by hand", "Prove the pipe, skip the bulk.", [2, 2, 1], "You may reduce volume and still use a compromised account or host.", "Manual exceptions need the same isolation questions as the job.", recContainVendorLink, "Change the host and the identity, not only the file size.", "Smaller is not the same as cleaner.", "Someone names the test file test-final-v2.txt, because of course."),
    ],
    { topicIds: ["third-party-connections", "data-flows"], learningObjectiveIds: ["zh-c06-pause-unreviewed-partner-links"], departmentIds: ["vendors", "business-owners", "technical-response"] },
  ),
  q(
    "zh-c07",
    "containment",
    "Inbox from 'IT Support — urgent password'",
    "Staff are getting internal-looking mail: reset your warehouse password via this portal. The sending mailbox is a lookalike created this morning. Helpdesk phones are lighting up with people who 'already did it to be helpful'.",
    "It even had the Northstar stripe. Almost.",
    ["NIST IR", "NIST CSF 2.0"],
    [
      o("zh-c07-a", "defensible", "Warn on posters at the canteen only", "No more phishing if they walk past a sign.", [1, 2, 1], "Remote planners never see the poster; some still click.", "Awareness without identity containment leaves the mailbox live.", recContainMail, "Block the path, then tell people.", "You cannot poster your way out of an active mail incident.", "The poster is laminated. The campaign is not."),
      o("zh-c07-b", "high-risk", "Reply-all with the sample so everyone can spot it", "Education.", [0, 1, 0], "You mail a live lure to the whole company.", "Do not redistribute malicious mail as training.", recContainMail, "Describe it; do not forward it.", "Amplifying the attacker is not containment.", "The lure now has a second, official-looking thread."),
      o("zh-c07-c", "strong", "Block the sender, freeze lookalike mailboxes, reset clickers, use another channel", "Tannoy, known Teams team, or a manager cascade — not the attacker's thread.", [3, 2, 3], "The campaign loses its runway and victims get real credential care.", "Email and identity containment belong together.", recContainMail, "Tell people through a path the lookalike does not own.", "Contain the mailbox, the portal, and the people who already typed.", "Helpdesk scripts gain one sentence that actually helps."),
    ],
    { topicIds: ["email-containment", "identity"], learningObjectiveIds: ["zh-c07-contain-lookalike-mail-and-clickers"], departmentIds: ["technical-response", "communications", "it-operations"] },
  ),
  q(
    "zh-c08",
    "containment",
    "The training warehouse is still clean",
    "Northstar's small training WMS on a separate site is still healthy. A planner wants to point live orders at it 'just for today' because it looks like the real one. The training site uses a copied production database from last month and a shared VPN profile.",
    "It is basically a spare company. How hard can it be?",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-c08-a", "strong", "Keep it off the infected network; do not dump live orders on it", "If you must use it, copy only what you need after a security review.", [3, 2, 3], "You still have a clean reference environment.", "Unaffected environments are assets to protect, not spare production.", recContainClean, "A training box is not a disaster recovery site just because it is up.", "Do not spend your last clean island on an unplanned cutover.", "The training site remains boring. That is the point."),
      o("zh-c08-b", "high-risk", "Point live picking at training now", "Same screens, different building.", [0, 1, 0], "You may import the attacker via VPN, data, or panicked copy-paste.", "Improvised failovers spread incidents into the last safe room.", recContainClean, "DR is designed; this is a hope.", "Clean is a state you can lose in one enthusiastic afternoon.", "Training now has real customer addresses and a new lock banner."),
      o("zh-c08-c", "defensible", "Use training read-only to check yesterday's stock figures", "Look, do not book.", [2, 2, 1], "You might get numbers without booking orders, if access is truly read-only and off the sick path.", "Even read-only needs a controlled route.", recContainClean, "Name who connects, from where, and when it stops.", "Limited use is a trade-off, not a free lunch.", "Someone still tries to confirm a pick. Of course they do."),
    ],
    { topicIds: ["protect-clean-environments", "failback"], learningObjectiveIds: ["zh-c08-do-not-burn-the-clean-site"], departmentIds: ["technical-response", "business-owners", "it-operations"] },
  ),
  q(
    "zh-c09",
    "containment",
    "The big red idea",
    "A technician stands at the site comms cabinet. Pulling the core switch would stop every locked PC — and the yard cameras, the gate, the remaining healthy pack stations, and the phone to the carrier. A director says 'just kill it' from the car park.",
    "If it has a light, it is guilty.",
    ["NIST IR", "NIST CSF 2.0"],
    [
      o("zh-c09-a", "defensible", "Pull the core if you cannot target in the next ten minutes", "Accept a black site to stop encryption you cannot otherwise see.", [2, 0, 2], "Spread may stop; so does every controlled workaround, and you now own a total outage.", "Broad shutdown can be justified when targeting is impossible — it is still a leadership decision with an ops cost.", recContainScope, "If you do it, write why, who authorised it, and what comes back first.", "Scorched earth is a choice, not a personality.", "The cabinet makes a heroic click. The yard goes medieval."),
      o("zh-c09-b", "strong", "Isolate known-bad VLANs and identity first", "Keep gate, phones, and clean pack lines if they are truly separate.", [3, 2, 3], "You slow the attack without inventing a second disaster.", "Targeted containment is the default; site-wide is the exception.", recContainScope, "Surgery before demolition.", "A director's urgency does not replace a network map.", "The technician puts a labelled sticky note on one blade, not a funeral wreath on all of them."),
      o("zh-c09-c", "high-risk", "Leave everything up so something still ships", "Customers will never know.", [0, 1, 0], "The malware uses your uptime as infrastructure.", "Hoping the healthy bits stay healthy is not a design.", recContainScope, "Uptime can be attacker infrastructure.", "Shipping is not a substitute for isolation.", "A pallet leaves. It contains encrypted feelings."),
    ],
    { topicIds: ["containment-scope", "shutdown-decisions"], learningObjectiveIds: ["zh-c09-prefer-targeted-isolation-over-site-kill"], departmentIds: ["incident-lead", "leadership", "technical-response"] },
  ),
  q(
    "zh-e01",
    "escalation",
    "Three commanders and a megaphone",
    "IT support, a warehouse shift lead, and a confident agency temp all think they are running the morning. The temp has a megaphone and a slide titled 'War Room (draft)'. Decisions are travelling by shout.",
    "I brought slides. Momentum is leadership.",
    ["NIST IR", "DORA"],
    [
      o("zh-e01-a", "high-risk", "Let the loudest voice win", "The megaphone has range.", [0, 0, 0], "Contradictory orders hit the floor: isolate, do not isolate, reboot.", "Authority needs a name, not volume.", recEscLead, "One voice out, one log in.", "Unclear command creates three containments and zero decisions.", "The megaphone enters a second life nobody asked for."),
      o("zh-e01-b", "strong", "Name a coordinator, a technical lead, and a scribe", "Roles, not volume. The temp can still take notes.", [3, 2, 3], "People know where facts go and who can say stop.", "Coordination is an appointment, not a vibe.", recEscLead, "This unblocks every later choice.", "Someone must own the clock; that someone is assigned, not assumed.", "The temp becomes scribe and is oddly good at it."),
      o("zh-e01-c", "defensible", "Split: warehouse owns trucks, IT owns PCs, nobody owns the room", "Clear-ish.", [2, 2, 1], "Handoffs fall through the crack in the middle.", "Split ownership still needs a single incident coordinator.", recEscLead, "A room still needs a chair.", "Function leads are not a substitute for one incident spine.", "Two huddles open. Neither has the full picture. Both have biscuits."),
    ],
    { topicIds: ["incident-coordinator", "command"], learningObjectiveIds: ["zh-e01-appoint-one-incident-coordinator"], departmentIds: ["incident-lead", "leadership", "it-operations"] },
  ),
  q(
    "zh-e02",
    "escalation",
    "Helpdesk is not the cavalry",
    "The service desk manager has been approving every isolation because they have the ticket queue. The person who actually understands the warehouse network is on a forklift walk-through and has not been asked. Isolation of the west VLAN is waiting on 'a ticket comment'.",
    "If it is not in the queue, it is not real.",
    ["NIST IR", "NIST CSF 2.0"],
    [
      o("zh-e02-a", "strong", "Name technical response; helpdesk feeds them", "Tickets become inputs. Isolation authority sits with the technical lead.", [3, 2, 3], "The west VLAN can be cut without a comment thread.", "Helpdesk is a sensor and a customer channel, not automatically the technical owner.", recEscTech, "Put expertise where the blast radius is.", "Technical ownership is assigned for the incident, not inherited from the queue.", "The forklift tour ends. The VLAN finally meets a grown-up."),
      o("zh-e02-b", "high-risk", "Keep approving isolation via ticket comments only", "Audit trail.", [0, 1, 0], "The attacker does not wait for comment number twelve.", "Process theatre is not technical command.", recEscTech, "Log decisions in the incident record; do not hide them in a queue.", "An audit trail that arrives after encryption is a diary, not a control.", "The ticket waits. The share does not."),
      o("zh-e02-c", "defensible", "Pair helpdesk and the network person on a recorded call", "Two owners, one hour.", [2, 2, 1], "You may get speed if they truly share a clock; you may also get polite deadlock.", "A pairing works only if one of them can say cut.", recEscTech, "Dual control needs a designated cutter.", "Collaboration without a decision right is delay.", "The call is wholesome and slightly too long."),
    ],
    { topicIds: ["technical-ownership", "helpdesk-role"], learningObjectiveIds: ["zh-e02-separate-queue-from-technical-command"], departmentIds: ["technical-response", "it-operations", "incident-lead"] },
  ),
  q(
    "zh-e03",
    "escalation",
    "The car-park payment plan",
    "The managing director calls from the car park: pay whatever they ask, keep the peak, do not involve 'too many people'. The ransom note is only an hour old. Finance has not been briefed. Nobody has written options down.",
    "I can authorise it from here. I am next to a van.",
    ["DORA", "NIST IR"],
    [
      o("zh-e03-a", "high-risk", "Pay from the car park on speakerphone", "Speed is leadership.", [0, 0, 0], "You start a payment path with no counsel, no record, and no idea if restore even works.", "Extortion is not a van-side decision.", recEscExec, "Executives set risk appetite; they still need a briefing pack.", "Being senior does not make a Bitcoin transfer a control.", "Finance asks which cost centre is 'crime'. The van has opinions."),
      o("zh-e03-b", "strong", "Short briefing: facts, options, next update, no payment yet", "Bring finance and counsel into a logged path.", [3, 2, 3], "Leadership stays in the loop without burning the company's position.", "Executives need options, not a ransom portal on a phone.", recEscExec, "A cadence beats a panic transfer.", "Payment, if ever, is a last-resort decision with recorded advice — not a reflex.", "The managing director stays on the line for five useful minutes, then parks properly."),
      o("zh-e03-c", "defensible", "Ask the MD to stay away until we 'know everything'", "Protect them from the mess.", [1, 2, 1], "You may keep them from harming the response and also starve the incident of authority when you need a business call.", "Shielding executives entirely creates a vacuum.", recEscExec, "Brief early, decide later, keep them on a clock.", "Leadership is a stakeholder, not a spectator or a freelancer.", "The car park briefing becomes a rumour with leather seats."),
    ],
    { topicIds: ["executive-role", "ransom-governance"], learningObjectiveIds: ["zh-e03-brief-executives-do-not-freelance-payment"], departmentIds: ["leadership", "incident-lead", "legal-privacy"] },
  ),
  q(
    "zh-e04",
    "escalation",
    "IT operations still has a change window",
    "The usual Monday patch window starts at 09:00. An operations engineer wants to patch 'everything that looks sad', including boxes you are still imaging. Another wants to freeze all changes including the isolation rule you need.",
    "The calendar invited us. The calendar is law.",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-e04-a", "defensible", "Allow only isolation and evidence snapshots", "Tiny change list, named approver.", [2, 2, 1], "You may miss a needed patch on an exposed edge, but you stop chaos.", "A tight allowlist is a reasonable freeze design.", recEscOps, "Write the allowed change types on the board.", "Incident freeze is a filter, not a sulk.", "The calendar meeting becomes a stand-up with fewer patches and more purpose."),
      o("zh-e04-b", "high-risk", "Patch every sad box including evidence hosts", "Green ticks are soothing.", [0, 1, 0], "You destroy forensic value and mix your fingerprints with the attacker's.", "Healthy-looking is not the same as preserved.", recEscOps, "Do not fix the crime scene first.", "Uncontrolled change during IR is a second incident.", "The evidence box is now compliant and empty."),
      o("zh-e04-c", "strong", "Freeze routine work, ticket break-glass, same clock as the incident", "Isolation yes; landscaping no.", [3, 2, 3], "IT operations becomes part of command instead of a parallel universe.", "Operations owns the pipes; the incident owns the freeze list.", recEscOps, "Put ops in the room with authority and constraints.", "A change window is not senior to a live cyberattack.", "Someone cancels the landscaping patch with a dignified calendar note."),
    ],
    { topicIds: ["it-operations", "change-freeze"], learningObjectiveIds: ["zh-e04-put-ops-on-the-incident-clock"], departmentIds: ["it-operations", "incident-lead", "technical-response"] },
  ),
  q(
    "zh-e05",
    "escalation",
    "Who decides what still ships",
    "Security wants the west pack line off until identity is clean. The warehouse manager wants it on because a retailer penalty clause starts at noon. Both are talking to different deputies. Nobody has written the trade-off.",
    "We will feel it out.",
    ["DORA", "NIST CSF 2.0"],
    [
      o("zh-e05-a", "strong", "Business owner decides service, security sets the safety limit, write it down", "Noon penalty versus spread: a recorded choice.", [3, 3, 3], "You get a decision that can be explained later, not a tug of war.", "Business owners prioritise; technical leads bound what is safe enough to run.", recEscBiz, "Trade-offs belong in the incident log.", "Cyber decisions are business decisions with technical constraints.", "The retailer clause is now a line on the board, not a shout."),
      o("zh-e05-b", "high-risk", "Let whoever is more stressed win in the moment", "Peak energy.", [0, 0, 0], "The line flickers on and off; nobody can reconstruct why.", "Stress is not a RACI.", recEscBiz, "Name the owner of the business call.", "If both 'win' in alternate minutes, the attacker also wins.", "Two deputies now have opposite instructions and the same headache."),
      o("zh-e05-c", "defensible", "Keep the line up with extra human checks", "People watching people picking.", [2, 2, 1], "You may catch some bad behaviour and still miss silent encryption.", "Compensating humans are a real trade-off, not a full control.", recEscBiz, "If you accept residual risk, the business owner signs it.", "Monitoring with eyeballs has a range of about one aisle.", "A supervisor with a clipboard becomes an unofficial IDS."),
    ],
    { topicIds: ["business-ownership", "risk-acceptance"], learningObjectiveIds: ["zh-e05-business-owner-sets-priorities-within-limits"], departmentIds: ["business-owners", "incident-lead", "leadership"] },
  ),
  q(
    "zh-e06",
    "escalation",
    "Passport scans on the shared drive",
    "HR realises contractor right-to-work scans sit on the same file share that locked this morning. They do not know if anything was copied. A well-meaning HR partner wants to email all contractors tonight 'just in case'. Legal has a voicemail. Privacy has a train ticket.",
    "If we tell everyone immediately, we are being transparent.",
    ["NIST IR", "DORA"],
    [
      o("zh-e06-a", "high-risk", "Mass-email contractors that their passports were stolen", "Get ahead of it.", [0, 1, 0], "You announce a personal-data incident you have not established, and you may cause harm and legal noise.", "Suspicion is not a confirmed breach notice.", recEscLegal, "Involve privacy and legal before you notify people as if it were fact.", "No single job title is 'always legally responsible' — the organisation has a process, and counsel advises it.", "The contractors' inbox becomes a panic room."),
      o("zh-e06-b", "strong", "Loop legal and privacy in now; preserve the share; no public claim yet", "Facts versus unknowns on a clock.", [3, 2, 3], "Duties get a path; the incident lead still runs containment.", "Privacy joins early when personal data may be in scope; they do not take over the warehouse.", recEscLegal, "Early involvement is how you avoid both silence and fiction.", "Legal and privacy advise; operations still contain; communications still need approved words.", "Privacy gets off the train and onto the bridge call. Welcome."),
      o("zh-e06-c", "defensible", "Wait for a full forensic report before telling anyone including counsel", "Perfect facts only.", [1, 2, 1], "You may preserve calm and miss notification clocks or hold-notice duties.", "Counsel can work with incomplete facts; they cannot work with a voicemail forever.", recEscLegal, "Incomplete and honest beats late and theatrical.", "Involving legal is not the same as admitting a breach to the world.", "The voicemail ages like milk."),
    ],
    { topicIds: ["legal-privacy", "personal-data"], learningObjectiveIds: ["zh-e06-involve-privacy-without-premature-notice"], departmentIds: ["legal-privacy", "hr", "incident-lead"] },
  ),
  q(
    "zh-e07",
    "escalation",
    "The scanner vendor named maybe-Lee",
    "The handheld scanner vendor offers a free remote session from an engineer named maybe-Lee, who will 'just hop on any warehouse PC'. They can be here in spirit in ten minutes. Procurement thinks saying no will delay the hardware credit you were promised last quarter.",
    "Lee is real. We think. The credit is definitely real.",
    ["DORA", "NIST CSF 2.0"],
    [
      o("zh-e07-a", "strong", "Jump host, MFA, ticket, watched, time-bound", "Help inside your controls, or no help.", [3, 2, 3], "Expertise arrives without handing the estate to a stranger.", "Vendors inherit your incident; they do not get a shortcut around it.", recEscVendor, "Refuse uncontrolled access, not all help.", "Third-party remote tools are identity events.", "maybe-Lee is on a professional leash and slightly less chatty."),
      o("zh-e07-b", "high-risk", "AnyDesk on a packing PC, speed", "The credit depends on being nice.", [0, 1, 0], "You add an untracked administrator during a compromise.", "Procurement outcomes are not a reason to skip access control.", recEscVendor, "Hardware credits do not outrank containment.", "Helpful vendors are still third parties.", "Lee has brought stickers and, accidentally, a wider blast radius."),
      o("zh-e07-c", "defensible", "Refuse all vendor help until next week", "Zero extra hands.", [2, 0, 2], "You keep purity and may lose the only people who know the scanner firmware.", "Refuse the uncontrolled path; you can still schedule a controlled one.", recEscVendor, "A delayed, watched session is usually enough.", "Isolation of vendors is a tool, not a personality.", "The scanners remain spiritually pure and physically sad."),
    ],
    { topicIds: ["vendor-access", "third-party"], learningObjectiveIds: ["zh-e07-vendor-help-only-on-a-controlled-path"], departmentIds: ["vendors", "technical-response", "incident-lead"] },
  ),
  q(
    "zh-e08",
    "escalation",
    "The insurer would like you to wait",
    "Cyber insurance wants a call before you isolate anything else, hire anyone, or talk to the carrier. The policy pack is in a PDF named FINAL_v7. The broker says 'do not touch evidence'. Encryption is still walking a share.",
    "The policy is very sure of itself.",
    ["DORA", "NIST IR"],
    [
      o("zh-e08-a", "high-risk", "Pause all containment until the broker joins at noon", "Stay onside.", [0, 0, 0], "The attacker does not recognise your policy clock.", "Insurance notification is a parallel track, not a stop-work order.", recEscInsure, "Contain first, notify along the agreed path.", "A PDF cannot outrun ransomware.", "The broker is in another meeting about wording. The share is not."),
      o("zh-e08-b", "strong", "Keep containing, notify through the agreed path, record what you said", "A named person calls; a named person keeps isolating.", [3, 2, 3], "You protect cover without donating more files.", "Insurers need facts; they do not run the warehouse.", recEscInsure, "Do both: stop the bleeding and start the claim file.", "Cyber insurance is a stakeholder, not the incident coordinator.", "FINAL_v7 is opened. It contains a phone number. Imagine."),
      o("zh-e08-c", "defensible", "Send the broker the whole ticket dump right now", "Transparency.", [2, 1, 2], "You may satisfy curiosity and overwhelm them with unreviewed noise, including personal data.", "A cover note plus a timeline beats a slurry.", recEscInsure, "Summarise, then attach what counsel is happy to share.", "Volume is not a notification.", "A broker intern weeps, but productively."),
    ],
    { topicIds: ["cyber-insurance", "parallel-tracks"], learningObjectiveIds: ["zh-e08-notify-insurer-without-pausing-containment"], departmentIds: ["legal-privacy", "leadership", "incident-lead"] },
  ),
  q(
    "zh-e09",
    "escalation",
    "Police, retainers, or neither yet",
    "A local officer who knows the site manager offers to 'swing by for the ransomware'. Your retained incident-response firm is one voicemail away. A deputy wants to wait until you can prove a crime. Another wants to post the lock screen on a community Facebook group 'for awareness'.",
    "Someone in uniform will know the password, maybe.",
    ["NIST IR", "DORA"],
    [
      o("zh-e09-a", "defensible", "Call the retained IR firm now, hold police until counsel agrees", "Buy expertise; do not freelance public enforcement.", [2, 2, 1], "You get hands that know ransomware and you may delay a useful law-enforcement path.", "External IR is often the fastest technical lift; police involvement is a counsel-guided choice.", recEscExternal, "Do not wait for a perfect crime story to get qualified help.", "There is no single title that must call the police — the organisation decides with advice.", "The voicemail becomes a bridge. The Facebook post does not."),
      o("zh-e09-b", "strong", "Counsel-guided: IR firm on the clock, law enforcement considered, no Facebook", "Facts in a pack. No community forensics.", [3, 2, 3], "Help arrives on a contract; public chatter stays off the table.", "External specialists support your coordinator; they do not replace organisational decisions.", recEscExternal, "Use the retainer you already pay for.", "Law enforcement and private IR are options with purposes, not trophies.", "The site manager thanks the officer and does not hand over the only disk."),
      o("zh-e09-c", "high-risk", "Post the banner on Facebook and invite the officer to click around", "Community and coppers.", [0, 0, 0], "You leak evidence, invite copycats, and create a messy trail.", "Public posts are not a reporting channel.", recEscExternal, "Private, logged, advised.", "Awareness without a process is just a leak with comments.", "The Facebook group has theories. All of them are wrong. One is a gif."),
    ],
    { topicIds: ["external-ir", "law-enforcement"], learningObjectiveIds: ["zh-e09-use-retainers-and-advice-not-facebook"], departmentIds: ["legal-privacy", "incident-lead", "leadership"] },
  ),
  q(
    "zh-b01",
    "continuity",
    "The warehouse WhatsApp poll",
    "A shift group chat now has a photo of the lock banner and a poll: pay, pray, or go home. Agency staff are asking if they will be paid. Nobody has sent an internal brief. The poll is winning.",
    "Democracy, but with ransomware.",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-b01-a", "high-risk", "Join as definitely-not-management and steer the memes", "Undercover vibe.", [0, 1, 0], "You look untrustworthy and leak more.", "Do not troll your own incident.", recContStaff, "Be present as the organisation, not a costume.", "Staff need a briefing, not a secret identity.", "Your alias is immediately obvious. The poll adds a fourth option."),
      o("zh-b01-b", "strong", "One internal brief: what to do, what not to do, where to report", "Thank people, close the poll, name a pay question owner for HR.", [3, 3, 3], "Rumour slows; agency staff get a human answer path.", "Employees are sensors and a leak surface.", recContStaff, "Treat people as part of the response.", "Unofficial channels fill every silence you leave.", "The poll closes. The stickers remain. HR has a script."),
      o("zh-b01-c", "defensible", "Ban phones on the floor until further notice", "No phones, no leaks.", [2, 1, 1], "You may reduce photos and also lose useful reports, plus picking slows.", "Policy without a replacement channel fails.", recContStaff, "If you restrict phones, give an official place to send what they saw.", "Control the message; do not pretend people stopped existing.", "Phones go into a bucket. The bucket is not encrypted. People are annoyed."),
    ],
    { topicIds: ["employee-comms", "rumour-control"], learningObjectiveIds: ["zh-b01-official-staff-brief-beats-group-chats"], departmentIds: ["communications", "hr", "incident-lead"] },
  ),
  q(
    "zh-b02",
    "continuity",
    "Directors want hourly voice notes",
    "Two directors want WhatsApp voice notes every hour 'in plain English'. The incident scribe is already behind on the written log. One director forwards the last note to a spouse who 'works in IT'.",
    "If it is not in my headphones, it did not happen.",
    ["DORA", "NIST CSF 2.0"],
    [
      o("zh-b02-a", "strong", "Written cadence: facts, impact, next steps, next time", "Short pack, same clock, no forwarding.", [3, 2, 3], "Leaders stay informed; the record stays in one place.", "Voice notes vanish; incident logs do not.", recContMgmt, "Headphones are not the system of record.", "Management updates are a product with a version, not a chat habit.", "A director learns to read. A spouse is gently un-forwarded."),
      o("zh-b02-b", "high-risk", "Agree to the hourly voice notes and skip the log", "Keep them happy.", [0, 1, 0], "The official story lives in disappearing audio and a family group.", "Informal briefings leak and cannot be audited.", recContMgmt, "Happiness is not a communications plan.", "If it is not written, the next shift will invent it.", "The spouse has theories and a group chat of their own."),
      o("zh-b02-c", "defensible", "One live call now, then written only", "Feed the anxiety once.", [2, 2, 1], "You may settle nerves and still create an unminuted conversation unless you write it down after.", "A call is fine if it becomes a note.", recContMgmt, "Talk, then type.", "Access for executives should not bypass the incident record.", "The call is eight minutes. The note is nine lines. Progress."),
    ],
    { topicIds: ["management-updates", "record-keeping"], learningObjectiveIds: ["zh-b02-written-cadence-for-leaders"], departmentIds: ["leadership", "communications", "incident-lead"] },
  ),
  q(
    "zh-b03",
    "continuity",
    "The retailer on hold about today's pallets",
    "A key retailer's control tower is on the phone: will the 11:00 pallets leave? Sales wants to promise yes. Warehouse thinks maybe three of twelve. Nobody has approved words. The hold music is optimistic.",
    "Tell them it is a routine IT blip. They love blips.",
    ["DORA", "NIST CSF 2.0"],
    [
      o("zh-b03-a", "defensible", "Tell only this retailer the fuller picture", "VIP honesty.", [2, 2, 1], "You help one partner and create a fairness and leak problem.", "Selective detail has a half-life.", recContCust, "A fair holding line plus specific slot news is cleaner.", "Biggest customer is not a secret briefing privilege by default.", "The second-biggest customer has ears, and LinkedIn."),
      o("zh-b03-b", "high-risk", "Promise all twelve pallets and a routine outage", "Keep the relationship smooth.", [0, 1, 0], "You miss slots and you have lied about the nature of the event.", "Hope is not a delivery plan; 'routine' is not a cyberattack.", recContCust, "Promise only what the floor can still do.", "Customers can plan around truth; they cannot plan around charm.", "Eleven o'clock arrives. So does a penalty email."),
      o("zh-b03-c", "strong", "Approved facts: what still ships, what is delayed, next update time", "One channel, one number of pallets.", [3, 3, 3], "The retailer can reroute; you keep a relationship you can defend.", "Operational honesty is communications.", recContCust, "Cadence beats charisma.", "Customer updates need a business owner and a comms check, not a sales solo.", "Hold music ends. The number three of twelve is strangely respected."),
    ],
    { topicIds: ["customer-comms", "delivery-promises"], learningObjectiveIds: ["zh-b03-honest-slot-updates-not-routine-blips"], departmentIds: ["communications", "business-owners", "leadership"] },
  ),
  q(
    "zh-b04",
    "continuity",
    "The carton supplier's EDI is staring",
    "A packaging supplier's portal shows yesterday's order stuck, and they phone: do we still need today's cardboard? Someone drafts an email attaching the lock-screen photo 'so they understand'. Procurement wants to cancel everything for a week.",
    "Suppliers love context. Especially screenshots of criminals.",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-b04-a", "strong", "Short notice, no attachment: delay, revised quantity, known phone number", "If they need more, they call the number already on the contract.", [3, 3, 3], "Cardboard plans adjust without a second copy of your incident art.", "Partners need operational facts, not malware souvenirs.", recContSupp, "Describe, do not attach.", "You can warn a supplier without amplifying the attacker.", "The draft loses its screenshot and gains a delivery date. Grown-up."),
      o("zh-b04-b", "high-risk", "Send the lock banner to every supplier in BCC", "Transparency at scale.", [0, 1, 0], "You distribute incident imagery and invite copycats and panic.", "Do not mail the face of the attack to the extended family.", recContSupp, "Need-to-know, no trophies.", "Awareness is not a ransomware gallery.", "Procurement would like to sit down. The BCC list is long."),
      o("zh-b04-c", "defensible", "Say nothing and cancel next week's board internally only", "Quiet inventory move.", [1, 2, 1], "You may avoid leaks and leave the supplier making product you will reject.", "Silence has a cost in waste and trust.", recContSupp, "Tell the people whose trucks are about to arrive.", "Suppliers are part of continuity, not spectators.", "A lorry of unneeded cardboard is already on the ring road."),
    ],
    { topicIds: ["supplier-comms", "edi"], learningObjectiveIds: ["zh-b04-notify-suppliers-without-attachments"], departmentIds: ["communications", "vendors", "business-owners"] },
  ),
  q(
    "zh-b05",
    "continuity",
    "The local paper has a tip",
    "A reporter who covers the industrial estate texts the site manager: hearing Northstar had a cyberattack, any comment before noon? Marketing has a cheerful holding tweet about 'investing in technology'. The site manager is not a spokesperson.",
    "If we joke, maybe they will go away.",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-b05-a", "high-risk", "Tweet that it is a routine outage with a shrug emoji", "Keep it light.", [0, 1, 0], "Customers, staff, and later investigators remember the shrug.", "Humour is not a disclosure strategy.", recContPublic, "One spokesperson, approved line.", "Vacuum plus jokes gets filled by worse stories.", "The tweet has four likes, all internal, and a long afterlife."),
      o("zh-b05-b", "defensible", "No comment, ignore the reporter", "Empty air.", [2, 1, 1], "You avoid a wrong statement and you let the tip harden into a story without you.", "Silence can be a tactic; it still needs a watch on what others publish.", recContPublic, "A factual holding line is usually safer than a void.", "No comment is a decision — brief the spokesperson anyway.", "The paper files with 'declined to comment' and a photo of the gate."),
      o("zh-b05-c", "strong", "Approved holding line, named spokesperson, no extra detail", "We are dealing with a service disruption, next update when we have facts.", [3, 2, 3], "The organisation speaks once, calmly, without confirming what you do not know.", "Public statements are a controlled product.", recContPublic, "Holding lines exist for this exact text message.", "Site managers should route press, not become press.", "Marketing bins the cheerful tweet. The reporter gets one adult sentence."),
    ],
    { topicIds: ["public-statements", "media"], learningObjectiveIds: ["zh-b05-holding-line-not-jokes-or-void"], departmentIds: ["communications", "leadership", "incident-lead"] },
  ),
  q(
    "zh-b06",
    "continuity",
    "Today's delivery slots are a spreadsheet of hope",
    "Transport has 140 slots. Warehouse can perhaps fulfil 40 on a clean island plus paper. Sales wants to keep all 140 'on the system' so the portal looks healthy. Nobody has told drivers.",
    "The portal being green is a customer experience.",
    ["DORA", "NIST CSF 2.0"],
    [
      o("zh-b06-a", "strong", "Cut the book to what you can do, tell drivers and customers", "Forty honest slots beat 140 ghosts.", [3, 3, 3], "The yard matches the promise; people can reroute.", "Continuity is a reduced plan you can actually run.", recContSlots, "Hope is not capacity.", "Delivery disruption is managed by shrinking the plan in public, not decorating the portal.", "Drivers are annoyed on time, which is oddly professional."),
      o("zh-b06-b", "high-risk", "Leave 140 live and apologise at the door", "Keep the funnel full.", [0, 1, 0], "You create a second incident made of waiting lorries and broken trust.", "A green portal is not a warehouse.", recContSlots, "Do not advertise capacity you have already lost.", "Experience design cannot outrun physics.", "The industrial estate becomes a car park with feelings."),
      o("zh-b06-c", "defensible", "Cancel everything including the 40 you could do", "Clean break.", [2, 0, 2], "You avoid chaos and you also discard recoverable value.", "Total stop is simpler and costlier; name it if you choose it.", recContSlots, "If you halt, the business owner should own that halt.", "Purity can starve the day.", "The yard is peaceful. The penalty clauses are not."),
    ],
    { topicIds: ["delivery-disruption", "capacity"], learningObjectiveIds: ["zh-b06-shrink-slots-to-real-capacity"], departmentIds: ["business-owners", "communications", "leadership"] },
  ),
  q(
    "zh-b07",
    "continuity",
    "Clipboards versus the second set of books",
    "A supervisor proposes heroic jogging with clipboards to keep picks moving. It might ship pallets. It might invent stock that never existed. There is a dusty manual-pick procedure from a snow day, unopened, in a binder labelled 'BCP — do not borrow'.",
    "We will remember the pallets. We have a vibe.",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-b07-a", "high-risk", "Hero clipboards, no reconciliation plan", "Jog faster.", [0, 1, 0], "You ship the wrong freight with confidence and no way back.", "Manual ops without a paper trail is a second incident.", recContManual, "Workarounds need controls.", "Continuity is designed, not improvised from stationery.", "A clipboard becomes legally interesting."),
      o("zh-b07-b", "strong", "Use the snow-day procedure: named owners, photos, later reconciliation", "Small volume, written, boring.", [2, 3, 3], "Critical goods move without inventing a parallel universe of stock.", "The binder exists for this hour.", recContManual, "Heroism is not a control.", "If it is not written, it will not be reconcilable on Tuesday.", "Photos of pallets. The glamorous part of incident response."),
      o("zh-b07-c", "defensible", "Stop all physical work until systems return", "No picks, no fiction.", [3, 0, 2], "You protect data integrity and starve today's customers.", "A halt is honest if leadership accepts the commercial hit.", recContManual, "Name the ops cost of purity.", "Not picking is also a continuity choice.", "The yard is quiet enough to hear a penalty clause landing."),
    ],
    { topicIds: ["manual-procedures", "business-continuity"], learningObjectiveIds: ["zh-b07-documented-manual-lane-not-hero-clipboards"], departmentIds: ["business-owners", "it-operations", "incident-lead"] },
  ),
  q(
    "zh-b08",
    "continuity",
    "The note claims they have customer addresses",
    "The ransom note lists a sample of delivery addresses that look real. Operations wants to ring those customers 'to warn them about the hackers'. Privacy is still on the earlier train. Sales wants to deny everything because the sample might be from a public tracking page.",
    "If it is on a tracking page, it is not stealing. Right?",
    ["NIST IR", "DORA"],
    [
      o("zh-b08-a", "strong", "Treat as possible theft: preserve, involve privacy, do not confirm from the note alone", "Check whether the sample is public tracking versus private files.", [3, 2, 3], "You keep options and you do not accidentally notify the wrong way.", "A criminal's claim is a lead, not a press release.", recContTheft, "Verify the data class before you ring a hundred doorbells.", "Suspected data theft is a privacy track running beside containment.", "Someone finally compares the sample to the public tracker. Adult work."),
      o("zh-b08-b", "high-risk", "Ring every listed customer now and admit a breach", "Get ahead of the hackers.", [0, 1, 0], "You may create panic, admit what you cannot prove, and miss the real notification process.", "Customer calls are notifications. They need a basis.", recContTheft, "Do not let the attacker set your comms clock by bluff.", "The note is not your legal analysis.", "The phones become a rumour mill with postcodes."),
      o("zh-b08-c", "defensible", "Say nothing internally either until forensics is done", "In case it is nothing.", [2, 1, 1], "You avoid a false alarm and you may leave staff repeating the note in WhatsApp.", "Internal holding facts can exist without a public breach claim.", recContTheft, "Staff still need 'do not speculate' guidance.", "Silence to customers is not the same as silence to your own floor.", "The WhatsApp poll gains a new, worse option."),
    ],
    { topicIds: ["suspected-data-theft", "privacy"], learningObjectiveIds: ["zh-b08-ransom-claims-are-leads-not-notices"], departmentIds: ["legal-privacy", "communications", "incident-lead"] },
  ),
  q(
    "zh-b09",
    "continuity",
    "Marketing would like a breach announcement",
    "A draft social post begins: we can confirm a data breach affecting customers. The evidence is the ransom note and a locked share. Privacy has not confirmed exfiltration. Legal has not approved words. The social manager says 'the narrative window is closing'.",
    "If we say it first, we own it.",
    ["DORA", "NIST IR"],
    [
      o("zh-b09-a", "defensible", "Post a service-disruption update, no personal-data claim", "Own the delay, not a breach you cannot show.", [2, 2, 1], "You fill the window without making a legal statement you may have to unwind.", "Service truth is allowed; breach truth needs a basis.", recContBreach, "If you speak, speak about what you actually know.", "Owning the story is not the same as over-claiming it.", "The narrative window contains one boring, accurate sentence."),
      o("zh-b09-b", "strong", "No breach announcement; holding line only after privacy and legal", "The window can wait for facts.", [3, 2, 3], "You avoid a premature personal-data admission and you still have a spokesperson ready.", "Breach announcements are legal events, not marketing assets.", recContBreach, "Closing a narrative window with the wrong noun is worse than a pause.", "Do not let social calendars declare a breach.", "The draft is saved as DRAFT_DO_NOT_POST, which is a promising filename."),
      o("zh-b09-c", "high-risk", "Publish the confirmation to 'control the narrative'", "Speed.", [0, 0, 0], "You may trigger duties, customer panic, and a correction tomorrow.", "You cannot unsay a breach.", recContBreach, "Control is accuracy plus approval, not going first.", "Marketing does not get to find exfiltration on a feeling.", "The post is live. Privacy's train is still a train."),
    ],
    { topicIds: ["breach-announcements", "disclosure"], learningObjectiveIds: ["zh-b09-no-premature-breach-post"], departmentIds: ["communications", "legal-privacy", "leadership"] },
  ),
  q(
    "zh-r01",
    "recovery",
    "Backups last tested in another financial year",
    "Finance swears warehouse backups are 'in the cloud'. Ops swears a USB in a drawer labelled Snacks is the real one. Restore tests are a rumour from fourteen months ago. A director wants a go-live time for the all-hands.",
    "The snacks drawer is a tier-1 vault. Probably.",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-r01-a", "high-risk", "Promise Tuesday 06:00 from the USB vibes", "Leadership needs a date.", [0, 1, 0], "You commit to a restore you cannot show.", "Recovery dates need evidence.", recRecBackup, "Proof before poetry.", "A backup you have not restored is a story.", "Someone is already printing the Tuesday banner."),
      o("zh-r01-b", "strong", "Locate copies, protect them, test-restore one file and one service", "Then offer a range, not a theatrical hour.", [3, 3, 3], "You learn what is actually recoverable before you advertise it.", "Test restores beat folklore.", recRecBackup, "This is how you earn a date.", "Immutability only matters if you can find the copy and open it.", "The snacks drawer contains crisps and a mystery stick. Both are inventoried."),
      o("zh-r01-c", "defensible", "Start restoring everything in parallel to save time", "More jobs, more hope.", [1, 2, 1], "You may restore malware with the data and hide failures in volume.", "Sequence is a control.", recRecBackup, "A sample success beats a flood of unknown jobs.", "Parallelism without a clean target is optimism.", "Twelve restore jobs enter a knife fight."),
    ],
    { topicIds: ["backups", "restore-testing"], learningObjectiveIds: ["zh-r01-test-restore-before-promising-dates"], departmentIds: ["it-operations", "technical-response", "leadership"] },
  ),
  q(
    "zh-r02",
    "recovery",
    "Payroll, portal, or the pick face first",
    "IT can bring back one major service this afternoon. HR wants payroll because it is month-end. Marketing wants the customer portal because of the paper. The warehouse manager wants WMS because pallets exist in the physical world. All three are in the same huddle, ranking their own pain.",
    "Whoever emails more should win.",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-r02-a", "strong", "Incident lead plus business owner: safety and core delivery first", "Write the order. Tell the other two the time they get.", [3, 3, 3], "Pallets and gates come back under a plan people can see.", "Recovery priority is a business call inside technical feasibility.", recRecPriority, "Pain is not the same as criticality.", "You can be fair about the sequence without pretending everything is first.", "HR and marketing get a clock instead of a fight. The pallets get a system."),
      o("zh-r02-b", "high-risk", "Restore whichever dashboard is reddest", "The reddest must be the most important.", [0, 1, 0], "You may bring back a website while the warehouse still runs on myth.", "Colour is not a priority model.", recRecPriority, "Use impact, not UI anxiety.", "Dashboards shout; yards do not.", "The portal is beautiful and empty of truth."),
      o("zh-r02-c", "defensible", "Split the afternoon into three partial restores", "Everyone gets a slice.", [2, 2, 1], "You keep political peace and may finish none of them well.", "Splitting scarce recovery effort has a cost.", recRecPriority, "If you slice, say what 'done enough' means for each.", "Fairness can dilute recoverability.", "Three services flicker. Nobody can ship a story or a pallet."),
    ],
    { topicIds: ["recovery-priority", "business-impact"], learningObjectiveIds: ["zh-r02-prioritise-core-delivery-not-the-loudest"], departmentIds: ["business-owners", "incident-lead", "leadership"] },
  ),
  q(
    "zh-r03",
    "recovery",
    "Pour the backup onto the same street",
    "A vendor offers to restore WMS onto the existing warehouse servers 'because the hardware is fine'. Those servers still sit on the VLAN that hosted the encryption. Gold images exist, unused, in a cupboard with a hopeful label.",
    "Hardware that still pings is innocent.",
    ["NIST IR", "NIST CSF 2.0"],
    [
      o("zh-r03-a", "defensible", "Restore to the old servers after a rapid reimage on the same VLAN", "Faster, slightly haunted.", [2, 2, 1], "You may save hours and rejoin a network you have not proven clean.", "Same street, new paint, is a trade-off you should name.", recRecClean, "If you reuse hardware, change the neighbourhood too.", "Pinging is not cleanliness.", "The hopeful cupboard looks neglected and correct."),
      o("zh-r03-b", "strong", "Rebuild on gold images in a clean, isolated environment, then restore data", "Priority services only.", [3, 2, 3], "You come back narrower and less haunted.", "Restore is not the same as reconnect.", recRecClean, "This is the recovery spine.", "Good data on a dirty network is how sequels start.", "The gold image is boring. That is the point."),
      o("zh-r03-c", "high-risk", "Restore last month's full disk image onto live production now", "Ancient means innocent.", [0, 1, 0], "You may reintroduce the foothold and yesterday's malware culture.", "Age is not cleanliness.", recRecClean, "Do not relocate the ghost.", "A full-disk souvenir is not a gold image.", "The macros wave as they return home."),
    ],
    { topicIds: ["clean-rebuild", "restore-target"], learningObjectiveIds: ["zh-r03-restore-to-clean-isolated-env"], departmentIds: ["technical-response", "it-operations"] },
  ),
  q(
    "zh-r04",
    "recovery",
    "New passwords, old mailbox",
    "IT is ready to reset warehouse passwords. The plan is to email temporary passwords from the same mail system that sent lookalike reset links this morning. Several clickers have not been identified. Shared aisle accounts are still in the spreadsheet.",
    "If we mail it, they will change it. Probably.",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-r04-a", "high-risk", "Email temps to everyone including shared aisles", "Scale.", [0, 1, 0], "The attacker reads the new secrets in the same thread as the old campaign.", "Do not send keys through a house you still distrust.", recRecCreds, "Fix the identity path first.", "A password reset is not recovery if the mailbox is still a hostile place.", "The lookalike portal would like to thank you for the refill."),
      o("zh-r04-b", "strong", "Kill sessions, reset after mail/identity is controlled, named accounts, out-of-band temps", "Managers hand secrets face to face or via a known HR path.", [3, 2, 3], "Old sessions die; new secrets do not go to the attacker first.", "Credential recovery is sequencing, not a mail merge.", recRecCreds, "Out-of-band is slower and actually a reset.", "Shared accounts should not survive the incident that abused them.", "A manager walks the floor with envelopes. Old-school, effective."),
      o("zh-r04-c", "defensible", "Force reset at next login on the still-suspect portal", "Close enough.", [2, 1, 1], "You may catch some people and train others to type into the wrong box.", "A force-reset on a shady page is a trap with extra steps.", recRecCreds, "Change the destination, then the secret.", "Login prompts are part of the incident, not only the password.", "Half the floor practices typing into déjà vu."),
    ],
    { topicIds: ["credential-reset", "identity-recovery"], learningObjectiveIds: ["zh-r04-reset-credentials-out-of-band"], departmentIds: ["it-operations", "technical-response", "hr"] },
  ),
  q(
    "zh-r05",
    "recovery",
    "We are back, please stop watching",
    "WMS looks up. A VP wants the extra monitoring switched off because 'it is noisy and the team is tired'. Mystery beacons still flicker twice an hour. The intern has printed WE ARE BACK stickers.",
    "Winners do not look at logs.",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-r05-a", "strong", "Controlled reopen, heightened monitoring, named rollback, 72-hour watch", "Stickers optional. Alerts mandatory.", [3, 3, 3], "You can run the warehouse without lying to yourselves.", "Recovery is a phase with instrumentation, not a mood.", recRecMonitor, "All-clear is a monitoring decision.", "Tiredness is not a compensating control.", "The intern keeps one sticker. For later."),
      o("zh-r05-b", "high-risk", "Stickers on, detections off", "Close the war room.", [0, 1, 0], "You will miss the sequel.", "Noise is a clue, not a nuisance to mute.", recRecMonitor, "Tune, do not blind.", "Declaring victory is how second incidents hide.", "The stickers are one size too triumphant."),
      o("zh-r05-c", "defensible", "Stay in full incident mode until the beacons have been silent a week", "Sleep is for other industries.", [3, 1, 2], "You stay safe and burn the team, which becomes its own operational risk.", "Name an exit criterion that is not forever.", recRecMonitor, "You can be careful without becoming nocturnal forever.", "Burnout is also an incident outcome.", "The war room acquires a toaster and a union pamphlet."),
    ],
    { topicIds: ["post-restore-monitoring", "reopen-criteria"], learningObjectiveIds: ["zh-r05-reopen-with-watch-and-rollback"], departmentIds: ["technical-response", "incident-lead", "leadership"] },
  ),
  q(
    "zh-r06",
    "recovery",
    "Pay them so Friday peak lives",
    "A well-meaning operations lead finds the payment portal still open and drafts a 'small test payment' to see if files decrypt, because Friday is the biggest dispatch day of the month. Counsel has not signed anything. Backups have not been proven.",
    "It is only a test. Tests are scientific.",
    ["NIST IR", "DORA"],
    [
      o("zh-r06-a", "high-risk", "Send a small test amount tonight", "Science.", [0, 0, 0], "You start a payment path without a decision and may still get nothing back.", "Test payments are still payments.", recRecRansom, "Do not poke the portal for curiosity.", "Ransom is a leadership and legal track, not a warehouse experiment.", "Finance asks again which cost centre is 'crime'. Science is not an answer."),
      o("zh-r06-b", "strong", "Preserve the note, no payment, prove restores, logged decision if ever", "Friday is a planning problem, not a Bitcoin problem, until leadership says otherwise.", [3, 2, 3], "You keep options; you do not fund the attacker from the floor.", "Payment never guarantees recovery and can create more legal and ethical problems.", recRecRansom, "Work the backups while the portal sits unclicked.", "Nobody on the pack line is authorised by enthusiasm.", "The draft payment is deleted. Friday gets a reduced, honest plan."),
      o("zh-r06-c", "defensible", "Keep the portal bookmarked 'just in case' without paying", "Optionality.", [2, 1, 1], "You avoid paying and you keep a tempting, unlogged path near tired people.", "If you retain the option, lock it behind counsel and access control, not a browser tab.", recRecRansom, "Optionality needs a padlock.", "A bookmark is not a strategy; it is a future accident.", "The tab stays open. So does the risk of a tired click."),
    ],
    { topicIds: ["ransom-payment", "extortion"], learningObjectiveIds: ["zh-r06-no-floor-level-ransom-experiments"], departmentIds: ["leadership", "legal-privacy", "incident-lead"] },
  ),
  q(
    "zh-r07",
    "recovery",
    "Turn the carrier pipe back on",
    "WMS is up in the clean environment. The carrier SFTP job is the last red light on a manager's dashboard. Someone proposes reconnecting with the old job account 'because it is already in the script'. That account lived on the sick subnet this morning.",
    "Green lights are a personality type.",
    ["DORA", "NIST CSF 2.0"],
    [
      o("zh-r07-a", "strong", "New identity, clean host, monitored job, carrier told the window", "Reconnect on purpose.", [3, 3, 3], "The partner path returns without importing the morning.", "Reconnection is a controlled change, not a dashboard click.", recRecReconnect, "Scripts are not evidence of cleanliness.", "Third-party pipes need the same rebuild hygiene as internal ones.", "The robot is invited back with a new badge. It beeps politely."),
      o("zh-r07-b", "high-risk", "Flip the old job on so the 16:00 file leaves", "Make the light green.", [0, 1, 0], "You may reattach a compromised identity to a clean core.", "Old accounts are part of the incident.", recRecReconnect, "Do not reimport the problem to save a script.", "A red light can be honest.", "The dashboard is thrilled. The identity log is not."),
      o("zh-r07-c", "defensible", "Send tonight's file on a USB via courier", "Avoid the pipe.", [2, 2, 1], "You may move data without the old account and you create custody and delay issues.", "Sneakernet is a workaround with its own controls.", recRecReconnect, "If you courier, encrypt, log, and limit what is on the stick.", "Avoiding a pipe is not the same as securing the next one.", "A courier becomes a network route with a high-vis jacket."),
    ],
    { topicIds: ["reconnect-partners", "clean-identity"], learningObjectiveIds: ["zh-r07-reconnect-with-new-identity-and-monitoring"], departmentIds: ["vendors", "technical-response", "it-operations"] },
  ),
  q(
    "zh-r08",
    "recovery",
    "The review before the coffee goes cold",
    "Someone wants a 60-slide retro before monitoring is quiet. Someone else wants to never speak of this again. A draft already blames night shift by name. The intern is updating a CV in the corner, just in case.",
    "Accountability means a villain. Ideally on nights.",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-r08-a", "high-risk", "Publish the blame note to all-staff", "Consequences.", [0, 0, 0], "People hide the next incident and you lose the truth.", "Scapegoats are useless and contagious.", recRecReview, "Blameless is not consequence-free, but hunting shifts fails.", "Culture is a control.", "The intern updates the CV faster. Night shift goes quiet forever."),
      o("zh-r08-b", "strong", "Short living log: what worked, what failed, owners, no villains", "Three pages while the coffee is still bad.", [3, 2, 3], "Fixes have names; people stay in the room.", "Improvement is part of response.", recRecReview, "Write while memory exists.", "A review is a coordination artefact, not a trial.", "The living log is ugly and true. The CV is closed."),
      o("zh-r08-c", "defensible", "Schedule a polished retro in Q4", "When the trauma has aged.", [1, 2, 1], "Details evaporate; the slides will be prettier.", "Delay deletes lessons even if it reduces heat.", recRecReview, "Capture now, polish later.", "Memory is a perishable control.", "Q4 is already fully booked with other regrets."),
    ],
    { topicIds: ["post-incident-review", "blameless"], learningObjectiveIds: ["zh-r08-timely-blameless-review"], departmentIds: ["incident-lead", "hr", "leadership"] },
  ),
  q(
    "zh-r09",
    "recovery",
    "Monday should hurt less next time",
    "The board will fund 'something'. Ideas include a motivational poster, a new logo for the incident channel, MFA on privileged and remote access, actually testing restores, and a 40-page policy nobody will read this quarter. The intern suggests a tabletop that is not optional.",
    "Posters are cheaper than segmentation.",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-r09-a", "defensible", "Fund MFA now, defer restore tests to next year", "Identity first, backups later.", [2, 1, 2], "You close a real hole and leave the recovery story unproven.", "Sequencing improvements is allowed if the deferral has a date and an owner.", recRecImprove, "Do not let 'later' become another fourteen months.", "Trade-offs in the backlog still need names.", "MFA lands. The snacks USB remains a personality."),
      o("zh-r09-b", "high-risk", "Print posters and rename the Teams channel", "Culture.", [0, 1, 0], "Nothing that failed this morning actually changes.", "Rebranding is not a control family.", recRecImprove, "Spend the goodwill on identity, backups, and practice.", "Logos do not isolate VLANs.", "The poster is motivational. The malware cannot read."),
      o("zh-r09-c", "strong", "Dated actions: MFA, segmentation, restore tests, and a scheduled tabletop", "Few items, owners, dates — including who coordinates next Monday.", [3, 3, 3], "The organisation buys fewer sequels.", "Lessons become work, not wallpaper.", recRecImprove, "Practice is how the playbook becomes muscle.", "Improvement is operational, not decorative.", "The intern books a tabletop. Nobody is allowed to be 'busy in the yard' that hour."),
    ],
    { topicIds: ["improvement-actions", "lessons-learned"], learningObjectiveIds: ["zh-r09-turn-lessons-into-dated-controls"], departmentIds: ["leadership", "it-operations", "incident-lead"] },
  ),
];
