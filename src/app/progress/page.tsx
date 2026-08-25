import type { Metadata } from "next";
import { ProgressPage } from "@/components/site/ProgressPage";
import "@/components/site/home-page.css";

export const metadata: Metadata = {
  title: "My progress | BreachRoom",
  description: "See locally saved BreachRoom training activity on this device.",
};

export default function Page() {
  return <ProgressPage />;
}
