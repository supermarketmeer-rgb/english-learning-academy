import { CheckCircle2, Mic, MicOff, RefreshCw, RotateCcw } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AudioPlayButton } from '../components/AudioPlayButton';
import { IllustrationImage } from '../components/IllustrationImage';
import { useAcademy } from '../context/AcademyContext';
import { AssessmentService } from '../services/AssessmentService';
import { FeedbackEffectsService } from '../services/FeedbackEffectsService';
import { LessonContentService } from '../services/LessonContentService';
import { SpeechService } from '../services/SpeechService';
import { PlacementQuestion, PlacementResult, SkillDomain } from '../types/academy';

export const PlacementTestPage: React.FC = () => {
  const { activeProfile, placementResult, savePlacement } = useAcademy();
  const questions = LessonContentService.getPlacementQuestions();

  const [retaking, setRetaking] = useState(!placementResult);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reorderTokens, setReorderTokens] = useState<Record<string, string[]>>({});
  const [includeSpeaking, setIncludeSpeaking] = useState(true);
  const [listeningSpeech, setListeningSpeech] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const activeQuestions: PlacementQuestion[] = includeSpeaking
    ? questions
    : questions.filter((q) => q.type !== 'speaking_optional');

  const currentQuestion = activeQuestions[currentIdx];

  const handleSelectOption = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleToggleReorderToken = (qId: string, word: string, idx: number) => {
    const key = `${word}__${idx}`;
    const existing = reorderTokens[qId] || [];
    const next = existing.includes(key)
      ? existing.filter((t) => t !== key)
      : [...existing, key];
    setReorderTokens((prev) => ({ ...prev, [qId]: next }));
    setAnswers((prev) => ({
      ...prev,
      [qId]: next.map((t) => t.split('__')[0]).join(' '),
    }));
  };

  const handleSpeakTest = (qId: string) => {
    setSpeechError(null);
    if (!SpeechService.isRecognitionSupported()) {
      setSpeechError('التعرف الصوتي غير مدعوم في هذا المتصفح؛ يمكنك تخطي التحدث أو تأكيد التدريب الذاتي.');
      return;
    }
    setListeningSpeech(true);
    SpeechService.startRecognition({
      onResult: (transcript) => {
        setAnswers((prev) => ({ ...prev, [qId]: transcript }));
      },
      onError: (msg) => setSpeechError(msg),
      onEnd: () => setListeningSpeech(false),
    });
  };

  const handleFinish = async () => {
    if (!activeProfile) return;
    setSubmitting(true);
    try {
      const evaluated: PlacementResult = AssessmentService.evaluatePlacementTest(
        activeProfile.id,
        questions,
        answers,
        includeSpeaking
      );
      await savePlacement(evaluated);
      FeedbackEffectsService.triggerForScore(evaluated.overallScore, 50);
      setRetaking(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartRetake = () => {
    setAnswers({});
    setReorderTokens({});
    setCurrentIdx(0);
    setIncludeSpeaking(true);
    setSpeechError(null);
    setRetaking(true);
  };

  if (!retaking && placementResult) {
    const domains: SkillDomain[] = [
      'vocabulary',
      'grammar',
      'reading',
      'listening',
      'sentence_construction',
      'writing',
      'speaking',
    ];

    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="hidden h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 sm:block">
                <IllustrationImage
                  src="/src/assets/images/topic_exams_achievement_1795681977692.jpg"
                  alt="تقرير اختبار تحديد المستوى"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                  تقرير اختبار تحديد المستوى
                </p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                  مستواك الموصى به:{' '}
                  <span dir="ltr" className="font-en text-teal-700 dark:text-teal-400">
                    {placementResult.assignedLevel}
                  </span>
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  النتيجة الكلية: <span className="font-mono-num font-bold">{placementResult.overallScore}%</span> ·
                  بناءً على الأداء الفعلي في المهارات السبع وليس العمر أو الصف الدراسي
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleStartRetake}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span>إعادة الاختبار</span>
            </button>
          </div>

          <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
            {placementResult.summaryAr}
          </p>

          {/* Skill Breakdown */}
          <div className="mt-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              تحليل الأداء حسب المهارة
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {domains.map((domain) => {
                const score = placementResult.skillScores[domain] ?? 0;
                const isStrength = score >= 65;
                return (
                  <div
                    key={domain}
                    className="phosphor-card rounded-xl bg-white p-4 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{AssessmentService.getSkillLabelAr(domain)}</span>
                      <span className="font-mono-num text-slate-700 dark:text-slate-200">
                        {score}% · {isStrength ? 'نقطة قوة' : 'يحتاج تقوية'}
                      </span>
                    </div>
                    <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isStrength ? 'bg-teal-600 dark:bg-teal-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(4, score)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/learning-path"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              الانتقال إلى مساري التعليمي المخصص
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              عرض لوحة الطالب
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="hidden h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 sm:block">
              <IllustrationImage
                src="/src/assets/images/topic_exams_achievement_1795681977692.jpg"
                alt="اختبار تحديد المستوى الشامل"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                اختبار تحديد المستوى الشامل
              </h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                يقيّم المفردات والقواعد والقراءة والاستماع وبناء الجملة والكتابة لتحديد نقطة البداية الدقيقة.
              </p>
            </div>
          </div>
          <span className="font-mono-num text-sm font-bold text-teal-700 dark:text-teal-400">
            {currentIdx + 1} / {activeQuestions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-teal-700 transition-all dark:bg-teal-500"
            style={{ width: `${((currentIdx + 1) / activeQuestions.length) * 100}%` }}
          />
        </div>

        {currentQuestion && (
          <div className="mt-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                المهارة: <strong className="text-slate-800 dark:text-slate-200">{AssessmentService.getSkillLabelAr(currentQuestion.skill)}</strong>
              </span>
              <span dir="ltr" className="font-en">
                Target Level · {currentQuestion.level}
              </span>
            </div>

            <p className="text-lg font-bold leading-relaxed text-slate-900 dark:text-white">
              {currentQuestion.promptAr}
            </p>

            {currentQuestion.passageEn && (
              <div
                dir="ltr"
                lang="en"
                className="font-en rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
              >
                {currentQuestion.passageEn}
              </div>
            )}

            {currentQuestion.audioScriptEn && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                <AudioPlayButton text={currentQuestion.audioScriptEn} labelAr="تشغيل المقطع الصوتي" />
                {currentQuestion.type === 'speaking_optional' && (
                  <span dir="ltr" className="font-en text-sm font-semibold text-slate-800 dark:text-slate-100">
                    "{currentQuestion.audioScriptEn}"
                  </span>
                )}
              </div>
            )}

            {/* Options / Reorder / Optional Speaking */}
            {(currentQuestion.type === 'mcq' ||
              currentQuestion.type === 'listening_mcq' ||
              currentQuestion.type === 'writing_check') && (
              <div className="grid gap-3" dir="ltr">
                {currentQuestion.options?.map((opt) => {
                  const selected = answers[currentQuestion.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion.id, opt)}
                      className={`min-h-[48px] rounded-xl border px-4 py-3 text-left font-en text-sm font-medium transition-colors ${
                        selected
                          ? 'border-teal-700 bg-teal-50 text-teal-900 dark:border-teal-400 dark:bg-teal-950/60 dark:text-teal-100'
                          : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'reorder' && currentQuestion.wordsToOrder && (
              <div className="space-y-3" dir="ltr">
                <div className="min-h-[52px] rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3.5 font-en text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100">
                  {answers[currentQuestion.id] || 'Tap the words in order...'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.wordsToOrder.map((word, wIdx) => {
                    const tokenKey = `${word}__${wIdx}`;
                    const used = (reorderTokens[currentQuestion.id] || []).includes(tokenKey);
                    return (
                      <button
                        key={tokenKey}
                        type="button"
                        onClick={() => handleToggleReorderToken(currentQuestion.id, word, wIdx)}
                        className={`min-h-[44px] rounded-lg border px-4 py-2 font-en text-sm font-semibold ${
                          used
                            ? 'border-teal-700 bg-teal-700 text-white'
                            : 'border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setReorderTokens((prev) => ({ ...prev, [currentQuestion.id]: [] }));
                      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: '' }));
                    }}
                    className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>إعادة</span>
                  </button>
                </div>
              </div>
            )}

            {currentQuestion.type === 'speaking_optional' && (
              <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSpeakTest(currentQuestion.id)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    {listeningSpeech ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    <span>{listeningSpeech ? 'جارٍ الاستماع...' : 'تسجيل النطق عبر الميكروفون'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.id, 'SELF_CONFIRMED')}
                    className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${
                      answers[currentQuestion.id] === 'SELF_CONFIRMED'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
                        : 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>نطقتها بوضوح (تقييم ذاتي)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIncludeSpeaking(false);
                      handleFinish();
                    }}
                    className="min-h-[44px] px-3 text-xs font-semibold text-slate-500 underline"
                  >
                    تخطي سؤال التحدث الاختياري
                  </button>
                </div>
                {answers[currentQuestion.id] && answers[currentQuestion.id] !== 'SELF_CONFIRMED' && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    ما تم التقاطه:{' '}
                    <span dir="ltr" className="font-en font-semibold">
                      {answers[currentQuestion.id]}
                    </span>
                  </p>
                )}
                {speechError && (
                  <p className="text-xs text-amber-700 dark:text-amber-300">{speechError}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-100 pt-5 dark:border-slate-800">
          <button
            type="button"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            className="min-h-[44px] rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
          >
            السابق
          </button>

          {currentIdx < activeQuestions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIdx((i) => Math.min(activeQuestions.length - 1, i + 1))}
              className="min-h-[44px] rounded-xl bg-teal-700 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-800 dark:bg-teal-600"
            >
              التالي
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinish}
              className="min-h-[44px] rounded-xl bg-emerald-700 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {submitting ? 'جارٍ التحليل...' : 'اعتماد النتيجة وعرض مستواي'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
