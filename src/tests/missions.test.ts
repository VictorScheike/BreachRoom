import { describe, expect, it } from "vitest";
import { MISSION_LIST } from "@/lib/missions/catalog";
import { preparePlaythrough } from "@/lib/missions/playthrough";
import { scorePlaythrough } from "@/lib/missions/scoring";
import { PLAYTHROUGH_LENGTH, STORY_PHASES } from "@/lib/missions/types";

describe("mission question banks", () => {
  it("gives each mission a unique question bank covering every phase of every scenario", () => {
    expect(MISSION_LIST).toHaveLength(4);
    for (const mission of MISSION_LIST) {
      expect(mission.questions.length).toBeGreaterThanOrEqual(32);
      const ids = new Set(mission.questions.map((question) => question.id));
      expect(ids.size).toBe(mission.questions.length);
      for (const scenario of mission.scenarios) {
        for (const phase of STORY_PHASES) {
          const pool = mission.questions.filter(
            (question) =>
              question.phase === phase && question.scenarioIds.includes(scenario.id),
          );
          expect(pool.length, `${mission.id} ${scenario.id} ${phase}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("prepares eight unique coherent questions and keeps scoring on option ids after shuffle", () => {
    for (const mission of MISSION_LIST) {
      const play = preparePlaythrough(mission, 42);
      expect(play.questions).toHaveLength(PLAYTHROUGH_LENGTH);
      expect(new Set(play.questions.map((question) => question.id)).size).toBe(8);
      expect(play.questions.map((question) => question.phase)).toEqual([...STORY_PHASES]);
      for (const question of play.questions) {
        expect(question.scenarioIds.includes(play.scenarioId)).toBe(true);
        const order = play.optionOrder[question.id];
        expect(order).toHaveLength(3);
        expect(new Set(order).size).toBe(3);
      }

      const strongChoices = play.questions.map((question) => {
        const strong = question.options.find((option) => option.quality === "strong");
        if (!strong) {
          throw new Error("Missing strong option");
        }
        return {
          questionId: question.id,
          optionId: strong.id,
          displayLetter: "C" as const,
        };
      });
      const score = scorePlaythrough({ ...mission, questions: play.questions }, strongChoices);
      expect(score.overall).toBeGreaterThanOrEqual(80);
      expect(score.dimensions).toHaveLength(3);
      for (const dimension of score.dimensions) {
        expect(dimension.points).toBeLessThanOrEqual(24);
      }
    }
  });
});
