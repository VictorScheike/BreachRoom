import { SecurityArchitect } from "@/components/builder/SecurityArchitect";

export function BuilderArchitectGuide({ message }: { message: string }) {
  return (
    <aside className="builder-guide">
      <div className="builder-guide__portrait">
        <SecurityArchitect className="builder-architect" />
      </div>
      <blockquote className="builder-bubble">
        <p>{message}</p>
      </blockquote>
    </aside>
  );
}
