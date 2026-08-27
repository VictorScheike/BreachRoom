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
        <p className="training-lede missions-intro">
          These maps exist so you can practise the hard calls before they land on your desk. Each
          one is a different workplace under pressure — phishing, ransomware, a risky AI launch, a
          poisoned build, a lockout. Walking the route and deciding at each checkpoint is how the
          judgement sticks.
        </p>
        <MissionsLibrary />
      </main>
    </div>
  );
}
