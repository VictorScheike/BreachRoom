export const CONTEXT_CHIPS = [
  { id: "Microsoft 365", kind: "technology" as const, label: "Microsoft 365" },
  { id: "Azure", kind: "technology" as const, label: "Azure" },
  { id: "AWS", kind: "technology" as const, label: "AWS" },
  { id: "GitHub", kind: "technology" as const, label: "GitHub" },
  { id: "CI/CD pipelines", kind: "technology" as const, label: "CI/CD pipelines" },
  { id: "Internal applications", kind: "context" as const, label: "Internal applications" },
  { id: "AI assistants", kind: "technology" as const, label: "AI assistants" },
  { id: "SaaS platforms", kind: "context" as const, label: "SaaS platforms" },
  { id: "Third-party technology providers", kind: "context" as const, label: "Third-party technology providers" },
] as const;

export type ContextChipId = (typeof CONTEXT_CHIPS)[number]["id"];
