import type { Metadata } from "next";
import { ProgressReportPage } from "@/components/site/ProgressReportPage";
import "@/components/site/home-page.css";

export const metadata: Metadata = {
  title: "Your score | BreachRoom",
  description: "Review a saved BreachRoom after-action report on this device.",
};

export default function Page() {
  return <ProgressReportPage />;
}
