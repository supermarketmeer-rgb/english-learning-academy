import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AudioPlayButton } from '../components/AudioPlayButton';
import { IllustrationImage } from '../components/IllustrationImage';
import { QuestionBlock } from '../components/QuestionBlock';
import { useAcademy } from '../context/AcademyContext';
import { AnalyticsService } from '../services/AnalyticsService';
import { AssessmentService } from '../services/AssessmentService';
import { FeedbackEffectsService } from '../services/FeedbackEffectsService';
import { LessonContentService } from '../services/LessonContentService';
import { GrammarLesson } from '../types/academy';
import { getGrammarLessonImage } from '../utils/assetLoader';

export const GrammarModulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonParam = searchParams.get('lesson');
  const allLessons = LessonContentService.getGrammarLessons();
  const { activeProfile, lessonProgress, completeLesson } = useAcademy();

  const [tierFilter, setTierFilter] = useState<'all' | GrammarLesson['tier']>('all');
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [showExerciseFeedback, setShowExerciseFeedback] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const selectedLesson = lessonParam
    ? LessonContentService.getGrammarLessonById(lessonParam)
    : undefined;

  const completedMap = useMemo(
    () => new Map(lessonProgress.map((p) => [p.lessonId, p])),
    [lessonProgress]
  );

  const filtered =
    tierFilter === 'all' ? allLessons : allLessons.filter((l) => l.tier === tierFilter);

  const openLesson = (lesson: GrammarLesson) => {
    setSearchParams({ lesson: lesson.id });
    setExerciseAnswers({});
    setShowExerciseFeedback(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    AnalyticsService.logLessonStarted('grammar', lesson.id, lesson.level);
  };

  const handleSubmitFinalQuiz = async (lesson: GrammarLesson) => {
    let correct = 0;
    for (const q of lesson.finalQuiz) {
      if (
        AssessmentService.normalizeAnswer(quizAnswers[q.id] || '') ===
        AssessmentService.normalizeAnswer(q.correctAnswer)
      ) {
        correct += 1;
      }
    }
    const score =
      lesson.finalQuiz.length > 0 ? Math.round((correct / lesson.finalQuiz.length) * 100) : 100;
    setQuizSubmitted(true);
    FeedbackEffectsService.triggerForScore(score);

    if (activeProfile) {
      await AssessmentService.recordAssessmentAttempt({
        profileId: activeProfile.id,
        assessmentId: lesson.id,
        moduleId: 'grammar',
        level: lesson.level,
        score,
        totalQuestions: lesson.finalQuiz.length,
        correctAnswers: correct,
      });
    }
    await completeLesson(lesson.id, 'grammar', lesson.level, score);
  };

  if (selectedLesson) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <button
          type="button"
          onClick={() => setSearchParams({})}
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة إلى قائمة دروس القواعد</span>
        </button>

        {/* Lesson Header */}
        <section className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900 sm:p-8">
          <div className="grid items-stretch gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span dir="ltr" className="font-en font-bold text-teal-700 dark:text-teal-400">
                  {selectedLesson.level} · Lesson {selectedLesson.order}
                </span>
                <span>أكاديمية القواعد</span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                {selectedLesson.titleAr}
              </h1>
              <p dir="ltr" className="font-en mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {selectedLesson.titleEn}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {selectedLesson.summaryAr}
              </p>
            </div>
            <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 lg:col-span-4">
              <IllustrationImage
                src={getGrammarLessonImage(
                  selectedLesson.tier,
                  selectedLesson.order,
                  selectedLesson.illustrationPath
                )}
                alt={selectedLesson.titleAr}
                className="h-full max-h-52 w-full object-cover"
              />
            </div>
          </div>

          {selectedLesson.formula && (
            <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50/70 p-4 dark:border-teal-800/60 dark:bg-teal-950/30">
              <p className="text-xs font-semibold text-teal-800 dark:text-teal-300">القاعدة المختصرة:</p>
              <p dir="ltr" className="font-mono-num mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {selectedLesson.formula}
              </p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">الشرح المبسط</h2>
            <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {selectedLesson.explanationAr.map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono-num font-bold text-teal-700 dark:text-teal-400">
                    {i + 1}.
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            {selectedLesson.englishRuleTip && (
              <p
                dir="ltr"
                lang="en"
                className="font-en mt-3 rounded-lg bg-slate-100 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Tip: {selectedLesson.englishRuleTip}
              </p>
            )}
          </div>
        </section>

        {/* English Examples */}
        <section className="phosphor-card space-y-4 rounded-2xl bg-white p-6 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">أمثلة تطبيقية مع النطق</h2>
          <div className="space-y-3">
            {selectedLesson.examples.map((ex, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="space-y-1">
                  <p dir="ltr" lang="en" className="font-en text-base font-semibold text-slate-900 dark:text-white">
                    {ex.en}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{ex.ar}</p>
                </div>
                <AudioPlayButton text={ex.en} size="sm" labelAr="استمع" />
              </div>
            ))}
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="phosphor-card space-y-4 rounded-2xl bg-white p-6 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h2>أخطاء شائعة يجب تجنبها</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {selectedLesson.commonMistakes.map((m, i) => (
              <div key={i} className="phosphor-card rounded-xl bg-white p-4 dark:bg-slate-900">
                <p dir="ltr" className="font-en text-xs font-semibold text-rose-700 line-through dark:text-rose-400">
                  ✗ {m.wrong}
                </p>
                <p dir="ltr" className="font-en mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  ✓ {m.correct}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {m.explanationAr}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Exercises */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">تدريب تفاعلي فوري</h2>
          </div>
          {selectedLesson.exercises.map((q, idx) => (
            <QuestionBlock
              key={q.id}
              question={q}
              index={idx}
              selectedAnswer={exerciseAnswers[q.id] || ''}
              onSelectAnswer={(ans) =>
                setExerciseAnswers((prev) => ({ ...prev, [q.id]: ans }))
              }
              showFeedback={showExerciseFeedback}
            />
          ))}
          <button
            type="button"
            onClick={() => {
              setShowExerciseFeedback(true);
              const correct = selectedLesson.exercises.filter(
                (q) =>
                  AssessmentService.normalizeAnswer(exerciseAnswers[q.id] || '') ===
                  AssessmentService.normalizeAnswer(q.correctAnswer)
              ).length;
              const score =
                selectedLesson.exercises.length > 0
                  ? Math.round((correct / selectedLesson.exercises.length) * 100)
                  : 100;
              FeedbackEffectsService.triggerForScore(score);
            }}
            className="min-h-[44px] rounded-xl border border-teal-700 px-5 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-50 dark:border-teal-500 dark:text-teal-300 dark:hover:bg-teal-950/40"
          >
            تحقق من إجابات التدريب
          </button>
        </section>

        {/* Final Assessment */}
        <section className="phosphor-card space-y-4 rounded-2xl bg-teal-50/30 p-6 dark:bg-teal-950/20">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            التقييم الختامي القصير للدرس
          </h2>
          {selectedLesson.finalQuiz.map((q, idx) => (
            <QuestionBlock
              key={q.id}
              question={q}
              index={idx}
              selectedAnswer={quizAnswers[q.id] || ''}
              onSelectAnswer={(ans) => setQuizAnswers((prev) => ({ ...prev, [q.id]: ans }))}
              showFeedback={quizSubmitted}
            />
          ))}
          <button
            type="button"
            onClick={() => handleSubmitFinalQuiz(selectedLesson)}
            className="min-h-[48px] rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 dark:bg-teal-600"
          >
            اعتماد التقييم وحفظ إنجاز الدرس
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          أكاديمية القواعد (Grammar Academy)
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          منهج متدرج من {allLessons.length} درساً يغطي التأسيس، المرحلة الابتدائية، المتوسطة، والإعدادية، مع أمثلة ناطقة وتصحيح الأخطاء الشائعة.
        </p>
      </div>

      {/* Tier Filter */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-900">
        {(
          [
            { id: 'all', label: `الكل (${allLessons.length})` },
            { id: 'beginner', label: 'المبتدئ Beginner' },
            { id: 'elementary', label: 'الأساسي Elementary' },
            { id: 'intermediate', label: 'المتوسط Intermediate' },
            { id: 'expansion', label: 'الإعدادية B2' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTierFilter(tab.id)}
            className={`min-h-[40px] rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
              tierFilter === tab.id
                ? 'bg-white text-teal-700 shadow-xs dark:bg-slate-800 dark:text-teal-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((lesson) => {
          const prog = completedMap.get(lesson.id);
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => openLesson(lesson)}
              className="phosphor-card-interactive group flex flex-col justify-between rounded-xl bg-white p-4 text-right dark:bg-slate-900"
            >
              <div>
                <div className="mb-3 aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                  <IllustrationImage
                    src={getGrammarLessonImage(lesson.tier, lesson.order, lesson.illustrationPath)}
                    alt={lesson.titleAr}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span dir="ltr" className="font-en font-bold text-teal-700 dark:text-teal-400">
                    {lesson.level} · #{lesson.order}
                  </span>
                  {prog?.completed && (
                    <span className="inline-flex items-center gap-1 font-mono-num text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      {prog.score}%
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                  {lesson.titleAr}
                </h2>
                <p dir="ltr" className="font-en text-xs font-medium text-slate-500 dark:text-slate-400">
                  {lesson.titleEn}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {lesson.summaryAr}
                </p>
              </div>
              <p className="mt-4 text-xs font-semibold text-teal-700 dark:text-teal-400">
                بدء الدرس والتدريب ←
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
