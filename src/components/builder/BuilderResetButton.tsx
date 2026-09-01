export function BuilderResetButton({ onReset }: { onReset: () => void }) {
  return (
    <button type="button" className="builder-reset" onClick={onReset}>
      Reset game
    </button>
  );
}
