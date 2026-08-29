import { labMissionSchema } from "./schemas";
import type {
  ArchitectureComponent,
  AttackStageId,
  ComponentReaction,
  LabDifficulty,
  ReadinessVector,
  SlotId,
} from "./types";

function reaction(
  outcome: ComponentReaction["outcome"],
  attackerAction: string,
  controlReaction: string,
  explanation: string,
  architectDetail: string,
): ComponentReaction {
  return { outcome, attackerAction, controlReaction, explanation, architectDetail };
}

function component(
  id: string,
  slotId: SlotId,
  name: string,
  icon: string,
  area: ArchitectureComponent["area"],
  options: {
    description: string;
    architectDescription: string;
    tradeOff: string;
    architectTradeOff: string;
    hint: string;
    recommended?: boolean;
    difficulties?: readonly LabDifficulty[];
    readiness: ReadinessVector;
    reactions: Partial<Record<AttackStageId, ComponentReaction>>;
  },
): ArchitectureComponent {
  return {
    id,
    slotId,
    name,
    icon,
    area,
    description: options.description,
    architectDescription: options.architectDescription,
    tradeOff: options.tradeOff,
    architectTradeOff: options.architectTradeOff,
    hint: options.hint,
    recommended: options.recommended === true,
    difficulties: options.difficulties ?? ["guided", "architect"],
    readiness: options.readiness,
    reactions: options.reactions,
  };
}

