import type { Metadata } from "next";
import { BreachRoomApp } from "@/components/BreachRoomApp";

export const metadata: Metadata = {
  title: "Try the exercise | BreachRoom",
  description:
    "Walk through a fictional Northstar ransomware incident as a compact top-down exercise.",
};

export default function PlayPage() {
  return <BreachRoomApp />;
}
