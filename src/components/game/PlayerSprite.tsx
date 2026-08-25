interface PlayerSpriteProps {
  facing: "up" | "down" | "left" | "right";
  walking: boolean;
}

export function PlayerSprite({ facing, walking }: PlayerSpriteProps) {
  const frame = walking ? "walk" : "idle";
  return (
    <svg
      viewBox="0 0 16 16"
      className={`player-sprite player-${facing} player-${frame}`}
      aria-hidden="true"
    >
      <rect x="5" y="1" width="6" height="5" fill="#f0d5b8" />
      <rect x="5" y="1" width="6" height="2" fill="#1b2438" />
      <rect x="4" y="6" width="8" height="6" fill="#1e4d7b" />
      <rect x="6" y="8" width="4" height="3" fill="#7dd3fc" />
      <rect x="11" y="8" width="3" height="2" fill="#cbd5e1" />
      <rect x="4" y="12" width="3" height="4" fill="#243049" />
      <rect x="9" y="12" width="3" height="4" fill="#243049" />
      {facing === "left" ? <rect x="5" y="3" width="2" height="2" fill="#0b1220" /> : null}
      {facing === "right" ? <rect x="9" y="3" width="2" height="2" fill="#0b1220" /> : null}
      {facing === "up" ? <rect x="6" y="2" width="4" height="2" fill="#1b2438" /> : null}
      {facing === "down" ? <rect x="7" y="3" width="2" height="2" fill="#0b1220" /> : null}
    </svg>
  );
}
