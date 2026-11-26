import { Gauge, Volume2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { SpeechService } from '../services/SpeechService';

const SPEED_OPTIONS = [
  { value: 0.6, labelAr: 'بطيء جداً' },
  { value: 0.75, labelAr: 'بطيء' },
  { value: 0.9, labelAr: 'متوازن' },
  { value: 1.0, labelAr: 'طبيعي' },
  { value: 1.2, labelAr: 'سريع' },
];

export const SpeechSpeedControl: React.FC<{ variant?: 'compact' | 'inline' }> = ({
  variant = 'compact',
}) => {
  const { settings, updateSettings } = useAcademy();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!SpeechService.isTTSSupported()) return null;

  const handleSelectSpeed = (rate: number) => {
    updateSettings({ speechRate: rate });
    if (variant === 'compact') {
      setOpen(false);
    }
  };

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/90 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800/70">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Gauge className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
          <span>سرعة القراءة:</span>
        </span>
        {SPEED_OPTIONS.map((opt) => {
          const active = Math.abs(settings.speechRate - opt.value) < 0.03;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelectSpeed(opt.value)}
              className={`min-h-[36px] rounded-lg px-2.5 py-1 font-mono-num text-xs font-semibold transition-colors ${
                active
                  ? 'bg-teal-700 text-white dark:bg-teal-600'
                  : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
              title={opt.labelAr}
            >
              {opt.value}x
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
        aria-expanded={open}
        aria-label="التحكم بسرعة القراءة واللهجة الإنجليزية"
      >
        <Gauge className="h-4 w-4 text-teal-700 dark:text-teal-400" />
        <span className="hidden sm:inline">سرعة القراءة</span>
        <span dir="ltr" className="font-mono-num font-bold text-teal-700 dark:text-teal-300">
          {settings.speechRate}x
        </span>
      </button>

      {open && (
        <div
          className="phosphor-card absolute left-0 z-50 mt-2 w-64 rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900"
          role="dialog"
          aria-label="إعدادات سرعة القراءة والصوت"
        >
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            سرعة القراءة بالإنجليزية
          </p>
          <div className="mt-2.5 grid grid-cols-1 gap-1.5">
            {SPEED_OPTIONS.map((opt) => {
              const active = Math.abs(settings.speechRate - opt.value) < 0.03;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectSpeed(opt.value)}
                  className={`flex min-h-[40px] items-center justify-between rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-teal-700 text-white dark:bg-teal-600'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{opt.labelAr}</span>
                  <span dir="ltr" className="font-mono-num font-bold">
                    {opt.value}x
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-900 dark:text-white">لهجة النطق الطبيعي</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => updateSettings({ preferredVoiceAccent: 'en-GB' })}
                className={`min-h-[38px] rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  settings.preferredVoiceAccent === 'en-GB'
                    ? 'bg-teal-700 text-white dark:bg-teal-600'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                بريطاني (UK)
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ preferredVoiceAccent: 'en-US' })}
                className={`min-h-[38px] rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  settings.preferredVoiceAccent === 'en-US'
                    ? 'bg-teal-700 text-white dark:bg-teal-600'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                أمريكي (US)
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                SpeechService.speak('Welcome to English Learning Academy. Let us practice together!', {
                  rate: settings.speechRate,
                  accent: settings.preferredVoiceAccent,
                })
              }
              className="mt-2.5 inline-flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-lg border border-teal-700/30 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-950/60 dark:text-teal-200"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>تجربة الصوت الآن</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
