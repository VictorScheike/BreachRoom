import type { BuilderQuestion } from "./types";

export const BUILDER_QUESTIONS: readonly BuilderQuestion[] = [
  {
    id: "ssb-01",
    number: 1,
    categoryId: "security-by-design",
    tags: ["Security by Design", "Architecture"],
    prompt: "A product team is planning a new customer portal. When should security first be involved?",
    options: [
      {
        letter: "A",
        text: "After the solution has been fully developed",
        feedback:
          "Not quite — important architecture decisions have already been made by then, which makes security changes slower and more expensive.",
      },
      {
        letter: "B",
        text: "During the design phase, before key technology decisions are locked",
        feedback:
          "Correct — early involvement makes it easier to find a solution that supports both the business and security.",
      },
      {
        letter: "C",
        text: "Only during the penetration test before launch",
        feedback:
          "Not quite — penetration testing is useful, but it cannot replace secure design decisions made earlier.",
      },
    ],
    correctLetter: "B",
    mainPoint: "Security by Design means involving security while the solution can still be shaped.",
    architectCorrect:
      "Correct — security creates the most value when it is included before the important design choices are locked.",
    architectWrong:
      "Not quite — security should help shape the solution during design, not only inspect it at the end.",
    visual: {
      kind: "timeline",
      title: "From idea to launch",
      nodes: [
        { id: "idea", label: "Idea" },
        { id: "design", label: "Design", highlight: true, detail: "Involve security" },
        { id: "build", label: "Build" },
        { id: "test", label: "Test" },
        { id: "launch", label: "Launch" },
      ],
    },
    resultRecommendation: "Bring security into projects while the architecture can still be changed.",
  },
  {
    id: "ssb-02",
    number: 2,
    categoryId: "security-by-design",
    tags: ["Security by Design", "Risk"],
    prompt: "Before choosing security controls for a new solution, what should you understand first?",
    options: [
      {
        letter: "A",
        text: "Which security product has the most features",
        feedback:
          "Not quite — a powerful tool does not help if it does not address the actual risks of the solution.",
      },
      {
        letter: "B",
        text: "The purpose, data, users, integrations and potential business impact",
        feedback:
          "Correct — controls should be selected based on what the solution does and what could realistically go wrong.",
      },
      {
        letter: "C",
        text: "Which controls another company used in a similar project",
        feedback:
          "Not quite — examples can help, but another organisation may have different data, risks and requirements.",
      },
    ],
    correctLetter: "B",
    mainPoint: "Understand the solution and its risks before selecting controls.",
    architectCorrect: "Correct — first understand the context. Then choose controls that match the actual risk.",
    architectWrong: "Not quite — controls should follow the risk, not the other way around.",
    visual: {
      kind: "context-cards",
      title: "Understand the solution first",
      nodes: [
        { id: "purpose", label: "Purpose", highlight: true },
        { id: "data", label: "Data", highlight: true },
        { id: "users", label: "Users", highlight: true },
        { id: "integrations", label: "Integrations", highlight: true },
        { id: "impact", label: "Impact", highlight: true },
      ],
    },
    resultRecommendation: "Start with context and risk instead of starting with a tool or checklist.",
  },
  {
    id: "ssb-03",
    number: 3,
    categoryId: "data-protection",
    tags: ["Data Protection", "Classification"],
    prompt: "A claims solution will process names, contact details and medical information. What should happen first?",
    options: [
      {
        letter: "A",
        text: "Treat all information as ordinary internal data",
        feedback: "Not quite — medical information requires stronger protection than ordinary internal information.",
      },
      {
        letter: "B",
        text: "Classify the data according to sensitivity, legal requirements and business impact",
        feedback:
          "Correct — classification helps determine the right access, encryption, retention and monitoring requirements.",
      },
      {
        letter: "C",
        text: "Wait until production because the data model may change",
        feedback: "Not quite — data protection requirements must influence the design before production.",
      },
    ],
    correctLetter: "B",
    mainPoint: "Different data requires different levels of protection.",
    architectCorrect: "Correct — data classification tells us how strongly the information must be protected.",
    architectWrong: "Not quite — sensitive information must be identified before the solution is designed around it.",
    visual: {
      kind: "classification",
      title: "Data classification",
      nodes: [
        { id: "public", label: "Public" },
        { id: "internal", label: "Internal" },
        { id: "confidential", label: "Confidential" },
        { id: "restricted", label: "Restricted", highlight: true, detail: "Medical information" },
      ],
    },
    resultRecommendation: "Classify information before deciding how it should be stored, accessed and deleted.",
  },
  {
    id: "ssb-04",
    number: 4,
    categoryId: "data-protection",
    tags: ["Data Protection", "Minimisation"],
    prompt:
      "An AI assistant requests access to the customer’s entire history “in case it becomes useful.” What is the best response?",
    options: [
      {
        letter: "A",
        text: "Give it access as long as all data is encrypted",
        feedback:
          "Not quite — encryption protects data, but it does not justify collecting or exposing unnecessary information.",
      },
      {
        letter: "B",
        text: "Give it only the data that is necessary for the defined purpose",
        feedback: "Correct — data minimisation reduces both privacy risk and the impact of a potential breach.",
      },
      {
        letter: "C",
        text: "Export the complete history once and delete the export later",
        feedback: "Not quite — temporarily copying unnecessary data still creates unnecessary exposure.",
      },
    ],
    correctLetter: "B",
    mainPoint: "Only use the data the solution actually needs.",
    architectCorrect: "Correct — less unnecessary data means less unnecessary risk.",
    architectWrong:
      "Not quite — protecting data is important, but the first question is whether the solution needs it at all.",
    visual: {
      kind: "funnel",
      title: "Data minimisation",
      nodes: [
        { id: "full", label: "Full customer history", warning: true },
        { id: "required", label: "Required fields only", highlight: true },
      ],
    },
    resultRecommendation: "Reduce the amount of data before adding controls around it.",
  },
  {
    id: "ssb-05",
    number: 5,
    categoryId: "data-protection",
    tags: ["Data Protection", "Data flow"],
    prompt: "A vendor says that all data is encrypted. Is the security review complete?",
    options: [
      {
        letter: "A",
        text: "Yes, because encryption removes the main risk",
        feedback:
          "Not quite — encryption is important, but it does not explain where data travels, who can access it or how long it is retained.",
      },
      {
        letter: "B",
        text: "No, map where data enters, moves, is stored, logged, shared and deleted",
        feedback: "Correct — an end-to-end dataflow reveals risks that a single control cannot show.",
      },
      {
        letter: "C",
        text: "Only ask which AI model or cloud provider the vendor uses",
        feedback:
          "Not quite — the provider is relevant, but the complete processing flow matters more than a product name.",
      },
    ],
    correctLetter: "B",
    mainPoint: "You cannot protect data if you do not understand where it goes.",
    architectCorrect: "Correct — encryption is one control. We still need to understand the entire dataflow.",
    architectWrong: "Not quite — security requires a complete picture of how data is processed from beginning to end.",
    visual: {
      kind: "dataflow",
      title: "End-to-end dataflow",
      nodes: [
        { id: "user", label: "User" },
        { id: "app", label: "Application" },
        { id: "vendor", label: "Vendor service", highlight: true, detail: "External transfer" },
        { id: "model", label: "Model" },
        { id: "storage", label: "Storage", highlight: true, detail: "Logs and retention" },
        { id: "deletion", label: "Deletion", highlight: true },
      ],
    },
    resultRecommendation: "Map the full lifecycle of data, including logs, suppliers and deletion.",
  },
  {
    id: "ssb-06",
    number: 6,
    categoryId: "identity-access",
    tags: ["Identity & Access", "Least privilege"],
    prompt: "Claims employees need access to a new system. How should access be designed?",
    options: [
      {
        letter: "A",
        text: "Give everyone the same access to simplify support",
        feedback:
          "Not quite — broad access increases the likelihood and impact of mistakes or compromised accounts.",
      },
      {
        letter: "B",
        text: "Use role-based access, least privilege, MFA and regular access reviews",
        feedback: "Correct — users should receive only the access needed for their responsibilities.",
      },
      {
        letter: "C",
        text: "Create one shared administrator account for the team",
        feedback:
          "Not quite — shared accounts remove individual accountability and create a serious security risk.",
      },
    ],
    correctLetter: "B",
    mainPoint: "Access should be limited, personal and regularly reviewed.",
    architectCorrect: "Correct — the right person should have the right access for the right reason and period.",
    architectWrong: "Not quite — convenience should not remove accountability or create unnecessary access.",
    visual: {
      kind: "role-matrix",
      title: "Role-based access",
      nodes: [
        { id: "handler", label: "Claims handler", detail: "View and update claims", highlight: true },
        { id: "lead", label: "Team lead", detail: "Approve selected actions", highlight: true },
        { id: "admin", label: "Administrator", detail: "Manage system", highlight: true },
        { id: "shared", label: "No shared account", blocked: true },
      ],
    },
    resultRecommendation: "Use personal accounts, role-based access and least privilege.",
  },
  {
    id: "ssb-07",
    number: 7,
    categoryId: "identity-access",
    tags: ["Identity & Access", "Secrets"],
    prompt: "An application needs an API key to connect to an external service. Where should the key be stored?",
    options: [
      {
        letter: "A",
        text: "Inside the source code because the repository is private",
        feedback:
          "Not quite — secrets can leak through source code, history, logs, backups or compromised developer accounts.",
      },
      {
        letter: "B",
        text: "In a managed secret vault with restricted access and rotation",
        feedback: "Correct — managed secrets reduce exposure and make access and rotation easier to control.",
      },
      {
        letter: "C",
        text: "In an internal email sent to the development team",
        feedback: "Not quite — email is not an appropriate system for storing and managing application secrets.",
      },
    ],
    correctLetter: "B",
    mainPoint: "Secrets must be stored separately from code and protected throughout their lifecycle.",
    architectCorrect: "Correct — keep secrets out of the code and manage them through a controlled service.",
    architectWrong: "Not quite — private code and internal email can still be exposed. Secrets need dedicated protection.",
    visual: {
      kind: "secrets",
      title: "Protect the API key",
      nodes: [
        { id: "code", label: "Source code", warning: true, detail: "Do not store keys here" },
        { id: "vault", label: "Secret vault", highlight: true },
        { id: "app", label: "Application identity", highlight: true },
      ],
    },
    resultRecommendation: "Use managed identities or a secret vault and rotate secrets when necessary.",
  },
  {
    id: "ssb-08",
    number: 8,
    categoryId: "cloud-application",
    tags: ["Cloud", "Configuration"],
    prompt: "A team creates a cloud storage account for customer documents. What is the safest starting point?",
    options: [
      {
        letter: "A",
        text: "Make it public during development and restrict it before launch",
        feedback:
          "Not quite — temporary insecure configurations are often forgotten and can expose real data.",
      },
      {
        letter: "B",
        text: "Use secure defaults, private access, policies, logging and automated configuration scanning",
        feedback:
          "Correct — secure defaults and automated guardrails reduce the chance of dangerous misconfigurations.",
      },
      {
        letter: "C",
        text: "Focus mainly on giving the resource a clear name",
        feedback: "Not quite — naming helps administration, but it does not protect the data.",
      },
    ],
    correctLetter: "B",
    mainPoint: "Cloud resources should be private and securely configured by default.",
    architectCorrect:
      "Correct — secure defaults are safer than relying on someone to remember every setting later.",
    architectWrong:
      "Not quite — cloud security begins with safe configuration from the moment the resource is created.",
    visual: {
      kind: "cloud-storage",
      title: "Secure cloud storage",
      nodes: [
        { id: "public", label: "Public storage", warning: true, detail: "Avoid" },
        { id: "private", label: "Private storage", highlight: true, detail: "Policy · logging · shield" },
      ],
    },
    resultRecommendation: "Use secure templates, policies and continuous configuration scanning.",
  },
  {
    id: "ssb-09",
    number: 9,
    categoryId: "cloud-application",
    tags: ["Cloud", "Network"],
    prompt: "A database is only used by the application backend. How should it be exposed?",
    options: [
      {
        letter: "A",
        text: "Through a private endpoint with access restricted to the required workload",
        feedback: "Correct — the database does not need to be reachable from the public internet.",
      },
      {
        letter: "B",
        text: "Publicly, but with a name that is difficult to guess",
        feedback: "Not quite — obscurity does not provide meaningful network protection.",
      },
      {
        letter: "C",
        text: "Publicly to every device on the corporate network",
        feedback: "Not quite — the entire corporate network does not need direct database access.",
      },
    ],
    correctLetter: "A",
    mainPoint: "Only expose a service to the networks and systems that actually need it.",
    architectCorrect: "Correct — remove unnecessary internet exposure and allow only the required connection.",
    architectWrong:
      "Not quite — a system should not be publicly reachable when only one internal workload needs it.",
    visual: {
      kind: "network",
      title: "Private connectivity",
      nodes: [
        { id: "internet", label: "Internet", blocked: true },
        { id: "backend", label: "Backend", highlight: true },
        { id: "endpoint", label: "Private endpoint", highlight: true },
        { id: "database", label: "Database", highlight: true },
      ],
    },
    resultRecommendation: "Reduce public exposure and segment sensitive workloads.",
  },
  {
    id: "ssb-10",
    number: 10,
    categoryId: "cloud-application",
    tags: ["Application Security", "API"],
    prompt: "A public claims API accepts information submitted by customers. What should protect it?",
    options: [
      {
        letter: "A",
        text: "Authentication, authorisation, input validation, rate limiting and security testing",
        feedback: "Correct — the API must verify both the user and the data before processing a request.",
      },
      {
        letter: "B",
        text: "TLS encryption alone",
        feedback: "Not quite — TLS protects data in transit but does not prevent unauthorised or malicious requests.",
      },
      {
        letter: "C",
        text: "Validation in the customer’s browser only",
        feedback: "Not quite — client-side validation can be bypassed and must be repeated on the server.",
      },
    ],
    correctLetter: "A",
    mainPoint: "Never trust input, and always verify what a user is allowed to do.",
    architectCorrect: "Correct — protect both the connection, the identity, the permission and the input.",
    architectWrong: "Not quite — encryption or browser validation alone cannot secure a public API.",
    visual: {
      kind: "api-layers",
      title: "Layered API protection",
      nodes: [
        { id: "authn", label: "Authentication", highlight: true },
        { id: "authz", label: "Authorisation", highlight: true },
        { id: "input", label: "Input validation", highlight: true },
        { id: "rate", label: "Rate limit", highlight: true },
        { id: "api", label: "API" },
      ],
    },
    resultRecommendation: "Apply layered protection to public applications and APIs.",
  },
  {
    id: "ssb-11",
    number: 11,
    categoryId: "ai-security",
    tags: ["AI Security", "Access control"],
    prompt: "A RAG assistant searches internal policies and customer documents. What is the most important access control?",
    options: [
      {
        letter: "A",
        text: "Use a longer system prompt telling the AI to protect confidential information",
        feedback: "Not quite — a prompt is not a reliable replacement for technical access control.",
      },
      {
        letter: "B",
        text: "Ensure retrieval respects the user’s permissions before documents reach the model",
        feedback: "Correct — the AI must never retrieve information the current user is not authorised to access.",
      },
      {
        letter: "C",
        text: "Place every document in one shared index so the AI can search more effectively",
        feedback:
          "Not quite — a shared index without permission enforcement can expose confidential information across users and teams.",
      },
    ],
    correctLetter: "B",
    mainPoint: "Access control must be enforced during retrieval, not left to the model.",
    architectCorrect:
      "Correct — the AI can only answer safely if the retrieval layer respects the user’s permissions.",
    architectWrong:
      "Not quite — telling the model to behave is not the same as technically preventing unauthorised retrieval.",
    visual: {
      kind: "rag-access",
      title: "Permission-aware retrieval",
      nodes: [
        { id: "identity", label: "Employee identity", highlight: true },
        { id: "check", label: "Permission check", highlight: true },
        { id: "docs", label: "Approved documents", highlight: true },
        { id: "blocked", label: "Customer document", blocked: true, detail: "Blocked before the model" },
        { id: "model", label: "AI model" },
        { id: "answer", label: "Answer" },
      ],
    },
    resultRecommendation: "Enforce permissions before data is retrieved and sent to an AI model.",
  },
  {
    id: "ssb-12",
    number: 12,
    categoryId: "ai-security",
    tags: ["AI Security", "Human oversight"],
    prompt: "An AI system flags potentially fraudulent insurance claims. How should important decisions be handled?",
    options: [
      {
        letter: "A",
        text: "Automatically reject every claim with a high fraud score",
        feedback: "Not quite — an AI score may be wrong, biased or based on incomplete information.",
      },
      {
        letter: "B",
        text: "Use AI as decision support with human review, logging and ongoing quality monitoring",
        feedback: "Correct — human oversight is important when an AI output can significantly affect a person.",
      },
      {
        letter: "C",
        text: "Do not log the AI recommendation because the model is confidential",
        feedback:
          "Not quite — without appropriate logging, it becomes difficult to investigate decisions, errors or misuse.",
      },
    ],
    correctLetter: "B",
    mainPoint: "High-impact AI decisions require oversight, traceability and monitoring.",
    architectCorrect:
      "Correct — AI can support the decision, but important outcomes still need accountable human oversight.",
    architectWrong: "Not quite — confidence scores do not remove the need for accountability and human judgement.",
    visual: {
      kind: "human-review",
      title: "Human oversight",
      nodes: [
        { id: "ai", label: "AI recommendation" },
        { id: "human", label: "Human review", highlight: true },
        { id: "decision", label: "Final decision", highlight: true },
        { id: "log", label: "Audit log", detail: "Traceable outcome", highlight: true },
      ],
    },
    resultRecommendation:
      "Use human oversight and traceability for AI-supported decisions with significant impact.",
  },
  {
    id: "ssb-13",
    number: 13,
    categoryId: "secure-delivery",
    tags: ["Secure Delivery", "CI/CD"],
    prompt: "Security testing repeatedly finds critical issues immediately before release. What should the team improve?",
    options: [
      {
        letter: "A",
        text: "Add code review and automated SAST, SCA, secret and configuration scanning to the CI/CD pipeline",
        feedback:
          "Correct — automated checks help detect issues while developers can still fix them efficiently.",
      },
      {
        letter: "B",
        text: "Accept the issues when the release deadline is close",
        feedback: "Not quite — deadlines do not remove the risk created by critical vulnerabilities.",
      },
      {
        letter: "C",
        text: "Replace automated testing with one annual penetration test",
        feedback:
          "Not quite — penetration testing is valuable, but it cannot provide continuous feedback on every code change.",
      },
    ],
    correctLetter: "A",
    mainPoint: "Security checks should be part of the development process, not a final surprise.",
    architectCorrect:
      "Correct — give developers security feedback early and automatically as part of delivery.",
    architectWrong:
      "Not quite — security testing must happen continuously, not only after development is finished.",
    visual: {
      kind: "cicd",
      title: "Secure CI/CD",
      nodes: [
        { id: "code", label: "Code" },
        { id: "review", label: "Review", highlight: true },
        { id: "scan", label: "SAST / SCA", highlight: true, detail: "Critical issue stopped" },
        { id: "test", label: "Test" },
        { id: "deploy", label: "Deploy", blocked: true },
      ],
    },
    resultRecommendation: "Move security checks earlier and automate them in CI/CD.",
  },
  {
    id: "ssb-14",
    number: 14,
    categoryId: "secure-delivery",
    tags: ["Secure Delivery", "Supply chain"],
    prompt: "A developer wants to add a new third-party dependency. What should happen first?",
    options: [
      {
        letter: "A",
        text: "Download the newest version from the first available website",
        feedback: "Not quite — an unverified source can contain a modified or malicious package.",
      },
      {
        letter: "B",
        text: "Verify the source, scan for vulnerabilities and licences, pin the version and record the component",
        feedback: "Correct — third-party components should be known, verified and continuously monitored.",
      },
      {
        letter: "C",
        text: "Never update dependencies because updates can introduce changes",
        feedback:
          "Not quite — outdated dependencies can retain known vulnerabilities and become unsupported.",
      },
    ],
    correctLetter: "B",
    mainPoint: "Your solution is only as secure as the components and build process it depends on.",
    architectCorrect:
      "Correct — know what enters the build, where it came from and whether it contains known risks.",
    architectWrong:
      "Not quite — dependencies must be verified and maintained, not blindly trusted or permanently frozen.",
    visual: {
      kind: "supply-chain",
      title: "Verified dependencies",
      nodes: [
        { id: "source", label: "Verified source", highlight: true },
        { id: "scan", label: "Vulnerability scan", highlight: true },
        { id: "pin", label: "Pinned version", highlight: true },
        { id: "sbom", label: "Component inventory / SBOM", highlight: true },
        { id: "app", label: "Application" },
      ],
    },
    resultRecommendation: "Maintain an inventory of dependencies and verify them throughout their lifecycle.",
  },
  {
    id: "ssb-15",
    number: 15,
    categoryId: "secure-delivery",
    tags: ["Secure Delivery", "Operations"],
    prompt: "The solution has passed its security review and is now in production. Is the security work finished?",
    options: [
      {
        letter: "A",
        text: "Yes, because production approval confirms that the solution is secure",
        feedback: "Not quite — systems, threats, users and dependencies continue to change after launch.",
      },
      {
        letter: "B",
        text: "No, continue monitoring, patching, reviewing access, deleting expired data and reassessing changes",
        feedback: "Correct — security is a lifecycle that continues for as long as the solution exists.",
      },
      {
        letter: "C",
        text: "Disable most logging to reduce storage costs and privacy concerns",
        feedback:
          "Not quite — logging should be proportionate and privacy-aware, but removing it can prevent detection and investigation.",
      },
    ],
    correctLetter: "B",
    mainPoint: "Security is continuous and must follow the solution throughout its lifecycle.",
    architectCorrect:
      "Correct — launch is not the finish line. Security continues through operation, change and eventual retirement.",
    architectWrong: "Not quite — a solution can become insecure as technology, access, data and threats change.",
    visual: {
      kind: "lifecycle",
      title: "Security after launch",
      nodes: [
        { id: "design", label: "Design" },
        { id: "build", label: "Build" },
        { id: "test", label: "Test" },
        { id: "operate", label: "Operate", highlight: true, detail: "Monitor · patch · review · delete · respond" },
        { id: "improve", label: "Improve", highlight: true },
      ],
    },
    resultRecommendation: "Continue monitoring and reassessing the solution after it reaches production.",
  },
];
