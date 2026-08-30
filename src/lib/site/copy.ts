export const SITE_NAME = "BreachRoom";

export const NAV_ITEMS = [
  { href: "/", label: "Start" },
  { href: "/missions/", label: "Missions" },
  { href: "/training/", label: "Training by role" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/progress/", label: "My progress" },
  { href: "/about/", label: "About" },
  { href: "/play/", label: "Play free" },
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
    title: "Walk the site",
    body: "You play a compact top-down incident on the Northstar campus. Eight decisions sit along the route to the Core Server Room.",
  },
  {
    title: "A debrief, not a badge",
    body: "You get a BreachRoom simulation score and a written after-action report. It is a discussion aid, not a certificate.",
  },
] as const;

export const ABOUT_HEADLINE = "Who we are";

export const ABOUT_INTRO =
  "There is no agency behind this and no product team. BreachRoom is built by me, Victor Scheike, because cybersecurity still gets treated as a specialist corner instead of something every digital organisation has to be able to talk about — and to build.";

export const ABOUT_BODY = [
  "I studied a Master of Science in Digital Innovation & Management (Cand.it.) in Copenhagen. I built this because I want a bigger focus on what cybersecurity actually means: not a product you buy, not a policy on a shelf, and not only the people with security in their job title.",
] as const;

export const ABOUT_SECTIONS = [
  {
    title: "Practising the incident",
    body: "It means noticing when something is wrong, containing it before it spreads, telling the right people, keeping evidence, and keeping the organisation moving when the picture is still incomplete. Those are human decisions under pressure. The map missions are a short, open tabletop for rehearsing that conversation — product, operations, communications, leadership, not only specialists.",
  },
  {
    title: "Building resilient cybersecurity",
    body: "It also means designing the system so that one stolen password or one poisoned document does not become the whole story. Architecture cannot promise that a cyberattack is avoided. It can prevent some paths, limit the blast radius, detect suspicious activity, and support recovery. Architecture Defence Lab is the other half of that idea. You take ten architecture decisions, one layer at a time, without being told whether a control held. Then one campaign tests prevention, limitation, detection and recovery on the path you actually built.",
  },
] as const;

export const ABOUT_CLOSE =
  "If a control fails, the next layer still gets a chance. That is defence in depth, not a badge. If you want the usual vendor pitch, this is the wrong site.";

export const ABOUT_LINKS = [
  {
    href: "https://victorscheike.com/",
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
