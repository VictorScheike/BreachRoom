import { formatCoverageMatrix, publicCombinations, shownTrainingCombinations, topicFamilyCounts } from "../src/lib/training/coverage";
import { generateDeck } from "../src/lib/training/deck";

console.log(formatCoverageMatrix());
console.log("\nPublic combinations:");
for (const row of publicCombinations()) {
  console.log(`- ${row.roleGroup} / ${row.topicId} / ${row.difficulty}: ${row.technologies.join(", ") || "no tech"}`);
}
console.log("\nShown combinations:", shownTrainingCombinations().length);
console.log("Topic family sizes:", topicFamilyCounts());

const examples = [
  {
    name: "Finance phishing in Microsoft 365",
    query: {
      roleGroup: "finance-hr" as const,
      specificRole: "finance" as const,
      topics: ["phishing"],
      technologies: ["microsoft-365"],
      contexts: ["third-party-providers"],
      mapId: "inbox-under-siege" as const,
      difficulty: "Beginner" as const,
    },
  },
  {
    name: "Developer cloud security AWS",
    query: {
      roleGroup: "developers-devops" as const,
      specificRole: "developer" as const,
      topics: ["cloud-security"],
      technologies: ["aws"],
      mapId: "dependency-depths" as const,
      difficulty: "Beginner" as const,
    },
  },
  {
    name: "IT ransomware",
    query: {
      roleGroup: "it-security" as const,
      topics: ["ransomware"],
      mapId: "locked-out" as const,
      difficulty: "Beginner" as const,
    },
  },
];

console.log("\nExample decks:");
for (const example of examples) {
  const deck = generateDeck(example.query, { seed: `example-${example.name}` });
  if (deck.ok) {
    console.log(`\n${example.name}: ${deck.config.title}`);
    console.log(deck.config.questionIds.join(", "));
  } else {
    console.log(`\n${example.name}: ${deck.message}`);
  }
}
