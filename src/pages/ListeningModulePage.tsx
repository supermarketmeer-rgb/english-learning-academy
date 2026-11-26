import { ArrowRight, CheckCircle2, Headphones, Play, RotateCcw, Square } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IllustrationImage } from '../components/IllustrationImage';
import { QuestionBlock } from '../components/QuestionBlock';
import { useAcademy } from '../context/AcademyContext';
import { AnalyticsService } from '../services/AnalyticsService';
import { AssessmentService } from '../services/AssessmentService';
import { FeedbackEffectsService } from '../services/FeedbackEffectsService';
import { LessonContentService } from '../services/LessonContentService';
import { SpeechService } from '../services/SpeechService';
import { ListeningLesson } from '../types/academy';

export const ListeningModulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonParam = searchParams.get('lesson');
  const lessons = LessonContentService.getListeningLessons();
  const { activeProfile, lessonProgress, settings, completeLesson } = useAcademy();

  const [playbackRate, setPlaybackRate] = useState(settings.speechRate);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLineIdx, setActiveLineIdx] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [missingAnswers, setMissingAnswers] = useState<Record<string, string>>({});
  const [compAnswers, setCompAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  const selectedLesson = lessonParam
    ? LessonContentService.getListeningLessonById(lessonParam)
    : undefined;

  const completedMap = useMemo(
    () => new Map(lessonProgress.map((p) => [p.lessonId, p])),
    [lessonProgress]
  );

  useEffect(() => {
    return () => {
      stopRef.current?.();
      SpeechService.stopSpeaking();
    };
  }, [lessonParam]);

  const openLesson = (lesson: ListeningLesson) => {
    stopRef.current?.();
    setSearchParams({ lesson: lesson.id });
    setIsPlaying(false);
    setActiveLineIdx(null);
    setShowTranscript(false);
    setMissingAnswers({});
    setCompAnswers({});
    setSubmitted(false);
    AnalyticsService.logLessonStarted('listening', lesson.id, lesson.level);
  };

  const handlePlayAll = (lesson: ListeningLesson) => {
    stopRef.current?.();
    setIsPlaying(true);
    const lines = lesson.scriptLines.map((l) => l.textEn);
    stopRef.current = SpeechService.speakSequence(lines, {
      rate: playbackRate,
      accent: settings.preferredVoiceAccent,
      onLineIndex: (idx) => setActiveLineIdx(idx),
      onComplete: () => {
        setIsPlaying(false);
        setActiveLineIdx(null);
      },
    });
  };

  const handleStop = () => {
    stopRef.current?.();
    setIsPlaying(false);
    setActiveLineIdx(null);
  };

  const handleSubmit = async (lesson: ListeningLesson) => {
    let correct = 0;
    for (const mw of lesson.missingWordExercises) {
      if (missingAnswers[mw.id] === mw.missingWord) correct += 1;
    }
    for (const q of lesson.comprehensionQuestions) {
      if (
        AssessmentService.normalizeAnswer(compAnswers[q.id] || '') ===
        AssessmentService.normalizeAnswer(q.correctAnswer)
      ) {
        correct += 1;
      }
    }
    const total = lesson.missingWordExercises.length + lesson.comprehensionQuestions.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 100;
    setSubmitted(true);
    FeedbackEffectsService.triggerForScore(score);

    if (activeProfile) {
      await AssessmentService.recordAssessmentAttempt({
        profileId: activeProfile.id,
        assessmentId: lesson.id,
        moduleId: 'listening',
        level: lesson.level,
        score,
        totalQuestions: total,
        correctAnswers: correct,
      });
    }
    await completeLesson(lesson.id, 'listening', lesson.level, score);
  };

  if (selectedLesson) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <button
          type="button"
          onClick={() => {
            handleStop();
            setSearchParams({});
          }}
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة إلى دروس الاستماع</span>
        </button>

        {/* Audio Player Card */}
        <section className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900 sm:p-8">
          <div className="grid items-stretch gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                <span dir="ltr" className="font-en">{selectedLesson.level}</span> · {selectedLesson.categoryAr}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {selectedLesson.titleAr}
              </h1>
              <p dir="ltr" className="font-en text-sm font-semibold text-slate-500 dark:text-slate-400">
                {selectedLesson.titleEn}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {selectedLesson.instructionsAr}
              </p>
            </div>
            {selectedLesson.illustrationPath && (
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 lg:col-span-4">
                <IllustrationImage
                  src={selectedLesson.illustrationPath}
                  alt={selectedLesson.titleAr}
                  className="h-full max-h-48 w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex flex-wrap items-center gap-2">
              {!isPlaying ? (
                <button
                  type="button"
                  onClick={() => handlePlayAll(selectedLesson)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 dark:bg-teal-600"
                >
                  <Play className="h-4 w-4" />
                  <span>تشغيل المقطع</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStop}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-rose-700 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-800"
                >
                  <Square className="h-4 w-4" />
                  <span>إيقاف</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handlePlayAll(selectedLesson)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <RotateCcw className="h-4 w-4" />
                <span>إعادة الاستماع</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">السرعة:</span>
              {[0.75, 0.9, 1.0, 1.15].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setPlaybackRate(r)}
                  className={`min-h-[38px] rounded-lg border px-2.5 py-1 font-mono-num text-xs font-semibold ${
                    playbackRate === r
                      ? 'border-teal-700 bg-teal-700 text-white'
                      : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {r}x
                </button>
              ))}
            </div>
          </div>

          {!SpeechService.isTTSSupported() && (
            <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
              متصفحك لا يدعم التركيب الصوتي؛ يمكنك فتح النص المكتوب أدناه لإكمال التدريب.
            </p>
          )}

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowTranscript((v) => !v)}
              className="min-h-[40px] text-xs font-semibold text-teal-700 underline dark:text-teal-400"
            >
              {showTranscript ? 'إخفاء النص المكتوب' : 'عرض النص المكتوب والترجمة (بعد الاستماع)'}
            </button>

            {showTranscript && (
              <div className="mt-3 space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                {selectedLesson.scriptLines.map((line, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-2.5 ${
                      activeLineIdx === i ? 'bg-teal-50 dark:bg-teal-950/50' : ''
                    }`}
                  >
                    <p dir="ltr" className="font-en text-sm font-semibold text-slate-900 dark:text-white">
                      <span className="text-teal-700 dark:text-teal-400">{line.speaker}: </span>
                      {line.textEn}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{line.textAr}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Missing Word Exercises */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            تدريب الكلمة المفقودة (استمع وأكمل)
          </h2>
          {selectedLesson.missingWordExercises.map((mw, idx) => {
            const chosen = missingAnswers[mw.id];
            const isCorrect = submitted && chosen === mw.missingWord;
            return (
              <div
                key={mw.id}
                className="phosphor-card rounded-xl bg-white p-5 dark:bg-slate-900"
              >
                <p className="text-xs font-semibold text-slate-500">
                  {idx + 1}. تلميح: {mw.hintAr}
                </p>
                <p dir="ltr" className="font-en mt-2 text-base font-semibold text-slate-900 dark:text-white">
                  {mw.sentenceBefore}{' '}
                  <span className="inline-block min-w-[80px] border-b-2 border-teal-600 px-2 text-center text-teal-700 dark:text-teal-400">
                    {chosen || '____'}
                  </span>{' '}
                  {mw.sentenceAfter}
                </p>
                <div className="mt-4 flex flex-wrap gap-2" dir="ltr">
                  {mw.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={submitted}
                      onClick={() => setMissingAnswers((prev) => ({ ...prev, [mw.id]: opt }))}
                      className={`min-h-[44px] rounded-lg border px-4 py-2 font-en text-sm font-semibold ${
                        submitted && opt === mw.missingWord
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
                          : submitted && chosen === opt && opt !== mw.missingWord
                            ? 'border-rose-600 bg-rose-50 text-rose-900'
                            : chosen === opt
                              ? 'border-teal-700 bg-teal-700 text-white'
                              : 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {submitted && (
                  <p className="mt-3 text-xs font-semibold">
                    {isCorrect ? '✓ إجابة صحيحة' : `الإجابة الصحيحة: ${mw.missingWord}`}
                  </p>
                )}
              </div>
            );
          })}
        </section>

        {/* Comprehension Questions */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">أسئلة الفهم السمعي</h2>
          {selectedLesson.comprehensionQuestions.map((q, idx) => (
            <QuestionBlock
              key={q.id}
              question={q}
              index={idx}
              selectedAnswer={compAnswers[q.id] || ''}
              onSelectAnswer={(ans) => setCompAnswers((prev) => ({ ...prev, [q.id]: ans }))}
              showFeedback={submitted}
            />
          ))}
          <button
            type="button"
            onClick={() => handleSubmit(selectedLesson)}
            className="min-h-[48px] rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 dark:bg-teal-600"
          >
            تصحيح وحفظ نتيجة الاستماع
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          أكاديمية الاستماع (Listening Academy)
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          دروس استماع مجانية عبر نطق المتصفح مع إمكانية ضبط السرعة وتدريبات الكلمة المفقودة والفهم.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => {
          const prog = completedMap.get(lesson.id);
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => openLesson(lesson)}
              className="phosphor-card-interactive group flex flex-col justify-between rounded-xl bg-white p-4 text-right dark:bg-slate-900"
            >
              <div>
                <div className="mb-3 aspect-[16/10] w-full overflow-hidden rounded-lg border border-slate-200/70 dark:border-slate-800">
                  <IllustrationImage
                    src={lesson.illustrationPath}
                    alt={lesson.titleAr}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span dir="ltr" className="font-en font-bold text-teal-700 dark:text-teal-400">
                    {lesson.level} · {lesson.categoryAr}
                  </span>
                  {prog?.completed ? (
                    <span className="inline-flex items-center gap-1 font-mono-num text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      {prog.score}%
                    </span>
                  ) : (
                    <Headphones className="h-4 w-4 text-slate-400" />
                  )}
                </div>
                <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                  {lesson.titleAr}
                </h2>
                <p dir="ltr" className="font-en text-xs text-slate-500 dark:text-slate-400">
                  {lesson.titleEn}
                </p>
              </div>
              <p className="mt-4 text-xs font-semibold text-teal-700 dark:text-teal-400">
                بدء الاستماع ←
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
