import { CheckCircle2, Mic, MicOff, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AudioPlayButton } from '../components/AudioPlayButton';
import { AudioWaveformVisualizer } from '../components/AudioWaveformVisualizer';
import { IllustrationImage } from '../components/IllustrationImage';
import { useAcademy } from '../context/AcademyContext';
import { LessonContentService } from '../services/LessonContentService';
import { SpeechService } from '../services/SpeechService';
import { PronunciationDrill } from '../types/academy';
import { getAudioLabDrillImage } from '../utils/assetLoader';

function tokenizeEnglish(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function evaluatePronunciationMatch(target: string, spoken: string) {
  const targetTokens = tokenizeEnglish(target);
  const spokenTokens = tokenizeEnglish(spoken);
  const spokenSet = new Set(spokenTokens);

  const wordStatus = targetTokens.map((word) => ({
    word,
    matched: spokenSet.has(word),
  }));

  const matchedCount = wordStatus.filter((w) => w.matched).length;
  const accuracy =
    targetTokens.length > 0 ? Math.round((matchedCount / targetTokens.length) * 100) : 0;

  return { accuracy, wordStatus, matchedCount, totalWords: targetTokens.length };
}

export const AudioLabPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const drills = useMemo(() => LessonContentService.getAudioLabDrills(), []);
  const drillParam = searchParams.get('drill');

  const { pronunciationLogs, logPronunciationAttempt } = useAcademy();

  const [categoryFilter, setCategoryFilter] = useState<'all' | PronunciationDrill['category']>('all');
  const [selectedDrillId, setSelectedDrillId] = useState<string>(drillParam || drills[0].id);
  const [labRate, setLabRate] = useState<number>(0.85);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [lastMatchResult, setLastMatchResult] = useState<ReturnType<
    typeof evaluatePronunciationMatch
  > | null>(null);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [isStandaloneMonitor, setIsStandaloneMonitor] = useState(false);
  const [waveformHintAr, setWaveformHintAr] = useState<string | null>(null);

  // Custom phrase practice
  const [customPhrase, setCustomPhrase] = useState('Learning English step by step builds confidence.');
  const [customTranscript, setCustomTranscript] = useState('');
  const [customMatch, setCustomMatch] = useState<ReturnType<
    typeof evaluatePronunciationMatch
  > | null>(null);

  const stopRecRef = useRef<(() => void) | null>(null);
  const meterStopRef = useRef<(() => void) | null>(null);

  const recognitionSupported = SpeechService.isRecognitionSupported();

  const stopMicAudioSession = useCallback(() => {
    meterStopRef.current?.();
    meterStopRef.current = null;
    setAnalyserNode(null);
    setIsStandaloneMonitor(false);
    setMicLevel(0);
  }, []);

  useEffect(() => {
    if (drillParam && drills.some((d) => d.id === drillParam)) {
      setSelectedDrillId(drillParam);
    }
  }, [drillParam, drills]);

  useEffect(() => {
    return () => {
      stopRecRef.current?.();
      stopMicAudioSession();
      SpeechService.stopSpeaking();
    };
  }, [stopMicAudioSession]);

  const selectedDrill = useMemo(
    () => drills.find((d) => d.id === selectedDrillId) || drills[0],
    [drills, selectedDrillId]
  );

  const logsMap = useMemo(
    () => new Map(pronunciationLogs.map((l) => [l.drillId, l])),
    [pronunciationLogs]
  );

  const labStats = useMemo(() => {
    const practicedCount = pronunciationLogs.length;
    const masteredCount = pronunciationLogs.filter((l) => l.bestAccuracy >= 80).length;
    const avgAccuracy =
      practicedCount > 0
        ? Math.round(
            pronunciationLogs.reduce((sum, l) => sum + l.bestAccuracy, 0) / practicedCount
          )
        : 0;
    const totalAttempts = pronunciationLogs.reduce((sum, l) => sum + l.attempts, 0);
    return { practicedCount, masteredCount, avgAccuracy, totalAttempts };
  }, [pronunciationLogs]);

  const filteredDrills =
    categoryFilter === 'all' ? drills : drills.filter((d) => d.category === categoryFilter);

  const startMicAudioSession = useCallback(
    async (standalone: boolean) => {
      setWaveformHintAr(null);
      stopMicAudioSession();

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          if (standalone) {
            setWaveformHintAr(
              'تعذر الوصول إلى الميكروفون في هذا المتصفح؛ يمكنك المتابعة باستخدام أزرار التقييم الذاتي.'
            );
          }
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

        if (!AudioCtx) {
          stream.getTracks().forEach((t) => t.stop());
          if (standalone) {
            setWaveformHintAr('ميزة Web Audio API غير مدعومة في هذا المتصفح.');
          }
          return;
        }

        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);

        const timeData = new Uint8Array(analyser.fftSize);
        let active = true;
        let rafId = 0;

        setAnalyserNode(analyser);
        setIsStandaloneMonitor(standalone);

        const tick = () => {
          if (!active) return;
          analyser.getByteTimeDomainData(timeData);
          let sumSquares = 0;
          for (let i = 0; i < timeData.length; i++) {
            const normalized = (timeData[i] - 128) / 128;
            sumSquares += normalized * normalized;
          }
          const rms = Math.sqrt(sumSquares / timeData.length);
          setMicLevel(Math.min(100, Math.round(rms * 320)));
          rafId = requestAnimationFrame(tick);
        };
        tick();

        meterStopRef.current = () => {
          active = false;
          if (rafId) cancelAnimationFrame(rafId);
          setMicLevel(0);
          try {
            source.disconnect();
            analyser.disconnect();
          } catch {
            // ignore disconnect errors
          }
          stream.getTracks().forEach((t) => t.stop());
          ctx.close().catch(() => {});
        };
      } catch {
        setAnalyserNode(null);
        setIsStandaloneMonitor(false);
        if (standalone) {
          setWaveformHintAr(
            'لم يتم السماح بالوصول إلى الميكروفون أو لا يوجد ميكروفون متصل بهذا الجهاز.'
          );
        }
      }
    },
    [stopMicAudioSession]
  );

  const handleToggleStandaloneWaveform = async () => {
    if (isListening) {
      stopRecRef.current?.();
      stopMicAudioSession();
      setIsListening(false);
      return;
    }
    if (isStandaloneMonitor) {
      stopMicAudioSession();
      return;
    }
    await startMicAudioSession(true);
  };

  const handleSelectDrill = (drill: PronunciationDrill) => {
    stopRecRef.current?.();
    stopMicAudioSession();
    setIsListening(false);
    setSelectedDrillId(drill.id);
    setSearchParams({ drill: drill.id });
    setMicError(null);
    setWaveformHintAr(null);
    setLastTranscript('');
    setLastMatchResult(null);
  };

  const handleStartLiveCheck = (isCustom = false) => {
    setMicError(null);
    setWaveformHintAr(null);
    if (!recognitionSupported) {
      setMicError(
        'التعرف الصوتي غير متوفر في هذا المتصفح؛ يمكنك تجربة الموجة الصوتية بالميكروفون أو استخدام أزرار التقييم الذاتي أدناه.'
      );
      return;
    }

    stopRecRef.current?.();
    stopMicAudioSession();
    setIsListening(true);
    void startMicAudioSession(false);

    const target = isCustom ? customPhrase : selectedDrill.targetEn;

    stopRecRef.current = SpeechService.startRecognition({
      onResult: async (transcript) => {
        const result = evaluatePronunciationMatch(target, transcript);
        if (isCustom) {
          setCustomTranscript(transcript);
          setCustomMatch(result);
        } else {
          setLastTranscript(transcript);
          setLastMatchResult(result);
          await logPronunciationAttempt(
            selectedDrill.id,
            selectedDrill.level,
            result.accuracy,
            transcript,
            'speech_recognition'
          );
        }
      },
      onError: (msg) => {
        setMicError(msg);
      },
      onEnd: () => {
        setIsListening(false);
        stopMicAudioSession();
      },
    });
  };

  const handleSelfPracticeRecord = async (score: number) => {
    setLastTranscript('تدريب ذاتي بالاستماع والترديد');
    setLastMatchResult({
      accuracy: score,
      wordStatus: tokenizeEnglish(selectedDrill.targetEn).map((w) => ({ word: w, matched: true })),
      matchedCount: tokenizeEnglish(selectedDrill.targetEn).length,
      totalWords: tokenizeEnglish(selectedDrill.targetEn).length,
    });
    await logPronunciationAttempt(
      selectedDrill.id,
      selectedDrill.level,
      score,
      'self_practice',
      'self_practice'
    );
  };

  const currentLog = logsMap.get(selectedDrill.id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              المختبر الصوتي التفاعلي · متابعة تطور النطق
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              المختبر الصوتي لمواكبة تقدم النطق
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              تدرّب على مخارج الحروف الإنجليزية الصعبة، قارن بين الأصوات المتشابهة، اختبر دقة نطقك كلمة بكلمة، وتابع تطور مستواك الصوتي بمرور الوقت.
            </p>
          </div>
          <div dir="ltr" className="font-en text-right text-xs font-bold text-slate-500 dark:text-slate-400">
            Pronunciation & Audio Lab
          </div>
        </div>

        {/* Pronunciation KPI Strip */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="phosphor-card rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">متوسط دقة النطق</p>
            <p className="font-mono-num mt-1.5 text-2xl font-bold text-teal-700 dark:text-teal-400">
              {labStats.avgAccuracy}%
            </p>
          </div>
          <div className="phosphor-card rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">الأصوات المتقنة (80%+)</p>
            <p className="font-mono-num mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
              {labStats.masteredCount} / {drills.length}
            </p>
          </div>
          <div className="phosphor-card rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">التمارين المُجرّبة</p>
            <p className="font-mono-num mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
              {labStats.practicedCount}
            </p>
          </div>
          <div className="phosphor-card rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">إجمالي المحاولات</p>
            <p className="font-mono-num mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
              {labStats.totalAttempts}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-900">
        {(
          [
            { id: 'all', label: 'جميع التمارين الصوتية' },
            { id: 'consonant_contrast', label: 'مخارج الحروف الساكنة' },
            { id: 'vowel_length', label: 'الأصوات المتحركة' },
            { id: 'word_stress', label: 'نبر المقاطع' },
            { id: 'fluency_sentence', label: 'الطلاقة والإيقاع' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategoryFilter(tab.id)}
            className={`min-h-[40px] rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
              categoryFilter === tab.id
                ? 'bg-white text-teal-700 shadow-xs dark:bg-slate-800 dark:text-teal-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Studio Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Drill Selector List */}
        <div className="space-y-3 lg:col-span-5">
          {filteredDrills.map((drill) => {
            const log = logsMap.get(drill.id);
            const active = drill.id === selectedDrill.id;
            return (
              <button
                key={drill.id}
                type="button"
                onClick={() => handleSelectDrill(drill)}
                className={`phosphor-card-interactive flex w-full items-center justify-between gap-3 rounded-xl p-3 text-right ${
                  active
                    ? 'bg-teal-50/90 dark:bg-teal-950/50'
                    : 'bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                    <IllustrationImage
                      src={getAudioLabDrillImage(drill.id, drill.illustrationPath)}
                      alt={drill.titleAr}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span dir="ltr" className="font-en font-bold text-teal-700 dark:text-teal-400">
                        {drill.level} · {drill.focusSound}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{drill.categoryAr}</span>
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      {drill.titleAr}
                    </h2>
                  </div>
                </div>
                <div className="shrink-0 text-left">
                  {log ? (
                    <span className="inline-flex items-center gap-1 font-mono-num text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      {log.bestAccuracy}%
                    </span>
                  ) : (
                    <Volume2 className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Audio Lab Workbench */}
        <div className="space-y-6 lg:col-span-7">
          <div className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900">
            <div className="grid items-stretch gap-4 sm:grid-cols-12">
              <div className="sm:col-span-8">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span dir="ltr" className="font-en font-bold text-teal-700 dark:text-teal-400">
                    {selectedDrill.level} · {selectedDrill.focusSound}
                  </span>
                  {currentLog && (
                    <span className="font-mono-num font-semibold text-emerald-700 dark:text-emerald-400">
                      أفضل دقة: {currentLog.bestAccuracy}% · المحاولات: {currentLog.attempts}
                    </span>
                  )}
                </div>

                <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                  {selectedDrill.titleAr}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {selectedDrill.arabicTip}
                </p>
              </div>
              <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 sm:col-span-4">
                <IllustrationImage
                  src={getAudioLabDrillImage(selectedDrill.id, selectedDrill.illustrationPath)}
                  alt={selectedDrill.titleAr}
                  className="h-full max-h-40 w-full object-cover"
                />
              </div>
            </div>

            {/* Target Sentence Box */}
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
              <p dir="ltr" lang="en" className="font-en text-lg font-bold text-slate-900 dark:text-white">
                {selectedDrill.targetEn}
              </p>
              <p dir="ltr" className="font-mono-num mt-2 text-xs text-slate-500 dark:text-slate-400">
                {selectedDrill.ipa}
              </p>
              <p className="mt-1.5 text-xs font-medium text-teal-700 dark:text-teal-400">
                تقريب النطق: {selectedDrill.arabicApprox}
              </p>
              {selectedDrill.contrastWordEn && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/70 pt-3 dark:border-slate-700">
                  <span dir="ltr" className="font-en text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Contrast pairs: {selectedDrill.contrastWordEn}
                  </span>
                  <AudioPlayButton
                    text={selectedDrill.contrastWordEn.replace(/·/g, ',')}
                    size="sm"
                    rateOverride={0.75}
                    labelAr="نطق المقارنة"
                  />
                </div>
              )}
            </div>

            {/* Playback Speed & Controls */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <AudioPlayButton
                  text={selectedDrill.targetEn}
                  rateOverride={labRate}
                  labelAr={`استمع (${labRate}x)`}
                />
                <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                  {[
                    { r: 0.65, label: 'بطيء' },
                    { r: 0.85, label: 'واضح' },
                    { r: 1.0, label: 'طبيعي' },
                  ].map((opt) => (
                    <button
                      key={opt.r}
                      type="button"
                      onClick={() => setLabRate(opt.r)}
                      className={`min-h-[36px] rounded-md px-2.5 text-xs font-semibold ${
                        labRate === opt.r
                          ? 'bg-white text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-400'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isListening) {
                    stopRecRef.current?.();
                    stopMicAudioSession();
                    setIsListening(false);
                  } else {
                    handleStartLiveCheck(false);
                  }
                }}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white transition-colors ${
                  isListening
                    ? 'bg-rose-700 hover:bg-rose-800'
                    : 'bg-teal-700 hover:bg-teal-800 dark:bg-teal-600'
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                <span>{isListening ? 'إيقاف الاستماع' : 'اختبر نطقك بالميكروفون'}</span>
              </button>
            </div>

            {/* Real-Time Web Audio API Waveform Visualizer */}
            <AudioWaveformVisualizer
              analyser={analyserNode}
              isActive={isListening || isStandaloneMonitor}
              levelPercent={micLevel}
              isStandaloneMonitor={isStandaloneMonitor}
              onToggleStandaloneMonitor={handleToggleStandaloneWaveform}
              statusHintAr={waveformHintAr}
            />

            {micError && (
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                {micError}
              </p>
            )}

            {/* Word-by-word Analysis Result */}
            {lastMatchResult && (
              <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    تحليل تطابق الكلمات:
                  </span>
                  <span className="font-mono-num text-sm font-bold text-teal-700 dark:text-teal-400">
                    الدقة: {lastMatchResult.accuracy}% ({lastMatchResult.matchedCount}/{lastMatchResult.totalWords})
                  </span>
                </div>
                {lastTranscript && lastTranscript !== 'تدريب ذاتي بالاستماع والترديد' && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    ما سمعه المختبر:{' '}
                    <span dir="ltr" className="font-en font-semibold text-slate-900 dark:text-white">
                      "{lastTranscript}"
                    </span>
                  </p>
                )}
                <div dir="ltr" className="flex flex-wrap gap-1.5 pt-1">
                  {lastMatchResult.wordStatus.map((ws, i) => (
                    <span
                      key={i}
                      className={`rounded-md px-2.5 py-1 font-en text-xs font-semibold ${
                        ws.matched
                          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200'
                          : 'bg-rose-100 text-rose-900 dark:bg-rose-950/70 dark:text-rose-200'
                      }`}
                    >
                      {ws.word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Self-Assessment Practice Bar (always works even without mic) */}
            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                تقييم ذاتي سريع بعد الاستماع والترديد (لحفظ تقدمك في أي متصفح):
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSelfPracticeRecord(65)}
                  className="min-h-[40px] rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  تدرّبت عليها (تحتاج إعادة)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelfPracticeRecord(85)}
                  className="min-h-[40px] rounded-lg border border-lime-500/60 bg-lime-50 px-3.5 py-1.5 text-xs font-semibold text-lime-900 hover:bg-lime-100 dark:bg-lime-950/40 dark:text-lime-200"
                >
                  نطقتها بوضوح (85%)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelfPracticeRecord(100)}
                  className="min-h-[40px] rounded-lg bg-teal-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 dark:bg-teal-600"
                >
                  أتقنتها تماماً (100%)
                </button>
              </div>
            </div>
          </div>

          {/* Custom Sandbox Phrase Checker */}
          <div className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-700 dark:text-teal-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                مساحة اختبار نطق حرة (أدخل أي جملة إنجليزية)
              </h3>
            </div>
            <input
              type="text"
              dir="ltr"
              lang="en"
              value={customPhrase}
              onChange={(e) => {
                setCustomPhrase(e.target.value);
                setCustomMatch(null);
              }}
              placeholder="Type any English word or sentence to hear and practice..."
              className="font-en mt-3 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <AudioPlayButton text={customPhrase} rateOverride={labRate} labelAr="استمع للجملة" />
              {recognitionSupported && (
                <button
                  type="button"
                  onClick={() => handleStartLiveCheck(true)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <Mic className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                  <span>فحص نطق الجملة</span>
                </button>
              )}
              {customMatch && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomTranscript('');
                    setCustomMatch(null);
                  }}
                  className="inline-flex min-h-[40px] items-center gap-1 text-xs font-semibold text-slate-500"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>مسح</span>
                </button>
              )}
            </div>
            {customMatch && (
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
                <p className="font-semibold text-teal-700 dark:text-teal-400">
                  التطابق: <span className="font-mono-num">{customMatch.accuracy}%</span> · ما تم التقاطه:{' '}
                  <span dir="ltr" className="font-en text-slate-800 dark:text-slate-200">
                    "{customTranscript}"
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pronunciation History Table */}
      <section className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          سجل تقدم النطق في المختبر الصوتي
        </h2>
        {pronunciationLogs.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            ابدأ بأي تمرين أعلاه لتسجيل دقة نطقك ومتابعة تحسنك بمرور الوقت.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2.5 font-semibold">التمرين الصوتي</th>
                  <th className="py-2.5 font-semibold">المستوى</th>
                  <th className="py-2.5 font-semibold">أفضل دقة</th>
                  <th className="py-2.5 font-semibold">آخر دقة</th>
                  <th className="py-2.5 font-semibold">المحاولات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pronunciationLogs.map((log) => {
                  const drill = drills.find((d) => d.id === log.drillId);
                  return (
                    <tr key={log.id}>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">
                        {drill?.titleAr || log.drillId}
                      </td>
                      <td dir="ltr" className="py-3 font-en font-semibold">
                        {log.level}
                      </td>
                      <td className="py-3 font-mono-num font-bold text-emerald-700 dark:text-emerald-400">
                        {log.bestAccuracy}%
                      </td>
                      <td className="py-3 font-mono-num text-slate-600 dark:text-slate-300">
                        {log.lastAccuracy}%
                      </td>
                      <td className="py-3 font-mono-num text-slate-600 dark:text-slate-300">
                        {log.attempts}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
