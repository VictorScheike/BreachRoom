import type { ProgressSession } from "./store";
import { playUrlForMission } from "@/lib/training/session";

export function sessionResumeHref(session: ProgressSession): string {
  if (session.kind === "lab" || session.missionId.startsWith("lab-")) {
    return "/lab/";
  }
  return playUrlForMission(session.missionId, session.roleId);
}
