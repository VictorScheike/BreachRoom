import type { Metadata } from "next";
import { BreachRoomApp } from "@/components/BreachRoomApp";

export const metadata: Metadata = {
  title: "Try the exercise | BreachRoom",
  description:
    "Walk through a fictional ransomware tabletop and receive a structured after-action report.",
};

export default function PlayPage() {
  return <BreachRoomApp />;
}
