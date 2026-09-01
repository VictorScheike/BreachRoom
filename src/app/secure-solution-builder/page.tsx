import type { Metadata } from "next";
import { SecureSolutionBuilder } from "@/components/builder/SecureSolutionBuilder";
import { BUILDER_SUMMARY, BUILDER_TITLE } from "@/lib/builder/copy";
import "@/components/builder/builder.css";

export const metadata: Metadata = {
  title: `${BUILDER_TITLE} | BreachRoom`,
  description: BUILDER_SUMMARY,
};

export default function SecureSolutionBuilderPage() {
  return (
    <div className="builder-page">
      <main id="main-content" className="site-page-main">
        <SecureSolutionBuilder />
      </main>
    </div>
  );
}
