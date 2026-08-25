export interface TopicDefinition {
  id: string;
  label: string;
  cluster: "awareness" | "technical";
}

export const TOPICS: readonly TopicDefinition[] = [
  { id: "phishing", label: "Phishing", cluster: "awareness" },
  { id: "social-engineering", label: "Social engineering", cluster: "awareness" },
  { id: "password-management", label: "Password management", cluster: "awareness" },
  { id: "mfa", label: "MFA", cluster: "awareness" },
  { id: "data-security", label: "Data security", cluster: "awareness" },
  { id: "privacy", label: "Privacy", cluster: "awareness" },
  { id: "file-sharing", label: "Safe file sharing", cluster: "awareness" },
  { id: "incident-reporting", label: "Incident reporting", cluster: "awareness" },
  { id: "remote-work", label: "Remote work", cluster: "awareness" },
  { id: "suspicious-links", label: "Suspicious links and attachments", cluster: "awareness" },
  { id: "ai-security", label: "AI Security", cluster: "technical" },
  { id: "cloud-security", label: "Cloud Security", cluster: "technical" },
  { id: "application-security", label: "Application Security", cluster: "technical" },
  { id: "devsecops", label: "DevSecOps", cluster: "technical" },
  { id: "secure-development", label: "Secure Software Development", cluster: "technical" },
  { id: "software-supply-chain", label: "Software Supply Chain Security", cluster: "technical" },
  { id: "security-architecture", label: "Security Architecture", cluster: "technical" },
  { id: "identity", label: "Identity and access management", cluster: "technical" },
  { id: "ransomware", label: "Ransomware", cluster: "technical" },
  { id: "incident-response", label: "Incident response", cluster: "technical" },
  { id: "operational-resilience", label: "Operational resilience", cluster: "technical" },
  { id: "third-party-risk", label: "Third-party risk", cluster: "technical" },
];

export const TOOLS = [
  "Microsoft 365",
  "Azure",
  "AWS",
  "Google Workspace",
  "GitHub",
  "GitLab",
  "CI/CD pipelines",
  "SaaS platforms",
  "AI assistants",
  "Customer data",
  "Financial data",
  "SAP",
  "Internal applications",
  "Third-party technology providers",
] as const;

export const TRAINING_GOALS = [
  "Recognise a threat",
  "Make better decisions",
  "Prepare for an incident",
  "Understand a framework",
  "Train a specific role",
  "Support a new technology launch",
  "Improve secure development",
  "Test existing knowledge",
] as const;

export const AUDIENCES = [
  { id: "employee", label: "General employees" },
  { id: "finance", label: "Finance" },
  { id: "hr", label: "HR" },
  { id: "business-leader", label: "Business leaders and executives" },
  { id: "developer", label: "Developers" },
  { id: "devops", label: "DevOps and platform teams" },
  { id: "it-support", label: "IT support" },
  { id: "incident-responder", label: "Incident responders" },
  { id: "security-architect", label: "Security architects" },
  { id: "risk-governance", label: "Risk, privacy and governance professionals" },
] as const;
