import type { MissionReport } from "@/lib/missions/report";
import type { VerdictId } from "@/lib/missions/verdicts";

const VERDICT_TEXT: Record<VerdictId, { border: string; icon: string }> = {
  correct: { border: "#15803d", icon: "✓" },
  "partly-correct": { border: "#b45309", icon: "!" },
  incorrect: { border: "#b91c1c", icon: "×" },
};

export function buildEmailReportText(report: MissionReport): string {
  const lines = [
    `BreachRoom mission result`,
    `Mission: ${report.missionTitle}`,
    `Scenario: ${report.scenarioTitle}`,
    `Overall score: ${report.score.overall}/100`,
    `Outcome: ${report.outcomeLabel}`,
    report.outcomeSentence,
    "",
    "Decision summary",
    `Correct: ${report.verdictCounts.correct}`,
    `Partly correct: ${report.verdictCounts.partlyCorrect}`,
    `Incorrect: ${report.verdictCounts.incorrect}`,
    "",
    "Score areas",
    ...report.dimensions.map(
      (dimension) =>
        `${dimension.label}: ${dimension.percent}/100. ${dimension.interpretation}`,
    ),
    "",
    "What went well",
    ...(report.wentWell.length > 0
      ? report.wentWell.map((item) => `- ${item.question.title}: ${item.selected.title}`)
      : ["- No fully recommended responses this time."]),
    "",
    "What needs improvement",
    ...(report.needsImprovement.length > 0
      ? report.needsImprovement.map(
          (item) =>
            `- ${item.question.title} (${item.verdict.label}): try "${item.recommended.title}"`,
        )
      : ["- Keep repeating the recommended responses."]),
    "",
    "Your decisions",
    ...report.journey.flatMap((item) => [
      `${item.index}. ${item.question.title}`,
      `Your answer: ${item.selected.title}`,
      `Verdict: ${item.verdict.label} — ${item.verdict.meaning}`,
      `Recommended: ${item.recommended.title}`,
      item.selected.explanation,
      item.dimensionDeltas
        .map((delta) => `${delta.label} ${delta.points}/3`)
        .join("; "),
      "",
    ]),
    "Next steps",
    ...report.nextSteps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "This is a BreachRoom simulation debrief, not a certification.",
  ];
  return lines.join("\n");
}

export function buildEmailReportHtml(report: MissionReport): string {
  const decisions = report.journey
    .map((item) => {
      const tone = VERDICT_TEXT[item.verdict.id];
      const impacts = item.dimensionDeltas
        .map((delta) => `${delta.label}: ${delta.points} of 3`)
        .join(" · ");
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;border-collapse:collapse;">
  <tr>
    <td style="border-left:6px solid ${tone.border};padding:12px 14px;font-family:Arial,sans-serif;color:#111827;">
      <p style="margin:0 0 6px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${tone.border};"><strong>${tone.icon} ${item.verdict.label}</strong> — ${item.verdict.meaning}</p>
      <p style="margin:0 0 8px 0;font-size:16px;font-weight:bold;">${item.index}. ${escapeHtml(item.question.title)}</p>
      <p style="margin:0 0 4px 0;font-size:14px;"><strong>Your answer:</strong> ${escapeHtml(item.selected.title)}</p>
      <p style="margin:0 0 4px 0;font-size:14px;"><strong>Recommended:</strong> ${escapeHtml(item.recommended.title)}</p>
      <p style="margin:0 0 8px 0;font-size:14px;line-height:1.5;">${escapeHtml(item.selected.explanation)}</p>
      <p style="margin:0;font-size:13px;color:#374151;">${escapeHtml(impacts)}</p>
    </td>
  </tr>
</table>`;
    })
    .join("");

  const bars = report.dimensions
    .map((dimension) => {
      const color =
        dimension.percent >= 70 ? "#15803d" : dimension.percent >= 50 ? "#b45309" : "#b91c1c";
      return `<p style="font-family:Arial,sans-serif;font-size:14px;margin:0 0 4px 0;"><strong>${escapeHtml(dimension.label)}</strong> — ${dimension.percent}/100</p>
<p style="font-family:Arial,sans-serif;font-size:13px;margin:0 0 8px 0;color:#374151;">${escapeHtml(dimension.interpretation)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;"><tr>
<td style="height:10px;background:${color};width:${dimension.percent}%;">&nbsp;</td>
<td style="height:10px;background:#e5e7eb;width:${100 - dimension.percent}%;">&nbsp;</td>
</tr></table>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f3f4f6;color:#111827;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;">
    <tr><td style="padding:24px;font-family:Arial,sans-serif;">
      <p style="margin:0 0 8px 0;letter-spacing:0.12em;text-transform:uppercase;font-size:12px;color:#0f172a;">Mission result</p>
      <h1 style="margin:0 0 8px 0;font-size:22px;">${escapeHtml(report.missionTitle)}</h1>
      <p style="margin:0 0 8px 0;">Scenario: ${escapeHtml(report.scenarioTitle)}</p>
      <p style="margin:0 0 8px 0;font-size:18px;"><strong>Overall score: ${report.score.overall}/100</strong></p>
      <p style="margin:0 0 4px 0;"><strong>${escapeHtml(report.outcomeLabel)}</strong></p>
      <p style="margin:0 0 20px 0;">${escapeHtml(report.outcomeSentence)}</p>
      <h2 style="font-size:18px;">Decision summary</h2>
      <p>✓ Correct: ${report.verdictCounts.correct}<br>! Partly correct: ${report.verdictCounts.partlyCorrect}<br>× Incorrect: ${report.verdictCounts.incorrect}</p>
      <h2 style="font-size:18px;">Score areas</h2>
      ${bars}
      <h2 style="font-size:18px;">What went well</h2>
      ${listHtml(report.wentWell.map((item) => `${item.question.title}: ${item.selected.title}`), "No fully recommended responses this time.")}
      <h2 style="font-size:18px;">What needs improvement</h2>
      ${listHtml(report.needsImprovement.map((item) => `${item.question.title} (${item.verdict.label})`), "Keep repeating the recommended responses.")}
      <h2 style="font-size:18px;">Your decisions</h2>
      ${decisions}
      <h2 style="font-size:18px;">Next steps</h2>
      ${listHtml(report.nextSteps, "")}
      <p style="font-size:12px;color:#4b5563;margin-top:24px;">This is a BreachRoom simulation debrief, not a certification. Colours support the labels; each verdict also has an icon and text.</p>
    </td></tr>
  </table>
</body>
</html>`;
}

function listHtml(items: readonly string[], empty: string): string {
  if (items.length === 0) {
    return `<p>${escapeHtml(empty)}</p>`;
  }
  return `<ol>${items.map((item) => `<li style="margin-bottom:8px;">${escapeHtml(item)}</li>`).join("")}</ol>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function mailtoForReport(report: MissionReport): string {
  const subject = encodeURIComponent(`BreachRoom report: ${report.missionTitle}`);
  const body = encodeURIComponent(buildEmailReportText(report));
  return `mailto:?subject=${subject}&body=${body}`;
}
