import {
  optionPoints,
  qualityFromPoints,
  scorePlaythrough,
  SCORING_EXPLAINER,
  type DimensionScore,
  type PlayScore,
} from "@/lib/missions/scoring";
import type {
  AnswerOption,
  AnswerQuality,
  MissionDefinition,
  Question,
  RecordedChoice,
} from "@/lib/missions/types";

export { SCORING_EXPLAINER };

export interface DecisionDebrief {
  index: number;
  question: Question;
  selected: AnswerOption;
  displayLetter: "A" | "B" | "C";
  quality: AnswerQuality;
  recommended: AnswerOption;
  dimensionDeltas: readonly { id: string; label: string; points: number }[];
}

export interface DimensionInsight extends DimensionScore {
  interpretation: string;
  topDecisionTitles: readonly string[];
}

export interface AlternativeChange {
  title: string;
  instead: string;
}

export interface MissionReport {
  missionTitle: string;
  scenarioTitle: string;
  outcomeHeadline: string;
  summary: string;
  score: PlayScore;
  dimensions: readonly DimensionInsight[];
  strongest: readonly DecisionDebrief[];
  tradeoffs: readonly DecisionDebrief[];
  highestRisk: readonly DecisionDebrief[];
  lesson: string;
  journey: readonly DecisionDebrief[];
  alternativeHeadline: string;
  alternativeChanges: readonly AlternativeChange[];
  destinationState: "strong" | "mixed" | "weak";
}

function findOption(question: Question, optionId: string): AnswerOption {
  const option = question.options.find((item) => item.id === optionId);
  if (!option) {
    throw new Error(`Unknown option ${optionId}`);
  }
  return option;
}

function recommendedOption(question: Question): AnswerOption {
  const strong = question.options.find((item) => item.quality === "strong");
  if (strong) {
    return strong;
  }
  return [...question.options].sort(
    (left, right) => optionPoints(right.scores) - optionPoints(left.scores),
  )[0]!;
}

function interpretDimension(
  dimension: DimensionScore,
): string {
  if (dimension.percent >= 85) {
    return `${dimension.label}: ${dimension.percent}/100 — This track stayed consistently strong.`;
  }
  if (dimension.percent >= 70) {
    return `${dimension.label}: ${dimension.percent}/100 — Solid, with a few decisions that left room for a cleaner path.`;
  }
  if (dimension.percent >= 50) {
    return `${dimension.label}: ${dimension.percent}/100 — You made some of the right moves, but incomplete or delayed actions pulled this down.`;
  }
  const flavour: Record<string, string> = {
    containment:
      "You isolated some systems, but broad shutdowns, delays or risky reopenings reduced the score.",
    operations:
      "Workarounds and recovery choices either froze the business or skipped the controls those workarounds needed.",
    trust:
      "Communication, evidence or governance choices left people filling in the blanks.",
    aiSafety:
      "Agency, data and validation choices left the model with more power than proof.",
    enablement:
      "Blocks without a path, or launches without rails, both hurt the ability to ship safely.",
    customerTrust:
      "Customers were asked to accept magic, silence or machine verdicts without a human door.",
    buildIntegrity:
      "Packages, builders or signatures were treated as folklore instead of evidence.",
    deliveryResilience:
      "You either halted delivery entirely or kept the train moving through holes.",
    visibility:
      "Logs, inventories and monitoring were the first things sacrificed.",
  };
  const detail = flavour[dimension.id] ?? "This track collected too many high-risk moves.";
  return `${dimension.label}: ${dimension.percent}/100 — ${detail}`;
}

function headlineFor(
  mission: MissionDefinition,
  score: PlayScore,
  weakest: DimensionScore,
): string {
  if (mission.id === "locked-out") {
    if (score.level === "Resilient response") {
      return "Ransomware contained, with a recovery path you can defend.";
    }
    if (score.overall >= 70) {
      return "Ransomware contained, but recovery was delayed.";
    }
    if (score.overall >= 50) {
      return "The core is quieter, yet containment and trust still leak.";
    }
    return "The ransomware core was slowed, not really owned.";
  }
  if (mission.id === "ai-forge") {
    if (score.overall >= 85) {
      return "The AI solution launched with strong safeguards and limited permissions.";
    }
    if (score.overall >= 70) {
      return "The model launched with rails, and a few doors still too wide.";
    }
    if (score.overall >= 50) {
      return "Launch happened, but safety and customer trust were uneven.";
    }
    return "The forge ran hot: agency first, safeguards later.";
  }
  if (score.overall >= 85) {
    return "The compromised path was closed and the vault still lets honest builds through.";
  }
  if (score.overall >= 70) {
    return "The compromised package was removed, but pipeline visibility remained weak.";
  }
  if (score.overall >= 50) {
    return "You found a way through, with integrity and visibility still arguing.";
  }
  return `${weakest.label} took the hardest hit — the vault is still a wish.`;
}

