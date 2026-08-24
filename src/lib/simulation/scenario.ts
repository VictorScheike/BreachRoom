import { parseScenario } from "./schemas";
import type { Scenario } from "./types";

const lockedOutScenarioDefinition = {
  id: "locked-out-ransomware",
  title: "Locked Out: A Ransomware Incident",
  estimatedDuration: "10–15 minutes",
  organisation: {
    name: "Northstar Logistics",
    fictionalLabel: "Fictional organisation",
    description:
      "Northstar Logistics is a fictional Danish logistics company with 320 employees. It coordinates road freight and warehouse operations for customers across the European Union. The company depends on digital systems to plan routes, confirm pickups and keep delivery windows on track.",
    employeeCount: 320,
    geography: "Headquartered in Denmark, serving customers across the EU",
    technologyEnvironment: [
      "Microsoft 365 for email, collaboration and shared files",
      "Azure for identity and several cloud-hosted services",
      "An on-premises logistics platform used to plan and track deliveries",
      "Warehouse scanning devices connected to the logistics platform",
      "Parts of IT operations outsourced to an external managed service provider",
    ],
    businessDependency:
      "Same-day and next-day deliveries are time-sensitive. If planning, scanning or customer-notification systems are unavailable, vehicles wait, warehouses back up, and service commitments come under pressure.",
  },
  initialSituation:
    "It is 08:15 on a Monday. Employees report that shared files cannot be opened. Security monitoring has detected unusual file changes and suspicious activity on two employee devices.",
  playerBrief:
    "You are part of Northstar Logistics’ incident response group. At each stage, review the latest update, the available facts and the known unknowns, then choose one response. After you confirm a decision you cannot change it. The exercise has eight stages. Scores and analysis stay hidden until the after-action report. There is no single universally correct answer; some choices involve realistic trade-offs.",
  stages: [
    {
      id: "stage-1-initial-detection",
      timestamp: "Monday 08:15 CET",
      title: "Initial detection and triage",
      incidentUpdate:
        "The service desk queue fills with reports that finance and operations files on a shared drive will not open. Two workstations in the planning team show a burst of file-rename activity. The outsourced IT provider has not yet been contacted.",
      availableFacts: [
        "Multiple employees cannot open files in at least two shared folders.",
        "Security monitoring flagged unusual file changes in the last 40 minutes.",
        "Suspicious activity is currently associated with two named employee devices.",
        "Email in Microsoft 365 still appears to be working for most staff.",
      ],
      knownUnknowns: [
        "Whether encryption is limited to those two devices and the affected shares.",
        "Whether a privileged account is already involved.",
        "Whether the activity is still in progress.",
        "Whether backups of the shared folders are reachable and intact.",
      ],
      options: [
        {
          id: "s1-isolate-and-triage",
          title: "Isolate the two devices and start structured triage",
          description:
            "Take the two flagged workstations off the network, preserve them for later review, and stand up a short triage call with IT, security and operations. Ask teams not to reboot affected machines or try to open encrypted files.",
          scoreImpacts: {
            containment: 12,
            governance: 6,
            communication: 2,
            continuity: -6,
            evidence: 10,
          },
          rationale:
            "Early isolation reduces the chance that an active process continues to change files, while a named triage group creates a first decision forum.",
          tradeOffs:
            "The two planning-team devices go offline immediately, which may slow route planning before the scope is fully known.",
          strengths: [
            "Limits further activity from the devices already showing suspicious behaviour.",
            "Creates a first coordinated response rather than leaving staff to improvise.",
            "Protects the devices from casual reboot or troubleshooting that could overwrite useful records.",
          ],
          potentialGaps: [
            "Other affected systems may still be active if the incident is already wider than two devices.",
            "Operations still need a workaround for the staff who lost those workstations.",
          ],
          recommendedFollowUp: [
            "Identify who can isolate further endpoints, identity accounts and file shares if the scope grows.",
            "Record the time of isolation and who authorised it.",
          ],
        },
        {
          id: "s1-reboot-and-restore",
          title: "Reboot affected PCs and restore files locally",
          description:
            "Ask IT to reboot the noisy workstations and copy files back from local caches or previous versions so the planning team can keep working. Treat the alerts as a workstation problem until more evidence appears.",
          scoreImpacts: {
            containment: -10,
            governance: -4,
            communication: 0,
            continuity: 8,
            evidence: -12,
          },
          rationale:
            "This option privileges immediate productivity. Rebooting and restoring files can destroy volatile traces and may allow an active process to continue or restart.",
          tradeOffs:
            "Staff may get some files back quickly, but the underlying activity is not contained and later investigation becomes harder.",
          strengths: [
            "Keeps planning staff working in the first hour.",
            "Avoids taking devices offline before the business impact is fully visible.",
          ],
          potentialGaps: [
            "Reboots can erase useful volatile information.",
            "Restoring files onto a still-affected environment can encrypt them again.",
            "The response stays local and informal instead of being treated as an incident.",
          ],
          recommendedFollowUp: [
            "Stop further local restores until the two devices and related shares are assessed.",
            "Capture device and file-share logs before more troubleshooting takes place.",
          ],
        },
        {
          id: "s1-wait-for-provider",
          title: "Wait for the outsourced IT provider to investigate remotely",
          description:
            "Raise a ticket with the managed service provider and ask them to investigate remotely before any local action. Keep the two devices online so the provider can connect.",
          scoreImpacts: {
            containment: -6,
            governance: 4,
            communication: 4,
            continuity: 2,
            evidence: -4,
          },
          rationale:
            "The provider may have useful telemetry, but leaving suspected devices online while waiting for a remote session can allow the situation to continue.",
          tradeOffs:
            "You use an agreed supplier channel, yet you delay containment and may depend on a queue you do not control.",
          strengths: [
            "Uses the existing outsourcing relationship instead of bypassing it.",
            "Creates an early record that IT operations have been notified.",
          ],
          potentialGaps: [
            "Remote investigation is not the same as containment.",
            "Keeping the devices online can allow further file changes while you wait.",
            "Northstar still needs an internal owner; a ticket alone is not an incident command.",
          ],
          recommendedFollowUp: [
            "Set a short deadline for the provider’s first response and take local containment action if that deadline is missed.",
            "Keep the two devices from being used for normal work while remote review is arranged.",
          ],
        },
      ],
    },
    {
      id: "stage-2-containment",
      timestamp: "Monday 08:48 CET",
      title: "Containment of affected devices and systems",
      incidentUpdate:
        "More files on the operations share now fail to open. A short text file demanding payment has appeared in two folders. Warehouse Wi-Fi still works. Microsoft 365 email is up. The on-premises logistics platform is responding slowly but is still reachable.",
      availableFacts: [
        "File-encryption symptoms have spread beyond the first two workstations.",
        "A payment-demand message is present on at least two shared folders.",
        "The two originally flagged devices are still the clearest endpoint leads.",
        "Customer-facing email is currently available.",
      ],
      knownUnknowns: [
        "Which account is writing the new files.",
        "Whether the logistics platform itself is encrypted or only slow because of network load.",
        "Whether Azure identity has been used in the activity.",
        "How far the payment-demand files have been copied.",
      ],
      options: [
        {
          id: "s2-isolate-file-services",
          title: "Take affected file services offline and keep email running",
          description:
            "Disconnect the affected file server and related shares from the network. Leave Microsoft 365 email available for coordination. Ask warehouse and planning teams to stop saving new files to the affected locations.",
          scoreImpacts: {
            containment: 14,
            governance: 4,
            communication: 2,
            continuity: -8,
            evidence: 6,
          },
          rationale:
            "Shared folders are an active impact path. Taking them offline can slow further encryption while leaving a communication channel open for the response.",
          tradeOffs:
            "Teams lose access to operational documents just as Monday deliveries need coordination.",
          strengths: [
            "Targets the service currently showing active file changes.",
            "Preserves email as a coordination channel.",
            "Reduces the chance that more folders receive the payment-demand files.",
          ],
          potentialGaps: [
            "If another path such as identity or the logistics platform is already involved, file-share isolation alone will not finish containment.",
            "Staff need a clear instruction on where to work instead of the offline shares.",
          ],
          recommendedFollowUp: [
            "Confirm whether other file locations, including cloud libraries, show the same symptoms.",
            "Assign an operations lead to collect the documents people need by another route.",
          ],
        },
        {
          id: "s2-shutdown-everything",
          title: "Shut down the whole network, including Microsoft 365 access",
          description:
            "Treat this as a full environment compromise. Disconnect on-premises networks, warehouse connectivity and cloud access, including Microsoft 365, until a later all-clear.",
          scoreImpacts: {
            containment: 10,
            governance: -2,
            communication: -4,
            continuity: -16,
            evidence: 2,
          },
          rationale:
            "Broad shutdown can reduce spread, but it also removes the tools needed to coordinate, escalate and inform customers. It is a high-cost move this early, when email is still a working command channel.",
          tradeOffs:
            "You gain a hard stop on many network paths, and you lose almost every digital way to run the incident and the business at the same time.",
          strengths: [
            "Creates a decisive barrier against further network-based activity.",
            "Makes it harder for an active session to reach remaining systems.",
          ],
          potentialGaps: [
            "Management, customers and the provider become much harder to reach.",
            "Warehouse and delivery coordination stop almost completely.",
            "Cloud audit work and identity response are harder if everyone is locked out.",
          ],
          recommendedFollowUp: [
            "If a wide isolation is used, keep a pre-agreed break-glass communication method for the incident team.",
            "Reassess whether cloud identity can be restricted more selectively than a full lockout.",
          ],
        },
        {
          id: "s2-keep-running-and-scan",
          title: "Keep systems running and scan for known malware",
          description:
            "Leave file shares and the logistics platform online so deliveries can continue. Ask IT to run antivirus and malware scans on the two devices and a sample of nearby workstations.",
          scoreImpacts: {
            containment: -12,
            governance: -2,
            communication: 2,
            continuity: 10,
            evidence: -6,
          },
          rationale:
            "Signature scanning can be part of later analysis, but it is a weak primary containment move while files are still changing. Leaving the affected shares online favours short-term operations over stopping the incident.",
          tradeOffs:
            "Deliveries may continue for a while, and more files may become unreadable while scans run.",
          strengths: [
            "Avoids an immediate operational stop.",
            "Collects some endpoint scan results that can later support scoping.",
          ],
          potentialGaps: [
            "An active encryption process is not paused.",
            "Scans can alter timestamps and overwrite useful traces if not planned.",
            "The incident is still being handled as a local malware clean-up.",
          ],
          recommendedFollowUp: [
            "Move from scanning alone to isolation of the systems showing active file changes.",
            "Preserve copies of relevant logs before further clean-up tools are run.",
          ],
        },
      ],
    },
    {
      id: "stage-3-privileged-account",
      timestamp: "Monday 09:25 CET",
      title: "Suspected privileged-account compromise",
      incidentUpdate:
        "Helpdesk notes show a domain-administration password reset was completed overnight after a request that now looks unusual. Azure sign-in logs show repeated failed multi-factor prompts for a privileged cloud account, followed by a successful sign-in from an unexpected location.",
      availableFacts: [
        "A privileged on-premises account was reset outside normal change practice.",
        "A privileged Azure account shows MFA fatigue-style prompts and a later success.",
        "The outsourced provider uses privileged accounts to administer servers.",
        "No one has yet revoked active sessions for those accounts.",
      ],
      knownUnknowns: [
        "Whether the overnight reset was performed by a legitimate administrator.",
        "What those privileged accounts have accessed since the unusual sign-in.",
        "Whether other privileged accounts are affected.",
        "Whether warehouse or logistics-platform service accounts are involved.",
      ],
      options: [
        {
          id: "s3-reset-and-revoke",
          title: "Reset privileged credentials and revoke active sessions",
          description:
            "Reset the affected privileged passwords, revoke sessions and refresh tokens, and switch remaining privileged work to emergency access procedures. Notify the managed service provider through the incident channel so their administrators stop using the old credentials.",
          scoreImpacts: {
            containment: 12,
            governance: 10,
            communication: 4,
            continuity: -4,
            evidence: 8,
          },
          rationale:
            "If a privileged account is in use by an unauthorised party, leaving it valid allows further control of systems. Session revocation and coordinated credential reset are a standard containment step, provided emergency access remains possible.",
          tradeOffs:
            "Some administration work pauses until new credentials and approvals are in place, including work the provider may be doing.",
          strengths: [
            "Reduces ongoing use of accounts that already look unsafe.",
            "Keeps a controlled path for legitimate privileged work.",
            "Involves the supplier instead of leaving them on stale credentials.",
          ],
          potentialGaps: [
            "Other unnoticed privileged accounts may still be valid.",
            "Resetting credentials should be paired with a review of what those accounts recently did.",
          ],
          recommendedFollowUp: [
            "Review sign-in and audit logs for the affected accounts before they are overwritten.",
            "Confirm emergency access accounts still work and are tightly controlled.",
          ],
        },
        {
          id: "s3-disable-all-privileged",
          title: "Disable every privileged account, including break-glass access",
          description:
            "Immediately disable all privileged on-premises and Azure accounts, including emergency access accounts, until the whole identity system has been rebuilt. Ask the provider to wait.",
          scoreImpacts: {
            containment: 4,
            governance: -8,
            communication: -2,
            continuity: -12,
            evidence: -2,
          },
          rationale:
            "Removing attacker access matters, but disabling emergency access can lock the response team out of the very systems they need to contain, recover and investigate.",
          tradeOffs:
            "You close many identity doors at once, including the doors your own administrators may need in the next hour.",
          strengths: [
            "Makes further privileged abuse harder in the short term.",
            "Signals that identity is being treated as part of the incident.",
          ],
          potentialGaps: [
            "Break-glass lockout can stall containment and recovery.",
            "The provider cannot help if they also lose administration paths.",
            "A blanket disable is harder to audit than a controlled reset of named accounts.",
          ],
          recommendedFollowUp: [
            "Restore a minimal, monitored emergency access path before going further.",
            "Disable or reset accounts based on evidence rather than every privileged identity at once.",
          ],
        },
        {
          id: "s3-monitor-only",
          title: "Leave privileged accounts active and increase monitoring",
          description:
            "Do not reset credentials yet. Ask IT to watch the privileged accounts more closely so administrators can keep investigating and so the provider can stay logged in.",
          scoreImpacts: {
            containment: -10,
            governance: -4,
            communication: 0,
            continuity: 8,
            evidence: 4,
          },
          rationale:
            "Watching an account that may already be in unauthorised use is not the same as stopping that use. It can preserve some logs, but it leaves a high-value control path open.",
          tradeOffs:
            "Investigation access stays convenient, and so does any unauthorised privileged activity.",
          strengths: [
            "Avoids locking administrators out during an already difficult morning.",
            "May capture additional log events if activity continues.",
          ],
          potentialGaps: [
            "A compromised privileged account can undo other containment work.",
            "Monitoring without session revocation rarely changes the outcome in time.",
            "The overnight reset remains unaddressed.",
          ],
          recommendedFollowUp: [
            "Revoke sessions for the unusual sign-in even if a wider reset is delayed.",
            "Time-box monitoring-only and move to credential reset if further privileged activity appears.",
          ],
        },
      ],
    },
    {
      id: "stage-4-operational-disruption",
      timestamp: "Monday 10:10 CET",
      title: "Operational disruption affecting deliveries",
      incidentUpdate:
        "Warehouse scanners cannot update the on-premises logistics platform. Several trucks are waiting on the yard. Customer service is already receiving calls about collection windows. The planning team can still use personal knowledge and paper run-sheets for some routes, but not for the full Monday plan.",
      availableFacts: [
        "The logistics platform is no longer reliably updating from warehouse devices.",
        "Outbound vehicles are delayed and more are due over the next two hours.",
        "Some supervisors still have printed route lists from Friday.",
        "Microsoft 365 email remains a possible customer-contact channel if it has not been isolated.",
      ],
      knownUnknowns: [
        "How long the logistics platform will remain unreliable.",
        "Whether restoring it now would reconnect an unsafe system.",
        "Which customer commitments are already missed versus still recoverable.",
        "Whether drivers can complete deliveries safely using manual checks.",
      ],
      options: [
        {
          id: "s4-manual-operations",
          title: "Activate manual delivery procedures and brief operations leads",
          description:
            "Switch warehouses to paper or offline scanning where possible, give operations leads authority to release known routes, and keep the logistics platform isolated from further change until it is assessed. Tell customer service to use a short holding line: delays are being managed and more detail will follow.",
          scoreImpacts: {
            containment: 2,
            governance: 8,
            communication: 8,
            continuity: 14,
            evidence: 2,
          },
          rationale:
            "Continuity does not require putting a questionable platform back into full use. Manual procedures and a controlled customer holding line protect safety and trust while technical work continues.",
          tradeOffs:
            "Throughput will drop. Some deliveries will still miss windows, and manual working creates more room for routing mistakes.",
          strengths: [
            "Treats delivery impact as part of the incident, not a later business problem.",
            "Avoids rushing the logistics platform back online before it is understood.",
            "Gives customer service a consistent message instead of improvisation.",
          ],
          potentialGaps: [
            "Manual procedures may be incomplete if they have not been rehearsed.",
            "Priority customers still need a clearer follow-up once facts are stable.",
          ],
          recommendedFollowUp: [
            "List which routes can run manually and which should wait.",
            "Name an operations owner to track delayed consignments.",
          ],
        },
        {
          id: "s4-restore-platform-first",
          title: "Prioritise restoring the logistics platform before further investigation",
          description:
            "Ask IT and the provider to bring the logistics platform back to full service immediately so scanners and trucks can move. Investigation and containment can continue later, after the Monday peak.",
          scoreImpacts: {
            containment: -8,
            governance: -2,
            communication: -2,
            continuity: 10,
            evidence: -8,
          },
          rationale:
            "The business pressure is real, but restoring a system that may still be part of the incident can reintroduce the problem and overwrite useful state.",
          tradeOffs:
            "Vehicles may move sooner, and you may restore access for whoever is causing the disruption.",
          strengths: [
            "Directly addresses the most visible operational bottleneck.",
            "Acknowledges that missed deliveries have customer and safety effects.",
          ],
          potentialGaps: [
            "Restoration without checks can reconnect an unsafe path.",
            "Evidence on the platform may be altered by an emergency repair.",
            "The rest of the incident is deprioritised at a moment when identity and file-share questions are still open.",
          ],
          recommendedFollowUp: [
            "Separate ‘safe to operate manually’ from ‘safe to reconnect the platform’.",
            "If the platform must be touched, snapshot logs and configuration first.",
          ],
        },
        {
          id: "s4-pause-all-deliveries",
          title: "Pause all outbound deliveries until systems are confirmed clean",
          description:
            "Hold every vehicle, stop warehouse dispatch and wait for a technical all-clear before any further goods movement. Do not use manual workarounds.",
          scoreImpacts: {
            containment: 6,
            governance: 4,
            communication: -6,
            continuity: -14,
            evidence: 4,
          },
          rationale:
            "Stopping movement reduces the chance of dispatching on corrupted instructions, but a total pause is a severe continuity choice when some routes can still be verified by people.",
          tradeOffs:
            "You gain control over dispatch quality, and you accept a wide, immediate service failure plus likely perishable or contractual losses.",
          strengths: [
            "Avoids sending drivers out on unverified electronic instructions.",
            "Creates time for technical scoping without new warehouse transactions.",
          ],
          potentialGaps: [
            "Does not distinguish between unsafe systems and deliveries that supervisors can still verify.",
            "Customer and driver communication becomes urgent and negative all at once.",
            "A full stop can pressure later recovery decisions toward speed over safety.",
          ],
          recommendedFollowUp: [
            "Identify any deliveries that can be released using independent paper confirmation.",
            "Prepare a factual delay message for customers already expecting collection.",
          ],
        },
      ],
    },
    {
      id: "stage-5-possible-data-theft",
      timestamp: "Monday 11:45 CET",
      title: "Possible theft of employee or customer data",
      incidentUpdate:
        "A message claiming to represent the incident now says files were copied before they were locked. Overnight network records show unusual outbound volume from a server that hosts HR documents. Customer delivery records sit on the same storage environment as some internal folders.",
      availableFacts: [
        "There is a claim that data was taken, not only locked.",
        "Network records show unusual outbound volume overnight from an HR-related server.",
        "Employee information and some customer delivery records are stored in environments that may have been reachable.",
        "No one has confirmed which files, if any, actually left the network.",
      ],
      knownUnknowns: [
        "Whether the theft claim is true, inflated or a pressure tactic.",
        "What data types might be involved if a copy occurred.",
        "Whether personal data of employees or customers is affected.",
        "Which logs still exist to confirm or challenge the claim.",
      ],
      options: [
        {
          id: "s5-preserve-and-assess",
          title: "Preserve logs and open an internal privacy assessment",
          description:
            "Treat the claim as a potential data-theft event until it can be confirmed or reduced. Preserve relevant logs and server images where practical, brief legal and privacy contacts inside the company, and avoid public statements that assert either a confirmed breach or a confirmed non-breach.",
          scoreImpacts: {
            containment: 4,
            governance: 12,
            communication: 6,
            continuity: 0,
            evidence: 14,
          },
          rationale:
            "Theft claims during ransomware events are common and sometimes true. The useful first move is to protect evidence and start a factual assessment, not to guess in public.",
          tradeOffs:
            "This does not yet satisfy parties who want an immediate public answer, and it consumes specialist time while deliveries are still disrupted.",
          strengths: [
            "Keeps options open for later notifications based on facts.",
            "Protects the records needed to understand whether data left the environment.",
            "Brings privacy and legal roles in without waiting for a media cycle.",
          ],
          potentialGaps: [
            "Internal assessment still needs a clock; preservation alone is not a conclusion.",
            "Customer-facing teams need guidance on what they may and may not say.",
          ],
          recommendedFollowUp: [
            "Define what would confirm, challenge or remain uncertain about the theft claim.",
            "Map which employee and customer data stores were reachable from the affected paths.",
          ],
        },
        {
          id: "s5-public-breach-announcement",
          title: "Announce a data breach publicly this morning",
          description:
            "Publish a statement that Northstar Logistics has suffered a ransomware incident and that employee and customer data has been stolen. Inform all customers in the same terms so nobody hears it first from someone else.",
          scoreImpacts: {
            containment: 0,
            governance: -6,
            communication: -4,
            continuity: -4,
            evidence: -2,
          },
          rationale:
            "Transparency matters, but stating theft as fact before it is established can mislead customers, staff and authorities. Over-announcing is difficult to unwind and is not the same as meeting a later notification duty.",
          tradeOffs:
            "You occupy the public narrative early, and you may publish details that the investigation later narrows, widens or contradicts.",
          strengths: [
            "Avoids a prolonged public silence if the claim later proves true.",
            "Treats people whose data might be involved as stakeholders.",
          ],
          potentialGaps: [
            "Presents unverified theft as a confirmed event.",
            "Can create unnecessary alarm and conflicting later updates.",
            "May complicate a more precise notification once the facts are better known.",
          ],
          recommendedFollowUp: [
            "Replace a categorical theft statement with a factual update on what is confirmed, what is being assessed, and when the next update will come.",
            "Keep a record of what was said, when, and on what basis.",
          ],
        },
        {
          id: "s5-treat-as-bluff",
          title: "Treat the theft claim as a bluff and focus only on recovery",
          description:
            "Assume the data-theft claim is pressure to pay. Do not preserve extra logs, do not brief privacy contacts, and put all effort into getting files and the logistics platform back.",
          scoreImpacts: {
            containment: -2,
            governance: -12,
            communication: -10,
            continuity: 4,
            evidence: -14,
          },
          rationale:
            "Some claims are bluffs, and some are not. Discarding the question removes the chance to check it while logs still exist, and it leaves the organisation unprepared if the claim is later substantiated.",
          tradeOffs:
            "Recovery work gets a clearer queue, and a potentially serious data event is left unexamined.",
          strengths: [
            "Avoids being driven only by the attacker’s narrative.",
            "Keeps technical effort on restoring operations.",
          ],
          potentialGaps: [
            "Unusual outbound traffic is an independent reason to investigate, even without the claim.",
            "Employee and customer data questions will still arrive from other parties.",
            "Evidence needed later may already be rotating out of logs.",
          ],
          recommendedFollowUp: [
            "Reopen the theft question with log preservation and an internal privacy review.",
            "Separate recovery tasks from the assessment of possible data copying.",
          ],
        },
      ],
    },
    {
      id: "stage-6-communication",
      timestamp: "Monday 13:20 CET",
      title: "Communication with management, customers and media",
      incidentUpdate:
        "The managing director wants a statement before the afternoon leadership call. A trade journalist has left a voicemail asking about ‘a cyber attack at Northstar’. Two key customers have asked, in writing, why collections did not happen this morning.",
      availableFacts: [
        "Senior management has not yet had a single agreed picture of what is known.",
        "External media interest exists, but no interview has been given.",
        "Named customers are waiting for an explanation of missed collections.",
        "Staff on the yard and in customer service are already telling informal versions of events.",
      ],
      knownUnknowns: [
        "How much the journalist already believes they know.",
        "Which facts will still be true by the end of the day.",
        "Whether customers expect operational detail, security detail, or both.",
        "Who is authorised to speak on behalf of the company.",
      ],
      options: [
        {
          id: "s6-brief-then-hold",
          title: "Brief management first, then use a coordinated holding statement",
          description:
            "Give leadership a short brief of confirmed facts, open questions and current operational impact. Issue a holding statement to affected customers and a consistent internal note to staff. For media, acknowledge the enquiry, decline extra detail, and offer a time for a later update.",
          scoreImpacts: {
            containment: 0,
            governance: 10,
            communication: 16,
            continuity: 4,
            evidence: 2,
          },
          rationale:
            "Management cannot support decisions they have not heard. Customers need a factual operational update. Media does not need an unverified technical narrative. Sequencing those audiences reduces contradiction.",
          tradeOffs:
            "You will not satisfy people who want a full public technical account today, and preparing even a short brief takes time from other responders.",
          strengths: [
            "Puts leadership on a shared factual baseline.",
            "Gives customers a consistent explanation of delay without over-claiming.",
            "Avoids leaving staff to invent their own story on the yard.",
          ],
          potentialGaps: [
            "Holding statements must be updated as facts change, or they become a new problem.",
            "Key customers may still need a named contact for their specific consignments.",
          ],
          recommendedFollowUp: [
            "Agree who approves the next external update and when it will be reviewed.",
            "Keep a log of what was said to management, staff, customers and media.",
          ],
        },
        {
          id: "s6-let-operations-improvise",
          title: "Let operations tell customers whatever keeps deliveries moving",
          description:
            "Authorise supervisors and customer-service staff to explain the situation in their own words if it helps release vehicles and calm callers. Leadership can be briefed later. Ignore the journalist for now.",
          scoreImpacts: {
            containment: 0,
            governance: -8,
            communication: -6,
            continuity: 8,
            evidence: -4,
          },
          rationale:
            "Local honesty can help a single caller, but many informal accounts become contradictory. That harms both trust and later legal or customer reviews of what the company said.",
          tradeOffs:
            "Some deliveries and conversations may move faster, and the organisation loses a single version of events.",
          strengths: [
            "Does not leave front-line staff silent when customers are already calling.",
            "Keeps the focus on getting goods moving.",
          ],
          potentialGaps: [
            "Different customers will hear different stories, including speculation about cause.",
            "Management is still unbriefed while external narrative forms.",
            "There will be no reliable record of what was promised.",
          ],
          recommendedFollowUp: [
            "Replace improvised explanations with a short approved holding line.",
            "Brief management before the next external conversation that could set expectations.",
          ],
        },
        {
          id: "s6-detailed-public-statement",
          title: "Issue a detailed public statement naming ransomware and possible theft",
          description:
            "Publish a full statement on the website and to the journalist describing ransomware, privileged-account suspicions, possible employee and customer data theft, and current delivery failures. Copy all customers at once.",
          scoreImpacts: {
            containment: 0,
            governance: -4,
            communication: -2,
            continuity: -6,
            evidence: -2,
          },
          rationale:
            "A detailed dump of unverified technical and data-theft points can look like openness while locking the company into claims it cannot yet support. It also gives the journalist more than the incident team can currently explain.",
          tradeOffs:
            "You appear forthcoming, and you may publish uncertainties as if they were established findings.",
          strengths: [
            "Does not hide that a serious incident is affecting service.",
            "Treats all customers as entitled to the same information.",
          ],
          potentialGaps: [
            "Names technical theories and possible theft before they are established.",
            "Makes later, more accurate updates look like reversals.",
            "Can amplify concern among staff and customers without helping them act.",
          ],
          recommendedFollowUp: [
            "Rework public language around confirmed service impact and a commitment to further updates.",
            "Keep investigative detail inside the incident team and advisers until it is stable.",
          ],
        },
      ],
    },
    {
      id: "stage-7-backup-recovery",
      timestamp: "Monday 15:40 CET",
      title: "Backup validation and recovery decision",
      incidentUpdate:
        "The provider reports that backups of the logistics platform and several file shares exist. The last backup set that currently looks complete is from Friday 22:00. A more recent overnight copy sits on storage that was reachable from the affected network. A payment-demand message offers a decryptor if payment is made. Some customer orders created this morning exist only in memory, on paper, or in mailboxes.",
      availableFacts: [
        "A Friday evening backup set is available and has not yet been integrity-checked in isolation.",
        "A newer backup may have been exposed to the same environment as the incident.",
        "Paying is being presented as a faster path to readable files.",
        "Monday morning operational data is only partly represented in backups.",
      ],
      knownUnknowns: [
        "Whether the Friday backups are clean and restorable.",
        "Whether the overnight copy is already affected.",
        "Whether a paid decryptor would work, or would work safely.",
        "How much Monday data can be rebuilt from paper, scanners and email.",
      ],
      options: [
        {
          id: "s7-validate-then-restore",
          title: "Validate backups offline and restore from last known-good",
          description:
            "Copy the Friday backup set to an isolated environment, check integrity, and plan restoration from that point. Do not pay. Rebuild Monday activity from paper, warehouse records and email where needed. Leave the overnight copy untouched until it can be examined without connecting it to production.",
          scoreImpacts: {
            containment: 8,
            governance: 10,
            communication: 4,
            continuity: 6,
            evidence: 10,
          },
          rationale:
            "A backup is only useful if it is trustworthy. Isolated validation takes time, but it avoids restoring the incident along with the data. Refusing payment keeps recovery under Northstar’s control and avoids a second dependency.",
          tradeOffs:
            "Monday data will be incomplete. Restoration is slower than a promised decryptor. Some deliveries will remain delayed.",
          strengths: [
            "Treats backup integrity as a recovery requirement, not an afterthought.",
            "Avoids connecting a possibly affected overnight copy straight to production.",
            "Does not add a payment path whose result cannot be assured.",
          ],
          potentialGaps: [
            "The business still needs a plan for orders created after Friday evening.",
            "Validation work must be staffed so it does not stall indefinitely.",
          ],
          recommendedFollowUp: [
            "Define a restoration order: identity and logging, then logistics platform, then file shares.",
            "Assign operations staff to reconstruct Monday consignments from non-file-share sources.",
          ],
        },
        {
          id: "s7-pay-ransom",
          title: "Pay for the offered decryptor to restore faster",
          description:
            "Open a payment path to obtain the decryptor, aiming to unlock files and the logistics platform in time for Tuesday operations. Keep backups as a fallback but do not spend the evening validating them first.",
          scoreImpacts: {
            containment: -8,
            governance: -12,
            communication: -6,
            continuity: 12,
            evidence: -10,
          },
          rationale:
            "Payment can look like the only way to protect customers, but it does not guarantee recovery, can fund further harm, and can distract from backup validation. This is a policy and risk decision, not a technical all-clear.",
          tradeOffs:
            "You might recover some files sooner, and you accept uncertain results, possible re-infection, and a recovery process you do not control.",
          strengths: [
            "Takes the delivery backlog seriously as a reason to consider every recovery path.",
            "Keeps backups in mind as a fallback rather than discarding them.",
          ],
          potentialGaps: [
            "A decryptor does not confirm that copied data is safe or that access is gone.",
            "Time spent negotiating is time not spent validating backups.",
            "There is no assurance the offered tool works or is complete.",
          ],
          recommendedFollowUp: [
            "If payment is still being considered, pause it until backup validation results are known and decision-makers have been briefed on uncertainty.",
            "Preserve the original encrypted systems rather than overwriting them in place.",
          ],
        },
        {
          id: "s7-restore-latest-unchecked",
          title: "Restore the most recent backup immediately without checks",
          description:
            "Restore the overnight copy straight onto the logistics platform and file servers so Monday data is not lost. Skip isolated integrity checks to save time.",
          scoreImpacts: {
            containment: -10,
            governance: -4,
            communication: 0,
            continuity: 8,
            evidence: -12,
          },
          rationale:
            "The newest copy is attractive because it contains more of today, but a backup taken while the incident was active can bring the problem back. Restoring in place can also overwrite evidence.",
          tradeOffs:
            "You may recover this morning’s orders, and you may restore affected data onto production.",
          strengths: [
            "Attempts to protect Monday operational data, not only last week’s.",
            "Shows urgency about the delivery backlog.",
          ],
          potentialGaps: [
            "No integrity check before production use.",
            "Overnight storage may have been reachable by the same activity.",
            "In-place restore can destroy the current state needed for later review.",
          ],
          recommendedFollowUp: [
            "Stop further production restores until a copy has been validated in isolation.",
            "Keep an untouched image of current systems before another restore attempt.",
          ],
        },
      ],
    },
    {
      id: "stage-8-lessons-learned",
      timestamp: "Tuesday 09:00 CET",
      title: "Post-incident actions and lessons learned",
      incidentUpdate:
        "Core email is available. A limited logistics-platform restore is in progress from the Friday backup, with Monday consignments being rebuilt manually. Two devices remain isolated. The theft claim is still unconfirmed. Staff are tired and want to know whether the incident is over.",
      availableFacts: [
        "Some services are back, but recovery is incomplete.",
        "The managed service provider was involved to varying degrees depending on earlier choices.",
        "Several decisions were made under time pressure without a written action log.",
        "Customers still expect a clearer picture of remaining delays.",
      ],
      knownUnknowns: [
        "The initial access path has not been confirmed.",
        "Whether additional accounts or systems remain affected.",
        "What the overnight outbound traffic actually contained.",
        "Which improvements the organisation is prepared to fund and assign.",
      ],
      options: [
        {
          id: "s8-structured-debrief",
          title: "Run a structured debrief and assign improvement actions",
          description:
            "Keep a reduced incident team in place until restoration criteria are met. Hold a factual debrief, write down what is still unknown, and assign owners for identity hardening, backup testing, supplier escalation, manual-operations rehearsal and communication templates. Schedule a follow-up review.",
          scoreImpacts: {
            containment: 4,
            governance: 14,
            communication: 8,
            continuity: 6,
            evidence: 8,
          },
          rationale:
            "Recovery is not the same as learning. A short, structured close converts a painful Monday into named improvements without pretending the organisation now has a certificate of readiness.",
          tradeOffs:
            "Staff remain in incident mode a little longer, and improvement work competes with the delivery backlog.",
          strengths: [
            "Separates ‘service is returning’ from ‘the incident is understood and closed’.",
            "Turns observations into owners and follow-up work.",
            "Includes the supplier relationship rather than treating it as out of scope.",
          ],
          potentialGaps: [
            "Actions without dates and owners will still fade.",
            "Technical root cause may take longer than the debrief.",
          ],
          recommendedFollowUp: [
            "Record open questions, including the unconfirmed theft claim, with a next review date.",
            "Test backups and break-glass access as named recovery actions, not assumptions.",
          ],
        },
        {
          id: "s8-close-and-return-to-bau",
          title: "Declare the incident closed and return to business as usual",
          description:
            "Tell staff the event is over, stand down the response group, and put all effort into catching up missed deliveries. Lessons can be discussed at a later, unspecified meeting if time allows.",
          scoreImpacts: {
            containment: -4,
            governance: -14,
            communication: -8,
            continuity: 6,
            evidence: -10,
          },
          rationale:
            "The backlog is real, but closing before access paths, identity and the theft claim are understood leaves the next incident to start from the same position. Informal promises to ‘talk later’ often disappear.",
          tradeOffs:
            "Operations regain people immediately, and the organisation loses the moment when facts are still fresh.",
          strengths: [
            "Recognises customer delivery recovery as an urgent business need.",
            "Reduces meeting load on exhausted staff.",
          ],
          potentialGaps: [
            "Unconfirmed issues are treated as finished because services are partly back.",
            "Supplier performance and backup quality are not reviewed.",
            "Evidence and decision records are less likely to be retained.",
          ],
          recommendedFollowUp: [
            "Reopen a short, time-boxed review with named owners before the week ends.",
            "Do not describe the event as fully closed while restoration criteria and the theft question remain open.",
          ],
        },
        {
          id: "s8-rebuild-everything",
          title: "Keep the incident open and rebuild every system from scratch",
          description:
            "Refuse to close any part of the incident until every server, PC, cloud account and warehouse device has been rebuilt. Delay remaining deliveries until that rebuild is complete.",
          scoreImpacts: {
            containment: 6,
            governance: -2,
            communication: -4,
            continuity: -12,
            evidence: 6,
          },
          rationale:
            "Thorough rebuilding can be justified for systems that were clearly affected. Applying it to every system without scoping extends harm to customers and can stall evidence work and decision-making.",
          tradeOffs:
            "You reduce the chance of leaving a foothold on an in-scope system, and you keep the business in an extended outage that may not match the evidence.",
          strengths: [
            "Does not assume that a partial restore equals a clean environment.",
            "Keeps attention on identity and endpoint rebuild, not only file recovery.",
          ],
          potentialGaps: [
            "Lacks scoping, so effort is not aimed at the systems that matter most.",
            "An unbounded rebuild delays communication of a realistic recovery plan.",
            "Staff and customers are left without a usable definition of ‘done’.",
          ],
          recommendedFollowUp: [
            "Rebuild systems with confirmed or likely involvement first, based on evidence.",
            "Publish internal restoration criteria so the incident can be reduced in stages.",
          ],
        },
      ],
    },
  ],
} as const;

export const scenario: Scenario = parseScenario(lockedOutScenarioDefinition);

export const STAGE_COUNT = scenario.stages.length;
export const OPTIONS_PER_STAGE = 3;
