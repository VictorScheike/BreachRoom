import type { Metadata } from "next";
import { AboutPage } from "@/components/site/AboutPage";

export const metadata: Metadata = {
  title: "Who we are | BreachRoom",
  description:
    "BreachRoom is a one-person educational project by Victor Scheike, built to put more focus on cybersecurity.",
};

export default function About() {
  return <AboutPage />;
}
