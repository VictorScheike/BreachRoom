"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ScoutInput } from "@/lib/training/recommend";
import { AUDIENCES, TOOLS, TOPICS, TRAINING_GOALS } from "@/lib/training/curriculum";
import {
  defaultScoutInput,
  parseAudience,
  parseFormat,
  recommendTraining,
  SCOUT_IDENTITY,
} from "@/lib/training/scout";
import { AI_PROVIDER_CONFIGURED } from "@/lib/training/ai";

export function CreateTrainingPage() {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState<ScoutInput>(defaultScoutInput);
  const result = useMemo(
    () => (step > 5 ? recommendTraining(input) : null),
    [input, step],
  );

  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl px-4 py-12 text-site-ink">
      <div className="mb-8 flex items-center gap-4">
        <div
          aria-hidden="true"
          className="grid h-16 w-16 place-items-center rounded-2xl border border-cyan bg-navy-800 font-mono text-xs text-cyan"
        >
          ⌁
          <span className="text-[10px] tracking-widest">SCOUT</span>
        </div>
        <div>
          <p className="text-sm tracking-[0.16em] text-cyan uppercase">{SCOUT_IDENTITY.name}</p>
          <h1 className="font-serif text-3xl font-semibold">Create your training</h1>
        </div>
      </div>
      <p className="text-site-muted">{SCOUT_IDENTITY.purpose}</p>
      <p className="mt-2 text-sm text-site-muted">{SCOUT_IDENTITY.note}</p>
      {AI_PROVIDER_CONFIGURED ? null : (
        <p className="mt-2 text-sm text-amber">Local matching is on. No external model is called.</p>
      )}

      {step === 1 ? (
        <section className="mt-8">
          <h2>Who is the training for?</h2>
          <div className="mt-4 grid gap-2">
            {AUDIENCES.map((item) => (
              <button
                key={item.id}
                type="button"
                className="rounded-lg border border-site-line px-3 py-2 text-left hover:bg-navy-700"
                onClick={() => {
                  setInput({ ...input, audienceId: parseAudience(item.id) });
                  setStep(2);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="mt-8">
          <h2>What does the organisation work with?</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {TOOLS.map((tool) => {
              const on = input.tools.includes(tool);
              return (
                <button
                  key={tool}
                  type="button"
                  className={
                    on
                      ? "rounded-full bg-cyan px-3 py-1 text-sm text-navy-950"
                      : "rounded-full border border-site-line px-3 py-1 text-sm"
                  }
                  onClick={() =>
                    setInput({
                      ...input,
                      tools: on
                        ? input.tools.filter((item) => item !== tool)
                        : [...input.tools, tool],
                    })
                  }
                >
                  {tool}
                </button>
              );
            })}
          </div>
          <label className="mt-6 block text-sm">
            Tell Scout about your environment
            <textarea
              className="mt-2 w-full rounded-lg border border-site-line bg-navy-800 p-3"
              rows={3}
              value={input.environmentNote}
              onChange={(event) =>
                setInput({ ...input, environmentNote: event.target.value.slice(0, 500) })
              }
            />
          </label>
          <p className="mt-2 text-sm text-amber">
            Do not enter passwords, secrets, personal data or confidential customer information.
          </p>
          <button type="button" className="mt-4 home-btn-primary" onClick={() => setStep(3)}>
            Continue
          </button>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="mt-8">
          <h2>Choose a cybersecurity topic</h2>
          {(["awareness", "technical"] as const).map((cluster) => (
            <div key={cluster} className="mt-4">
              <h3 className="capitalize">{cluster === "awareness" ? "Employee awareness" : "Technical and architectural security"}</h3>
              <div className="mt-2 grid gap-2">
                {TOPICS.filter((topic) => topic.cluster === cluster).map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    className="rounded-lg border border-site-line px-3 py-2 text-left"
                    onClick={() => {
                      setInput({ ...input, topicId: topic.id });
                      setStep(4);
                    }}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {step === 4 ? (
        <section className="mt-8">
          <h2>Choose the training goal</h2>
          <div className="mt-4 grid gap-2">
            {TRAINING_GOALS.map((goal) => (
              <button
                key={goal}
                type="button"
                className="rounded-lg border border-site-line px-3 py-2 text-left"
                onClick={() => {
                  setInput({ ...input, goal });
                  setStep(5);
                }}
              >
                {goal}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 5 ? (
        <section className="mt-8">
          <h2>Choose the format</h2>
          <button
            type="button"
            className="mt-4 block rounded-lg border border-cyan px-3 py-3 text-left"
            onClick={() => {
              setInput({ ...input, formatId: parseFormat("mission") });
              setStep(6);
            }}
          >
            Playable mission — available now
          </button>
          <p className="mt-4 text-sm text-site-muted">
            Short quiz and structured learning path are not playable yet. Scout can still produce a
            labelled training outline.
          </p>
          <button
            type="button"
            className="mt-2 block rounded-lg border border-site-line px-3 py-3 text-left"
            onClick={() => {
              setInput({ ...input, formatId: parseFormat("learning-path") });
              setStep(6);
            }}
          >
            Ask for a training outline
          </button>
        </section>
      ) : null}

      {result ? (
        <section className="mt-8 rounded-2xl border border-site-line bg-site-card p-6">
          <p className="text-sm uppercase tracking-wide text-cyan">Scout recommendation</p>
          <h2 className="mt-2 text-2xl">{result.title}</h2>
          <p className="mt-2">{result.explanation}</p>
          <ul className="mt-4 list-disc pl-5 text-sm leading-7">
            <li>Audience: {result.audienceLabel}</li>
            <li>Context: {result.tools.join(", ") || "None selected"}</li>
            {result.environmentNote ? <li>Notes: {result.environmentNote}</li> : null}
            <li>Topic: {result.topicId}</li>
            <li>Format: {result.formatLabel}</li>
            {result.estimatedMinutes ? <li>Duration: about {result.estimatedMinutes} minutes</li> : null}
            {result.frameworks.length > 0 ? <li>Frameworks: {result.frameworks.join(", ")}</li> : null}
          </ul>
          <h3 className="mt-4">Learning objectives</h3>
          <ul className="list-disc pl-5 text-sm leading-7">
            {result.learningObjectives.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {result.canStartMission ? (
            <Link className="mt-6 inline-flex rounded-md bg-amber px-4 py-2 font-semibold text-navy-950" href="/play/">
              Start tailored mission
            </Link>
          ) : (
            <div className="mt-6">
              <h3>Training outline</h3>
              <p className="text-sm">This is an outline, not a complete playable course.</p>
              <ol className="mt-2 list-decimal pl-5 text-sm leading-7">
                {result.outline.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
