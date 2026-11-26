import { Volume2, VolumeX } from 'lucide-react';
import React, { useState } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { SpeechService } from '../services/SpeechService';

interface AudioPlayButtonProps {
  text: string;
  labelAr?: string;
  rateOverride?: number;
  size?: 'sm' | 'md';
}

export const AudioPlayButton: React.FC<AudioPlayButtonProps> = ({
  text,
  labelAr = 'استمع',
  rateOverride,
  size = 'md',
}) => {
  const { settings } = useAcademy();
  const [speaking, setSpeaking] = useState(false);
  const supported = SpeechService.isTTSSupported();

  const handlePlay = () => {
    if (!supported) return;
    if (speaking) {
      SpeechService.stopSpeaking();
      setSpeaking(false);
      return;
    }
    SpeechService.speak(text, {
      rate: rateOverride ?? settings.speechRate,
      accent: settings.preferredVoiceAccent,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  };

  if (!supported) {
    return (
      <span className="inline-flex min-h-[40px] items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <VolumeX className="h-4 w-4" />
        <span>النطق الصوتي غير مدعوم في هذا المتصفح</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePlay}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
        size === 'sm' ? 'min-h-[40px] px-3 py-1.5 text-xs' : 'min-h-[44px] px-4 py-2 text-sm'
      } font-semibold ${
        speaking
          ? 'border-teal-700 bg-teal-700 text-white dark:border-teal-500 dark:bg-teal-600'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
      }`}
      aria-label={`${labelAr}: ${text}`}
    >
      <Volume2 className="h-4 w-4 shrink-0" />
      <span>{speaking ? 'جارٍ التشغيل...' : labelAr}</span>
    </button>
  );
};
