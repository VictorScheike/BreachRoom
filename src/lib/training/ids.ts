export const TECHNOLOGY_IDS = [
  "microsoft-365",
  "azure",
  "aws",
  "github",
  "cicd",
  "ai-assistants",
] as const;

export type TechnologyId = (typeof TECHNOLOGY_IDS)[number];

export const CONTEXT_IDS = [
  "internal-applications",
  "saas",
  "third-party-providers",
] as const;

export type ContextId = (typeof CONTEXT_IDS)[number];

export const TECHNOLOGY_LABELS: Record<TechnologyId, string> = {
  "microsoft-365": "Microsoft 365",
  azure: "Azure",
  aws: "AWS",
  github: "GitHub",
  cicd: "CI/CD pipelines",
  "ai-assistants": "AI assistants",
};

export const CONTEXT_LABELS: Record<ContextId, string> = {
  "internal-applications": "Internal applications",
  saas: "SaaS platforms",
  "third-party-providers": "Third-party technology providers",
};

export function isTechnologyId(value: string): value is TechnologyId {
  return (TECHNOLOGY_IDS as readonly string[]).includes(value);
}

export function isContextId(value: string): value is ContextId {
  return (CONTEXT_IDS as readonly string[]).includes(value);
}

export function technologyLabel(id: string): string {
  return isTechnologyId(id) ? TECHNOLOGY_LABELS[id] : id;
}

export function contextLabel(id: string): string {
  return isContextId(id) ? CONTEXT_LABELS[id] : id;
}
