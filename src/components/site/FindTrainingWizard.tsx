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
import { WizardActions, WizardOptionCard, WizardStep } from "@/components/site/WizardControls";

type WizardStepId = 1 | 2 | 3 | "result";

const ROLE_MARKERS: Record<RoleGroupId, string> = {
  "general-employees": "●",
  "finance-hr": "■",
  "developers-devops": "</>",
  "it-security": "🛡",
  "leaders-risk": "▲",
};

export function FindTrainingWizard({ initialGroup }: { initialGroup?: RoleGroupId }) {
  const [step, setStep] = useState<WizardStepId>(initialGroup ? 2 : 1);
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
        <WizardStep
          title="Who is the training for?"
          supporting="Choose the group that will actually make the decisions."
        >
          <div className="wizard-options wizard-options--roles">
            {ROLE_GROUPS.map((group) => (
              <WizardOptionCard
                key={group.id}
                title={group.name}
                description={group.sentence}
                selected={roleGroup === group.id}
                onSelect={() => setRoleGroup(group.id)}
                marker={ROLE_MARKERS[group.id]}
                category="Role group"
              />
            ))}
          </div>
          <WizardActions
            step={1}
            continueLabel="Continue"
            continueDisabled={!roleGroup}
            onContinue={() => roleGroup && setStep(2)}
            onReset={reset}
          />
        </WizardStep>
      ) : null}

      {step === 2 && roleGroup ? (
        <WizardStep
          title="What should they practise?"
          supporting={`These topics have enough reviewed questions for ${roleGroupLabel(roleGroup)}.`}
        >
          <div className="wizard-options">
            {visibleTopics.map((topic) => (
              <WizardOptionCard
                key={topic.id}
                title={topic.label}
                description={topic.supporting}
                selected={topicId === topic.id}
                onSelect={() => setTopicId(topic.id)}
                marker="▣"
                category="Topic"
              />
            ))}
          </div>
          {topics.length > 6 && !showAllTopics ? (
            <button type="button" className="training-how" onClick={() => setShowAllTopics(true)}>
              Show all topics
            </button>
          ) : null}
          <WizardActions
            step={2}
            continueLabel="Continue"
            continueDisabled={!topicId}
            onContinue={() => topicId && setStep(3)}
            onBack={() => setStep(1)}
            onReset={reset}
          />
        </WizardStep>
      ) : null}

      {step === 3 ? (
        <WizardStep
          title="What context matters?"
          supporting="Optional. Select the tools or environments that should influence ranking."
        >
          <div className="wizard-options">
            {CONTEXT_CHIPS.map((chip) => (
              <WizardOptionCard
                key={chip.id}
                title={chip.label}
                description={
                  chip.kind === "technology"
                    ? "Include this technology when ranking reviewed questions."
                    : "Include this operating context when ranking reviewed questions."
                }
                selected={chipIds.includes(chip.id)}
                onSelect={() =>
                  setChipIds((current) =>
                    current.includes(chip.id)
                      ? current.filter((item) => item !== chip.id)
                      : [...current, chip.id],
                  )
                }
                marker={chip.kind === "technology" ? "⚙" : "○"}
                category={chip.kind === "technology" ? "Technology" : "Context"}
              />
            ))}
          </div>
          <p className="training-note">
            Optional notes stay on this page only. Do not enter confidential information. They are
            not saved.
          </p>
          <label className="training-optional">
            Optional context (not stored)
            <textarea rows={2} maxLength={280} />
          </label>
          <WizardActions
            step={3}
            continueLabel="Continue"
            onContinue={() => setStep("result")}
            onBack={() => setStep(2)}
            onReset={reset}
            extra={
              <button type="button" className="btn-tertiary" onClick={() => setStep("result")}>
                Skip this step
              </button>
            }
          />
        </WizardStep>
      ) : null}

      {step === "result" && result && !result.ok ? (
        <section>
          <h2>Not enough reviewed questions yet</h2>
          <p>{result.message}</p>
          {result.broaderTopicId ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setTopicId(result.broaderTopicId);
                setStep(2);
              }}
            >
              Try a broader topic
            </button>
          ) : null}
          <WizardActions
            step="result"
            continueLabel="Return to the previous step"
            onContinue={() => setStep(3)}
            onReset={reset}
          />
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
          <footer className="wizard-actions">
            <div className="wizard-actions__cluster">
              <Link className="btn-secondary" href="/missions/">
                Browse all missions
              </Link>
              <Link
                className="btn-primary wizard-actions__continue"
                href={playUrlForConfig(result.config)}
                onClick={() => startConfig(result.config)}
              >
                Start this training
              </Link>
            </div>
            <button type="button" className="btn-tertiary wizard-actions__reset" onClick={reset}>
              Start over
            </button>
          </footer>
          {alternative ? (
            <div className="training-alt">
              <h3>Alternative</h3>
              <p>{alternative.config.title}</p>
              <Link
                className="btn-secondary"
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