function summaryFor(score: PlayScore, lesson: string): string {
  return `${score.level}. Overall ${score.overall}/100, the rounded average of three dimension percentages. ${lesson}`;
}

export function buildMissionReport(
  mission: MissionDefinition,
  scenarioId: string,
  choices: readonly RecordedChoice[],
  questions: readonly Question[],
): MissionReport {
  const score = scorePlaythrough(
    { ...mission, questions: [...questions] },
    choices,
  );
  const journey: DecisionDebrief[] = choices.map((choice, index) => {
    const question = questions.find((item) => item.id === choice.questionId);
    if (!question) {
      throw new Error(`Missing question ${choice.questionId}`);
    }
    const selected = findOption(question, choice.optionId);
    const recommended = recommendedOption(question);
    return {
      index: index + 1,
      question,
      selected,
      displayLetter: choice.displayLetter,
      quality: selected.quality,
      recommended,
      dimensionDeltas: mission.dimensions.map((dimension) => ({
        id: dimension.id,
        label: dimension.label,
        points: selected.scores[dimension.id] ?? 0,
      })),
    };
  });

  const strongest = journey.filter((item) => item.quality === "strong");
  const tradeoffs = journey.filter(
    (item) => item.quality === "defensible" || item.quality === "weak",
  );
  const highestRisk = journey.filter((item) => item.quality === "high-risk");

  const worst = [...journey].sort(
    (left, right) =>
      optionPoints(left.selected.scores) - optionPoints(right.selected.scores),
  )[0];
  const lesson = worst
    ? `Your most important lesson: ${worst.selected.learningPoint}`
    : "Your most important lesson: write the decision down while the coffee is still bad.";

  const dimensions: DimensionInsight[] = score.dimensions.map((dimension) => {
    const ranked = [...journey].sort((left, right) => {
      const leftDelta = left.selected.scores[dimension.id] ?? 0;
      const rightDelta = right.selected.scores[dimension.id] ?? 0;
      return leftDelta - rightDelta;
    });
    return {
      ...dimension,
      interpretation: interpretDimension(dimension),
      topDecisionTitles: ranked.slice(0, 3).map((item) => item.question.title),
    };
  });

  const weakest = [...score.dimensions].sort((left, right) => left.percent - right.percent)[0]!;
  const alternativeChanges = journey
    .filter((item) => item.selected.id !== item.recommended.id)
    .slice(0, 3)
    .map((item) => ({
      title: item.question.title,
      instead: item.recommended.title,
    }));

  const destinationState =
    score.overall >= 70 ? "strong" : score.overall >= 50 ? "mixed" : "weak";

  const scenarioTitle =
    mission.scenarios.find((item) => item.id === scenarioId)?.title ?? scenarioId;

  return {
    missionTitle: mission.title,
    scenarioTitle,
    outcomeHeadline: headlineFor(mission, score, weakest),
    summary: summaryFor(score, lesson),
    score,
    dimensions,
    strongest,
    tradeoffs,
    highestRisk,
    lesson,
    journey,
    alternativeHeadline:
      alternativeChanges.length === 0
        ? "A stronger response would look a lot like yours."
        : "A stronger response would change a few high-leverage moves — not rewrite the whole day.",
    alternativeChanges,
    destinationState,
  };
}

export function qualityLabel(quality: AnswerQuality): string {
  switch (quality) {
    case "strong":
      return "Strong";
    case "defensible":
      return "Defensible";
    case "weak":
      return "Weak";
    case "high-risk":
      return "High risk";
    default: {
      const unhandled: never = quality;
      return unhandled;
    }
  }
}

export function qualityFromOption(option: AnswerOption): AnswerQuality {
  return option.quality || qualityFromPoints(optionPoints(option.scores));
}
