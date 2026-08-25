import type { AvailabilityStatus, FormatId } from "@/lib/missions/types";

export interface TrainingFormat {
  id: FormatId;
  title: string;
  status: AvailabilityStatus;
  description: string;
}

export const TRAINING_FORMATS: readonly TrainingFormat[] = [
  {
    id: "mission",
    title: "Playable missions",
    status: "available",
    description: "Interactive scenarios where decisions change the outcome.",
  },
  {
    id: "quiz",
    title: "Quizzes",
    status: "planned",
    description: "Short role-specific knowledge checks that can complement missions.",
  },
  {
    id: "learning-path",
    title: "Learning paths",
    status: "planned",
    description:
      "Structured collections of scenarios and learning activities for specific roles.",
  },
];