const rawMission = {
  id: "lab-poisoned-claim",
  title: "The Poisoned Claim",
  missionLabel: "Mission 01",
  attack: {
    id: "poisoned-claim",
    name: "The Poisoned Claim",
    company: "Nordic Shield Insurance",
    fictionalNote:
      "Nordic Shield Insurance and this incident are fictional. They exist so you can practise architecture choices, not to describe a real insurer.",
    tagline: "Build it. Then let the attack loose.",
    scenario:
      "Nordic Shield Insurance has introduced an AI assistant that helps claims handlers summarize insurance cases, search documents and prepare customer responses. An attacker uses stolen credentials and uploads a poisoned claims document containing hidden instructions. The attacker attempts to manipulate the AI, reach customer information and export sensitive data.",
    stages: [
      {
        id: "initial-access",
        number: 1,
        name: "Initial access",
        summary: "The attacker tries stolen employee credentials against the claims portal.",
        guidedDetail:
          "Stolen passwords are common. Multi-factor authentication stops a password on its own. Clear roles limit how far a compromised account can go.",
        architectPrompt: "Watch how identity and access control treat a reused password.",
        highlight: ["claims-portal", "identity"],
        controllingSlots: ["identity"],
        requiresAttackerInside: false,
      },
      {
        id: "poisoned-document",
        number: 2,
        name: "Poisoned document",
        summary: "The account uploads a claims file that hides extra instructions.",
        guidedDetail:
          "Uploading a claim is normal work. Treat files and retrieved content as untrusted input even when the upload itself is allowed.",
        architectPrompt: "A legitimate business function can still carry a hostile payload.",
        highlight: ["uploaded-document", "ai-application", "claims-portal"],
        controllingSlots: [],
        requiresAttackerInside: true,
        legitimateActivity: true,
      },
      {
        id: "prompt-injection",
        number: 3,
        name: "Indirect prompt injection",
        summary: "The AI reads the document and may follow the hidden instructions.",
        guidedDetail:
          "A filter that only checks what the user types will miss instructions hidden in a file. Guardrails need to inspect document content and model output.",
        architectPrompt: "See whether retrieved content is treated as untrusted input.",
        highlight: ["uploaded-document", "guardrails", "ai-application"],
        controllingSlots: ["guardrails"],
        requiresAttackerInside: true,
      },
      {
        id: "model-data",
        number: 4,
        name: "Model and data exposure",
        summary: "The manipulated AI tries to send context to the model and pull extra claims data.",
        guidedDetail:
          "Where the model lives, how the app reaches data, and how secrets are stored decide the blast radius.",
        architectPrompt: "Boundary, identity and data path all matter together.",
        highlight: ["model", "data-access", "secrets", "claims-database", "ai-application"],
        controllingSlots: ["model", "data-access", "secrets"],
        requiresAttackerInside: true,
      },
      {
        id: "unsafe-action",
        number: 5,
        name: "Unsafe action",
        summary: "The AI tries to export sensitive claim information through a connected tool.",
        guidedDetail:
          "If the assistant can act on its own, a manipulated model can finish the job. Human approval before sensitive actions is a last gate.",
        architectPrompt: "Agency decides whether a bad instruction can leave the building.",
        highlight: ["ai-application", "agency", "external-network"],
        controllingSlots: ["agency"],
        requiresAttackerInside: true,
      },
      {
        id: "detection",
        number: 6,
        name: "Detection and containment",
        summary: "Monitoring either explains the abuse in time or only stores the evidence.",
        guidedDetail:
          "Logs that nobody watches are not detection. Correlation across AI, identity and data access is what turns noise into a response.",
        architectPrompt: "Ask whether anyone would see this in time to act.",
        highlight: ["monitoring", "claims-database", "ai-application"],
        controllingSlots: ["monitoring"],
        requiresAttackerInside: false,
      },
    ],
  },
  slots: [
    {
      id: "identity",
      name: "Identity and access",
      zone: "user-input",
      purpose: "Who can open the claims portal, and how much can they do?",
      architectPurpose: "Authentication and authorization at the employee edge.",
    },
    {
      id: "model",
      name: "AI model",
      zone: "ai-application",
      purpose: "Where does the model run, and who else can see the prompts?",
      architectPurpose: "Model hosting, retention and network exposure.",
    },
    {
      id: "guardrails",
      name: "AI input and output protection",
      zone: "ai-application",
      purpose: "Does the assistant inspect documents and answers, or only what people type?",
      architectPurpose: "Untrusted content inspection on retrieve, prompt and completion.",
    },
    {
      id: "data-access",
      name: "Access to claims data",
      zone: "protected-systems",
      purpose: "How does the AI reach customer records?",
      architectPurpose: "Data path, privilege and purpose limitation.",
    },
    {
      id: "agency",
      name: "AI agency and approval",
      zone: "ai-application",
      purpose: "Can the assistant act alone on sensitive steps?",
      architectPurpose: "Human control of high-impact tool use.",
    },
    {
      id: "monitoring",
      name: "Monitoring and detection",
      zone: "protected-systems",
      purpose: "Will anyone notice unusual AI or data-access behaviour?",
      architectPurpose: "Telemetry, correlation and response time.",
    },
    {
      id: "secrets",
      name: "Secrets management",
      zone: "ai-application",
      purpose: "Where do service passwords and keys live?",
      architectPurpose: "Credential storage and reuse after application compromise.",
    },
    {
      id: "supply-chain",
      name: "Software supply chain",
      zone: "ai-application",
      purpose: "How is the assistant built and shipped?",
      architectPurpose: "Pipeline hygiene, dependency and image trust.",
    },
  ],
  fixedNodes: [
    {
      id: "claims-handler",
      name: "Claims Handler",
      zone: "user-input",
      description: "An employee using the portal to work a case.",
    },
    {
      id: "claims-portal",
      name: "Claims Portal",
      zone: "user-input",
      description: "The web app where staff sign in and upload files.",
    },
    {
      id: "uploaded-document",
      name: "Uploaded Claims Document",
      zone: "user-input",
      description: "A file the assistant will later retrieve and summarise.",
    },
    {
      id: "ai-application",
      name: "AI Claims Application",
      zone: "ai-application",
      description: "The assistant that reads documents, searches and drafts replies.",
    },
    {
      id: "claims-database",
      name: "Claims Database",
      zone: "protected-systems",
      description: "Customer records, case notes and payout details.",
    },
    {
      id: "external-network",
      name: "External Network",
      zone: "protected-systems",
      description: "Anything outside Nordic Shield’s trusted environment.",
    },
  ],
  components: [
    component(
      "identity-mfa-rbac",
      "identity",
      "MFA and role-based access",
      "shield",
      "identity",
      {
        description: "Sign-in needs a second factor. Staff only get the claims work they need.",
        architectDescription: "Phishing-resistant MFA with role separation on claims functions.",
        tradeOff: "A little more friction at sign-in. Much less damage if a password leaks.",
        architectTradeOff: "Higher operational cost and some user friction. Stronger isolation and auditability.",
        hint: "Stolen passwords fail if a second factor is required.",
        recommended: true,
        readiness: { prevention: 4, dataProtection: 1, containment: 3, detection: 1 },
        reactions: {
          "initial-access": reaction(
            "blocked",
            "Reuse the stolen password on the claims portal.",
            "MFA rejects the password. The role would have been limited anyway.",
            "The stolen password is not enough. The attacker never reaches the portal.",
            "Phishing-resistant MFA plus RBAC stops password replay and would have limited a session that did get through.",
          ),
        },
      },
    ),
    component(
      "identity-password",
      "identity",
      "Password-only access",
      "key",
      "identity",
      {
        description: "Staff sign in with a password. Fast to roll out.",
        architectDescription: "Password authentication with shared claims-handler access.",
        tradeOff: "Faster for staff. A leaked password is a full sign-in.",
        architectTradeOff: "Lower operational cost and easier integration. Broader access after credential theft.",
        hint: "If only a password stands in the way, a stolen password is a stolen login.",
        readiness: { prevention: 0, dataProtection: 0, containment: 0, detection: 0 },
        reactions: {
          "initial-access": reaction(
            "successful",
            "Reuse the stolen password on the claims portal.",
            "Password-only sign-in accepts the credential.",
            "The attacker signs in as a claims handler.",
            "No second factor and no role split. The stolen identity is fully usable.",
          ),
        },
      },
    ),
    component(
      "identity-mfa-flat",
      "identity",
      "MFA without clear roles",
      "badge",
      "identity",
      {
        description: "A second factor is required, but most staff share the same access.",
        architectDescription: "MFA is on, but claims roles are broad and poorly separated.",
        tradeOff: "Stops simple password reuse. A signed-in user can still see too much.",
        architectTradeOff: "Better authentication than passwords alone. Weak authorization once inside.",
        hint: "MFA helps. Shared roles still spread the blast radius.",
        difficulties: ["architect"],
        readiness: { prevention: 3, dataProtection: 1, containment: 1, detection: 1 },
        reactions: {
          "initial-access": reaction(
            "contained",
            "Reuse the stolen password on the claims portal.",
            "MFA blocks password-only replay from outside. A phished session would still be wide.",
            "Password reuse fails, but the identity model is still too open if a live session is stolen.",
            "MFA contains this particular replay. Missing RBAC remains a residual path for a hijacked session.",
          ),
        },
      },
    ),
    component(
      "model-private",
      "model",
      "Private enterprise LLM",
      "cpu",
      "ai-security",
      {
        description: "The model runs in an approved environment. Prompts are not kept for training.",
        architectDescription: "Private endpoint, no prompt retention, approved network path only.",
        tradeOff: "More setup. Customer text stays inside the approved boundary.",
        architectTradeOff: "Higher cost and more engineering. Better isolation and data control.",
        hint: "A public consumer API is a shortcut that sends case text outside.",
        recommended: true,
        readiness: { prevention: 2, dataProtection: 4, containment: 2, detection: 1 },
        reactions: {
          "model-data": reaction(
            "contained",
            "Send case text and hidden instructions to the model.",
            "The private endpoint keeps processing in the approved boundary.",
            "The model call does not leave Nordic Shield’s approved environment.",
            "No retention and a private endpoint remove the consumer-API exposure. Network isolation still depends on the data path.",
          ),
        },
      },
    ),
    component(
      "model-public",
      "model",
      "Public AI API",
      "cloud",
      "ai-security",
      {
        description: "A hosted public model. Quick to connect.",
        architectDescription: "Public model API with insufficient enterprise data controls.",
        tradeOff: "Fast integration. Case text may leave the company.",
        architectTradeOff: "Lower cost and quicker delivery. Weak control of retention and residency.",
        hint: "If the model is outside, so is whatever you send it.",
        readiness: { prevention: 1, dataProtection: 0, containment: 0, detection: 0 },
        reactions: {
          "model-data": reaction(
            "successful",
            "Send case text and hidden instructions to a public model endpoint.",
            "The public API accepts the prompt. Enterprise controls are too thin.",
            "Sensitive context is processed outside the trusted environment.",
            "Insufficient contractual and technical controls on the public endpoint create an external exposure path.",
          ),
        },
      },
    ),
    component(
      "model-private-broad",
      "model",
      "Private model, broad network",
      "network",
      "ai-security",
      {
        description: "A private model, reachable from much of the internal network.",
        architectDescription: "Private endpoint placed on a flat internal network.",
        tradeOff: "Avoids a public API. Internal systems can still reach it too easily.",
        architectTradeOff: "Better than a public API. Weaker isolation than a tightly scoped endpoint.",
        hint: "Private is not the same as segmented.",
        difficulties: ["architect"],
        readiness: { prevention: 2, dataProtection: 2, containment: 1, detection: 1 },
        reactions: {
          "model-data": reaction(
            "contained",
            "Send case text to the private model from the assistant.",
            "Traffic stays internal, but the model is easy to reach from other systems.",
            "Nothing leaves to a public API. The flat network still widens internal exposure.",
            "Residency is preserved. East-west access remains a residual risk if the app is abused.",
          ),
        },
      },
    ),
    component(
      "guard-full",
      "guardrails",
      "Input and output guardrails",
      "scan",
      "ai-security",
      {
        description: "Checks user text, retrieved documents and the model’s answers.",
        architectDescription: "Policy filter on prompt, retrieved chunks and completions, including documents.",
        tradeOff: "More processing. Hidden file instructions are much harder to sneak through.",
        architectTradeOff: "More latency and tuning. Stronger control of untrusted retrieved content.",
        hint: "The danger is often in the file, not in what the handler typed.",
        recommended: true,
        readiness: { prevention: 4, dataProtection: 2, containment: 2, detection: 2 },
        reactions: {
          "prompt-injection": reaction(
            "blocked",
            "Have the assistant retrieve the file and obey hidden instructions.",
            "Document inspection flags the injected content. Output policy would also hold.",
            "The hidden instructions never become trusted orders.",
            "Treating retrieved content as untrusted input, with output validation, stops this indirect injection.",
          ),
        },
      },
    ),
    component(
      "guard-prompt-only",
      "guardrails",
      "Basic prompt filter",
      "filter",
      "ai-security",
      {
        description: "Only checks the text a person types into the chat box.",
        architectDescription: "Keyword and allow-list checks on the user prompt only.",
        tradeOff: "Cheap and simple. Blind to instructions hiding in documents.",
        architectTradeOff: "Easy integration and low cost. No inspection of retrieved content or completions.",
        hint: "If you only filter the chat box, a file can still issue orders.",
        readiness: { prevention: 1, dataProtection: 0, containment: 0, detection: 0 },
        reactions: {
          "prompt-injection": reaction(
            "successful",
            "Hide instructions in the uploaded claim and let retrieval carry them in.",
            "The user-prompt filter never sees the file contents.",
            "The assistant treats the document as ordinary context and follows the hidden orders.",
            "Indirect prompt injection succeeds because retrieved content is trusted by default.",
          ),
        },
      },
    ),
    component(
      "guard-input-only",
      "guardrails",
      "Input scanning, no output check",
      "eye",
      "ai-security",
      {
        description: "Looks at incoming text and files, but not at what the model replies or tries to do.",
        architectDescription: "Inbound scanning without completion or tool-call validation.",
        tradeOff: "Catches some document tricks. Misses a model that still tries a bad action.",
        architectTradeOff: "Partial coverage. Lower false-positive cost, weaker control of actions.",
        hint: "Finding a suspicious file is not the same as blocking a suspicious action.",
        difficulties: ["architect"],
        readiness: { prevention: 2, dataProtection: 1, containment: 1, detection: 2 },
        reactions: {
          "prompt-injection": reaction(
            "contained",
            "Hide instructions in the claim file.",
            "Inbound scanning raises a warning. Completions are not validated.",
            "The injection is partly seen. Enough instruction can still reach the model.",
            "Input inspection without output or tool validation contains some payload, not the whole chain.",
          ),
        },
      },
    ),
    component(
      "data-api",
      "data-access",
      "Restricted Claims API",
      "lock",
      "data-protection",
      {
        description: "The assistant asks a small API for only the fields this case needs.",
        architectDescription: "Least-privilege, purpose-filtered Claims API bound to the service identity.",
        tradeOff: "More work to build. A manipulated assistant cannot dump the whole book.",
        architectTradeOff: "More engineering. Stronger least privilege and auditability.",
        hint: "The assistant should not sit on the database as if it were an admin.",
        recommended: true,
        readiness: { prevention: 2, dataProtection: 4, containment: 3, detection: 1 },
        reactions: {
          "model-data": reaction(
            "contained",
            "Ask for extra customer records beyond this claim.",
            "The API rejects calls outside the service identity and purpose filter.",
            "The assistant cannot read the whole claims book.",
            "Least privilege on a purpose-built API stops bulk retrieval even if the model is manipulated.",
          ),
        },
      },
    ),
    component(
      "data-direct",
      "data-access",
      "Direct database access",
      "database",
      "data-protection",
      {
        description: "The AI application talks straight to the claims database.",
        architectDescription: "Application connection with broad table rights.",
        tradeOff: "Simple for developers. A bad instruction can ask for far too much.",
        architectTradeOff: "Faster implementation. Large blast radius if the app is abused.",
        hint: "Direct database rights turn the assistant into a powerful insider.",
        readiness: { prevention: 0, dataProtection: 0, containment: 0, detection: 1 },
        reactions: {
          "model-data": reaction(
            "successful",
            "Query neighbouring claims and customer identifiers.",
            "The database accepts the application’s broad connection.",
            "Sensitive records are read well beyond the open case.",
            "Direct DB access gives the manipulated app an insider-sized blast radius.",
          ),
        },
      },
    ),
    component(
      "data-nightly",
      "data-access",
      "Nightly claims copy",
      "copy",
      "data-protection",
      {
        description: "A nightly copy of claims data sits with the AI application for speed.",
        architectDescription: "Local replica of claims data inside the AI trust zone.",
        tradeOff: "Snappier answers. The copy is still a pile of customer data beside the model.",
        architectTradeOff: "Better latency and simpler queries. Weaker control of live purpose and privilege.",
        hint: "A handy copy is still production data.",
        difficulties: ["architect"],
        readiness: { prevention: 1, dataProtection: 1, containment: 0, detection: 1 },
        reactions: {
          "model-data": reaction(
            "successful",
            "Read extra customers from the local claims copy.",
            "The replica is already in the AI zone, so the API gate is skipped.",
            "The assistant reads a broad slice of customer data from the copy.",
            "A nightly copy bypasses live least privilege. Purpose limitation is gone once the file is local.",
          ),
        },
      },
    ),
    component(
      "agency-human",
      "agency",
      "Human approval",
      "person",
      "oversight",
      {
        description: "A person must approve before the assistant sends or exports sensitive data.",
        architectDescription: "Mandatory approval on sensitive tool calls, including export.",
        tradeOff: "Slower on busy days. A manipulated model cannot finish the export alone.",
        architectTradeOff: "More manual work. Stronger control of high-impact actions.",
        hint: "If the assistant can press send, a hidden instruction can press send.",
        recommended: true,
        readiness: { prevention: 1, dataProtection: 2, containment: 4, detection: 1 },
        reactions: {
          "unsafe-action": reaction(
            "blocked",
            "Export customer records to an outside address.",
            "The export waits for a human and is refused.",
            "Nothing sensitive leaves without a person looking at it.",
            "Human-in-the-loop on sensitive tools is the last gate when earlier controls fail.",
          ),
        },
      },
    ),
    component(
      "agency-auto",
      "agency",
      "Automatic tool actions",
      "bolt",
      "oversight",
      {
        description: "If the model is confident, it can act without waiting.",
        architectDescription: "Autonomous tool use gated only on model confidence.",
        tradeOff: "Faster handling. Confidence is a poor stand-in for permission.",
        architectTradeOff: "Lower handling cost. Much more agency for a manipulated model.",
        hint: "Confidence is not the same as a safe action.",
        readiness: { prevention: 0, dataProtection: 0, containment: 0, detection: 0 },
        reactions: {
          "unsafe-action": reaction(
            "successful",
            "Call the export tool while the model looks confident.",
            "Automatic actions fire without a human gate.",
            "Sensitive claim data is sent outside the trusted environment.",
            "Agency based on confidence lets the injection complete the objective.",
          ),
        },
      },
    ),
    component(
      "agency-threshold",
      "agency",
      "Approval above a money threshold",
      "scale",
      "oversight",
      {
        description: "People approve large payouts. Smaller actions go through.",
        architectDescription: "Human approval only when estimated value exceeds a finance threshold.",
        tradeOff: "Protects big payments. A quiet customer-data export may still be ‘small’.",
        architectTradeOff: "Less reviewer load. Gaps for non-financial sensitive actions.",
        hint: "Not every harmful action has a large invoice attached.",
        difficulties: ["architect"],
        readiness: { prevention: 1, dataProtection: 1, containment: 2, detection: 1 },
        reactions: {
          "unsafe-action": reaction(
            "contained",
            "Export a bundle of customer records. No payout is attached.",
            "The finance threshold does not fire. A subset of the export still goes.",
            "Some sensitive data can leave because this was not a large payment.",
            "Thresholds tied to money miss confidentiality events. Partial export remains possible.",
          ),
        },
      },
    ),
    component(
      "monitor-siem",
      "monitoring",
      "SIEM alerts",
      "radar",
      "detection",
      {
        description: "Security monitoring correlates odd AI use, sign-ins and data access.",
        architectDescription: "Central SIEM with detections across identity, AI tools and data stores.",
        tradeOff: "Needs tuning. Unusual access is much more likely to be seen in time.",
        architectTradeOff: "Higher operating cost. Faster, richer detection and response.",
        hint: "Someone has to be watching, with enough context to understand AI abuse.",
        recommended: true,
        readiness: { prevention: 1, dataProtection: 1, containment: 2, detection: 4 },
        reactions: {
          detection: reaction(
            "detected",
            "Leave traces across portal, assistant and data access.",
            "SIEM correlates failed or odd identity events with AI tool use and data reads.",
            "The attempt is visible in time to investigate and contain.",
            "Cross-signal correlation is what turns this from scattered logs into a response.",
          ),
        },
      },
    ),
    component(
      "monitor-logs",
      "monitoring",
      "Basic application logs",
      "list",
      "detection",
      {
        description: "Events are stored. Nobody is assigned to watch them live.",
        architectDescription: "Application logs retained without active monitoring or correlation.",
        tradeOff: "Cheap. Evidence exists after the fact, not in time to stop harm.",
        architectTradeOff: "Low cost. Weak detection and slow containment.",
        hint: "A log file is not an alert.",
        readiness: { prevention: 0, dataProtection: 0, containment: 0, detection: 1 },
        reactions: {
          detection: reaction(
            "successful",
            "Leave traces in application logs.",
            "Logs are stored. No timely alert is raised.",
            "Investigators could reconstruct this later. Nobody is pulled in now.",
            "Retention without monitoring fails the detection objective even when evidence exists.",
          ),
        },
      },
    ),
    component(
      "monitor-thin-alerts",
      "monitoring",
      "Alerts without AI context",
      "bell",
      "detection",
      {
        description: "Security alerts fire, but they do not explain what the assistant was doing.",
        architectDescription: "Generic alerts on access spikes without AI-tool or prompt context.",
        tradeOff: "Someone is pinged. They may not see it was an AI-led export.",
        architectTradeOff: "Some detection. Weak investigation quality and slower containment.",
        hint: "An alert that cannot explain the assistant is easy to dismiss.",
        difficulties: ["architect"],
        readiness: { prevention: 0, dataProtection: 0, containment: 1, detection: 2 },
        reactions: {
          detection: reaction(
            "detected",
            "Trigger generic access alerts.",
            "An alert fires. It lacks AI and document context, so the story is incomplete.",
            "Someone is notified, but the picture is too thin to contain quickly.",
            "Detection without AI-aware correlation is easy to misfile as routine access.",
          ),
        },
      },
    ),
    component(
      "secrets-vault",
      "secrets",
      "Managed identity and vault",
      "vault",
      "data-protection",
      {
        description: "The app uses short-lived identity. Secrets sit in a vault, not in config files.",
        architectDescription: "Workload identity plus a secrets vault. No long-lived keys in config.",
        tradeOff: "More platform work. Stealing the app config does not hand over the database password.",
        architectTradeOff: "Higher engineering cost. Stops credential reuse after app compromise.",
        hint: "If the password lives next to the code, compromising the app steals the password.",
        recommended: true,
        readiness: { prevention: 2, dataProtection: 3, containment: 3, detection: 1 },
        reactions: {
          "model-data": reaction(
            "contained",
            "Read service credentials from the application and reuse them.",
            "There is no long-lived secret in config. The vault issues short-lived access.",
            "Compromising the app does not hand the attacker a reusable database password.",
            "Managed identity removes static credential reuse from this stage.",
          ),
        },
      },
    ),
    component(
      "secrets-config",
      "secrets",
      "Secrets in application config",
      "file",
      "data-protection",
      {
        description: "Connection strings live in configuration beside the app.",
        architectDescription: "Static secrets in environment or config files.",
        tradeOff: "Easy to ship. If the app is abused, those secrets can be reused.",
        architectTradeOff: "Faster implementation. Credential reuse after compromise.",
        hint: "Config files travel with the app.",
        readiness: { prevention: 0, dataProtection: 0, containment: 0, detection: 0 },
        reactions: {
          "model-data": reaction(
            "successful",
            "Read database credentials from application configuration.",
            "Static secrets are present in the app environment.",
            "The attacker can reuse those credentials against protected systems.",
            "Config-stored secrets turn application compromise into further access.",
          ),
        },
      },
    ),
    component(
      "supply-protected",
      "supply-chain",
      "Protected CI/CD pipeline",
      "pipeline",
      "supply-chain",
      {
        description: "Builds scan dependencies, secrets and containers before release.",
        architectDescription: "Pipeline with dependency, secret and image scanning plus signed deploys.",
        tradeOff: "Releases take longer. You are less likely to ship a poisoned helper.",
        architectTradeOff: "More process. Stronger SSDF-aligned build integrity.",
        hint: "This mission’s live attack is the poisoned claim, not a second supply-chain plot.",
        recommended: true,
        readiness: { prevention: 3, dataProtection: 1, containment: 1, detection: 2 },
        reactions: {},
      },
    ),
    component(
      "supply-open",
      "supply-chain",
      "Pipeline without dependency checks",
      "box",
      "supply-chain",
      {
        description: "Code can ship without scanning libraries, secrets or images.",
        architectDescription: "Deployment pipeline without dependency or secret validation.",
        tradeOff: "Faster releases. Weaker assurance that what you run is what you meant.",
        architectTradeOff: "Lower friction. Residual risk in the software you actually deploy.",
        hint: "It will not change this document attack, but it still weakens the architecture.",
        readiness: { prevention: 0, dataProtection: 0, containment: 0, detection: 0 },
        reactions: {},
      },
    ),
  ],
};

export const LAB_MISSION = labMissionSchema.parse(rawMission);

export const LAB_MISSION_ID = LAB_MISSION.id;

export function slotById(id: SlotId) {
  const slot = LAB_MISSION.slots.find((item) => item.id === id);
  if (!slot) {
    throw new Error(`Unknown architecture slot: ${id}`);
  }
  return slot;
}

export function componentById(id: string): ArchitectureComponent | undefined {
  return LAB_MISSION.components.find((item) => item.id === id);
}

export function requireComponent(id: string): ArchitectureComponent {
  const found = componentById(id);
  if (!found) {
    throw new Error(`Unknown architecture component: ${id}`);
  }
  return found;
}

export function componentsFor(difficulty: LabDifficulty, slotId?: SlotId): ArchitectureComponent[] {
  return LAB_MISSION.components.filter((item) => {
    const difficultyOk = item.difficulties.includes(difficulty);
    const slotOk = slotId ? item.slotId === slotId : true;
    return difficultyOk && slotOk;
  });
}
