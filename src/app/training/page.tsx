import type { Metadata } from "next";
import { TrainingPage } from "@/components/site/TrainingPage";
import "@/components/site/home-page.css";

export const metadata: Metadata = {
  title: "Find the right training | BreachRoom",
  description:
    "Answer three short questions and BreachRoom will recommend an available mission for your role.",
};

export default function Page() {
  return (
    <div className="home-page">
      <TrainingPage />
    </div>
  );
}
