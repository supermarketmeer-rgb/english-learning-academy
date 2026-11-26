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

export const SpeechService = {
  isTTSSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as Record<string, unknown>;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
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
      utterance.lang = preferredAccent;
      utterance.rate = options?.rate ?? 0.9;
      utterance.pitch = 1;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const exactMatch = voices.find((v) =>
          v.lang.toLowerCase().startsWith(preferredAccent.toLowerCase())
        );
        const anyEnglish = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
        if (exactMatch) {
          utterance.voice = exactMatch;
        } else if (anyEnglish) {
          utterance.voice = anyEnglish;
        }
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
