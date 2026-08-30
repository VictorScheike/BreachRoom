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
  prompt: string,
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
    { prompt, ...tags },
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
const recDetectEdr = "Treat the overnight endpoint alert as a live incident, preserve the host, and search for related alerts before treating it as a one-off.";
const recDetectScope = "Treat the first affected device as a lead, not the whole incident, until nearby systems and accounts have been checked.";
const recDetectRecord = "Open one incident record with a time, a named lead, and a place for facts. Tickets are inputs, not the incident.";
const recDetectLogs = "Stop log rotation or overwrites, snapshot what remains, and record any missing time window.";
const recDetectReboot = "Instruct staff not to reboot locked PCs, collect screenshots, and route reports to the incident channel.";
const recDetectMap = "Build a simple affected-versus-working list with owners before declaring the size of the incident.";
const recDetectLogin = "Disable or challenge the suspicious session, keep the log, and check whether other warehouse accounts moved the same way.";
const recDetectSev = "Set an initial severity from business impact plus signs of spread, then review it on a clock. Do not wait for certainty.";
const recContainHost = "Isolate the encrypting host from the network, keep it powered for evidence, and watch neighbouring systems for the same behaviour.";
const recContainSeg = "Cut the path between the infected warehouse segment and healthy file shares, with a named exception if a delivery path must stay open.";
const recContainAcct = "Disable the compromised account, terminate its sessions, and review what it could still reach.";
const recContainPriv = "Isolate the affected host and revoke the active privileged session first. Preserve logs. Then replace standing local administrator rights with managed elevation, just-in-time access, or documented emergency access.";
const recContainVpn = "Revoke risky remote sessions, pause bulk sync, and keep a watched path only for responders.";
const recContainVendorLink = "Pause or tightly restrict the third-party connection until it is confirmed not to be a spread path, then reopen with an owner and a time limit.";
const recContainMail = "Block the malicious mail path, reset or freeze affected mailboxes, and warn staff through a channel the attacker does not control.";
const recContainClean = "Keep clean environments off the infected network and do not use them as an improvised production workaround.";
const recContainScope = "Isolate known-bad segments first. A site-wide shutdown needs an explicit business decision and an operations plan.";
const recEscLead = "Name one incident coordinator, a technical lead, and a scribe so orders and facts have a single home.";
const recEscTech = "Give technical response a named owner with authority to isolate, and keep helpdesk as a reporting channel, not the commander.";
const recEscExec = "Brief executives with facts, options, and a next update time. Payment and public statements wait for a logged decision path.";
const recEscOps = "Freeze routine IT changes, keep break-glass work ticketed, and put operations on the same clock as the incident.";
const recEscBiz = "Business owners decide which services stay open within the containment limits security sets. Record the trade-off.";
const recEscLegal = "Involve legal and privacy as soon as personal data may be involved. They advise on duties; they do not replace the incident lead.";
const recEscVendor = "Accept vendor help only through a ticketed, watched, time-bound path your organisation controls.";
const recEscInsure = "Notify cyber insurance through the agreed path without pausing containment. Keep a record of what you told them.";
const recEscExternal = "Decide with counsel whether to involve law enforcement or a retained incident-response firm. Do not wait for a perfect story, and do not freelance the call.";
const recContStaff = "Send one internal brief: what to do, what not to do, and where to report. Then close unofficial polls and rumour threads.";
const recContMgmt = "Give management a short cadence of facts, impact, and next steps. Informal voice notes are not the record.";
const recContCust = "Tell affected customers what you know, what still ships, and when the next update is, using approved wording.";
const recContSupp = "Notify suppliers who may be blocked, without attaching samples or guessing about data theft.";
const recContPublic = "Hold public comment to an approved spokesperson. Rumours get a factual holding line, not speculation.";
const recContSlots = "Decide delivery slots with the warehouse owner against a written impact picture, not against hoped-for capacity.";
const recContManual = "If work continues on paper, use a named manual procedure with later reconciliation. Informal clipboards create a second incident.";
const recContTheft = "Treat a theft claim as possible until checked. Preserve evidence and involve privacy. Do not confirm a breach from the ransom note alone.";
const recContBreach = "Do not announce a personal-data breach until privacy and legal have a factual basis. A holding line is better than a wrong headline.";
const recRecBackup = "Locate backups, protect them, and test-restore a sample before promising a go-live time.";
const recRecPriority = "Restore in an order the business owner and incident lead agree: safety and core delivery first, lower-priority services later.";
const recRecClean = "Restore onto a clean, isolated environment. Do not restore good data onto the same infected network.";
const recRecCreds = "Reset credentials after you control the identity path, terminate old sessions, and do not send new secrets through a mailbox you still distrust.";
const recRecMonitor = "Reopen with heightened monitoring and a named rollback. Service restoration is not a detection control.";
const recRecRansom = "Do not pay from the warehouse floor. Preserve the note, involve leadership and counsel, and treat payment as a last-resort decision with no guarantee of recovery.";
const recRecReconnect = "Reconnect partners only after the path is clean, monitored, and owned. Speed without a check can reimport the problem.";
const recRecReview = "Run a short, blameless review with facts and owners while memories are fresh.";
const recRecImprove = "Turn the review into a few dated actions: identity, segmentation, backups, and a rehearsed Monday playbook.";

