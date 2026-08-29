"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { requireMission } from "@/lib/missions/catalog";
import type { DifficultyId } from "@/lib/missions/types";
import {
  CONTEXT_CHIPS,
  CONTEXT_QUOTA,
  MAX_CONTEXTS,
  MAX_TECHNOLOGIES,
  selectionLimitCopy,
  technologiesForRole,
  TECHNOLOGY_CHIPS,
} from "@/lib/training/availability";
import { createTrainingSeed, type TrainingConfig } from "@/lib/training/config";
import {
  availableContexts,
  combinationReady,
  publicTopicsForGroup,
} from "@/lib/training/coverage";
import { generateDeck, coverageSummary } from "@/lib/training/deck";
import { ROLE_GROUPS, type RoleGroupId } from "@/lib/training/groups";
import type { ContextId, TechnologyId } from "@/lib/training/ids";
import { contextLabel, technologyLabel } from "@/lib/training/ids";
import { roleGroupLabel, roleLabel, topicLabel } from "@/lib/training/labels";
import { displayDifficulty } from "@/lib/training/reviewed/convert";
import { playUrlForConfig, saveTrainingSession } from "@/lib/training/session";
import { BrandMark } from "@/components/site/BrandMark";
import {
  WizardActions,
  WizardOptionCard,
  WizardStep,
  type WizardStepId,
} from "@/components/site/WizardControls";

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
  const [difficulty, setDifficulty] = useState<DifficultyId>("Beginner");
  const [technologies, setTechnologies] = useState<TechnologyId[]>([]);
  const [contexts, setContexts] = useState<ContextId[]>([]);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [seed] = useState(createTrainingSeed);

  const topics = roleGroup ? publicTopicsForGroup(roleGroup, difficulty) : [];
  const visibleTopics = showAllTopics ? topics : topics.slice(0, 6);
  const matrixTechnologies = roleGroup ? technologiesForRole(roleGroup) : [];
  const readyContexts =
    roleGroup && topicId ? availableContexts(roleGroup, topicId, difficulty, technologies) : [];

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
        difficulty,
        mapId: publicTopicsForGroup(roleGroup, difficulty).find((item) => item.id === topicId)?.mapId,
      },
      { seed },
    );
  }, [step, roleGroup, topicId, technologies, contexts, difficulty, seed]);

  const alternative = useMemo(() => {
    if (!roleGroup || !topicId) {
      return null;
    }
    const other = publicTopicsForGroup(roleGroup, difficulty).find((item) => item.id !== topicId);
    if (!other) {
      return null;
    }
    const deck = generateDeck(
      { roleGroup, topics: [other.id], mapId: other.mapId, difficulty },
      { seed: `${seed}-alt` },
    );
    return deck.ok ? deck : null;
  }, [roleGroup, topicId, difficulty, seed]);

  const reset = () => {
    setStep(1);
    setRoleGroup(null);
    setTopicId(null);
    setDifficulty("Beginner");
    setTechnologies([]);
    setContexts([]);
    setShowAllTopics(false);
  };

  const startConfig = (config: TrainingConfig) => {
    saveTrainingSession(config);
  };

  const toggleTechnology = (id: TechnologyId, ready: boolean) => {
    if (!ready) {
      return;
    }
    setTechnologies((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= MAX_TECHNOLOGIES) {
        return current;
      }
      return [...current, id];
    });
  };

  const toggleContext = (id: ContextId) => {
    setContexts((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= MAX_CONTEXTS) {
        return current;
      }
      return [id];
    });
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
        Answer a few short questions and BreachRoom will assemble eight reviewed workplace
        decisions for your role. Scout does not invent new answers.
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
          Recommendations are matched locally against BreachRoom’s reviewed question bank. Selected
          technologies and operating contexts are hard coverage constraints, not ranking hints. Do
          not enter passwords, personal data or confidential information.
        </p>
      ) : null}

      {step !== "result" ? (
        <p className="training-progress" aria-live="polite">
          Step {step} of 4
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
                onSelect={() => {
                  setRoleGroup(group.id);
                  setTechnologies([]);
                  setContexts([]);
                }}
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
          supporting={`These topics have enough reviewed questions for ${roleGroupLabel(roleGroup)} at ${displayDifficulty(difficulty)}.`}
        >
          <div className="wizard-options">
            {visibleTopics.map((topic) => (
              <WizardOptionCard
                key={topic.id}
                title={topic.label}
                description={topic.supporting}
                selected={topicId === topic.id}
                onSelect={() => {
                  setTopicId(topic.id);
                  setTechnologies([]);
                  setContexts([]);
                }}
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
          title="What level should they practise?"
          supporting="Beginner tests recognition and the safest next action. Challenge tests scope, prioritisation, evidence, ownership and trade-offs."
        >
          <div className="wizard-options">
            <WizardOptionCard
              title="Beginner"
              description="Recognition and the safest next action."
              selected={difficulty === "Beginner"}
              onSelect={() => {
                setDifficulty("Beginner");
                setTechnologies([]);
                setContexts([]);
              }}
              marker="1"
              category="Level"
            />
            <WizardOptionCard
              title="Challenge"
              description="Scope, prioritisation, evidence, ownership and trade-offs. No Recommended badge."
              selected={difficulty === "Intermediate"}
              onSelect={() => {
                setDifficulty("Intermediate");
                setTechnologies([]);
                setContexts([]);
              }}
              marker="2"
              category="Level"
            />
          </div>
          <WizardActions
            step={3}
            continueLabel="Continue"
            onContinue={() => {
              if (!roleGroup || !topicId) {
                return;
              }
              const available = publicTopicsForGroup(roleGroup, difficulty);
              if (!available.some((topic) => topic.id === topicId)) {
                setTopicId(null);
                setStep(2);
                return;
              }
              setStep(4);
            }}
            onBack={() => setStep(2)}
            onReset={reset}
          />
        </WizardStep>
      ) : null}

      {step === 4 && roleGroup && topicId ? (
        <WizardStep
          title="What technology or operating context matters?"
          supporting={selectionLimitCopy()}
        >
          <div className="wizard-options">
            {matrixTechnologies.map((id) => {
              const chip = TECHNOLOGY_CHIPS.find((item) => item.id === id);
              const ready = combinationReady({
                roleGroup,
                topicId,
                difficulty,
                technologies: [id],
                contexts,
              });
              const atLimit = technologies.length >= MAX_TECHNOLOGIES && !technologies.includes(id);
              return (
                <WizardOptionCard
                  key={id}
                  title={chip?.label ?? technologyLabel(id)}
                  description={chip?.description ?? "At least 4 of your 8 questions will use this technology."}
                  selected={technologies.includes(id)}
                  disabled={!ready || atLimit}
                  disabledReason={
                    !ready
                      ? "Not enough reviewed questions yet"
                      : atLimit
                        ? `You can include at most ${MAX_TECHNOLOGIES} technologies.`
                        : undefined
                  }
                  onSelect={() => toggleTechnology(id, ready && !atLimit)}
                  marker="⚙"
                  category="Technology"
                />
              );
            })}
            {CONTEXT_CHIPS.map((chip) => {
              const ready = readyContexts.includes(chip.id);
              const atLimit = contexts.length >= MAX_CONTEXTS && !contexts.includes(chip.id);
              if (!ready && !contexts.includes(chip.id)) {
                return null;
              }
              return (
                <WizardOptionCard
                  key={chip.id}
                  title={chip.label}
                  description={`At least ${CONTEXT_QUOTA} of your 8 questions will use this operating context.`}
                  selected={contexts.includes(chip.id)}
                  disabled={!ready || atLimit}
                  disabledReason={
                    !ready
                      ? "Not enough reviewed questions yet"
                      : atLimit
                        ? "You can include one operating context."
                        : undefined
                  }
                  onSelect={() => ready && toggleContext(chip.id)}
                  marker="○"
                  category="Context"
                />
              );
            })}
          </div>
          <p className="training-note">{selectionLimitCopy()}</p>
          <WizardActions
            step={4}
            continueLabel="Continue"
            onContinue={() => setStep("result")}
            onBack={() => setStep(3)}
            onReset={reset}
            extra={
              <button
                type="button"
                className="btn-tertiary"
                onClick={() => {
                  setTechnologies([]);
                  setContexts([]);
                  setStep("result");
                }}
              >
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
            onContinue={() => setStep(4)}
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
            {topicId ? `, ${topicLabel(topicId)}` : ""}, {displayDifficulty(result.config.difficulty)}
            {result.config.technologies.length > 0
              ? `, ${result.config.technologies.map((id) => technologyLabel(id)).join(", ")}`
              : ""}
            {result.config.contexts.length > 0
              ? `, ${result.config.contexts.map((id) => contextLabel(id)).join(", ")}`
              : ""}
            .
          </p>
          {coverageSummary(result.config) ? (
            <p className="training-coverage">{coverageSummary(result.config)}</p>
          ) : null}
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
              <strong>Coverage:</strong> {coverageSummary(result.config) || "Role and topic only"}
            </li>
            <li>
              <strong>Questions:</strong> 8 selected from {result.matchCount} matching reviewed
              questions
            </li>
            <li>
              <strong>Difficulty:</strong> {displayDifficulty(result.config.difficulty)}
            </li>
            <li>
              <strong>Estimated duration:</strong> about{" "}
              {requireMission(result.config.mapId).estimatedMinutes} minutes
            </li>
            <li>
              <strong>Map:</strong> {requireMission(result.config.mapId).title}
            </li>
            <li>
              <strong>Guidance:</strong> {requireMission(result.config.mapId).frameworks.join(" · ")}{" "}
              (educational mapping, not certification)
            </li>
          </ul>
          <p>
            Pressing Start opens the {requireMission(result.config.mapId).title} map with this role,
            topic, difficulty
            {result.config.technologies.length > 0
              ? `, ${result.config.technologies.map((id) => technologyLabel(id)).join(", ")}`
              : ""}
            {result.config.contexts.length > 0
              ? ` and ${result.config.contexts.map((id) => contextLabel(id)).join(", ")}`
              : ""}{" "}
            already selected. The Start link keeps those values so the session cannot fall back to a
            generic question pool.
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
