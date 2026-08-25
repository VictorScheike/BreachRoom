export const SITE_NAME = "BreachRoom";

export const NAV_ITEMS = [
  { href: "/", label: "Why it exists" },
  { href: "/play/", label: "Try the exercise" },
  { href: "/about/", label: "Who we are" },
] as const;

export const HOME_EYEBROW = "An open educational project";

export const HOME_HEADLINE = "Incident response is a people problem long before it is a tooling problem.";

export const HOME_LEDE =
  "Most of the hard calls in a cyber incident are organisational: what to shut down, who to tell, what to preserve, and how to keep the business moving. BreachRoom is a short tabletop for practising those calls — not a game, and not a security product.";

export const WHY_EXISTS_TITLE = "Why this exists";

export const WHY_EXISTS_BODY = [
  "I work around data, cloud and digital transformation. Cybersecurity often shows up as a slide at the end of a programme, or as something “the security team will handle”. That is a thin way to prepare people who will actually be in the room when something breaks.",
  "Tabletops are the format that stuck with me. You do not need a lab. You need a situation, a clock, and a handful of imperfect options. BreachRoom is that format, in the browser, for anyone who wants to rehearse the conversation — product, operations, communications, leadership — not only specialists.",
] as const;

export const WHY_MATTERS_TITLE = "Why it matters";

export const WHY_MATTERS_BODY = [
  "A ransomware morning is rarely decided by who knows the most acronyms. It is decided by whether someone isolates a system, whether legal and communications are brought in at the right moment, and whether evidence is still there when you need it.",
  "I wanted a way to put more focus on cybersecurity without pretending this is a SOC, a certification, or a vendor assessment. You spend about fifteen minutes in a fictional company, you make eight decisions, and you get a structured debrief you can argue with.",
] as const;

export const EXERCISE_TITLE = "What you will do";

export const EXERCISE_POINTS = [
  {
    title: "One fictional incident",
    body: "Locked Out is a ransomware scenario at Northstar Logistics. The company is invented. The kinds of pressure are not.",
  },
  {
    title: "Eight decisions",
    body: "Containment, escalation, evidence, continuity, communication, suppliers, recovery and what you write down afterwards.",
  },
  {
    title: "A debrief, not a badge",
    body: "You get a BreachRoom simulation score and a written after-action report. It is a discussion aid, not a certificate.",
  },
] as const;

export const ABOUT_HEADLINE = "Who we are";

export const ABOUT_INTRO =
  "There is no agency behind this and no product team. BreachRoom is built by me, Victor Scheike, because cybersecurity still gets treated as a specialist corner instead of something every digital organisation has to be able to talk about.";

export const ABOUT_BODY = [
  "I studied a Master of Science in Digital Innovation & Management (Cand.it.) in Copenhagen. I built this because I want a bigger focus on what cybersecurity actually means: not a product you buy, not a policy on a shelf, and not only the people with security in their job title.",
  "It means noticing when something is wrong, containing it before it spreads, telling the right people, keeping evidence, and keeping the organisation moving when the picture is still incomplete. Those are human decisions under pressure. BreachRoom is a short, open tabletop for practising them. If you want the usual vendor pitch, this is the wrong site.",
] as const;

export const ABOUT_LINKS = [
  {
    href: "https://victorscheikecom.victorscheike.workers.dev/",
    label: "victorscheike.com",
  },
  {
    href: "https://www.linkedin.com/in/victorscheike",
    label: "LinkedIn",
  },
  {
    href: "https://github.com/VictorScheike",
    label: "GitHub",
  },
] as const;
