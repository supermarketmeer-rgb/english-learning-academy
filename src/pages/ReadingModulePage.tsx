import { ArrowRight, BookOpenCheck, CheckCircle2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AudioPlayButton } from '../components/AudioPlayButton';
import { IllustrationImage } from '../components/IllustrationImage';
import { QuestionBlock } from '../components/QuestionBlock';
import { SpeechSpeedControl } from '../components/SpeechSpeedControl';
import { useAcademy } from '../context/AcademyContext';
import { AnalyticsService } from '../services/AnalyticsService';
import { AssessmentService } from '../services/AssessmentService';
import { FeedbackEffectsService } from '../services/FeedbackEffectsService';
import { LessonContentService } from '../services/LessonContentService';
import { ReadingLesson } from '../types/academy';
import { getReadingLessonImage } from '../utils/assetLoader';

export const ReadingModulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonParam = searchParams.get('lesson');
  const lessons = LessonContentService.getReadingLessons();
  const { activeProfile, lessonProgress, completeLesson } = useAcademy();

  const [showArabicSummary, setShowArabicSummary] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [shortAnswers, setShortAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const selectedLesson = lessonParam
    ? LessonContentService.getReadingLessonById(lessonParam)
    : undefined;

  const completedMap = useMemo(
    () => new Map(lessonProgress.map((p) => [p.lessonId, p])),
    [lessonProgress]
  );

  const openLesson = (lesson: ReadingLesson) => {
    setSearchParams({ lesson: lesson.id });
    setShowArabicSummary(false);
    setAnswers({});
    setShortAnswers({});
    setSubmitted(false);
    AnalyticsService.logLessonStarted('reading', lesson.id, lesson.level);
  };

  const handleSubmitReading = async (lesson: ReadingLesson) => {
    const objectiveQuestions = [...lesson.trueFalseQuestions, ...lesson.mcqQuestions];
    let correct = 0;
    for (const q of objectiveQuestions) {
      if (
        AssessmentService.normalizeAnswer(answers[q.id] || '') ===
        AssessmentService.normalizeAnswer(q.correctAnswer)
      ) {
        correct += 1;
      }
    }
    for (const sa of lesson.shortAnswerPrompts) {
      const text = (shortAnswers[sa.id] || '').toLowerCase();
      if (sa.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
        correct += 1;
      }
    }
    const total = objectiveQuestions.length + lesson.shortAnswerPrompts.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 100;
    setSubmitted(true);
    FeedbackEffectsService.triggerForScore(score);

    if (activeProfile) {
      await AssessmentService.recordAssessmentAttempt({
        profileId: activeProfile.id,
        assessmentId: lesson.id,
        moduleId: 'reading',
        level: lesson.level,
        score,
        totalQuestions: total,
        correctAnswers: correct,
      });
    }
    await completeLesson(lesson.id, 'reading', lesson.level, score);
  };

  if (selectedLesson) {
    const fullText = selectedLesson.paragraphsEn.join(' ');
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <button
          type="button"
          onClick={() => setSearchParams({})}
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة إلى نصوص القراءة</span>
        </button>

        {/* Reading Passage Card */}
        <article className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900 sm:p-8">
          <div className="grid items-stretch gap-6 lg:grid-cols-12">
            <div className="flex flex-col justify-between space-y-3 lg:col-span-8">
              <div>
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                  <span dir="ltr" className="font-en">{selectedLesson.level}</span> · {selectedLesson.genreAr}
                </p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedLesson.titleAr}
                </h1>
                <p dir="ltr" className="font-en text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {selectedLesson.titleEn}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{selectedLesson.introAr}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <AudioPlayButton text={fullText} labelAr="استمع للنص" />
                <SpeechSpeedControl variant="inline" />
              </div>
            </div>
            <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 lg:col-span-4">
              <IllustrationImage
                src={getReadingLessonImage(selectedLesson.id, selectedLesson.illustrationPath)}
                alt={selectedLesson.titleAr}
                className="h-full max-h-52 w-full object-cover"
              />
            </div>
          </div>

          <div
            dir="ltr"
            lang="en"
            className="font-en mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-5 text-base leading-relaxed text-slate-900 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
          >
            {selectedLesson.paragraphsEn.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowArabicSummary((v) => !v)}
              className="min-h-[40px] text-xs font-semibold text-teal-700 underline dark:text-teal-400"
            >
              {showArabicSummary ? 'إخفاء الملخص المساعد بالعربية' : 'إظهار ملخص الفهم بالعربية (عند الحاجة)'}
            </button>
            {showArabicSummary && (
              <p className="mt-2 rounded-lg bg-slate-100 p-3 text-xs leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {selectedLesson.arabicSupportSummary}
              </p>
            )}
          </div>
        </article>

        {/* Vocabulary Support */}
        <section className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">دعم المفردات المفتاحية</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {selectedLesson.vocabularySupport.map((v) => (
              <div
                key={v.word}
                className="phosphor-card flex items-center justify-between gap-2 rounded-xl bg-white p-3.5 dark:bg-slate-900"
              >
                <div>
                  <p dir="ltr" className="font-en text-sm font-bold text-slate-900 dark:text-white">
                    {v.word}
                  </p>
                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">{v.arabic}</p>
                  <p className="text-[11px] text-slate-500">{v.pronunciation}</p>
                </div>
                <AudioPlayButton text={v.word} size="sm" labelAr="نطق" />
              </div>
            ))}
          </div>
        </section>

        {/* Comprehension Questions */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">أسئلة الفهم والاستيعاب</h2>
          {[...selectedLesson.trueFalseQuestions, ...selectedLesson.mcqQuestions].map((q, idx) => (
            <QuestionBlock
              key={q.id}
              question={q}
              index={idx}
              selectedAnswer={answers[q.id] || ''}
              onSelectAnswer={(ans) => setAnswers((prev) => ({ ...prev, [q.id]: ans }))}
              showFeedback={submitted}
            />
          ))}

          {selectedLesson.shortAnswerPrompts.map((sa, idx) => (
            <div
              key={sa.id}
              className="phosphor-card rounded-xl bg-white p-5 dark:bg-slate-900"
            >
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                <span className="font-mono-num ml-2 text-teal-700 dark:text-teal-400">
                  {selectedLesson.trueFalseQuestions.length + selectedLesson.mcqQuestions.length + idx + 1}.
                </span>
                {sa.questionAr}
              </p>
              <p dir="ltr" className="font-en mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                {sa.questionEn}
              </p>
              <input
                type="text"
                dir="ltr"
                disabled={submitted}
                value={shortAnswers[sa.id] || ''}
                onChange={(e) =>
                  setShortAnswers((prev) => ({ ...prev, [sa.id]: e.target.value }))
                }
                placeholder="Write a short answer in English..."
                className="font-en mt-3 min-h-[44px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {submitted && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/70">
                  <span className="font-semibold text-teal-700 dark:text-teal-400">نموذج إجابة مقترح: </span>
                  <span dir="ltr" className="font-en font-medium text-slate-800 dark:text-slate-200">
                    {sa.sampleAnswerEn}
                  </span>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleSubmitReading(selectedLesson)}
            className="min-h-[48px] rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 dark:bg-teal-600"
          >
            تصحيح الأسئلة وحفظ تقدم القراءة
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          أكاديمية القراءة (Reading Academy)
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          قصص قصيرة وحوارات ومقالات تعليمية متدرجة مع دعم صوتي وقاموس مصاحب وأسئلة فهم متنوعة.
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
                <div className="mb-3 aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                  <IllustrationImage
                    src={getReadingLessonImage(lesson.id, lesson.illustrationPath)}
                    alt={lesson.titleAr}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span dir="ltr" className="font-en font-bold text-teal-700 dark:text-teal-400">
                    {lesson.level} · {lesson.genreAr}
                  </span>
                  {prog?.completed ? (
                    <span className="inline-flex items-center gap-1 font-mono-num text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      {prog.score}%
                    </span>
                  ) : (
                    <BookOpenCheck className="h-4 w-4 text-slate-400" />
                  )}
                </div>
                <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                  {lesson.titleAr}
                </h2>
                <p dir="ltr" className="font-en text-xs text-slate-500 dark:text-slate-400">
                  {lesson.titleEn}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {lesson.introAr}
                </p>
              </div>
              <p className="mt-4 text-xs font-semibold text-teal-700 dark:text-teal-400">
                قراءة النص ←
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
