import { ArrowRight, Award, CheckCircle2, Clock } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AudioPlayButton } from '../components/AudioPlayButton';
import { IllustrationImage } from '../components/IllustrationImage';
import { QuestionBlock } from '../components/QuestionBlock';
import { useAcademy } from '../context/AcademyContext';
import { CURRICULUM_DISCLAIMER_AR } from '../data/curriculumMeta';
import { AnalyticsService } from '../services/AnalyticsService';
import { AssessmentService } from '../services/AssessmentService';
import { LessonContentService } from '../services/LessonContentService';
import { ExamPack } from '../types/academy';

const SECTION_AR: Record<string, string> = {
  vocabulary: 'المفردات',
  grammar: 'القواعد',
  reading: 'القراءة',
  listening: 'الاستماع',
};

export const ExamsModulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const packParam = searchParams.get('pack');
  const packs = LessonContentService.getExamPacks();
  const { activeProfile, lessonProgress, completeLesson } = useAcademy();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);

  const selectedPack = packParam ? LessonContentService.getExamPackById(packParam) : undefined;

  const completedMap = useMemo(
    () => new Map(lessonProgress.map((p) => [p.lessonId, p])),
    [lessonProgress]
  );

  const openPack = (pack: ExamPack) => {
    setSearchParams({ pack: pack.id });
    setAnswers({});
    setSubmitted(false);
    setLastScore(null);
    AnalyticsService.logLessonStarted('exams', pack.id, pack.level);
  };

  const handleSubmitExam = async (pack: ExamPack) => {
    let correct = 0;
    for (const q of pack.questions) {
      if (
        AssessmentService.normalizeAnswer(answers[q.id] || '') ===
        AssessmentService.normalizeAnswer(q.correctAnswer)
      ) {
        correct += 1;
      }
    }
    const score = pack.questions.length > 0 ? Math.round((correct / pack.questions.length) * 100) : 100;
    setSubmitted(true);
    setLastScore(score);

    if (activeProfile) {
      await AssessmentService.recordAssessmentAttempt({
        profileId: activeProfile.id,
        assessmentId: pack.id,
        moduleId: 'exams',
        level: pack.level,
        score,
        totalQuestions: pack.questions.length,
        correctAnswers: correct,
      });
    }
    await completeLesson(pack.id, 'exams', pack.level, score);
  };

  if (selectedPack) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <button
          type="button"
          onClick={() => setSearchParams({})}
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة إلى حزم الاختبارات</span>
        </button>

        <section className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900 sm:p-8">
          <div className="grid items-stretch gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span dir="ltr" className="font-en font-bold text-teal-700 dark:text-teal-400">
                  {selectedPack.level} · Reference: {selectedPack.cambridgeRef}
                </span>
                <span className="inline-flex items-center gap-1 font-mono-num">
                  <Clock className="h-4 w-4" />
                  المدة المقترحة: {selectedPack.durationMinutes} دقيقة
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {selectedPack.titleAr}
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {selectedPack.targetGroupAr}
              </p>
            </div>
            {selectedPack.illustrationPath && (
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 lg:col-span-4">
                <IllustrationImage
                  src={selectedPack.illustrationPath}
                  alt={selectedPack.titleAr}
                  className="h-full max-h-48 w-full object-cover"
                />
              </div>
            )}
          </div>
        </section>

        {submitted && lastScore !== null && (
          <div className="phosphor-card rounded-2xl bg-teal-50 p-6 dark:bg-teal-950/40">
            <p className="text-lg font-bold text-teal-900 dark:text-teal-200">
              نتيجة الاختبار التدريبي: <span className="font-mono-num">{lastScore}%</span>
            </p>
            <p className="mt-1 text-sm text-teal-800 dark:text-teal-300">
              {lastScore >= 75
                ? 'أداء ممتاز! أنت جاهز للانتقال أو التعمق في هذا المستوى.'
                : 'بداية جيدة! راجع الإجابات والتفسيرات أدناه ثم أعد المحاولة لرفع نتيجتك.'}
            </p>
          </div>
        )}

        <div className="space-y-5">
          {selectedPack.questions.map((q, idx) => (
            <div key={q.id} className="space-y-3">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                قسم {SECTION_AR[q.section]}
              </p>

              {q.readingPassage && (
                <div
                  dir="ltr"
                  lang="en"
                  className="font-en rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                >
                  {q.readingPassage}
                </div>
              )}

              {q.listeningScript && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                  <AudioPlayButton text={q.listeningScript} labelAr="استمع لسؤال الاختبار" />
                </div>
              )}

              <QuestionBlock
                question={q}
                index={idx}
                selectedAnswer={answers[q.id] || ''}
                onSelectAnswer={(ans) => setAnswers((prev) => ({ ...prev, [q.id]: ans }))}
                showFeedback={submitted}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => handleSubmitExam(selectedPack)}
          className="min-h-[48px] rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 dark:bg-teal-600"
        >
          إنهاء الاختبار وعرض التقييم
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          وحدة الاستعداد للاختبارات (Exam Preparation)
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          نماذج تدريبية أصلية متوافقة مع أهداف اختبارات المدارس للمراحل الابتدائية والمتوسطة والإعدادية من Pre A1 Starters حتى B2 First for Schools.
        </p>
      </div>

      <p className="phosphor-card rounded-xl bg-white p-4 text-xs leading-relaxed text-slate-600 dark:bg-slate-900 dark:text-slate-300">
        {CURRICULUM_DISCLAIMER_AR}
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packs.map((pack) => {
          const prog = completedMap.get(pack.id);
          return (
            <button
              key={pack.id}
              type="button"
              onClick={() => openPack(pack)}
              className="phosphor-card-interactive group flex flex-col justify-between rounded-xl bg-white p-4 text-right dark:bg-slate-900"
            >
              <div>
                <div className="mb-3 aspect-[16/10] w-full overflow-hidden rounded-lg border border-slate-200/70 dark:border-slate-800">
                  <IllustrationImage
                    src={pack.illustrationPath}
                    alt={pack.titleAr}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span dir="ltr" className="font-en font-bold text-teal-700 dark:text-teal-400">
                    {pack.level} · {pack.cambridgeRef}
                  </span>
                  {prog?.completed ? (
                    <span className="inline-flex items-center gap-1 font-mono-num text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      {prog.score}%
                    </span>
                  ) : (
                    <Award className="h-4 w-4 text-slate-400" />
                  )}
                </div>
                <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                  {pack.titleAr}
                </h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {pack.targetGroupAr}
                </p>
              </div>
              <p className="mt-4 text-xs font-semibold text-teal-700 dark:text-teal-400">
                بدء الاختبار التدريبي ←
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
