import { Activity, Mic, MicOff } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface AudioWaveformVisualizerProps {
  /** Live analyser node created by Web Audio API during active mic input */
  analyser: AnalyserNode | null;
  /** Whether the microphone capture is currently live */
  isActive: boolean;
  /** Normalized mic volume percentage (0-100) */
  levelPercent: number;
  /** Standalone waveform practice state (used when user toggles mic preview directly) */
  isStandaloneMonitor?: boolean;
  /** Callback to toggle standalone live mic waveform monitor */
  onToggleStandaloneMonitor?: () => void;
  /** Optional Arabic status message or error */
  statusHintAr?: string | null;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  analyser,
  isActive,
  levelPercent,
  isStandaloneMonitor = false,
  onToggleStandaloneMonitor,
  statusHintAr,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let disposed = false;

    const syncDimensions = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      const width = Math.max(240, Math.floor(rect.width));
      const height = 112;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      return { width, height, dpr };
    };

    const resizeObserver = new ResizeObserver(() => {
      syncDimensions();
    });
    resizeObserver.observe(container);

    const timeData = analyser ? new Uint8Array(analyser.fftSize) : new Uint8Array(256);
    const freqData = analyser ? new Uint8Array(analyser.frequencyBinCount) : new Uint8Array(128);

    const drawFrame = () => {
      if (disposed) return;
      const { width, height, dpr } = syncDimensions();
      const isDark = document.documentElement.classList.contains('dark');

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Subtle laboratory grid backdrop
      ctx.fillStyle = isDark ? '#020617' : '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Horizontal baseline & quarter reference lines
      ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(15, 23, 42, 0.08)';
      ctx.lineWidth = 1;
      for (const ratio of [0.25, 0.5, 0.75]) {
        const y = Math.round(height * ratio) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (analyser && isActive) {
        analyser.getByteTimeDomainData(timeData);
        analyser.getByteFrequencyData(freqData);

        // Background low-opacity frequency bars
        const barCount = 36;
        const step = Math.max(1, Math.floor(freqData.length / barCount));
        const barSlot = width / barCount;
        const barWidth = Math.max(2, barSlot * 0.55);

        ctx.fillStyle = isDark ? 'rgba(45, 212, 191, 0.18)' : 'rgba(15, 118, 110, 0.14)';
        for (let i = 0; i < barCount; i++) {
          const mag = freqData[i * step] / 255;
          const barH = Math.max(2, mag * (height * 0.48));
          const x = i * barSlot + (barSlot - barWidth) / 2;
          ctx.fillRect(x, height - barH, barWidth, barH);
        }

        // Foreground time-domain oscilloscope waveform
        ctx.lineWidth = 2.4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = isDark ? '#a3e635' : '#4d7c0f';

        ctx.beginPath();
        const sliceWidth = width / timeData.length;
        let x = 0;
        for (let i = 0; i < timeData.length; i++) {
          const v = timeData[i] / 128.0; // 1.0 = center
          const y = (v * height) / 2;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();

        rafId = requestAnimationFrame(drawFrame);
      } else {
        // Resting clean flat baseline when microphone is idle
        ctx.lineWidth = 1.75;
        ctx.strokeStyle = isDark ? 'rgba(163, 230, 53, 0.45)' : 'rgba(101, 163, 13, 0.45)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      ctx.restore();
    };

    drawFrame();

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [analyser, isActive]);

  const signalClarityLabel = !isActive
    ? 'بانتظار بدء التمرين'
    : levelPercent >= 35
      ? 'صوت واضح ومسموع'
      : levelPercent >= 8
        ? 'صوت خافت — اقترب قليلاً'
        : 'تحدث الآن نحو الميكروفون';

  return (
    <div className="mt-5 space-y-3 rounded-xl border border-lime-600/40 bg-slate-50/70 p-4 dark:border-lime-400/40 dark:bg-slate-950/60">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
          <Activity
            className={`h-4 w-4 ${
              isActive
                ? 'text-lime-700 dark:text-lime-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          />
          <span>مرسمة الموجة الصوتية الحية (Web Audio Waveform)</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span
            className={`font-semibold ${
              isActive
                ? 'text-teal-800 dark:text-teal-300'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {signalClarityLabel}
          </span>
          <span className="font-mono-num font-bold text-slate-700 dark:text-slate-200">
            {isActive ? `${levelPercent}%` : '0%'}
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800"
      >
        <canvas
          ref={canvasRef}
          aria-label="رسم بياني فوري لموجة الصوت أثناء التدريب"
          className="block h-[112px] w-full"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
            شدة الإشارة:
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full bg-lime-600 transition-all duration-75 dark:bg-lime-400"
              style={{ width: `${isActive ? Math.max(4, levelPercent) : 0}%` }}
            />
          </div>
        </div>

        {onToggleStandaloneMonitor && (
          <button
            type="button"
            onClick={onToggleStandaloneMonitor}
            className={`inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              isStandaloneMonitor
                ? 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {isStandaloneMonitor ? (
              <>
                <MicOff className="h-3.5 w-3.5" />
                <span>إيقاف المعاينة الصوتية</span>
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
                <span>معاينة الموجة بالميكروفون</span>
              </>
            )}
          </button>
        )}
      </div>

      {statusHintAr && (
        <p className="text-xs text-amber-800 dark:text-amber-300">{statusHintAr}</p>
      )}
    </div>
  );
};
