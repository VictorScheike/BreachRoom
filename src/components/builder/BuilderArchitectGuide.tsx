import { SecurityArchitect } from "@/components/builder/SecurityArchitect";

export function BuilderArchitectGuide({
  message,
  priority = false,
}: {
  message: string;
  priority?: boolean;
}) {
  return (
    <aside className="builder-guide">
      <div className="builder-guide__portrait">
        <SecurityArchitect className="builder-architect" priority={priority} />
      </div>
      <blockquote className="builder-bubble">
        <p>{message}</p>
      </blockquote>
    </aside>
  );
}
