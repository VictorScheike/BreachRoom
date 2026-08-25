"use client";

import { useState } from "react";
import { RoleTrainingCard } from "@/components/site/RoleTrainingCard";
import { FindTrainingWizard } from "@/components/site/FindTrainingWizard";
import { ROLE_GROUPS, type RoleGroupId } from "@/lib/training/groups";

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
      <div className="role-training-grid">
        {ROLE_GROUPS.map((item) => (
          <RoleTrainingCard
            key={item.id}
            group={item}
            onFind={() => {
              setGroup(item.id);
              setStarted(true);
            }}
          />
        ))}
      </div>
    </main>
  );
}
