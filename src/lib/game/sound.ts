export function playTone(
  muted: boolean,
  frequency: number,
  durationMs: number,
  type: OscillatorType = "square",
): void {
  if (muted || typeof window === "undefined") {
    return;
  }
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) {
    return;
  }
  const context = new AudioContextCtor();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.04;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + durationMs / 1000);
  oscillator.stop(context.currentTime + durationMs / 1000);
  window.setTimeout(() => {
    void context.close();
  }, durationMs + 50);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
