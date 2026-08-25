const STEPS = [
  {
    number: "1",
    title: "Choose your training",
    text: "Select a mission directly or answer a few questions about your role and security context.",
    icon: "M2 3h12v2H2V3Zm0 4h8v2H2V7Zm0 4h12v2H2v-2Z",
  },
  {
    number: "2",
    title: "Make the decisions",
    text: "Explore the map, encounter realistic dilemmas and choose what you would do.",
    icon: "M8 1 3 13h2.2l.9-2.4h4.8L11.8 13H14L8 1Zm.9 7.2H7.1L8 5.6l.9 2.6Z",
  },
  {
    number: "3",
    title: "Understand the outcome",
    text: "See the consequences, review your decisions and track the areas you should practise next.",
    icon: "M3 12V8h2v4H3Zm4 0V4h2v8H7Zm4 0V6h2v6h-2Z",
  },
] as const;

function ProcessArrow() {
  return (
    <div className="how-arrow" aria-hidden="true">
      <svg viewBox="0 0 48 24" width="48" height="24" focusable="false" aria-hidden="true">
        <path
          d="M2 12h36M30 4l12 8-12 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="how-section" aria-labelledby="how-it-works-heading">
      <div className="how-section-inner">
        <p className="home-eyebrow">How it works</p>
        <h2 id="how-it-works-heading">Three steps from a role to a debrief.</h2>
        <div className="how-track">
          {STEPS.map((step, index) => (
            <div key={step.number} className="how-item">
              <article className="how-card">
                <p className="how-card__number">{step.number}</p>
                <span className="how-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 16 16" width="28" height="28">
                    <path d={step.icon} fill="currentColor" />
                  </svg>
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
              {index < STEPS.length - 1 ? <ProcessArrow /> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
