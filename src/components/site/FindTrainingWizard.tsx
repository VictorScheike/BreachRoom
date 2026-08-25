"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { requireMission } from "@/lib/missions/catalog";
import { CONTEXT_CHIPS } from "@/lib/training/chips";
import { createTrainingSeed, type TrainingConfig } from "@/lib/training/config";
import { publicTopicsForGroup } from "@/lib/training/coverage";
import { generateDeck } from "@/lib/training/deck";
import { ROLE_GROUPS, type RoleGroupId } from "@/lib/training/groups";
import { roleGroupLabel, roleLabel, topicLabel } from "@/lib/training/labels";
import { loadSeenQuestionIds, playUrlForConfig, saveTrainingSession } from "@/lib/training/session";
import { BrandMark } from "@/components/site/BrandMark";

type WizardStep = 1 | 2 | 3 | "result";

export function FindTrainingWizard({ initialGroup }: { initialGroup?: RoleGroupId }) {
  const [step, setStep] = useState<WizardStep>(initialGroup ? 2 : 1);
  const [roleGroup, setRoleGroup] = useState<RoleGroupId | null>(initialGroup ?? null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [chipIds, setChipIds] = useState<string[]>([]);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [seed] = useState(createTrainingSeed);

  const topics = roleGroup ? publicTopicsForGroup(roleGroup) : [];
  const visibleTopics = showAllTopics ? topics : topics.slice(0, 6);

  const technologies = chipIds.filter((id) =>
    CONTEXT_CHIPS.some((chip) => chip.id === id && chip.kind === "technology"),
  );
  const contexts = chipIds.filter((id) =>
    CONTEXT_CHIPS.some((chip) => chip.id === id && chip.kind === "context"),
  );

  const result = useMemo(() => {
    if (step !== "result" || !roleGroup || !topicId) {
      return null;
    }
    return generateDeck(
      {
        roleGroup,
        topics: [topicId],
        technologies,
        contexts,
        mapId: publicTopicsForGroup(roleGroup).find((item) => item.id === topicId)?.mapId
          ?? "inbox-under-siege",
      },
      { seed, avoidQuestionIds: loadSeenQuestionIds() },
    );
  }, [step, roleGroup, topicId, technologies, contexts, seed]);

  const alternative = useMemo(() => {
    if (!roleGroup || !topicId) {
      return null;
    }
    const other = publicTopicsForGroup(roleGroup).find((item) => item.id !== topicId);
    if (!other) {
      return null;
    }
    const deck = generateDeck(
      { roleGroup, topics: [other.id], mapId: other.mapId },
      { seed: `${seed}-alt` },
    );
    return deck.ok ? deck : null;
  }, [roleGroup, topicId, seed]);

  const reset = () => {
    setStep(1);
    setRoleGroup(null);
    setTopicId(null);
    setChipIds([]);
    setShowAllTopics(false);
  };

  const startConfig = (config: TrainingConfig) => {
    saveTrainingSession(config);
  };

  return (
    <div className="training-wizard">
      <header className="training-hero">
        <BrandMark size={48} className="rounded-xl" />
        <div>
          <p className="home-eyebrow">Scout</p>
          <h1>Find the right training</h1>
        </div>
      </header>
      <p className="training-lede">
        Answer three short questions and BreachRoom will recommend an available mission for your
        role. Scout assembles the session from reviewed BreachRoom questions — it does not invent
        new answers.
      </p>
      <button
        type="button"
        className="training-how"
        onClick={() => setHowOpen((value) => !value)}
        aria-expanded={howOpen}
      >
        How recommendations work
      </button>
      {howOpen ? (
        <p className="training-note">
          Recommendations are matched locally against BreachRoom’s curated mission library. Do not
          enter passwords, personal data or confidential information.
        </p>
      ) : null}

      {step !== "result" ? (
        <p className="training-progress" aria-live="polite">
          Step {step} of 3
        </p>
      ) : null}

      {step === 1 ? (
        <section>
          <h2>Who is the training for?</h2>
          <p>Choose the group that will actually make the decisions.</p>
          <div className="training-options">
            {ROLE_GROUPS.map((group) => (
              <button
                key={group.id}
                type="button"
                className={roleGroup === group.id ? "training-card is-selected" : "training-card"}
                onClick={() => setRoleGroup(group.id)}
                aria-pressed={roleGroup === group.id}
              >
                <strong>{group.name}</strong>
                <span>{group.sentence}</span>
              </button>
            ))}
          </div>
          <div className="training-nav">
            <button
              type="button"
              className="home-btn-primary"
              disabled={!roleGroup}
              onClick={() => roleGroup && setStep(2)}
            >
              Continue
            </button>
            <button type="button" className="home-btn-secondary" onClick={reset}>
              Start over
            </button>
          </div>
        </section>
      ) : null}

      {step === 2 && roleGroup ? (
        <section>
          <h2>What should they practise?</h2>
          <p>These topics have enough reviewed questions for {roleGroupLabel(roleGroup)}.</p>
          <div className="training-options">
            {visibleTopics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                className={topicId === topic.id ? "training-card is-selected" : "training-card"}
                onClick={() => setTopicId(topic.id)}
                aria-pressed={topicId === topic.id}
              >
                <strong>{topic.label}</strong>
                <span>{topic.supporting}</span>
              </button>
            ))}
          </div>
          {topics.length > 6 && !showAllTopics ? (
            <button type="button" className="training-how" onClick={() => setShowAllTopics(true)}>
              Show all topics
            </button>
          ) : null}
          <div className="training-nav">
            <button type="button" className="home-btn-secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="home-btn-primary"
              disabled={!topicId}
              onClick={() => topicId && setStep(3)}
            >
              Continue
            </button>
            <button type="button" className="home-btn-secondary" onClick={reset}>
              Start over
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section>
          <h2>What context matters?</h2>
          <p>Optional. Select the tools or environments that should influence ranking.</p>
          <div className="training-chips">
            {CONTEXT_CHIPS.map((chip) => {
              const on = chipIds.includes(chip.id);
              return (
                <button
                  key={chip.id}
                  type="button"
                  className={on ? "training-chip is-selected" : "training-chip"}
                  onClick={() =>
                    setChipIds((current) =>
                      on ? current.filter((item) => item !== chip.id) : [...current, chip.id],
                    )
                  }
                  aria-pressed={on}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
          <p className="training-note">
            Optional notes stay on this page only. Do not enter confidential information. They are
            not saved.
          </p>
          <label className="training-optional">
            Optional context (not stored)
            <textarea rows={2} maxLength={280} />
          </label>
          <div className="training-nav">
            <button type="button" className="home-btn-secondary" onClick={() => setStep(2)}>
              Back
            </button>
            <button type="button" className="home-btn-secondary" onClick={() => setStep("result")}>
              Skip this step
            </button>
            <button type="button" className="home-btn-primary" onClick={() => setStep("result")}>
              Continue
            </button>
            <button type="button" className="home-btn-secondary" onClick={reset}>
              Start over
            </button>
          </div>
        </section>
      ) : null}

      {step === "result" && result && !result.ok ? (
        <section>
          <h2>Not enough reviewed questions yet</h2>
          <p>{result.message}</p>
          {result.broaderTopicId ? (
            <button
              type="button"
              className="home-btn-primary"
              onClick={() => {
                setTopicId(result.broaderTopicId);
                setStep(2);
              }}
            >
              Try a broader topic
            </button>
          ) : null}
          <button type="button" className="home-btn-secondary" onClick={() => setStep(3)}>
            Return to the previous step
          </button>
        </section>
      ) : null}

      {step === "result" && result?.ok ? (
        <section>
          <p className="home-eyebrow">Your training</p>
          <h2>{result.config.title}</h2>
          <p>
            Recommended because you selected {roleGroupLabel(result.config.roleGroup)}
            {topicId ? `, ${topicLabel(topicId)}` : ""}
            {chipIds.length > 0 ? `, ${chipIds.join(", ")}` : ""}.
          </p>
          <ul className="training-facts">
            <li>
              <strong>Role:</strong>{" "}
              {result.config.specificRole
                ? roleLabel(result.config.specificRole)
                : roleGroupLabel(result.config.roleGroup)}
            </li>
            <li>
              <strong>Topic:</strong> {topicLabel(result.config.topics[0] ?? "")}
            </li>
            <li>
              <strong>Context:</strong>{" "}
              {[...result.config.technologies, ...result.config.contexts].join(", ") || "General"}
            </li>
            <li>
              <strong>Questions:</strong> 8 selected from {result.matchCount} matching reviewed
              questions
            </li>
            <li>
              <strong>Difficulty:</strong> {result.config.difficulty}
            </li>
            <li>
              <strong>Estimated duration:</strong> about{" "}
              {requireMission(result.config.mapId).estimatedMinutes} minutes
            </li>
            <li>
              <strong>Map:</strong> {requireMission(result.config.mapId).title}
            </li>
            <li>
              <strong>Guidance:</strong> {requireMission(result.config.mapId).frameworks.join(" · ")}
            </li>
          </ul>
          <p>
            Pressing Start opens the {requireMission(result.config.mapId).title} map with this role
            and these eight questions already selected. You will not need to choose again.
          </p>
          <div className="training-nav">
            <Link
              className="home-btn-primary"
              href={playUrlForConfig(result.config)}
              onClick={() => startConfig(result.config)}
            >
              Start this training
            </Link>
            <button type="button" className="home-btn-secondary" onClick={() => setStep(1)}>
              Change my selections
            </button>
            <Link className="home-btn-secondary" href="/missions/">
              Browse all missions
            </Link>
          </div>
          {alternative ? (
            <div className="training-alt">
              <h3>Alternative</h3>
              <p>{alternative.config.title}</p>
              <Link
                className="home-btn-secondary"
                href={playUrlForConfig(alternative.config)}
                onClick={() => startConfig(alternative.config)}
              >
                Start {requireMission(alternative.config.mapId).title} as{" "}
                {alternative.config.specificRole
                  ? roleLabel(alternative.config.specificRole)
                  : roleGroupLabel(alternative.config.roleGroup)}
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
