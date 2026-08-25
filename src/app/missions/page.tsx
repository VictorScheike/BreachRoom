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
        <p className="training-lede">
          Each mission is a playable map with eight decisions and a written debrief. After you
          choose one, you will only be offered roles that actually fit that scenario.
        </p>
        <MissionsLibrary />
      </main>
    </div>
  );
}
