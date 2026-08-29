const FRAMEWORK_SOURCES: readonly { match: RegExp; url: string }[] = [
  {
    match: /NIST SP 800-61/i,
    url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final",
  },
  {
    match: /NIST SP 800-204/i,
    url: "https://csrc.nist.gov/pubs/sp/800/204/d/final",
  },
  { match: /NIST SSDF/i, url: "https://csrc.nist.gov/projects/ssdf" },
  {
    match: /NIST AI RMF/i,
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
  },
  { match: /NIST/i, url: "https://www.nist.gov/cyberframework" },
  { match: /CIS/i, url: "https://www.cisecurity.org/controls/v8-1" },
  {
    match: /DORA/i,
    url: "https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng",
  },
  {
    match: /NIS2/i,
    url: "https://eur-lex.europa.eu/eli/dir/2022/2555/oj/eng",
  },
  {
    match: /GDPR/i,
    url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng",
  },
  { match: /OWASP GenAI/i, url: "https://genai.owasp.org/" },
  { match: /OWASP/i, url: "https://genai.owasp.org/" },
  { match: /ISO/i, url: "https://www.iso.org/standard/27001" },
];

const TECHNOLOGY_SOURCES: Record<string, readonly string[]> = {
  aws: [
    "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html",
    "https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html",
    "https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html",
    "https://docs.aws.amazon.com/security-ir/latest/userguide/detect-and-analyze.html",
    "https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html",
    "https://docs.aws.amazon.com/prescriptive-guidance/latest/terraform-aws-provider-best-practices/security.html",
  ],
  "microsoft-365": [
    "https://learn.microsoft.com/en-us/microsoft-365/admin/security-and-compliance/m365b-security-best-practices",
    "https://learn.microsoft.com/en-us/security/zero-trust/security-platform",
    "https://learn.microsoft.com/en-us/purview/ai-microsoft-purview",
  ],
  azure: [
    "https://learn.microsoft.com/en-us/azure/security/fundamentals/identity-management-best-practices",
    "https://learn.microsoft.com/en-us/azure/key-vault/general/secure-key-vault",
  ],
  github: [
    "https://docs.github.com/en/actions/reference/security/secure-use",
    "https://docs.github.com/en/code-security/tutorials/implement-supply-chain-best-practices/securing-builds",
    "https://docs.github.com/code-security/supply-chain-security/understanding-your-software-supply-chain/about-supply-chain-security",
  ],
  cicd: ["https://csrc.nist.gov/pubs/sp/800/204/d/final"],
  "ai-assistants": [
    "https://www.nist.gov/itl/ai-risk-management-framework",
    "https://genai.owasp.org/",
  ],
};

export function sourceUrlsFor(
  frameworks: readonly string[],
  technologyTags: readonly string[],
): string[] {
  const urls: string[] = [];
  for (const framework of frameworks) {
    const match = FRAMEWORK_SOURCES.find((item) => item.match.test(framework));
    if (match && !urls.includes(match.url)) {
      urls.push(match.url);
    }
  }
  for (const technology of technologyTags) {
    for (const url of TECHNOLOGY_SOURCES[technology] ?? []) {
      if (!urls.includes(url)) {
        urls.push(url);
      }
    }
  }
  if (urls.length === 0) {
    urls.push("https://www.nist.gov/cyberframework");
  }
  return urls.slice(0, 4);
}
