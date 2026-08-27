import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WizardActions } from "@/components/site/WizardControls";

describe("wizard actions", () => {
  it("keeps Continue with Back and puts Start over on the right", () => {
    const html = renderToStaticMarkup(
      <WizardActions
        step={2}
        continueLabel="Continue"
        onContinue={() => undefined}
        onBack={() => undefined}
        onReset={() => undefined}
      />,
    );
    const continueAt = html.indexOf(">Continue<");
    const startOverAt = html.indexOf(">Start over<");
    const backAt = html.indexOf(">Back<");
    expect(backAt).toBeGreaterThan(-1);
    expect(continueAt).toBeGreaterThan(backAt);
    expect(startOverAt).toBeGreaterThan(continueAt);
    expect(html).toContain("wizard-actions__reset");
    expect(html.indexOf("wizard-actions__continue")).toBeLessThan(html.indexOf("wizard-actions__reset"));
  });
});
