import type { GameState } from "@/lib/game/engine";
import type { MissionDefinition, RoleId } from "@/lib/missions/types";
import { ROLE_GROUPS, roleGroupForRole, type RoleGroupId } from "@/lib/training/groups";
import type { TrainingConfig } from "@/lib/training/config";

export interface MissionPerspective {
  mode: "role" | "general" | "standard";
  playingAs: string;
  focus: string;
  reportLine: string;
  chipLabel: string;
}

export function displayNameForRoleGroup(id: RoleGroupId): string {
  return ROLE_GROUPS.find((group) => group.id === id)?.name ?? id;
}

export function focusForRoleGroup(id: RoleGroupId): string {
  return ROLE_GROUPS.find((group) => group.id === id)?.focus ?? "";
}

export function roleGroupFromTraining(training: TrainingConfig | null, roleId: RoleId | null): RoleGroupId | null {
  if (training?.roleGroup) {
    return training.roleGroup;
  }
  if (roleId) {
    return roleGroupForRole(roleId);
  }
  return null;
}

export function missionPerspective(
  mission: MissionDefinition,
  training: TrainingConfig | null,
  roleId: RoleId | null,
): MissionPerspective {
  if (mission.audienceMode === "general") {
    return {
      mode: "general",
      playingAs: "Organisation-wide exercise",
      focus: "You’re making decisions as part of Northstar’s incident coordination team.",
      reportLine: "Perspective: Organisation-wide incident coordination team",
      chipLabel: "Organisation-wide exercise",
    };
  }

  const groupId = roleGroupFromTraining(training, roleId);
  if (groupId) {
    const name = displayNameForRoleGroup(groupId);
    return {
      mode: "role",
      playingAs: name,
      focus: `Your focus: ${focusForRoleGroup(groupId).replace(/^\w/, (letter) => letter.toLowerCase())}.`,
      reportLine: `Played as: ${name}`,
      chipLabel: name,
    };
  }

  return {
    mode: "standard",
    playingAs: "Standard mission",
    focus: "You’re considering the incident from an organisation-wide perspective.",
    reportLine: "Perspective: Organisation-wide",
    chipLabel: "",
  };
}

export function perspectiveFromState(state: GameState, mission: MissionDefinition): MissionPerspective {
  return missionPerspective(mission, state.trainingConfig, state.roleId);
}