export const NORTHSTAR_ZERO_HOUR_QUESTIONS: Question[] = [
  q(
    "zh-d01",
    "detection",
    "Dispatch workbook will not open",
    "At 06:40 on the Monday dispatch desk, DISPATCH_MON.xlsx shows a lock banner and a countdown. The night planner reports it was usable at handover. A picker asks whether this is malware.",
    "If I keep trying Open on other PCs, it might still load.",
    "How should the dispatch desk respond?",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-d01-a", "high-risk", "Copy the file to other PCs until one opens it", "Move the workbook onto the next three desks.", [0, 1, 0], "The lock banner follows the file onto previously healthy machines.", "Moving a locked business file is a common way ransomware spreads across a shift.", recDetectLock, "You need a preserved sample in isolation, not a tour of the office.", "A lock banner on a shared workbook is a suspected compromise, not a spreadsheet fault.", "Three more dispatch PCs now show the same countdown."),
      o("zh-d01-b", "strong", "Stop using it, photograph the screen, open the incident", "Leave the PC powered on, stop copies, and name a coordinator.", [3, 2, 3], "The desk is taken out of use and the morning has a named clock.", "The first minutes are for orientation and a named lead, not improvised recovery.", recDetectLock, "A shared picture and a named incident beat twelve people improvising in Excel.", "Locked business files on a Monday morning are an incident until proven otherwise.", "The night planner starts a timeline and stops further use of the file."),
      o("zh-d01-c", "defensible", "Switch to last week's printed run sheet", "Keep vans moving while IT investigates later.", [2, 2, 1], "A few loads leave, but nobody owns the cyber event and the file may still spread.", "Continuity is useful only if someone is also containing the compromise.", recDetectLock, "A workaround needs an incident owner beside it.", "Operations and detection have to run in the same hour.", "The yard is moving. The lock banner is also moving."),
    ],
    { topicIds: ["locked-files", "initial-detection"], learningObjectiveIds: ["zh-d01-treat-lock-banner-as-incident"], departmentIds: ["incident-lead", "it-operations", "business-owners"] },
  ),
  q(
    "zh-d02",
    "detection",
    "Overnight encryption alert on packing station PS-14",
    "Endpoint protection flagged packing station PS-14 overnight for suspicious encryption behaviour. The alert sat in a shared inbox because weekend cover does not triage security mail. PS-14 is now the busiest station on the belt.",
    "It packed all night, so the alert was probably a false positive.",
    "What should the incident team do with packing station PS-14?",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-d02-a", "strong", "Take PS-14 off the line and hunt related hosts", "Preserve the host and search for the same alert pattern.", [3, 2, 3], "A likely patient-zero is stopped while other stations can still pack.", "An untriaged encryption alert is a live lead, not junk mail.", recDetectEdr, "Endpoint alerts need a human owner on every shift.", "Detection fails when security mail is optional at weekends.", "The belt lead reroutes cartons and IT begins a related-alert search."),
      o("zh-d02-b", "high-risk", "Clear the alert so packing can continue", "Mark it resolved to keep the dashboard green.", [0, 0, 0], "Encryption continues under a clean dashboard.", "Closing an alert is not the same as understanding it.", recDetectEdr, "Throughput is not evidence that a host is clean.", "Unreviewed endpoint alerts are how weekday incidents start on Sunday.", "The shared inbox is empty. Activity on PS-14 is not."),
      o("zh-d02-c", "defensible", "Watch PS-14 for another hour while it packs", "Collect more telemetry and protect the SLA.", [2, 2, 1], "You may learn a little and also lose another hour of files.", "Observation is only defensible with a kill switch and a short clock.", recDetectEdr, "Watching needs an abort condition, not a hope that packing proves safety.", "Service levels are not evidence that a host is clean.", "Cartons continue to move. So does the alert count."),
    ],
    { topicIds: ["edr-alerts", "shift-handover"], learningObjectiveIds: ["zh-d02-triage-overnight-endpoint-alerts"], departmentIds: ["technical-response", "it-operations"] },
  ),
  q(
    "zh-d03",
    "detection",
    "Forklift tablet shows the same lock screen",
    "A forklift tablet in aisle G shows the same lock screen as dispatch. The driver says it is only this device because the other trucks still operate. Someone proposes labelling it a single-device fault and sending the driver on break.",
    "One tablet is a facilities ticket, not a crisis.",
    "How should this single locked tablet be treated?",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-d03-a", "defensible", "Park that truck and keep the rest of the fleet running", "Isolate one asset and defer the wider hunt.", [2, 2, 1], "You buy time on the floor but may miss a shared account or update server.", "Narrow isolation helps only if someone still checks blast radius.", recDetectScope, "One quiet device is a clue, not a conclusion.", "Declaring a single-device incident is a scope decision. Make it on evidence.", "Aisle G is calm. Neighbouring aisles have not been checked."),
      o("zh-d03-b", "high-risk", "Call it a broken tablet and close the ticket", "Facilities can order a spare after lunch.", [0, 0, 0], "The same lock appears on the next tablet that syncs the aisle list.", "A matching lock screen on operational kit is suspected compromise, not wear and tear.", recDetectScope, "The same banner on the same morning belongs to the same incident.", "Do not shrink an incident to fit the ticket category.", "The spare tablet arrives already locked."),
      o("zh-d03-c", "strong", "Treat it as a lead: accounts, sync paths, and neighbouring devices", "Check what the tablet talks to and who signed in.", [3, 2, 3], "You find the shared aisle login used on three other devices.", "First seen is not the same as only affected.", recDetectScope, "Scope is a hunt, not an assumption.", "One device is how you start counting, not how you stop.", "The driver becomes a useful witness on sign-in and last sync."),
    ],
    { topicIds: ["incident-scope", "operational-devices"], learningObjectiveIds: ["zh-d03-one-device-is-not-the-incident"], departmentIds: ["incident-lead", "technical-response", "business-owners"] },
  ),
  q(
    "zh-d04",
    "detection",
    "Forty tickets and no incident record",
    "Helpdesk has a Monday pile: locked Excel, slow scanners, password loops, and questions about whether the warehouse system is down on purpose. Nobody has opened an incident record. An agent is closing related tickets as a known Wi-Fi issue.",
    "If it is in the ticket tool, it counts as handled.",
    "How should helpdesk organise these related reports?",
    ["NIST IR", "NIST CSF 2.0"],
    [
      o("zh-d04-a", "high-risk", "Keep closing them as a Wi-Fi issue", "One category reduces visible panic.", [0, 1, 0], "Related symptoms scatter and the timeline becomes unreliable.", "Mis-tagging is how a cyberattack hides in a queue.", recDetectRecord, "An incident needs a spine, not a pile of unrelated tickets.", "Tickets without a parent incident are rumours with numbers.", "The known Wi-Fi issue now covers encryption alerts as well."),
      o("zh-d04-b", "defensible", "Create one large ticket and keep taking calls", "One record, still no commander.", [2, 2, 1], "Facts land in one place, but nobody is empowered to contain.", "A record without a named lead is still a queue.", recDetectRecord, "The document is not the organisation.", "Incident records exist to coordinate people, not only to store complaints.", "The combined ticket has dozens of comments and no decisions."),
      o("zh-d04-c", "strong", "Open one incident, name a lead, and link the tickets", "Helpdesk feeds the room; the room decides.", [3, 2, 3], "Symptoms start telling one story and someone owns the next hour.", "Detection includes creating the organisational object you will run.", recDetectRecord, "This is how Monday noise becomes a coordinated response.", "If it is not in the incident record, the next person will not see it.", "A scribe is named and tickets are linked to a single parent."),
    ],
    { topicIds: ["incident-record", "helpdesk-triage"], learningObjectiveIds: ["zh-d04-tickets-are-not-the-incident"], departmentIds: ["incident-lead", "it-operations"] },
  ),
  q(
    "zh-d05",
    "detection",
    "Warehouse logs were cleared at 05:00",
    "The warehouse system disk was 94 percent full at 05:00. Night IT ran the usual job to clear old logs so Monday receiving could start. The job finished just as lock banners appeared on packing PCs.",
    "We always delete old logs on Monday so receiving can start.",
    "What should happen to warehouse logs right now?",
    ["NIST IR", "NIST CSF 2.0"],
    [
      o("zh-d05-a", "strong", "Stop the job, snapshot what remains, and record the gap", "Write the missing window on the incident board.", [3, 2, 3], "Remaining evidence is kept and the missing hour is documented.", "A documented gap is still a fact. A silent wipe is a second problem.", recDetectLogs, "Evidence needs honesty more than a perfect disk.", "Preserving logs is part of detection, not a later forensic hobby.", "The board now shows a missing window and a stopped cleaner job."),
      o("zh-d05-b", "high-risk", "Run the cleaner again to free more space", "A tidy disk is treated as a healthy disk.", [0, 0, 0], "The last useful hours of warehouse activity vanish.", "Do not destroy remaining evidence because the disk is full.", recDetectLogs, "Free space is not worth a missing attacker timeline.", "Routine maintenance can destroy incident evidence if nobody pauses it.", "The disk is spacious and no longer informative."),
      o("zh-d05-c", "defensible", "Copy remaining logs to an unmarked USB stick from the office", "Better than nothing, with weak chain of custody.", [2, 1, 2], "You may save files and also mix chain of custody with an untracked device.", "Ad-hoc copies help only if you label, hash, and stop further deletion.", recDetectLogs, "A controlled snapshot beats an unlabelled souvenir.", "Preservation needs a method, not only speed.", "The copy exists, but nobody recorded a hash or custodian."),
    ],
    { topicIds: ["log-preservation", "evidence"], learningObjectiveIds: ["zh-d05-stop-overwriting-logs-in-an-incident"], departmentIds: ["technical-response", "it-operations"] },
  ),
  q(
    "zh-d06",
    "detection",
    "Staff are rebooting locked PCs",
    "Three pickers have already hard-rebooted locked PCs because that is how the label printer is usually recovered. One machine now sits on a disk-repair screen. Another came back locked faster.",
    "A reboot usually clears printer faults. Should we try it again?",
    "What instruction should go to staff on locked PCs?",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-d06-a", "defensible", "Allow one controlled restart on a spare host, recorded", "Experiment on a sacrificial box, not the fleet.", [2, 1, 2], "You might learn a behaviour and still burn one evidence source.", "A single instrumented test is a trade-off. A floor-wide reboot is not.", recDetectReboot, "If you must test, do it once, logged, and off the critical path.", "Curiosity needs a lab, not a pick face.", "The spare is restarted under observation. The fleet stays powered on."),
      o("zh-d06-b", "high-risk", "Tell everyone to reboot twice more", "Treat a third restart as the recovery plan.", [0, 0, 0], "Encryption progresses and traces vanish across the aisle.", "Rebooting through ransomware is not a recovery plan.", recDetectReboot, "Stop the helpful damage first.", "User workarounds can finish what the malware started.", "More machines are now mid-restart and mid-encryption."),
      o("zh-d06-c", "strong", "Hands off, screenshot, and report in the incident channel", "Leave machines on. Stop the reboot workaround.", [3, 2, 3], "Remaining evidence stays put and the floor gets one instruction.", "People will keep attempting local fixes unless you give them a better job.", recDetectReboot, "Staff are sensors when you tell them what good looks like.", "The first containment of many incidents is stopping helpful reboots.", "Reboots stop. Screenshots and reports start arriving in one channel."),
    ],
    { topicIds: ["user-behaviour", "evidence-preservation"], learningObjectiveIds: ["zh-d06-stop-reboots-on-locked-hosts"], departmentIds: ["incident-lead", "it-operations", "business-owners"] },
  ),
  q(
    "zh-d07",
    "detection",
    "What is actually broken this morning",
    "Yard gates still open. Payroll on the mezzanine looks fine. Warehouse management screens are locked. The customer portal is slow. Someone has circled one system on a laminated map and called it the outage.",
    "If the gates work, we are not in an incident.",
    "How should the team describe what is actually affected?",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-d07-a", "high-risk", "Declare only warehouse management down and ignore the rest", "One system, one story, less paperwork.", [0, 1, 0], "You miss portal and identity symptoms that change the response.", "Partial maps create false confidence.", recDetectMap, "Name what works and what does not, with owners.", "You cannot coordinate what you have not listed.", "The map now understates the incident."),
      o("zh-d07-b", "strong", "Build affected versus working with named owners", "Gates, warehouse management, portal, payroll, scanners — each has a status and an owner.", [3, 3, 3], "Leaders can choose what to protect without guessing.", "Impact mapping is how detection becomes a decision.", recDetectMap, "A shared picture is the cheapest coordination tool you have.", "Severity follows the business map, not the loudest room.", "The board now shows working and affected services with owners."),
      o("zh-d07-c", "defensible", "Trust the green IT dashboard and walk the floor later", "The monitoring view is currently calm.", [1, 2, 1], "Agents on locked PCs are silent, so the dashboard stays green.", "Dashboards lie when the sensors are the patients.", recDetectMap, "Look at the floor and the accounts, not only the chart.", "Telemetry gaps are findings, not comfort.", "The dashboard remains green while locked screens multiply on the floor."),
    ],
    { topicIds: ["impact-mapping", "affected-systems"], learningObjectiveIds: ["zh-d07-inventory-affected-versus-working"], departmentIds: ["incident-lead", "business-owners", "it-operations"] },
  ),
  q(
    "zh-d08",
    "detection",
    "Supervisor account signed in from two places",
    "Warehouse supervisor N. Patel badged in at 05:55. Identity logs also show a successful login from an unfamiliar country at 05:41 using the same account, then a burst of file-share access. Patel is on the floor and appears confused, not hostile.",
    "People travel. Could that login be a VPN or a delayed session?",
    "How should this suspicious supervisor login be handled?",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-d08-a", "strong", "Challenge the account, keep the log, and hunt related sessions", "Disable or reset, terminate sessions, and see who else jumped.", [3, 2, 3], "A likely stolen login stops walking the file share.", "Impossible travel on a privileged warehouse account is suspected compromise.", recDetectLogin, "Treat the person fairly and the credential as burned.", "Identity alerts are detection even when the human is standing in front of you.", "Patel is relieved to be believed. The remote session is cut."),
      o("zh-d08-b", "high-risk", "Ask Patel to keep working because it is peak", "The floor needs that login for the wave.", [0, 0, 0], "The other session keeps copying while the real human picks orders.", "A live person does not prove a live-only session.", recDetectLogin, "Operations cannot borrow a possibly stolen identity.", "Suspicious logins are not a staffing problem first.", "The unfamiliar session downloads another folder."),
      o("zh-d08-c", "defensible", "Watch the foreign session without touching it", "Collect more of the playbook before acting.", [2, 1, 2], "You may collect intelligence and also lose more files.", "Monitoring without a short kill plan is a stall, not a strategy.", recDetectLogin, "Observe only with an abort condition and a clock.", "Attribution is optional. Stopping the session is not.", "The session remains open while more share access accumulates."),
    ],
    { topicIds: ["suspicious-logins", "identity"], learningObjectiveIds: ["zh-d08-treat-impossible-travel-as-compromise"], departmentIds: ["technical-response", "incident-lead", "hr"] },
  ),
  q(
    "zh-d09",
    "detection",
    "Lorries left on time, so how severe is this",
    "Two outbound lorries left on time. A shift manager wants the incident logged as low — business as usual — so the 08:30 operations call stays short. Endpoint alerts and locked finance shares arrived in the same hour.",
    "If the yard is moving, severity is only a paperwork setting.",
    "How should initial incident severity be set?",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-d09-a", "defensible", "Call it medium and review at 09:00", "Avoid panic, keep a clock.", [2, 2, 1], "You may under-call spread, but you at least refuse a permanent low rating.", "A time-boxed severity is better than a comforting label.", recDetectSev, "Severity is a working hypothesis with an expiry.", "Under-classifying delays legal, vendor, and executive support.", "The operations call is shorter. Malicious activity is not."),
      o("zh-d09-b", "strong", "Set high based on signs of spread, then refine", "Trucks leaving does not cancel locked shares and endpoint alerts.", [3, 2, 3], "The right people join early. You can step down later with evidence.", "Initial severity should reflect worst plausible impact plus indicators of malicious activity.", recDetectSev, "It is cheaper to over-convene for an hour than to under-convene for a day.", "Business as usual is an outcome you earn, not a starting label.", "The 08:30 call includes locked shares and endpoint alerts as facts."),
      o("zh-d09-c", "high-risk", "Mark low so nobody escalates", "Protect the morning agenda.", [0, 0, 0], "Containment waits for a meeting that will now never happen.", "Severity is a coordination tool, not a mood.", recDetectSev, "Do not hide a cyberattack in a calm agenda.", "Low severity is how specialists arrive after encryption finishes.", "The agenda stays calm. The file share does not."),
    ],
    { topicIds: ["severity", "escalation-threshold"], learningObjectiveIds: ["zh-d09-set-initial-severity-from-impact-and-spread"], departmentIds: ["incident-lead", "leadership", "business-owners"] },
  ),
  q(
    "zh-c01",
    "containment",
    "PS-14 is still packing and encrypting",
    "Packing station PS-14 is isolated only on paper: an out-of-service note is taped to the monitor. The network cable is still connected, the belt is still feeding it, and a supervisor wants it to finish the current wave because it is almost done.",
    "It is almost finished. Pulling it now will miss the SLA.",
    "How should packing station PS-14 be contained?",
    ["NIST IR", "NIST CSF 2.0"],
    [
      o("zh-c01-a", "high-risk", "Let it finish the wave", "Keep the station online for about ninety more minutes.", [0, 1, 0], "Those ninety minutes become a path onto the share.", "Availability without isolation is a gift to the attacker.", recContainHost, "A wave is not worth a wider incident.", "Containment is a now action, not an after-the-wave action.", "The wave finishes. So does another folder."),
      o("zh-c01-b", "strong", "Disconnect the network, keep power, and reroute the belt", "Evidence stays. The host loses its path.", [3, 2, 3], "Encryption on neighbouring hosts slows and packing continues on other stations.", "Isolate the host. Do not power it off unless you must.", recContainHost, "You can protect the line and the evidence at once.", "A paper notice is not a network control.", "The cable is out. Power stays on. The belt is rerouted."),
      o("zh-c01-c", "defensible", "Power it off completely", "A dead machine cannot encrypt.", [2, 1, 1], "Spread stops on that box and you may lose volatile evidence and a clean shutdown trail.", "Hard power-off is a trade-off when you cannot isolate any other way.", recContainHost, "Network isolation is usually enough and kinder to the investigation.", "Containment should be as precise as the minute allows.", "The station is quiet. Volatile evidence is gone."),
    ],
    { topicIds: ["host-isolation", "warehouse-operations"], learningObjectiveIds: ["zh-c01-isolate-without-finishing-the-wave"], departmentIds: ["technical-response", "business-owners", "it-operations"] },
  ),
  q(
    "zh-c02",
    "containment",
    "Warehouse PCs still mount the finance share",
    "Aisle PCs still mount the finance invoice share because accounts needs proof-of-delivery photos. That share is where this morning's lock banners started. Network diagrams show one flat VLAN and a firewall rule last reviewed in 2019.",
    "Accounts still needs those photos or invoices will not match.",
    "What should happen to the warehouse-to-finance file share?",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-c02-a", "strong", "Cut warehouse-to-finance access until the path is proven clean", "Offer a manual photo drop with an owner if invoices must still move.", [3, 2, 3], "A likely spread path closes. A slower invoice path stays honest.", "Segmentation during an incident is allowed to be temporary and imperfect.", recContainSeg, "A named workaround is still a control.", "Flat networks turn one locked PC into a company-wide tour.", "Finance accepts a slower, owned photo drop while the share is cut."),
      o("zh-c02-b", "high-risk", "Leave the share up so invoices still match", "Protect month-end matching above isolation.", [0, 1, 0], "Ransomware keeps walking a trusted corridor.", "Process continuity is not an excuse to keep the blast radius open.", recContainSeg, "Month-end can wait behind a closed path.", "If two teams share a drive, they share an incident.", "Month-end matching continues on a share that is still encrypting."),
      o("zh-c02-c", "defensible", "Set the share read-only for an hour", "Photos in, malware maybe out.", [2, 2, 1], "You reduce some risk and may still allow a write you did not mean, or block a responder.", "Read-only is a compromise that needs testing, not assuming.", recContainSeg, "If you cannot verify the control, prefer a cut with a workaround.", "A half-open door is still a door.", "A photo upload fails. Write access may still exist on another mapping."),
    ],
    { topicIds: ["segmentation", "east-west-movement"], learningObjectiveIds: ["zh-c02-cut-flat-paths-between-functions"], departmentIds: ["technical-response", "business-owners", "it-operations"] },
  ),
  q(
    "zh-c03",
    "containment",
    "Shared picker account will not log off",
    "Shared aisle account PICK-WEST is still logged into warehouse management on six terminals. One of those sessions spawned the overnight encryption alert. Nobody wants to disable it because the west wave starts in twenty minutes and that is how west picking works.",
    "If you disable PICK-WEST, the west wave cannot start.",
    "What should happen to the shared PICK-WEST account?",
    ["NIST IR", "NIST CSF 2.0"],
    [
      o("zh-c03-a", "defensible", "Disable after the west wave", "Twenty minutes more, then hygiene.", [1, 2, 1], "Those twenty minutes may be the ones that matter.", "Delaying identity containment to protect a wave is a real trade-off. Name the risk out loud.", recContainAcct, "If you delay, put a watcher on that account and a hard stop.", "Compromised identities do not honour your timetable.", "The west wave starts. The compromised account is still live."),
      o("zh-c03-b", "strong", "Disable PICK-WEST, terminate sessions, and issue named logins", "Use break-glass supervisor accounts for the wave.", [3, 2, 3], "The stolen identity stops multiplying. Picking continues under people you can name.", "You can keep operations without keeping the hole.", recContainAcct, "Named logins are slower and survivable.", "Shared operational accounts turn one compromise into a shift-wide incident.", "West picking continues on named accounts. PICK-WEST sessions are dead."),
      o("zh-c03-c", "high-risk", "Reset the shared password and display it on the warehouse screens", "New shared secret, same shared account.", [0, 1, 0], "You re-invite everyone, including whoever already stole the old password, and you publish the new one.", "A floor display is not an identity control.", recContainAcct, "Stop the account. Do not republish it.", "A password change without session termination is theatre.", "The new password is now visible to the floor and in photos on several phones."),
    ],
    { topicIds: ["compromised-accounts", "shared-logins"], learningObjectiveIds: ["zh-c03-disable-shared-compromised-identities"], departmentIds: ["technical-response", "it-operations", "business-owners"] },
  ),
  q(
    "zh-c04",
    "containment",
    "Suspicious activity on a privileged warehouse PC",
    "An endpoint alert shows an unknown process making outbound connections from a warehouse PC. A supervisor is currently signed in with a local administrator account normally used to maintain legacy printer software.",
    "We need that administrator login. It is how we keep the label printers running.",
    "What should IT and Security do first?",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-c04-a", "strong", "Isolate the PC and revoke the active privileged session", "Disconnect from the network, revoke the session, and preserve logs.", [3, 2, 3], "The unknown process loses its outbound path and the privileged session cannot be reused.", "Immediate containment is isolate-and-revoke. Longer-term privilege design comes after the host is contained.", recContainPriv, "An active privileged session on a suspect host is a live highway, not a printer-support issue.", "Privileged access in an incident is a containment surface. Isolate first, then redesign standing local admin.", "The PC is off the network. The administrator session is revoked. Logs are held."),
      o("zh-c04-b", "high-risk", "Ask the supervisor to sign out and reinstall the printer software", "Treat it as a local application fault.", [0, 1, 0], "Evidence is overwritten and the host stays on the network with a privileged account nearby.", "Reinstalling software destroys forensic value and does not contain outbound activity.", recContainPriv, "Do not remediate a suspect privileged host by wiping and hoping.", "A sign-out plus reinstall is neither isolation nor evidence preservation.", "The printer software is being reinstalled. The unknown process had time to keep talking outbound."),
      o("zh-c04-c", "defensible", "Remove administrator rights from every warehouse PC immediately", "Estate-wide privilege reduction without isolating this host.", [2, 2, 1], "You start a sensible follow-up control while the affected device remains connected and the active session may still run.", "Removing standing local admin across the warehouse is good governance. It does not contain the device that is already talking outbound.", recContainPriv, "Contain the affected PC first. Then replace standing local admin with managed elevation, just-in-time access, or documented emergency access.", "A fleet-wide privilege change is a follow-up, not a substitute for isolating the compromised host.", "Group Policy work begins. The warehouse PC with the unknown process is still on the network."),
    ],
    { topicIds: ["privileged-access", "least-privilege"], learningObjectiveIds: ["zh-c04-remove-standing-admin-during-response"], departmentIds: ["technical-response", "it-operations"] },
  ),
  q(
    "zh-c05",
    "containment",
    "Remote planners are still on the VPN",
    "Home-based planners and several drivers are on the corporate VPN, syncing delivery PDFs. One planner is working from a train on a laptop that has a local administrator account and an always-on VPN profile. Bulk sync is still enabled because Monday packs are large.",
    "Remote staff still need the PDFs or customers will not get paperwork.",
    "How should remote access and bulk sync be handled?",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-c05-a", "high-risk", "Tell them to keep syncing so customers get PDFs", "Treat remote access as ordinary service.", [0, 1, 0], "Home endpoints keep feeding or drawing from a sick estate.", "Remote access is part of the warehouse now.", recContainVpn, "A PDF is not worth a second site of infection.", "VPN without session control extends the incident to every connected laptop.", "Bulk sync continues from unmanaged home devices."),
      o("zh-c05-b", "defensible", "Ask people to disconnect", "A chat message requesting voluntary drop-off.", [1, 2, 1], "Half stay on for one more file.", "Voluntary disconnect is not a control.", recContainVpn, "Force the session end, then explain.", "Politeness is not network isolation.", "Several people reply that they will disconnect in a moment."),
      o("zh-c05-c", "strong", "Terminate risky sessions, pause bulk sync, and keep responder VPN only", "Break-glass remote access only, watched.", [3, 2, 3], "Home PCs stop amplifying the morning. Responders can still work.", "Identity and remote access are containment, not afterthoughts.", recContainVpn, "You can pause sync without pausing the company forever.", "The edge of Northstar includes every laptop that dials in.", "Risky sessions are cut. A watched responder path remains."),
    ],
    { topicIds: ["remote-access", "session-control"], learningObjectiveIds: ["zh-c05-contain-vpn-and-sync"], departmentIds: ["technical-response", "it-operations", "incident-lead"] },
  ),
  q(
    "zh-c06",
    "containment",
    "Carrier still expects the 08:00 routing file",
    "A scheduled SFTP drop still pushes today's routing file to a long-haul carrier. The job account lives on a server in the same subnet as locked packing PCs. The carrier's automated retry is already running.",
    "If we miss the drop, trailers sit. If we send it, we might send more than a route file.",
    "What should happen to the scheduled carrier file transfer?",
    ["DORA", "NIST CSF 2.0"],
    [
      o("zh-c06-a", "strong", "Pause the job, tell the carrier by phone, and reopen later with an owner", "Human confirmation, no unreviewed payload.", [3, 2, 3], "You stop an unreviewed path and you do not leave a partner without notice.", "Third-party connections are part of containment, not background noise.", recContainVendorLink, "A phone call is cheaper than a contaminated drop.", "Vendor links inherit your incident whether you mention it or not.", "The carrier is told to wait. The job stays paused with an owner."),
      o("zh-c06-b", "high-risk", "Let the 08:00 file go because customers come first", "The job has always been fine.", [0, 1, 0], "A trusted pipe carries whatever the sick server will give it.", "Past reliability is not a control on Monday morning.", recContainVendorLink, "Pause until someone vouches for the path.", "Automation will faithfully export your worst morning.", "The retry succeeds. The payload is unreviewed."),
      o("zh-c06-c", "defensible", "Send a small test file by hand", "Prove the pipe, skip the bulk.", [2, 2, 1], "You may reduce volume and still use a compromised account or host.", "Manual exceptions need the same isolation questions as the job.", recContainVendorLink, "Change the host and the identity, not only the file size.", "Smaller is not the same as cleaner.", "A small file leaves from the same sick account."),
    ],
    { topicIds: ["third-party-connections", "data-flows"], learningObjectiveIds: ["zh-c06-pause-unreviewed-partner-links"], departmentIds: ["vendors", "business-owners", "technical-response"] },
  ),
  q(
    "zh-c07",
    "containment",
    "Lookalike mail asking staff to reset warehouse passwords",
    "Staff are receiving internal-looking mail asking them to reset warehouse passwords via a portal. The sending mailbox is a lookalike created this morning. Helpdesk phones are lighting up with people who already submitted credentials to be helpful.",
    "It used the Northstar colours. Several people already completed the form.",
    "How should the lookalike password-reset campaign be contained?",
    ["NIST IR", "NIST CSF 2.0"],
    [
      o("zh-c07-a", "defensible", "Warn on posters in the canteen only", "Awareness for people who walk past a sign.", [1, 2, 1], "Remote planners never see the poster. Some staff still click.", "Awareness without identity containment leaves the mailbox live.", recContainMail, "Block the path, then tell people.", "You cannot poster your way out of an active mail incident.", "Canteen posters go up. Remote clickers are not reached."),
      o("zh-c07-b", "high-risk", "Reply-all with the sample so everyone can spot it", "Treat redistribution as education.", [0, 1, 0], "You mail a live lure to the whole company.", "Do not redistribute malicious mail as training.", recContainMail, "Describe it. Do not forward it.", "Amplifying the attacker is not containment.", "The lure now has a second, official-looking thread."),
      o("zh-c07-c", "strong", "Block the sender, freeze lookalike mailboxes, reset clickers, and use another channel", "Tannoy, a known Teams team, or a manager cascade — not the attacker's thread.", [3, 2, 3], "The campaign loses its runway and victims get real credential care.", "Email and identity containment belong together.", recContainMail, "Tell people through a path the lookalike does not own.", "Contain the mailbox, the portal, and the people who already typed.", "Helpdesk now has a script: block, reset, and report through the known channel."),
    ],
    { topicIds: ["email-containment", "identity"], learningObjectiveIds: ["zh-c07-contain-lookalike-mail-and-clickers"], departmentIds: ["technical-response", "communications", "it-operations"] },
  ),
  q(
    "zh-c08",
    "containment",
    "Training warehouse is still healthy",
    "Northstar's small training warehouse-management system on a separate site is still healthy. A planner wants to point live orders at it just for today because the screens look the same. The training site uses a copied production database from last month and a shared VPN profile.",
    "It looks like production and it is still up. Can we fail over to it for today?",
    "Should live orders be switched to the training warehouse?",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-c08-a", "strong", "Keep it off the infected network. Do not dump live orders on it", "If you must use it, copy only what you need after a security review.", [3, 2, 3], "You still have a clean reference environment.", "Unaffected environments are assets to protect, not spare production.", recContainClean, "A training box is not a disaster-recovery site just because it is up.", "Do not spend your last clean island on an unplanned cutover.", "The training site stays isolated and unused for live orders."),
      o("zh-c08-b", "high-risk", "Point live picking at training now", "Same screens, different building.", [0, 1, 0], "You may import the attacker via VPN, data, or hurried copy-paste.", "Improvised failovers spread incidents into the last safe room.", recContainClean, "Disaster recovery is designed. This is a hope.", "Clean is a state you can lose in one unplanned afternoon.", "Training now has live customer addresses and a new lock banner."),
      o("zh-c08-c", "defensible", "Use training read-only to check yesterday's stock figures", "Look, do not book.", [2, 2, 1], "You might get numbers without booking orders, if access is truly read-only and off the sick path.", "Even read-only needs a controlled route.", recContainClean, "Name who connects, from where, and when it stops.", "Limited use is a trade-off, not a free option.", "Someone still tries to confirm a pick in the training system."),
    ],
    { topicIds: ["protect-clean-environments", "failback"], learningObjectiveIds: ["zh-c08-do-not-burn-the-clean-site"], departmentIds: ["technical-response", "business-owners", "it-operations"] },
  ),
  q(
    "zh-c09",
    "containment",
    "Proposal to pull the core switch",
    "A technician stands at the site communications cabinet. Pulling the core switch would stop every locked PC — and the yard cameras, the gate, the remaining healthy pack stations, and the phone to the carrier. A director says to kill it from the car park.",
    "If it has a light, take it down. We can sort the rest later.",
    "How wide should containment go?",
    ["NIST IR", "NIST CSF 2.0"],
    [
      o("zh-c09-a", "defensible", "Pull the core if you cannot target isolation in the next ten minutes", "Accept a black site to stop encryption you cannot otherwise see.", [2, 0, 2], "Spread may stop. So does every controlled workaround, and you now own a total outage.", "Broad shutdown can be justified when targeting is impossible. It is still a leadership decision with an operations cost.", recContainScope, "If you do it, write why, who authorised it, and what comes back first.", "Site-wide shutdown is a choice, not a default.", "The cabinet is powered down. The yard loses cameras, gates, and phones."),
      o("zh-c09-b", "strong", "Isolate known-bad VLANs and identity first", "Keep gate, phones, and clean pack lines if they are truly separate.", [3, 2, 3], "You slow the attack without inventing a second disaster.", "Targeted containment is the default. Site-wide is the exception.", recContainScope, "Prefer precise isolation before a full shutdown.", "A director's urgency does not replace a network map.", "Known-bad VLANs are cut. Gate and phones stay up."),
      o("zh-c09-c", "high-risk", "Leave everything up so something still ships", "Protect uptime and hope healthy systems stay healthy.", [0, 1, 0], "The malware uses your uptime as infrastructure.", "Hoping the healthy bits stay healthy is not a design.", recContainScope, "Uptime can be attacker infrastructure.", "Shipping is not a substitute for isolation.", "A pallet leaves. Encryption continues on the share."),
    ],
    { topicIds: ["containment-scope", "shutdown-decisions"], learningObjectiveIds: ["zh-c09-prefer-targeted-isolation-over-site-kill"], departmentIds: ["incident-lead", "leadership", "technical-response"] },
  ),
  q(
    "zh-e01",
    "escalation",
    "Three people think they are in charge",
    "IT support, a warehouse shift lead, and an agency contractor all believe they are running the morning. The contractor has been giving instructions over the warehouse tannoy from a draft slide titled incident room. Decisions are travelling by shout.",
    "I have slides. Someone has to take control of the floor.",
    "How should command of this incident be organised?",
    ["NIST IR", "DORA"],
    [
      o("zh-e01-a", "high-risk", "Let the loudest voice win", "Authority follows volume.", [0, 0, 0], "Contradictory orders hit the floor: isolate, do not isolate, reboot.", "Authority needs a name, not volume.", recEscLead, "One voice out, one log in.", "Unclear command creates three containments and zero decisions.", "A third, conflicting instruction goes out over the tannoy."),
      o("zh-e01-b", "strong", "Name a coordinator, a technical lead, and a scribe", "Roles, not volume. The contractor can still take notes.", [3, 2, 3], "People know where facts go and who can say stop.", "Coordination is an appointment, not whoever speaks first.", recEscLead, "This unblocks every later choice.", "Someone must own the clock. That someone is assigned, not assumed.", "Roles are posted. The contractor becomes scribe and the shouting stops."),
      o("zh-e01-c", "defensible", "Split: warehouse owns trucks, IT owns PCs, nobody owns the room", "Function leads without a single coordinator.", [2, 2, 1], "Handoffs fall through the crack in the middle.", "Split ownership still needs a single incident coordinator.", recEscLead, "A room still needs a chair.", "Function leads are not a substitute for one incident spine.", "Two huddles open. Neither has the full picture."),
    ],
    { topicIds: ["incident-coordinator", "command"], learningObjectiveIds: ["zh-e01-appoint-one-incident-coordinator"], departmentIds: ["incident-lead", "leadership", "it-operations"] },
  ),
  q(
    "zh-e02",
    "escalation",
    "Helpdesk is approving every isolation",
    "The service desk manager has been approving every isolation because they own the ticket queue. The person who understands the warehouse network is on a forklift walk-through and has not been asked. Isolation of the west VLAN is waiting on a ticket comment.",
    "If it is not in the queue, it is not authorised.",
    "Who should have authority to isolate the west VLAN?",
    ["NIST IR", "NIST CSF 2.0"],
    [
      o("zh-e02-a", "strong", "Name technical response. Helpdesk feeds them", "Tickets become inputs. Isolation authority sits with the technical lead.", [3, 2, 3], "The west VLAN can be cut without a comment thread.", "Helpdesk is a sensor and a customer channel, not automatically the technical owner.", recEscTech, "Put expertise where the blast radius is.", "Technical ownership is assigned for the incident, not inherited from the queue.", "The network owner is pulled in. The west VLAN is isolated."),
      o("zh-e02-b", "high-risk", "Keep approving isolation only via ticket comments", "Treat the queue as the audit trail.", [0, 1, 0], "The attacker does not wait for comment number twelve.", "Process theatre is not technical command.", recEscTech, "Log decisions in the incident record. Do not hide them in a queue.", "An audit trail that arrives after encryption is a diary, not a control.", "The ticket waits. The share does not."),
      o("zh-e02-c", "defensible", "Pair helpdesk and the network person on a recorded call", "Two owners for one hour.", [2, 2, 1], "You may get speed if they truly share a clock. You may also get polite deadlock.", "A pairing works only if one of them can say cut.", recEscTech, "Dual control needs a designated decision-maker.", "Collaboration without a decision right is delay.", "The call is useful and slightly too long. Isolation is still pending."),
    ],
    { topicIds: ["technical-ownership", "helpdesk-role"], learningObjectiveIds: ["zh-e02-separate-queue-from-technical-command"], departmentIds: ["technical-response", "it-operations", "incident-lead"] },
  ),
  q(
    "zh-e03",
    "escalation",
    "Managing director wants to pay from the car park",
    "The managing director calls from the car park: pay whatever they ask, keep the peak, and do not involve too many people. The ransom note is only an hour old. Finance has not been briefed. Nobody has written options down.",
    "I can authorise payment from here. We cannot miss peak.",
    "How should the managing director's payment request be handled?",
    ["DORA", "NIST IR"],
    [
      o("zh-e03-a", "high-risk", "Pay from the car park on speakerphone", "Treat speed as leadership.", [0, 0, 0], "You start a payment path with no counsel, no record, and no idea if restore even works.", "Extortion is not a car-park decision.", recEscExec, "Executives set risk appetite. They still need a briefing pack.", "Being senior does not make a cryptocurrency transfer a control.", "Finance asks which cost centre to use. There is still no written decision."),
      o("zh-e03-b", "strong", "Short briefing: facts, options, next update, no payment yet", "Bring finance and counsel into a logged path.", [3, 2, 3], "Leadership stays in the loop without burning the company's position.", "Executives need options, not a ransom portal on a phone.", recEscExec, "A cadence beats a panic transfer.", "Payment, if ever, is a last-resort decision with recorded advice, not a reflex.", "The managing director stays on the line for a five-minute briefing, then waits for the next update."),
      o("zh-e03-c", "defensible", "Ask the managing director to stay away until everything is known", "Protect them from the mess.", [1, 2, 1], "You may keep them from harming the response and also starve the incident of authority when you need a business call.", "Shielding executives entirely creates a vacuum.", recEscExec, "Brief early, decide later, keep them on a clock.", "Leadership is a stakeholder, not a spectator or a freelancer.", "The car park call becomes a rumour. Authority is unclear."),
    ],
    { topicIds: ["executive-role", "ransom-governance"], learningObjectiveIds: ["zh-e03-brief-executives-do-not-freelance-payment"], departmentIds: ["leadership", "incident-lead", "legal-privacy"] },
  ),
  q(
    "zh-e04",
    "escalation",
    "Monday patch window is still on the calendar",
    "The usual Monday patch window starts at 09:00. An operations engineer wants to patch everything that looks unhealthy, including boxes you are still imaging. Another wants to freeze all changes, including the isolation rule you need.",
    "The change calendar invited us. Do we still patch?",
    "What should happen to the Monday change window?",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-e04-a", "defensible", "Allow only isolation and evidence snapshots", "Tiny change list, named approver.", [2, 2, 1], "You may miss a needed patch on an exposed edge, but you stop chaos.", "A tight allowlist is a reasonable freeze design.", recEscOps, "Write the allowed change types on the board.", "Incident freeze is a filter, not a shutdown of all work.", "The calendar meeting becomes a stand-up with a short allowlist."),
      o("zh-e04-b", "high-risk", "Patch every unhealthy box, including evidence hosts", "Treat green ticks as recovery.", [0, 1, 0], "You destroy forensic value and mix your fingerprints with the attacker's.", "Looking healthy is not the same as being preserved.", recEscOps, "Do not remediate the crime scene first.", "Uncontrolled change during incident response is a second incident.", "The evidence host is now patched and forensically weaker."),
      o("zh-e04-c", "strong", "Freeze routine work, ticket break-glass, same clock as the incident", "Isolation yes. Unrelated landscaping no.", [3, 2, 3], "IT operations becomes part of command instead of a parallel universe.", "Operations owns the pipes. The incident owns the freeze list.", recEscOps, "Put operations in the room with authority and constraints.", "A change window is not senior to a live cyberattack.", "Routine patches are cancelled. Isolation changes are ticketed against the incident."),
    ],
    { topicIds: ["it-operations", "change-freeze"], learningObjectiveIds: ["zh-e04-put-ops-on-the-incident-clock"], departmentIds: ["it-operations", "incident-lead", "technical-response"] },
  ),
  q(
    "zh-e05",
    "escalation",
    "Who decides what still ships",
    "Security wants the west pack line off until identity is clean. The warehouse manager wants it on because a retailer penalty clause starts at noon. Both are talking to different deputies. Nobody has written the trade-off.",
    "We will feel our way through it as the morning goes on.",
    "Who decides whether the west pack line stays open?",
    ["DORA", "NIST CSF 2.0"],
    [
      o("zh-e05-a", "strong", "Business owner decides service, security sets the safety limit, write it down", "Noon penalty versus spread: a recorded choice.", [3, 3, 3], "You get a decision that can be explained later, not a tug of war.", "Business owners prioritise. Technical leads bound what is safe enough to run.", recEscBiz, "Trade-offs belong in the incident log.", "Cyber decisions are business decisions with technical constraints.", "The retailer clause is now a line on the board, with an owner and a limit."),
      o("zh-e05-b", "high-risk", "Let whoever is more stressed win in the moment", "Peak energy decides.", [0, 0, 0], "The line flickers on and off. Nobody can reconstruct why.", "Stress is not a RACI.", recEscBiz, "Name the owner of the business call.", "If both win in alternate minutes, the attacker also wins.", "Two deputies now have opposite instructions."),
      o("zh-e05-c", "defensible", "Keep the line up with extra human checks", "People watching people picking.", [2, 2, 1], "You may catch some bad behaviour and still miss silent encryption.", "Compensating humans are a real trade-off, not a full control.", recEscBiz, "If you accept residual risk, the business owner signs it.", "Monitoring with people has a range of about one aisle.", "A supervisor with a checklist becomes an unofficial control."),
    ],
    { topicIds: ["business-ownership", "risk-acceptance"], learningObjectiveIds: ["zh-e05-business-owner-sets-priorities-within-limits"], departmentIds: ["business-owners", "incident-lead", "leadership"] },
  ),
  q(
    "zh-e06",
    "escalation",
    "Right-to-work scans sit on the locked share",
    "HR realises contractor right-to-work scans sit on the same file share that locked this morning. They do not know if anything was copied. A well-meaning HR partner wants to email all contractors tonight just in case. Legal has a voicemail. Privacy is travelling.",
    "If we tell everyone immediately, we are being transparent.",
    "How should possible exposure of right-to-work documents be handled?",
    ["NIST IR", "DORA"],
    [
      o("zh-e06-a", "high-risk", "Mass-email contractors that their passports were stolen", "Get ahead of it.", [0, 1, 0], "You announce a personal-data incident you have not established, and you may cause harm and legal noise.", "Suspicion is not a confirmed breach notice.", recEscLegal, "Involve privacy and legal before you notify people as if it were fact.", "No single job title is always legally responsible. The organisation has a process, and counsel advises it.", "Contractors receive a panic email. Facts are still unknown."),
      o("zh-e06-b", "strong", "Loop legal and privacy in now. Preserve the share. No public claim yet", "Facts versus unknowns on a clock.", [3, 2, 3], "Duties get a path. The incident lead still runs containment.", "Privacy joins early when personal data may be in scope. They do not take over the warehouse.", recEscLegal, "Early involvement is how you avoid both silence and fiction.", "Legal and privacy advise. Operations still contain. Communications still need approved words.", "Privacy joins the bridge. The share is preserved. No notice has gone out yet."),
      o("zh-e06-c", "defensible", "Wait for a full forensic report before telling anyone, including counsel", "Perfect facts only.", [1, 2, 1], "You may preserve calm and miss notification clocks or hold-notice duties.", "Counsel can work with incomplete facts. They cannot work with a voicemail forever.", recEscLegal, "Incomplete and honest beats late and theatrical.", "Involving legal is not the same as admitting a breach to the world.", "The voicemail ages. Notification clocks are not paused."),
    ],
    { topicIds: ["legal-privacy", "personal-data"], learningObjectiveIds: ["zh-e06-involve-privacy-without-premature-notice"], departmentIds: ["legal-privacy", "hr", "incident-lead"] },
  ),
  q(
    "zh-e07",
    "escalation",
    "Scanner vendor offers an immediate remote session",
    "The handheld scanner vendor offers a free remote session from an engineer who will hop on any warehouse PC. They can start in ten minutes. Procurement thinks saying no will delay a hardware credit promised last quarter.",
    "They can be on a packing PC in ten minutes. The credit depends on being cooperative.",
    "How should the scanner vendor's remote-access offer be handled?",
    ["DORA", "NIST CSF 2.0"],
    [
      o("zh-e07-a", "strong", "Jump host, MFA, ticket, watched, time-bound", "Help inside your controls, or no help.", [3, 2, 3], "Expertise arrives without handing the estate to a stranger.", "Vendors inherit your incident. They do not get a shortcut around it.", recEscVendor, "Refuse uncontrolled access, not all help.", "Third-party remote tools are identity events.", "The engineer is on a jump host with MFA, a ticket, and a stop time."),
      o("zh-e07-b", "high-risk", "Allow unmanaged remote access on a packing PC for speed", "Protect the hardware credit.", [0, 1, 0], "You add an untracked administrator during a compromise.", "Procurement outcomes are not a reason to skip access control.", recEscVendor, "Hardware credits do not outrank containment.", "Helpful vendors are still third parties.", "An unmanaged remote tool is now running on a packing PC."),
      o("zh-e07-c", "defensible", "Refuse all vendor help until next week", "Zero extra hands.", [2, 0, 2], "You keep purity and may lose the only people who know the scanner firmware.", "Refuse the uncontrolled path. You can still schedule a controlled one.", recEscVendor, "A delayed, watched session is usually enough.", "Isolation of vendors is a tool, not a personality.", "The scanners stay untouched. Firmware expertise is also delayed."),
    ],
    { topicIds: ["vendor-access", "third-party"], learningObjectiveIds: ["zh-e07-vendor-help-only-on-a-controlled-path"], departmentIds: ["vendors", "technical-response", "incident-lead"] },
  ),
  q(
    "zh-e08",
    "escalation",
    "Insurer asks you to wait before isolating further",
    "Cyber insurance wants a call before you isolate anything else, hire anyone, or talk to the carrier. The policy pack is a PDF. The broker says do not touch evidence. Encryption is still walking a share.",
    "The policy is clear: do not act until we have spoken.",
    "How should cyber-insurance notification relate to containment?",
    ["DORA", "NIST IR"],
    [
      o("zh-e08-a", "high-risk", "Pause all containment until the broker joins at noon", "Stay onside with the policy.", [0, 0, 0], "The attacker does not recognise your policy clock.", "Insurance notification is a parallel track, not a stop-work order.", recEscInsure, "Contain first, notify along the agreed path.", "A policy PDF cannot outrun ransomware.", "The broker is in another meeting. The share continues to encrypt."),
      o("zh-e08-b", "strong", "Keep containing, notify through the agreed path, and record what you said", "A named person calls. A named person keeps isolating.", [3, 2, 3], "You protect cover without donating more files.", "Insurers need facts. They do not run the warehouse.", recEscInsure, "Do both: stop the bleeding and start the claim file.", "Cyber insurance is a stakeholder, not the incident coordinator.", "Containment continues. The broker receives a short, recorded notification."),
      o("zh-e08-c", "defensible", "Send the broker the whole ticket dump right now", "Treat volume as transparency.", [2, 1, 2], "You may satisfy curiosity and overwhelm them with unreviewed noise, including personal data.", "A cover note plus a timeline beats a slurry.", recEscInsure, "Summarise, then attach what counsel is happy to share.", "Volume is not a notification.", "The broker receives hundreds of unreviewed tickets."),
    ],
    { topicIds: ["cyber-insurance", "parallel-tracks"], learningObjectiveIds: ["zh-e08-notify-insurer-without-pausing-containment"], departmentIds: ["legal-privacy", "leadership", "incident-lead"] },
  ),
  q(
    "zh-e09",
    "escalation",
    "Police, retained firm, or neither yet",
    "A local officer who knows the site manager offers to swing by for the ransomware. Your retained incident-response firm is one voicemail away. A deputy wants to wait until you can prove a crime. Another wants to post the lock screen on a community Facebook group for awareness.",
    "Someone in uniform might know what to do. Or we wait until we can prove it.",
    "How should external specialist and law-enforcement involvement be decided?",
    ["NIST IR", "DORA"],
    [
      o("zh-e09-a", "defensible", "Call the retained firm now, hold police until counsel agrees", "Buy expertise. Do not freelance public enforcement.", [2, 2, 1], "You get hands that know ransomware and you may delay a useful law-enforcement path.", "External incident response is often the fastest technical lift. Police involvement is a counsel-guided choice.", recEscExternal, "Do not wait for a perfect crime story to get qualified help.", "There is no single title that must call the police. The organisation decides with advice.", "The retained firm is on the bridge. Police have not been engaged yet."),
      o("zh-e09-b", "strong", "Counsel-guided: retained firm on the clock, law enforcement considered, no public posts", "Facts in a pack. No community forensics.", [3, 2, 3], "Help arrives on a contract. Public chatter stays off the table.", "External specialists support your coordinator. They do not replace organisational decisions.", recEscExternal, "Use the retainer you already pay for.", "Law enforcement and private incident response are options with purposes, not trophies.", "The site manager thanks the officer and does not hand over the only disk. The firm is engaged."),
      o("zh-e09-c", "high-risk", "Post the lock banner on Facebook and invite the officer to click around", "Treat community posts as reporting.", [0, 0, 0], "You leak evidence, invite copycats, and create a messy trail.", "Public posts are not a reporting channel.", recEscExternal, "Keep this private, logged, and advised.", "Awareness without a process is a leak with comments.", "The Facebook group has theories. The lock banner is now public."),
    ],
    { topicIds: ["external-ir", "law-enforcement"], learningObjectiveIds: ["zh-e09-use-retainers-and-advice-not-facebook"], departmentIds: ["legal-privacy", "incident-lead", "leadership"] },
  ),
  q(
    "zh-b01",
    "continuity",
    "Shift group chat has a poll about the lock banner",
    "A shift group chat now has a photo of the lock banner and a poll: pay, wait, or go home. Agency staff are asking if they will be paid. Nobody has sent an internal brief. The poll is filling up.",
    "People are already voting in the chat. We should get in there.",
    "How should staff be briefed about the incident?",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-b01-a", "high-risk", "Join under an unofficial account and steer the chat", "Try to manage rumours from inside the thread.", [0, 1, 0], "You look untrustworthy and leak more.", "Do not troll your own incident.", recContStaff, "Be present as the organisation, not a costume.", "Staff need a briefing, not a secret identity.", "The unofficial account is recognised immediately. The poll gains another option."),
      o("zh-b01-b", "strong", "One internal brief: what to do, what not to do, where to report", "Thank people, close the poll, and name a pay-question owner for HR.", [3, 3, 3], "Rumour slows. Agency staff get a human answer path.", "Employees are sensors and a leak surface.", recContStaff, "Treat people as part of the response.", "Unofficial channels fill every silence you leave.", "The poll closes. HR has a script for agency pay questions."),
      o("zh-b01-c", "defensible", "Ban phones on the floor until further notice", "No phones, fewer leaks.", [2, 1, 1], "You may reduce photos and also lose useful reports, plus picking slows.", "Policy without a replacement channel fails.", recContStaff, "If you restrict phones, give an official place to send what they saw.", "Control the message. Do not pretend people stopped existing.", "Phones go into a bucket. Useful reports slow down. People are frustrated."),
    ],
    { topicIds: ["employee-comms", "rumour-control"], learningObjectiveIds: ["zh-b01-official-staff-brief-beats-group-chats"], departmentIds: ["communications", "hr", "incident-lead"] },
  ),
  q(
    "zh-b02",
    "continuity",
    "Directors want hourly voice notes",
    "Two directors want hourly messaging-app voice notes in plain English. The incident scribe is already behind on the written log. One director forwarded the last note to a spouse who works in IT.",
    "If it is not in my headphones, it did not happen.",
    "How should directors be kept informed?",
    ["DORA", "NIST CSF 2.0"],
    [
      o("zh-b02-a", "strong", "Written cadence: facts, impact, next steps, next time", "Short pack, same clock, no forwarding.", [3, 2, 3], "Leaders stay informed. The record stays in one place.", "Voice notes vanish. Incident logs do not.", recContMgmt, "Headphones are not the system of record.", "Management updates are a product with a version, not a chat habit.", "Directors receive a written pack. The earlier forward is stopped."),
      o("zh-b02-b", "high-risk", "Agree to the hourly voice notes and skip the log", "Keep them happy.", [0, 1, 0], "The official story lives in disappearing audio and a family group.", "Informal briefings leak and cannot be audited.", recContMgmt, "Happiness is not a communications plan.", "If it is not written, the next shift will invent it.", "The spouse now has a copy. The incident log is still empty."),
      o("zh-b02-c", "defensible", "One live call now, then written only", "Settle nerves once, then record.", [2, 2, 1], "You may settle nerves and still create an unminuted conversation unless you write it down after.", "A call is fine if it becomes a note.", recContMgmt, "Talk, then type.", "Access for executives should not bypass the incident record.", "The call is eight minutes. The follow-up note is nine lines."),
    ],
    { topicIds: ["management-updates", "record-keeping"], learningObjectiveIds: ["zh-b02-written-cadence-for-leaders"], departmentIds: ["leadership", "communications", "incident-lead"] },
  ),
  q(
    "zh-b03",
    "continuity",
    "Retailer on hold about today's pallets",
    "A key retailer's control tower is on the phone: will the 11:00 pallets leave? Sales wants to promise yes. Warehouse thinks maybe three of twelve. Nobody has approved words.",
    "Tell them it is a routine IT blip. They will stay calm.",
    "What should the retailer be told about this morning's pallets?",
    ["DORA", "NIST CSF 2.0"],
    [
      o("zh-b03-a", "defensible", "Tell only this retailer the fuller picture", "VIP honesty.", [2, 2, 1], "You help one partner and create a fairness and leak problem.", "Selective detail has a half-life.", recContCust, "A fair holding line plus specific slot news is cleaner.", "Biggest customer is not a secret briefing privilege by default.", "The second-largest customer hears a different story."),
      o("zh-b03-b", "high-risk", "Promise all twelve pallets and a routine outage", "Keep the relationship smooth.", [0, 1, 0], "You miss slots and you have misstated the nature of the event.", "Hope is not a delivery plan. Routine is not a cyberattack.", recContCust, "Promise only what the floor can still do.", "Customers can plan around truth. They cannot plan around charm.", "Eleven o'clock arrives. So does a penalty email."),
      o("zh-b03-c", "strong", "Approved facts: what still ships, what is delayed, next update time", "One channel, one number of pallets.", [3, 3, 3], "The retailer can reroute. You keep a relationship you can defend.", "Operational honesty is communications.", recContCust, "Cadence beats over-promising.", "Customer updates need a business owner and a communications check, not a sales solo.", "The retailer is told three of twelve, with a next update time."),
    ],
    { topicIds: ["customer-comms", "delivery-promises"], learningObjectiveIds: ["zh-b03-honest-slot-updates-not-routine-blips"], departmentIds: ["communications", "business-owners", "leadership"] },
  ),
  q(
    "zh-b04",
    "continuity",
    "Packaging supplier asks whether today's cardboard is still needed",
    "A packaging supplier's portal shows yesterday's order stuck, and they phone: do we still need today's cardboard? Someone drafts an email attaching the lock-screen photo so they understand. Procurement wants to cancel everything for a week.",
    "If we attach the lock screen they will understand why we are delayed.",
    "How should the packaging supplier be notified?",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-b04-a", "strong", "Short notice, no attachment: delay, revised quantity, known phone number", "If they need more, they call the number already on the contract.", [3, 3, 3], "Cardboard plans adjust without a second copy of your incident imagery.", "Partners need operational facts, not copies of the lock screen.", recContSupp, "Describe, do not attach.", "You can warn a supplier without amplifying the attacker.", "The draft loses its screenshot and gains a delivery date."),
      o("zh-b04-b", "high-risk", "Send the lock banner to every supplier in BCC", "Transparency at scale.", [0, 1, 0], "You distribute incident imagery and invite copycats and panic.", "Do not mail the face of the attack to the extended supply chain.", recContSupp, "Need-to-know, no trophies.", "Awareness is not a ransomware gallery.", "Procurement now has a long BCC list and a public incident image."),
      o("zh-b04-c", "defensible", "Say nothing and cancel next week's board internally only", "Quiet inventory move.", [1, 2, 1], "You may avoid leaks and leave the supplier making product you will reject.", "Silence has a cost in waste and trust.", recContSupp, "Tell the people whose trucks are about to arrive.", "Suppliers are part of continuity, not spectators.", "A lorry of unneeded cardboard is already on the ring road."),
    ],
    { topicIds: ["supplier-comms", "edi"], learningObjectiveIds: ["zh-b04-notify-suppliers-without-attachments"], departmentIds: ["communications", "vendors", "business-owners"] },
  ),
  q(
    "zh-b05",
    "continuity",
    "Local reporter asks for comment before noon",
    "A reporter who covers the industrial estate texts the site manager: hearing Northstar had a cyberattack, any comment before noon? Marketing has a cheerful holding post about investing in technology. The site manager is not a spokesperson.",
    "If we keep it light, maybe they will drop it.",
    "How should the press enquiry be handled?",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-b05-a", "high-risk", "Post that it is a routine outage and keep the tone informal", "Deflect with lightness.", [0, 1, 0], "Customers, staff, and later investigators remember the informal line.", "Humour is not a disclosure strategy.", recContPublic, "One spokesperson, approved line.", "A vacuum plus jokes gets filled by worse stories.", "The informal post has a long afterlife internally and externally."),
      o("zh-b05-b", "defensible", "No comment. Ignore the reporter", "Empty air.", [2, 1, 1], "You avoid a wrong statement and you let the tip harden into a story without you.", "Silence can be a tactic. It still needs a watch on what others publish.", recContPublic, "A factual holding line is usually safer than a void.", "No comment is a decision. Brief the spokesperson anyway.", "The paper files with declined to comment and a photo of the gate."),
      o("zh-b05-c", "strong", "Approved holding line, named spokesperson, no extra detail", "We are dealing with a service disruption. Next update when we have facts.", [3, 2, 3], "The organisation speaks once, calmly, without confirming what you do not know.", "Public statements are a controlled product.", recContPublic, "Holding lines exist for this exact message.", "Site managers should route press, not become press.", "Marketing bins the cheerful post. The reporter gets one approved sentence."),
    ],
    { topicIds: ["public-statements", "media"], learningObjectiveIds: ["zh-b05-holding-line-not-jokes-or-void"], departmentIds: ["communications", "leadership", "incident-lead"] },
  ),
  q(
    "zh-b06",
    "continuity",
    "Delivery book still shows 140 slots",
    "Transport has 140 slots. Warehouse can perhaps fulfil 40 on a clean island plus paper. Sales wants to keep all 140 on the system so the portal looks healthy. Nobody has told drivers.",
    "A green portal is the customer experience we cannot lose.",
    "How should today's delivery slots be managed?",
    ["DORA", "NIST CSF 2.0"],
    [
      o("zh-b06-a", "strong", "Cut the book to what you can do, tell drivers and customers", "Forty honest slots beat 140 ghosts.", [3, 3, 3], "The yard matches the promise. People can reroute.", "Continuity is a reduced plan you can actually run.", recContSlots, "Hope is not capacity.", "Delivery disruption is managed by shrinking the plan in public, not decorating the portal.", "Drivers are told on time. Customers see 40 slots."),
      o("zh-b06-b", "high-risk", "Leave 140 live and apologise at the door", "Keep the funnel full.", [0, 1, 0], "You create a second incident made of waiting lorries and broken trust.", "A green portal is not a warehouse.", recContSlots, "Do not advertise capacity you have already lost.", "Experience design cannot outrun physics.", "The industrial estate becomes a queue of waiting vehicles."),
      o("zh-b06-c", "defensible", "Cancel everything, including the 40 you could do", "Clean break.", [2, 0, 2], "You avoid chaos and you also discard recoverable value.", "Total stop is simpler and costlier. Name it if you choose it.", recContSlots, "If you halt, the business owner should own that halt.", "Purity can starve the day.", "The yard is peaceful. Penalty clauses are not."),
    ],
    { topicIds: ["delivery-disruption", "capacity"], learningObjectiveIds: ["zh-b06-shrink-slots-to-real-capacity"], departmentIds: ["business-owners", "communications", "leadership"] },
  ),
  q(
    "zh-b07",
    "continuity",
    "Proposal to keep picking on informal paper",
    "A supervisor proposes running picks on informal clipboards to keep pallets moving. It might ship goods. It might invent stock that never existed. There is a dusty manual-pick procedure from a snow day, unopened, in a binder labelled business continuity — do not borrow.",
    "We will remember the pallets. We just need to keep moving.",
    "How should picking continue if systems are down?",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-b07-a", "high-risk", "Informal clipboards, no reconciliation plan", "Move faster on paper with no later match-back.", [0, 1, 0], "You ship the wrong freight with confidence and no way back.", "Manual operations without a paper trail is a second incident.", recContManual, "Workarounds need controls.", "Continuity is designed, not improvised from stationery.", "A clipboard record cannot be reconciled on Tuesday."),
      o("zh-b07-b", "strong", "Use the snow-day procedure: named owners, photos, later reconciliation", "Small volume, written, boring.", [2, 3, 3], "Critical goods move without inventing a parallel universe of stock.", "The binder exists for this hour.", recContManual, "Heroism is not a control.", "If it is not written, it will not be reconcilable on Tuesday.", "Pallets move against the documented procedure with photos and named owners."),
      o("zh-b07-c", "defensible", "Stop all physical work until systems return", "No picks, no fiction.", [3, 0, 2], "You protect data integrity and starve today's customers.", "A halt is honest if leadership accepts the commercial hit.", recContManual, "Name the operations cost of purity.", "Not picking is also a continuity choice.", "The yard is quiet. Penalty clauses are now likely."),
    ],
    { topicIds: ["manual-procedures", "business-continuity"], learningObjectiveIds: ["zh-b07-documented-manual-lane-not-hero-clipboards"], departmentIds: ["business-owners", "it-operations", "incident-lead"] },
  ),
  q(
    "zh-b08",
    "continuity",
    "Ransom note lists sample delivery addresses",
    "The ransom note lists a sample of delivery addresses that look real. Operations wants to ring those customers to warn them. Privacy is still travelling. Sales wants to deny everything because the sample might be from a public tracking page.",
    "If it is on a tracking page, it is not theft. Should we call them anyway?",
    "How should the ransom note's claimed customer addresses be treated?",
    ["NIST IR", "DORA"],
    [
      o("zh-b08-a", "strong", "Treat as possible theft: preserve, involve privacy, do not confirm from the note alone", "Check whether the sample is public tracking versus private files.", [3, 2, 3], "You keep options and you do not accidentally notify the wrong way.", "A criminal's claim is a lead, not a press release.", recContTheft, "Verify the data class before you ring a hundred doorbells.", "Suspected data theft is a privacy track running beside containment.", "Someone compares the sample to the public tracker before any customer call."),
      o("zh-b08-b", "high-risk", "Ring every listed customer now and admit a breach", "Get ahead of the attackers.", [0, 1, 0], "You may create panic, admit what you cannot prove, and miss the real notification process.", "Customer calls are notifications. They need a basis.", recContTheft, "Do not let the attacker set your communications clock by bluff.", "The note is not your legal analysis.", "Phones become a rumour mill with postcodes."),
      o("zh-b08-c", "defensible", "Say nothing internally either until forensics is done", "In case it is nothing.", [2, 1, 1], "You avoid a false alarm and you may leave staff repeating the note in group chats.", "Internal holding facts can exist without a public breach claim.", recContTheft, "Staff still need do-not-speculate guidance.", "Silence to customers is not the same as silence to your own floor.", "The group chat gains a worse rumour in the absence of guidance."),
    ],
    { topicIds: ["suspected-data-theft", "privacy"], learningObjectiveIds: ["zh-b08-ransom-claims-are-leads-not-notices"], departmentIds: ["legal-privacy", "communications", "incident-lead"] },
  ),
  q(
    "zh-b09",
    "continuity",
    "Draft social post confirms a data breach",
    "A draft social post begins: we can confirm a data breach affecting customers. The evidence is the ransom note and a locked share. Privacy has not confirmed exfiltration. Legal has not approved words. The social manager says the narrative window is closing.",
    "If we say it first, we own the story.",
    "Should the organisation announce a personal-data breach?",
    ["DORA", "NIST IR"],
    [
      o("zh-b09-a", "defensible", "Post a service-disruption update, no personal-data claim", "Own the delay, not a breach you cannot show.", [2, 2, 1], "You fill the window without making a legal statement you may have to unwind.", "Service truth is allowed. Breach truth needs a basis.", recContBreach, "If you speak, speak about what you actually know.", "Owning the story is not the same as over-claiming it.", "The update contains one accurate sentence about disruption, not personal data."),
      o("zh-b09-b", "strong", "No breach announcement. Holding line only after privacy and legal", "The window can wait for facts.", [3, 2, 3], "You avoid a premature personal-data admission and you still have a spokesperson ready.", "Breach announcements are legal events, not marketing assets.", recContBreach, "Closing a narrative window with the wrong noun is worse than a pause.", "Do not let social calendars declare a breach.", "The draft is held. Privacy and legal have not approved a personal-data claim."),
      o("zh-b09-c", "high-risk", "Publish the confirmation to control the narrative", "Go first.", [0, 0, 0], "You may trigger duties, customer panic, and a correction tomorrow.", "You cannot unsay a breach.", recContBreach, "Control is accuracy plus approval, not going first.", "Marketing does not get to find exfiltration on a feeling.", "The post is live. Privacy has not confirmed exfiltration."),
    ],
    { topicIds: ["breach-announcements", "disclosure"], learningObjectiveIds: ["zh-b09-no-premature-breach-post"], departmentIds: ["communications", "legal-privacy", "leadership"] },
  ),
  q(
    "zh-r01",
    "recovery",
    "Backups last tested in another financial year",
    "Finance says warehouse backups are in the cloud. Operations says an unlabeled USB drive in the operations office is the real copy. Restore tests are a rumour from fourteen months ago. A director wants a go-live time for the all-hands.",
    "We need a time for the all-hands. The USB should be enough.",
    "What must happen before a restore go-live time is announced?",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-r01-a", "high-risk", "Promise Tuesday 06:00 based on the untested USB copy", "Leadership needs a date.", [0, 1, 0], "You commit to a restore you cannot show.", "Recovery dates need evidence.", recRecBackup, "Proof before a public time.", "A backup you have not restored is a story.", "Tuesday 06:00 is already being briefed. The copy is untested."),
      o("zh-r01-b", "strong", "Locate copies, protect them, and test-restore one file and one service", "Then offer a range, not a theatrical hour.", [3, 3, 3], "You learn what is actually recoverable before you advertise it.", "Test restores beat folklore.", recRecBackup, "This is how you earn a date.", "Immutability only matters if you can find the copy and open it.", "Copies are inventoried. One file and one service restore successfully. A range is offered."),
      o("zh-r01-c", "defensible", "Start restoring everything in parallel to save time", "More jobs, more hope.", [1, 2, 1], "You may restore malware with the data and hide failures in volume.", "Sequence is a control.", recRecBackup, "A sample success beats a flood of unknown jobs.", "Parallelism without a clean target is optimism.", "Twelve restore jobs start. Failures are hard to see."),
    ],
    { topicIds: ["backups", "restore-testing"], learningObjectiveIds: ["zh-r01-test-restore-before-promising-dates"], departmentIds: ["it-operations", "technical-response", "leadership"] },
  ),
  q(
    "zh-r02",
    "recovery",
    "Payroll, portal, or the pick face first",
    "IT can bring back one major service this afternoon. HR wants payroll because it is month-end. Marketing wants the customer portal because of the press. The warehouse manager wants warehouse management because pallets exist in the physical world. All three are in the same huddle, ranking their own pain.",
    "Whoever emails more should go first.",
    "Which service should be restored first this afternoon?",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-r02-a", "strong", "Incident lead plus business owner: safety and core delivery first", "Write the order. Tell the other two the time they get.", [3, 3, 3], "Pallets and gates come back under a plan people can see.", "Recovery priority is a business call inside technical feasibility.", recRecPriority, "Pain is not the same as criticality.", "You can be fair about the sequence without pretending everything is first.", "HR and marketing get a clock. Warehouse management is first."),
      o("zh-r02-b", "high-risk", "Restore whichever dashboard is reddest", "The reddest must be the most important.", [0, 1, 0], "You may bring back a website while the warehouse still runs on guesswork.", "Colour is not a priority model.", recRecPriority, "Use impact, not interface anxiety.", "Dashboards shout. Yards do not.", "The portal is restored. The warehouse still has no system of record."),
      o("zh-r02-c", "defensible", "Split the afternoon into three partial restores", "Everyone gets a slice.", [2, 2, 1], "You keep political peace and may finish none of them well.", "Splitting scarce recovery effort has a cost.", recRecPriority, "If you slice, say what done enough means for each.", "Fairness can dilute recoverability.", "Three services flicker. None is finished well enough to ship."),
    ],
    { topicIds: ["recovery-priority", "business-impact"], learningObjectiveIds: ["zh-r02-prioritise-core-delivery-not-the-loudest"], departmentIds: ["business-owners", "incident-lead", "leadership"] },
  ),
  q(
    "zh-r03",
    "recovery",
    "Vendor offers to restore onto the existing warehouse servers",
    "A vendor offers to restore warehouse management onto the existing warehouse servers because the hardware still responds. Those servers still sit on the VLAN that hosted the encryption. Gold images exist, unused, in a cupboard with a last-reviewed label.",
    "The hardware still pings. Restoring there will be fastest.",
    "Where should warehouse management be restored?",
    ["NIST IR", "NIST CSF 2.0"],
    [
      o("zh-r03-a", "defensible", "Restore to the old servers after a rapid reimage on the same VLAN", "Faster, still on an unproven network.", [2, 2, 1], "You may save hours and rejoin a network you have not proven clean.", "Same network, new image, is a trade-off you should name.", recRecClean, "If you reuse hardware, change the neighbourhood too.", "A ping is not cleanliness.", "Servers are reimaged on the same VLAN. Cleanliness is unproven."),
      o("zh-r03-b", "strong", "Rebuild on gold images in a clean, isolated environment, then restore data", "Priority services only.", [3, 2, 3], "You come back narrower and less likely to reintroduce the problem.", "Restore is not the same as reconnect.", recRecClean, "This is the recovery spine.", "Good data on a dirty network is how sequels start.", "Gold images come up in isolation. Data restore follows."),
      o("zh-r03-c", "high-risk", "Restore last month's full disk image onto live production now", "Older means safer.", [0, 1, 0], "You may reintroduce the foothold and yesterday's malware.", "Age is not cleanliness.", recRecClean, "Do not relocate the original problem.", "A full-disk souvenir is not a gold image.", "Last month's image is live again, including whatever lived on it."),
    ],
    { topicIds: ["clean-rebuild", "restore-target"], learningObjectiveIds: ["zh-r03-restore-to-clean-isolated-env"], departmentIds: ["technical-response", "it-operations"] },
  ),
  q(
    "zh-r04",
    "recovery",
    "Password reset planned through the same mail system",
    "IT is ready to reset warehouse passwords. The plan is to email temporary passwords from the same mail system that sent lookalike reset links this morning. Several clickers have not been identified. Shared aisle accounts are still in the spreadsheet.",
    "If we mail the new passwords, people will change them.",
    "How should warehouse credentials be reset?",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-r04-a", "high-risk", "Email temporary passwords to everyone, including shared aisle accounts", "Scale first.", [0, 1, 0], "The attacker reads the new secrets in the same thread as the old campaign.", "Do not send keys through a house you still distrust.", recRecCreds, "Fix the identity path first.", "A password reset is not recovery if the mailbox is still a hostile place.", "Lookalike inboxes receive the new secrets."),
      o("zh-r04-b", "strong", "Terminate sessions, reset after mail and identity are controlled, named accounts, out-of-band temps", "Managers hand secrets face to face or via a known HR path.", [3, 2, 3], "Old sessions die. New secrets do not go to the attacker first.", "Credential recovery is sequencing, not a mail merge.", recRecCreds, "Out-of-band is slower and actually a reset.", "Shared accounts should not survive the incident that abused them.", "Managers walk the floor with named envelopes. Shared aisle accounts are retired."),
      o("zh-r04-c", "defensible", "Force reset at next login on the still-suspect portal", "Close enough.", [2, 1, 1], "You may catch some people and train others to type into the wrong box.", "A force-reset on a shady page is a trap with extra steps.", recRecCreds, "Change the destination, then the secret.", "Login prompts are part of the incident, not only the password.", "Half the floor types a new password into a portal that still looks like this morning's lure."),
    ],
    { topicIds: ["credential-reset", "identity-recovery"], learningObjectiveIds: ["zh-r04-reset-credentials-out-of-band"], departmentIds: ["it-operations", "technical-response", "hr"] },
  ),
  q(
    "zh-r05",
    "recovery",
    "Warehouse management is up. A VP wants monitoring off",
    "Warehouse management looks restored. A vice president wants the extra monitoring switched off because it is noisy and the team is tired. Mystery beacons still flicker twice an hour. Someone has drafted an all-clear message.",
    "We are back. The extra alerts are noise and the team needs rest.",
    "When can heightened monitoring be switched off?",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-r05-a", "strong", "Controlled reopen, heightened monitoring, named rollback, 72-hour watch", "All-clear is a monitoring decision.", [3, 3, 3], "You can run the warehouse without lying to yourselves.", "Recovery is a phase with instrumentation, not a mood.", recRecMonitor, "All-clear is a monitoring decision.", "Tiredness is not a compensating control.", "The all-clear is held. A 72-hour watch and rollback owner are named."),
      o("zh-r05-b", "high-risk", "Send the all-clear and switch detections off", "Close the incident room.", [0, 1, 0], "You will miss the sequel.", "Noise is a clue, not a nuisance to mute.", recRecMonitor, "Tune, do not blind.", "Declaring victory is how second incidents hide.", "Detections go quiet. The beacons do not."),
      o("zh-r05-c", "defensible", "Stay in full incident mode until the beacons have been silent a week", "No exit criterion except silence.", [3, 1, 2], "You stay safe and burn the team, which becomes its own operational risk.", "Name an exit criterion that is not forever.", recRecMonitor, "You can be careful without becoming nocturnal indefinitely.", "Burnout is also an incident outcome.", "The incident room stays open with no end date. The team is exhausted."),
    ],
    { topicIds: ["post-restore-monitoring", "reopen-criteria"], learningObjectiveIds: ["zh-r05-reopen-with-watch-and-rollback"], departmentIds: ["technical-response", "incident-lead", "leadership"] },
  ),
  q(
    "zh-r06",
    "recovery",
    "Proposal to send a small test ransom payment",
    "A well-meaning operations lead finds the payment portal still open and drafts a small test payment to see if files decrypt, because Friday is the biggest dispatch day of the month. Counsel has not signed anything. Backups have not been proven.",
    "It is only a test. We need Friday's peak to survive.",
    "Should a test ransom payment be sent to recover Friday's peak?",
    ["NIST IR", "DORA"],
    [
      o("zh-r06-a", "high-risk", "Send a small test amount tonight", "Treat payment as an experiment.", [0, 0, 0], "You start a payment path without a decision and may still get nothing back.", "Test payments are still payments.", recRecRansom, "Do not poke the portal for curiosity.", "Ransom is a leadership and legal track, not a warehouse experiment.", "Finance asks which cost centre to use. Nothing has been authorised."),
      o("zh-r06-b", "strong", "Preserve the note, no payment, prove restores, logged decision if ever", "Friday is a planning problem, not a cryptocurrency problem, until leadership says otherwise.", [3, 2, 3], "You keep options. You do not fund the attacker from the floor.", "Payment never guarantees recovery and can create more legal and ethical problems.", recRecRansom, "Work the backups while the portal sits unclicked.", "Nobody on the pack line is authorised by enthusiasm.", "The draft payment is deleted. Friday gets a reduced, honest plan."),
      o("zh-r06-c", "defensible", "Keep the portal bookmarked just in case without paying", "Retain the option near tired people.", [2, 1, 1], "You avoid paying and you keep a tempting, unlogged path near tired people.", "If you retain the option, lock it behind counsel and access control, not a browser tab.", recRecRansom, "Optionality needs access control.", "A bookmark is not a strategy. It is a future accident.", "The tab stays open. So does the risk of a tired click."),
    ],
    { topicIds: ["ransom-payment", "extortion"], learningObjectiveIds: ["zh-r06-no-floor-level-ransom-experiments"], departmentIds: ["leadership", "legal-privacy", "incident-lead"] },
  ),
  q(
    "zh-r07",
    "recovery",
    "Carrier file-transfer job is the last red light",
    "Warehouse management is up in the clean environment. The carrier SFTP job is the last red light on a manager's dashboard. Someone proposes reconnecting with the old job account because it is already in the script. That account lived on the sick subnet this morning.",
    "Flip the old job on so the 16:00 file leaves. The script already works.",
    "How should the carrier file-transfer job be reconnected?",
    ["DORA", "NIST CSF 2.0"],
    [
      o("zh-r07-a", "strong", "New identity, clean host, monitored job, carrier told the window", "Reconnect on purpose.", [3, 3, 3], "The partner path returns without importing the morning.", "Reconnection is a controlled change, not a dashboard click.", recRecReconnect, "Scripts are not evidence of cleanliness.", "Third-party pipes need the same rebuild hygiene as internal ones.", "The carrier is told the window. A new identity runs from a clean host."),
      o("zh-r07-b", "high-risk", "Flip the old job on so the 16:00 file leaves", "Make the light green.", [0, 1, 0], "You may reattach a compromised identity to a clean core.", "Old accounts are part of the incident.", recRecReconnect, "Do not reimport the problem to save a script.", "A red light can be honest.", "The dashboard is green. The identity log shows the old sick account."),
      o("zh-r07-c", "defensible", "Send tonight's file on an encrypted USB via courier", "Avoid the pipe.", [2, 2, 1], "You may move data without the old account and you create custody and delay issues.", "Physical transfer is a workaround with its own controls.", recRecReconnect, "If you courier, encrypt, log, and limit what is on the device.", "Avoiding a pipe is not the same as securing the next one.", "A courier becomes a network route with a chain-of-custody form."),
    ],
    { topicIds: ["reconnect-partners", "clean-identity"], learningObjectiveIds: ["zh-r07-reconnect-with-new-identity-and-monitoring"], departmentIds: ["vendors", "technical-response", "it-operations"] },
  ),
  q(
    "zh-r08",
    "recovery",
    "Review while the facts are still fresh",
    "Someone wants a 60-slide retrospective before monitoring is quiet. Someone else wants never to speak of this again. A draft already blames night shift by name.",
    "Accountability means naming who on nights let this in.",
    "How should the post-incident review be run?",
    ["NIST CSF 2.0", "NIST IR"],
    [
      o("zh-r08-a", "high-risk", "Publish the blame note to all staff", "Treat naming as consequence.", [0, 0, 0], "People hide the next incident and you lose the truth.", "Scapegoats are useless and contagious.", recRecReview, "Blameless is not consequence-free, but hunting a shift fails.", "Culture is a control.", "Night shift goes quiet. The next incident will be harder to see."),
      o("zh-r08-b", "strong", "Short living log: what worked, what failed, owners, no villains", "A few pages while memory is still accurate.", [3, 2, 3], "Fixes have names. People stay in the room.", "Improvement is part of response.", recRecReview, "Write while memory exists.", "A review is a coordination artefact, not a trial.", "The living log is short and factual. Night shift is not named as a villain."),
      o("zh-r08-c", "defensible", "Schedule a polished retrospective in the next quarter", "When the heat has dropped.", [1, 2, 1], "Details evaporate. The slides will be prettier.", "Delay deletes lessons even if it reduces heat.", recRecReview, "Capture now, polish later.", "Memory is a perishable control.", "The next quarter is already full. Details are already fading."),
    ],
    { topicIds: ["post-incident-review", "blameless"], learningObjectiveIds: ["zh-r08-timely-blameless-review"], departmentIds: ["incident-lead", "hr", "leadership"] },
  ),
  q(
    "zh-r09",
    "recovery",
    "Board will fund something from this morning",
    "The board will fund an improvement. Ideas include a motivational poster, a new logo for the incident channel, multi-factor authentication on privileged and remote access, actually testing restores, and a 40-page policy nobody will read this quarter. Someone suggests a tabletop exercise that is not optional.",
    "A poster and a renamed channel would show we have learned.",
    "Which improvements should the organisation fund first?",
    ["NIST CSF 2.0", "DORA"],
    [
      o("zh-r09-a", "defensible", "Fund multi-factor authentication now, defer restore tests to next year", "Identity first, backups later.", [2, 1, 2], "You close a real hole and leave the recovery story unproven.", "Sequencing improvements is allowed if the deferral has a date and an owner.", recRecImprove, "Do not let later become another fourteen months.", "Trade-offs in the backlog still need names.", "Multi-factor authentication lands. Restore tests still have no date."),
      o("zh-r09-b", "high-risk", "Print posters and rename the incident channel", "Treat culture as a logo.", [0, 1, 0], "Nothing that failed this morning actually changes.", "Rebranding is not a control family.", recRecImprove, "Spend the goodwill on identity, backups, and practice.", "Logos do not isolate VLANs.", "The channel has a new name. Segmentation and backups are unchanged."),
      o("zh-r09-c", "strong", "Dated actions: multi-factor authentication, segmentation, restore tests, and a scheduled tabletop", "Few items, owners, dates — including who coordinates next Monday.", [3, 3, 3], "The organisation buys fewer sequels.", "Lessons become work, not wallpaper.", recRecImprove, "Practice is how the playbook becomes muscle.", "Improvement is operational, not decorative.", "Owners and dates are assigned. A tabletop is booked. Nobody is excused as busy in the yard."),
    ],
    { topicIds: ["improvement-actions", "lessons-learned"], learningObjectiveIds: ["zh-r09-turn-lessons-into-dated-controls"], departmentIds: ["leadership", "it-operations", "incident-lead"] },
  ),
];
