"use client";

import { useState } from "react";
import { publicTopicsForGroup } from "@/lib/training/coverage";
import { ROLE_GROUPS, type RoleGroupId } from "@/lib/training/groups";
import { FindTrainingWizard } from "@/components/site/FindTrainingWizard";

export function TrainingPage() {
  const [started, setStarted] = useState(false);
  const [group, setGroup] = useState<RoleGroupId | undefined>(undefined);

  if (started) {
    return (
      <main id="main-content" className="site-page home-wrap">
        <FindTrainingWizard initialGroup={group} />
      </main>
    );
  }

  return (
    <main id="main-content" className="site-page home-wrap">
      <p className="home-eyebrow">Training by role</p>
      <h1>Find training for your role</h1>
      <p className="training-lede">
        Choose who the training is for. Scout will then ask two short questions and assemble a
        session from reviewed BreachRoom missions.
      </p>
      <div className="role-group-grid">
        {ROLE_GROUPS.map((item) => {
          const topics = publicTopicsForGroup(item.id)
            .slice(0, 3)
            .map((topic) => topic.label);
          return (
            <article key={item.id} className="home-card role-group-card">
              <h2>{item.name}</h2>
              <p>{item.sentence}</p>
              <p>
                <strong>Practise:</strong> {topics.join(" · ")}
              </p>
              <button
                type="button"
                className="home-btn-primary"
                onClick={() => {
                  setGroup(item.id);
                  setStarted(true);
                }}
              >
                Find my training
              </button>
            </article>
          );
        })}
      </div>
    </main>
  );
}
