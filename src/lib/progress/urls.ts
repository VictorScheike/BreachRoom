import type { ProgressSession } from "./store";
import { playUrlForMission } from "@/lib/training/session";

export function sessionResumeHref(session: ProgressSession): string {
  if (session.kind === "lab" || session.missionId.startsWith("lab-")) {
    return "/lab/";
  }
  if (session.kind === "builder" || session.missionId === "secure-solution-builder") {
    return "/secure-solution-builder/";
  }
  return playUrlForMission(session.missionId, session.roleId);
}
