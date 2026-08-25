/**
 * Optional future adapter for Workers AI or another server-side model.
 * No AI binding is configured in wrangler.jsonc, so Scout stays deterministic.
 * Any future model output must be schema-validated here and must never write
 * trusted scores or recommended answers.
 */
export const AI_PROVIDER_CONFIGURED = false;
