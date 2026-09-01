import type { Metadata } from "next";
import { AboutPage } from "@/components/site/AboutPage";

export const metadata: Metadata = {
  title: "About | BreachRoom",
  description:
    "BreachRoom is a one-person educational project by Victor Scheike: map missions, Architecture Defence Lab, Secure Solution Builder, and training by role.",
};

export default function About() {
  return <AboutPage />;
}
