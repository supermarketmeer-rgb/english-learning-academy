export interface SpeechRecognitionResultCallback {
  onResult: (transcript: string, confidence: number) => void;
  onError: (reasonAr: string) => void;
  onEnd: () => void;
}

interface BrowserSpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

const ROBOTIC_VOICE_KEYWORDS = [
  'espeak',
  'compact',
  'albert',
  'bad news',
  'bahh',
  'bells',
  'boing',
  'bubbles',
  'cellos',
  'good news',
  'jester',
  'organ',
  'trinoids',
  'whisper',
  'zarvox',
  'wobble',
  'superstar',
  'ralph',
  'fred',
];

const HIGH_QUALITY_APPLE_NAMES = [
  'samantha',
  'daniel',
  'serena',
  'martha',
  'arthur',
  'karen',
  'moira',
  'tessa',
  'ava',
  'allison',
  'kate',
  'oliver',
  'zoe',
];

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesListenerAttached = false;

function refreshVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const list = window.speechSynthesis.getVoices();
  if (list.length > 0) {
    cachedVoices = list;
  }
  return cachedVoices;
}

function ensureVoicesLoaded() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  refreshVoices();
  if (!voicesListenerAttached) {
    voicesListenerAttached = true;
    window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
  }
}

function scoreHumanVoice(voice: SpeechSynthesisVoice, preferredAccent: 'en-GB' | 'en-US'): number {
  const lang = voice.lang.toLowerCase();
  if (!lang.startsWith('en')) return -1000;

  const name = voice.name.toLowerCase();
  let score = 0;

  // Accent match
  if (lang === preferredAccent.toLowerCase() || lang.startsWith(preferredAccent.toLowerCase())) {
    score += 35;
  } else if (lang.startsWith('en-gb') || lang.startsWith('en-us')) {
    score += 20;
  } else {
    score += 10;
  }

  // Highest quality: Neural / Natural online voices (Edge, Chrome, modern OS)
  if (name.includes('natural') || name.includes('neural')) {
    score += 110;
  }
  if (name.includes('online')) {
    score += 25;
  }

  // Apple Enhanced / Premium / Siri voices on iPad, iPhone, macOS
  if (name.includes('premium')) {
    score += 95;
  } else if (name.includes('enhanced')) {
    score += 85;
  } else if (name.includes('siri')) {
    score += 80;
  }

  // Google natural voices in Chrome / Android
  if (name.includes('google uk english') || name.includes('google us english')) {
    score += 75;
  } else if (name.includes('google')) {
    score += 55;
  }

  // Known pleasant human-sounding Apple / Microsoft voices
  if (HIGH_QUALITY_APPLE_NAMES.some((n) => name.includes(n))) {
    score += 40;
  }
  if (
    name.includes('aria') ||
    name.includes('jenny') ||
    name.includes('sonia') ||
    name.includes('ryan') ||
    name.includes('libby') ||
    name.includes('guy')
  ) {
    score += 45;
  }

  // Penalize robotic or novelty voices
  if (ROBOTIC_VOICE_KEYWORDS.some((bad) => name.includes(bad))) {
    score -= 80;
  }
  if (name.includes('microsoft david') || name.includes('microsoft zira') || name.includes('microsoft mark')) {
    score -= 15;
  }

  return score;
}

function selectBestHumanVoice(preferredAccent: 'en-GB' | 'en-US'): SpeechSynthesisVoice | null {
  ensureVoicesLoaded();
  const voices = refreshVoices();
  if (voices.length === 0) return null;

  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -999;

  for (const voice of voices) {
    const score = scoreHumanVoice(voice, preferredAccent);
    if (score > bestScore) {
      bestScore = score;
      best = voice;
    }
  }

  return best;
}

// Pre-warm voice list on load
ensureVoicesLoaded();

export const SpeechService = {
  isTTSSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as Record<string, unknown>;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  },

  getActiveVoiceName(accent: 'en-GB' | 'en-US' = 'en-GB'): string | null {
    return selectBestHumanVoice(accent)?.name ?? null;
  },

  stopSpeaking(): void {
    if (!this.isTTSSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore synthesis cancel errors
    }
  },

  speak(
    text: string,
    options?: {
      rate?: number;
      accent?: 'en-GB' | 'en-US';
      onStart?: () => void;
      onEnd?: () => void;
    }
  ): boolean {
    if (!this.isTTSSupported() || !text.trim()) {
      options?.onEnd?.();
      return false;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const preferredAccent = options?.accent || 'en-GB';
      const clampedRate = Math.min(1.5, Math.max(0.5, options?.rate ?? 0.9));

      utterance.lang = preferredAccent;
      utterance.rate = clampedRate;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const bestVoice = selectBestHumanVoice(preferredAccent);
      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang || preferredAccent;
      }

      utterance.onstart = () => options?.onStart?.();
      utterance.onend = () => options?.onEnd?.();
      utterance.onerror = () => options?.onEnd?.();

      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      options?.onEnd?.();
      return false;
    }
  },

  speakSequence(
    lines: string[],
    options?: {
      rate?: number;
      accent?: 'en-GB' | 'en-US';
      onLineIndex?: (idx: number) => void;
      onComplete?: () => void;
    }
  ): () => void {
    if (!this.isTTSSupported() || lines.length === 0) {
      options?.onComplete?.();
      return () => {};
    }

    let cancelled = false;
    let current = 0;

    const playNext = () => {
      if (cancelled || current >= lines.length) {
        options?.onComplete?.();
        return;
      }
      options?.onLineIndex?.(current);
      const line = lines[current];
      current += 1;
      this.speak(line, {
        rate: options?.rate,
        accent: options?.accent,
        onEnd: () => {
          if (!cancelled) {
            setTimeout(playNext, 350);
          }
        },
      });
    };

    playNext();

    return () => {
      cancelled = true;
      this.stopSpeaking();
    };
  },

  startRecognition(callbacks: SpeechRecognitionResultCallback): (() => void) | null {
    if (!this.isRecognitionSupported()) {
      callbacks.onError('ميزة التعرف الصوتي غير مدعومة في هذا المتصفح، يمكنك استخدام وضع التدريب الذاتي البديل.');
      return null;
    }

    try {
      const win = window as unknown as {
        SpeechRecognition?: new () => BrowserSpeechRecognition;
        webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
      };
      const RecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (!RecognitionCtor) return null;

      const recognition = new RecognitionCtor();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        const result = event.results[0]?.[0];
        if (result) {
          callbacks.onResult(result.transcript, result.confidence || 0.8);
        }
      };

      recognition.onerror = (event) => {
        const msg =
          event.error === 'not-allowed'
            ? 'يرجى السماح بالوصول إلى الميكروفون من إعدادات المتصفح أو استخدام وضع التدريب الذاتي.'
            : 'تعذر التقاط الصوت بوضوح، حاول مرة أخرى أو استخدم التدريب الذاتي.';
        callbacks.onError(msg);
      };

      recognition.onend = () => {
        callbacks.onEnd();
      };

      recognition.start();
      return () => {
        try {
          recognition.stop();
        } catch {
          // Ignore stop errors
        }
      };
    } catch {
      callbacks.onError('تعذر تشغيل التعرف الصوتي على هذا الجهاز.');
      return null;
    }
  },
};
