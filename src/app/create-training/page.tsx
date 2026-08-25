import type { Metadata } from "next";
import { CreateTrainingPage } from "@/components/site/CreateTrainingPage";

export const metadata: Metadata = {
  title: "Create your training | BreachRoom",
  description:
    "Tell Scout who the training is for and which risks matter. Get a mission recommendation or a structured outline.",
};

export default function Page() {
  return <CreateTrainingPage />;
}
