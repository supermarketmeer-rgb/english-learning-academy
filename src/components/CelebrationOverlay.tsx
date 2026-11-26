import React, { useEffect, useState } from 'react';
import { FeedbackEffectsService } from '../services/FeedbackEffectsService';

interface MiniCardParticle {
  id: string;
  label: string;
  colorClass: string;
  startX: number;
  startY: number;
  driftX: number;
  driftY: number;
  rotStart: number;
  rotEnd: number;
  delay: number;
  duration: number;
  scale: number;
}

const CARD_LABELS = ['✓', '★', '✨', 'A+', '🎉', '👏', '★', '✓'];

const CARD_COLORS = [
  'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-emerald-500/25 dark:bg-emerald-900/90 dark:text-emerald-200',
  'border-teal-400 bg-teal-50 text-teal-700 shadow-teal-500/25 dark:bg-teal-900/90 dark:text-teal-200',
  'border-lime-400 bg-lime-50 text-lime-700 shadow-lime-500/25 dark:bg-lime-900/90 dark:text-lime-200',
  'border-amber-400 bg-amber-50 text-amber-700 shadow-amber-500/25 dark:bg-amber-900/90 dark:text-amber-200',
  'border-sky-400 bg-sky-50 text-sky-700 shadow-sky-500/25 dark:bg-sky-900/90 dark:text-sky-200',
  'border-violet-400 bg-violet-50 text-violet-700 shadow-violet-500/25 dark:bg-violet-900/90 dark:text-violet-200',
];

function createBurstParticles(burstId: number): MiniCardParticle[] {
  const count = 30;
  const particles: MiniCardParticle[] = [];

  for (let i = 0; i < count; i += 1) {
    const startX = 12 + Math.random() * 76; // 12% to 88% across viewport
    const startY = 18 + Math.random() * 34; // upper-middle burst zone
    const angle = Math.random() * Math.PI * 2;
    const distance = 120 + Math.random() * 240;
    const driftX = Math.cos(angle) * distance;
    const driftY = Math.sin(angle) * distance * 0.7 + 160 + Math.random() * 180;

    particles.push({
      id: `${burstId}-${i}`,
      label: CARD_LABELS[i % CARD_LABELS.length],
      colorClass: CARD_COLORS[i % CARD_COLORS.length],
      startX,
      startY,
      driftX,
      driftY,
      rotStart: Math.round((Math.random() - 0.5) * 40),
      rotEnd: Math.round((Math.random() - 0.5) * 320),
      delay: Math.round(Math.random() * 220),
      duration: 1250 + Math.round(Math.random() * 750),
      scale: 0.85 + Math.random() * 0.45,
    });
  }

  return particles;
}

export const CelebrationOverlay: React.FC = () => {
  const [particles, setParticles] = useState<MiniCardParticle[]>([]);

  useEffect(() => {
    const timers: number[] = [];

    const unsubscribe = FeedbackEffectsService.subscribeCelebration((burstId) => {
      const next = createBurstParticles(burstId);
      setParticles((prev) => [...prev, ...next]);

      const timer = window.setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !p.id.startsWith(`${burstId}-`)));
      }, 2300);
      timers.push(timer);
    });

    return () => {
      unsubscribe();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  if (particles.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className={`celebration-mini-card absolute flex h-9 min-w-[36px] items-center justify-center rounded-xl border-2 px-2 text-sm font-bold shadow-lg ${p.colorClass}`}
          style={
            {
              left: `${p.startX}%`,
              top: `${p.startY}%`,
              animationDelay: `${p.delay}ms`,
              animationDuration: `${p.duration}ms`,
              '--drift-x': `${p.driftX}px`,
              '--drift-y': `${p.driftY}px`,
              '--rot-start': `${p.rotStart}deg`,
              '--rot-end': `${p.rotEnd}deg`,
              '--card-scale': p.scale,
            } as React.CSSProperties
          }
        >
          {p.label}
        </span>
      ))}
    </div>
  );
};
