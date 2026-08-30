import { describe, expect, it } from "vitest";
import { MISSION_LIST, requireMission } from "@/lib/missions/catalog";
import {
  PRODUCTION_QUESTION_FILES,
  assertProductionQuestionContent,
  firstProhibitedPhrase,
  readCatalogSource,
  validateCatalogSource,
  validateMissionQuestions,
  validateReviewedBankPhrases,
} from "@/lib/missions/content-validation";
import { preparePlaythrough } from "@/lib/missions/playthrough";
import type { RoleId } from "@/lib/missions/types";

const ROLE_SEEDS = [1, 2, 7, 21, 42, 88, 99, 128, 256, 512];

function blobFromPlay(questions: { title: string; situation: string; npcLine: string; prompt?: string; options: readonly { title: string; summary: string }[] }[]): string {
  return questions
    .map((question) =>
      [
        question.title,
        question.situation,
        question.npcLine,
        question.prompt ?? "",
        ...question.options.map((option) => `${option.title} ${option.summary}`),
      ].join(" "),
    )
    .join("\n");
}

describe("production mission question content", () => {
  it("rejects prohibited legacy phrases, missing fields, and obsolete imports", () => {
    expect(validateMissionQuestions()).toEqual([]);
    expect(validateReviewedBankPhrases()).toEqual([]);
    expect(validateCatalogSource(readCatalogSource())).toEqual([]);
    expect(() => assertProductionQuestionContent()).not.toThrow();
  });

  it("does not load the retired extras bank", () => {
    const catalog = readCatalogSource();
    expect(catalog).not.toContain("missions/extras");
    expect(catalog).not.toContain("LOCKED_OUT_EXTRAS");
    expect(PRODUCTION_QUESTION_FILES.length).toBe(7);
  });

  it("keeps enough questions for every published mission and role", () => {
    const classic = MISSION_LIST.filter((mission) => !mission.sessionPhases);
    for (const mission of classic) {
      expect(mission.questions.length, mission.id).toBeGreaterThanOrEqual(32);
    }
    expect(requireMission("northstar-zero-hour").questions).toHaveLength(45);
    expect(requireMission("inbox-under-siege").questions).toHaveLength(32);
  });

  it("never surfaces legacy copy across randomised missions and roles", () => {
    for (const mission of MISSION_LIST) {
      const roles: Array<RoleId | null> =
        mission.requiresRoleSelection === false
          ? [null]
          : mission.intendedRoles.length > 0
            ? [...mission.intendedRoles]
            : [null];
      for (const roleId of roles) {
        for (const seed of ROLE_SEEDS) {
          const play = preparePlaythrough(mission, seed, { roleId });
          const blob = blobFromPlay(play.questions);
          expect(firstProhibitedPhrase(blob), `${mission.id} seed ${seed} role ${roleId ?? "none"}`).toBeNull();
          for (const question of play.questions) {
            expect(question.prompt?.trim().length, question.id).toBeGreaterThan(8);
            expect(question.prompt?.trim().toLowerCase()).not.toBe("what do you do now?");
          }
        }
      }
    }
  });
});
