import type { Metadata } from "next";
import { BreachRoomApp } from "@/components/BreachRoomApp";

export const metadata: Metadata = {
  title: "Try the exercise | BreachRoom",
  description:
    "Walk a fictional incident as an original pixel RPG: ransomware, AI security, or software supply chain.",
};

export default function PlayPage() {
  return <BreachRoomApp />;
}
