import type { Metadata } from "next";
import { AboutPage } from "@/components/site/AboutPage";

export const metadata: Metadata = {
  title: "About | BreachRoom",
  description:
    "BreachRoom is a one-person educational project by Victor Scheike: practise cyber incidents, and build resilient cybersecurity before the attack runs.",
};

export default function About() {
  return <AboutPage />;
}
