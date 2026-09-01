import {
  BUILDER_INTRO_ARCHITECT,
  BUILDER_INTRO_BODY,
  BUILDER_SUBTITLE,
  BUILDER_TITLE,
  BUILDER_TOPIC_CHIPS,
} from "@/lib/builder/copy";
import { BuilderArchitectGuide } from "@/components/builder/BuilderArchitectGuide";

export function BuilderIntro({ onStart }: { onStart: () => void }) {
  return (
    <section className="builder-intro" aria-labelledby="builder-intro-heading">
      <BuilderArchitectGuide message={BUILDER_INTRO_ARCHITECT} priority />
      <div className="builder-intro__copy">
        <p className="builder-kicker">{BUILDER_TITLE}</p>
        <h1 id="builder-intro-heading">{BUILDER_SUBTITLE}</h1>
        <p>{BUILDER_INTRO_BODY}</p>
        <ul className="builder-topics">
          {BUILDER_TOPIC_CHIPS.map((chip) => (
            <li key={chip}>{chip}</li>
          ))}
        </ul>
        <div className="builder-intro__cta">
          <button type="button" className="builder-primary" onClick={onStart}>
            Start mission
          </button>
        </div>
      </div>
    </section>
  );
}
