import { ArrowRight, CheckCircle2, PenTool, RotateCcw } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AudioPlayButton } from '../components/AudioPlayButton';
import { IllustrationImage } from '../components/IllustrationImage';
import { useAcademy } from '../context/AcademyContext';
import { AnalyticsService } from '../services/AnalyticsService';
import { AssessmentService } from '../services/AssessmentService';
import { LessonContentService } from '../services/LessonContentService';
import { WritingLesson } from '../types/academy';

export const WritingModulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonParam = searchParams.get('lesson');
  const lessons = LessonContentService.getWritingLessons();
  const { lessonProgress, completeLesson } = useAcademy();

  const [builderWords, setBuilderWords] = useState<string[]>([]);
  const [draftText, setDraftText] = useState('');
  const [checklist, setChecklist] = useState<Record<number, boolean>>({});
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const selectedLesson = lessonParam
    ? LessonContentService.getWritingLessonById(lessonParam)
    : undefined;

  const completedMap = useMemo(
    () => new Map(lessonProgress.map((p) => [p.lessonId, p])),
    [lessonProgress]
  );

  const openLesson = (lesson: WritingLesson) => {
    setSearchParams({ lesson: lesson.id });
    setBuilderWords([]);
    setDraftText('');
    setChecklist({});
    setSavedFeedback(null);
    AnalyticsService.logLessonStarted('writing', lesson.id, lesson.level);
  };

  const wordCount = useMemo(() => {
    const trimmed = draftText.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [draftText]);

  const handleSaveWriting = async (lesson: WritingLesson) => {
    const checkedCount = Object.values(checklist).filter(Boolean).length;
    const checklistRatio = lesson.checklistAr.length > 0 ? checkedCount / lesson.checklistAr.length : 1;
    const lengthRatio = Math.min(1, wordCount / lesson.minWords);
    const score = Math.round((checklistRatio * 0.6 + lengthRatio * 0.4) * 100);

    await completeLesson(lesson.id, 'writing', lesson.level, Math.max(55, score));
    setSavedFeedback(
      `تم حفظ نشاط الكتابة بنجاح (${wordCount} كلمة). التقييم الذاتي: ${Math.max(55, score)}%.`
    );
  };

  if (selectedLesson) {
    const starter = selectedLesson.sentenceBuilderStarter;
    const builtSentence = builderWords.map((t) => t.split('__')[0]).join(' ');
    const starterMatches =
      starter &&
      AssessmentService.normalizeAnswer(builtSentence) ===
        AssessmentService.normalizeAnswer(starter.expectedEn);

    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <button
          type="button"
          onClick={() => setSearchParams({})}
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة إلى دروس الكتابة</span>
        </button>

        {/* Lesson Overview & Model */}
        <section className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900 sm:p-8">
          <div className="grid items-stretch gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                <span dir="ltr" className="font-en">{selectedLesson.level}</span> · {selectedLesson.writingStageAr}
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
                  className="h-full max-h-52 w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Model Example */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center justify-between gap-3">
              <p dir="ltr" className="font-en text-sm font-bold text-teal-700 dark:text-teal-400">
                Model: {selectedLesson.modelTitleEn}
              </p>
              <AudioPlayButton text={selectedLesson.modelTextEn} size="sm" labelAr="استمع للنموذج" />
            </div>
            <p
              dir="ltr"
              lang="en"
              className="font-en mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-900 dark:text-slate-100"
            >
              {selectedLesson.modelTextEn}
            </p>
            <ul className="mt-4 space-y-1 border-t border-slate-200 pt-3 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {selectedLesson.modelNotesAr.map((note, idx) => (
                <li key={idx}>• {note}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Optional Sentence Builder Warm-up */}
        {starter && (
          <section className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              تمرين تمهيدي: {starter.promptAr}
            </h2>
            <div dir="ltr" className="mt-3 space-y-3">
              <div className="min-h-[48px] rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 font-en text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                {builtSentence || 'Tap words to build the sentence...'}
              </div>
              <div className="flex flex-wrap gap-2">
                {starter.tokens.map((tok, tIdx) => {
                  const key = `${tok}__${tIdx}`;
                  const used = builderWords.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setBuilderWords((prev) =>
                          prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
                        )
                      }
                      className={`min-h-[42px] rounded-lg border px-3.5 py-1.5 font-en text-sm font-semibold ${
                        used
                          ? 'border-teal-700 bg-teal-700 text-white'
                          : 'border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {tok}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setBuilderWords([])}
                  className="inline-flex min-h-[42px] items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>إعادة</span>
                </button>
              </div>
              {starterMatches && (
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  ✓ أحسنت! تركيب الجملة صحيح تماماً.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Writing Workspace & Self-Assessment Checklist */}
        <section className="phosphor-card space-y-4 rounded-2xl bg-white p-6 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">مساحة الكتابة</h2>
            <span className="font-mono-num text-xs font-semibold text-slate-500 dark:text-slate-400">
              عدد الكلمات: {wordCount} / المطلوب {selectedLesson.minWords}+ كلمة
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {selectedLesson.promptAr}
          </p>
          <p dir="ltr" className="font-en text-xs text-slate-500 dark:text-slate-400">
            {selectedLesson.promptEn}
          </p>

          <textarea
            dir="ltr"
            lang="en"
            rows={7}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="Start writing in English here..."
            className="font-en w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              قائمة التقييم الذاتي (لا تتطلب خدمة خارجية):
            </p>
            {selectedLesson.checklistAr.map((item, idx) => (
              <label
                key={idx}
                className="flex min-h-[40px] cursor-pointer items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200"
              >
                <input
                  type="checkbox"
                  checked={!!checklist[idx]}
                  onChange={(e) =>
                    setChecklist((prev) => ({ ...prev, [idx]: e.target.checked }))
                  }
                  className="h-5 w-5 rounded border-slate-300 text-teal-700"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>

          {savedFeedback && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-semibold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              {savedFeedback}
            </p>
          )}

          <button
            type="button"
            disabled={wordCount < 3}
            onClick={() => handleSaveWriting(selectedLesson)}
            className="min-h-[48px] rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50 dark:bg-teal-600"
          >
            اعتماد التقييم الذاتي وحفظ النشاط
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          أكاديمية الكتابة (Writing Academy)
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          تدرّج من كتابة الكلمات وبناء الجمل إلى الفقرات والرسائل والقصص والمقالات مع نماذج وتقييم ذاتي محلي.
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
                    {lesson.level} · {lesson.writingStageAr}
                  </span>
                  {prog?.completed ? (
                    <span className="inline-flex items-center gap-1 font-mono-num text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      {prog.score}%
                    </span>
                  ) : (
                    <PenTool className="h-4 w-4 text-slate-400" />
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
                فتح درس الكتابة ←
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
