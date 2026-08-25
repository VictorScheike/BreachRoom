import type { Metadata } from "next";
import { BreachRoomApp } from "@/components/BreachRoomApp";

export const metadata: Metadata = {
  title: "Play free | BreachRoom",
  description: "Play a free BreachRoom cybersecurity mission in the browser.",
};

export default function PlayPage() {
  return <BreachRoomApp />;
}
