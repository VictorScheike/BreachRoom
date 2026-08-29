import type { Metadata } from "next";
import { MissionsLibrary } from "@/components/site/MissionsLibrary";
import "@/components/site/home-page.css";

export const metadata: Metadata = {
  title: "Missions | BreachRoom",
  description: "Browse playable BreachRoom missions by role, topic and difficulty.",
};

export default function MissionsPage() {
  return (
    <div className="home-page">
      <main id="main-content" className="site-page home-wrap">
        <p className="home-eyebrow">Mission library</p>
        <h1>Choose a mission</h1>
        <MissionsLibrary />
      </main>
    </div>
  );
}
