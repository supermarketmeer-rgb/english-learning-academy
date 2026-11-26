type CelebrationListener = (burstId: number) => void;

const celebrationListeners = new Set<CelebrationListener>();
let audioCtx: AudioContext | null = null;
let burstCounter = 0;
let lastFeedbackTime = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;

  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType,
  peakGain: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export const FeedbackEffectsService = {
  subscribeCelebration(listener: CelebrationListener): () => void {
    celebrationListeners.add(listener);
    return () => {
      celebrationListeners.delete(listener);
    };
  },

  playSuccessSound(): void {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Cheerful ascending major arpeggio: C5 -> E5 -> G5 -> C6
    const notes = [
      { freq: 523.25, delay: 0.0, dur: 0.16, gain: 0.16 },
      { freq: 659.25, delay: 0.08, dur: 0.16, gain: 0.16 },
      { freq: 783.99, delay: 0.16, dur: 0.18, gain: 0.17 },
      { freq: 1046.5, delay: 0.24, dur: 0.36, gain: 0.19 },
    ];

    for (const n of notes) {
      playTone(ctx, n.freq, now + n.delay, n.dur, 'triangle', n.gain);
      playTone(ctx, n.freq * 2, now + n.delay, n.dur * 0.7, 'sine', n.gain * 0.25);
    }
  },

  playErrorSound(): void {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Clear, gentle two-tone descending buzz: E3 -> B2
    playTone(ctx, 220, now, 0.18, 'triangle', 0.18);
    playTone(ctx, 185, now + 0.14, 0.28, 'sawtooth', 0.11);
    playTone(ctx, 165, now + 0.14, 0.28, 'triangle', 0.14);
  },

  triggerSuccess(): void {
    const now = Date.now();
    if (now - lastFeedbackTime < 180) return;
    lastFeedbackTime = now;

    this.playSuccessSound();
    burstCounter += 1;
    const id = burstCounter;
    celebrationListeners.forEach((listener) => listener(id));
  },

  triggerError(): void {
    const now = Date.now();
    if (now - lastFeedbackTime < 180) return;
    lastFeedbackTime = now;

    this.playErrorSound();
  },

  triggerForScore(score: number, passingThreshold = 60): void {
    if (score >= passingThreshold) {
      this.triggerSuccess();
    } else {
      this.triggerError();
    }
  },
};
