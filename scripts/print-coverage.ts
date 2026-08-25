import { formatCoverageMatrix, publicCombinations, topicFamilyCounts } from "../src/lib/training/coverage";
import { generateDeck } from "../src/lib/training/deck";

console.log(formatCoverageMatrix());
console.log("\nPublic combinations:");
for (const row of publicCombinations()) {
  console.log(`- ${row.roleGroup} / ${row.topicId}: ${row.eligible} questions on ${row.maps.join(", ")}`);
}
console.log("\nTopic family sizes:", topicFamilyCounts());

const examples = [
  {
    name: "Finance phishing in Microsoft 365",
    query: {
      roleGroup: "finance-hr" as const,
      specificRole: "finance" as const,
      topics: ["phishing"],
      technologies: ["Microsoft 365"],
      contexts: ["Third-party technology providers"],
      mapId: "inbox-under-siege" as const,
    },
  },
  {
    name: "Developer supply chain",
    query: {
      roleGroup: "developers-devops" as const,
      specificRole: "developer" as const,
      topics: ["supply-chain"],
      technologies: ["GitHub", "CI/CD pipelines"],
      mapId: "dependency-depths" as const,
    },
  },
  {
    name: "IT ransomware",
    query: {
      roleGroup: "it-security" as const,
      topics: ["ransomware"],
      mapId: "locked-out" as const,
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
