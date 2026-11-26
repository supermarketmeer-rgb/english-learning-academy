import { ArrowRight, AudioLines, CheckCircle2, Mic, MicOff } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AudioPlayButton } from '../components/AudioPlayButton';
import { IllustrationImage } from '../components/IllustrationImage';
import { useAcademy } from '../context/AcademyContext';
import { AnalyticsService } from '../services/AnalyticsService';
import { LessonContentService } from '../services/LessonContentService';
import { SpeechService } from '../services/SpeechService';
import { SpeakingActivity } from '../types/academy';

export const SpeakingModulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonParam = searchParams.get('lesson');
  const activities = LessonContentService.getSpeakingActivities();
  const { lessonProgress, completeLesson } = useAcademy();

  const [transcripts, setTranscripts] = useState<Record<string, string>>({});
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [recError, setRecError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const recognitionSupported = SpeechService.isRecognitionSupported();

  const selectedActivity = lessonParam
    ? LessonContentService.getSpeakingActivityById(lessonParam)
    : undefined;

  const completedMap = useMemo(
    () => new Map(lessonProgress.map((p) => [p.lessonId, p])),
    [lessonProgress]
  );

  const openActivity = (act: SpeakingActivity) => {
    setSearchParams({ lesson: act.id });
    setTranscripts({});
    setRecordingId(null);
    setRecError(null);
    setCheckedItems({});
    AnalyticsService.logLessonStarted('speaking', act.id, act.level);
  };

  const handleRecordPrompt = (promptId: string) => {
    setRecError(null);
    setRecordingId(promptId);
    SpeechService.startRecognition({
      onResult: (text) => {
        setTranscripts((prev) => ({ ...prev, [promptId]: text }));
      },
      onError: (msg) => setRecError(msg),
      onEnd: () => setRecordingId(null),
    });
  };

  const handleCompleteSpeaking = async (act: SpeakingActivity) => {
    const totalChecks = act.prompts.reduce((sum, p) => sum + p.checklistAr.length, 0);
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    const score = totalChecks > 0 ? Math.max(70, Math.round((checkedCount / totalChecks) * 100)) : 100;
    await completeLesson(act.id, 'speaking', act.level, score);
  };

  if (selectedActivity) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <button
          type="button"
          onClick={() => setSearchParams({})}
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة إلى أنشطة المحادثة</span>
        </button>

        <section className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900 sm:p-8">
          <div className="grid items-stretch gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                <span dir="ltr" className="font-en">{selectedActivity.level}</span> · {selectedActivity.activityTypeAr}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {selectedActivity.titleAr}
              </h1>
              <p dir="ltr" className="font-en text-sm font-semibold text-slate-500 dark:text-slate-400">
                {selectedActivity.titleEn}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {selectedActivity.instructionsAr}
              </p>

              {!recognitionSupported && (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200">
                  ملاحظة: التعرف الصوتي عبر الميكروفون غير متاح في هذا المتصفح، لذا يمكنك استخدام وضع «الاستماع والترديد مع التقييم الذاتي» أدناه دون الحاجة لأي خدمة مدفوعة.
                </p>
              )}
            </div>

            {selectedActivity.illustrationPath && (
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 lg:col-span-4">
                <IllustrationImage
                  src={selectedActivity.illustrationPath}
                  alt={selectedActivity.titleAr}
                  className="h-full max-h-56 w-full object-cover"
                />
              </div>
            )}
          </div>
        </section>

        <div className="space-y-5">
          {selectedActivity.prompts.map((prompt, idx) => (
            <div
              key={prompt.id}
              className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900"
            >
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                <span className="font-mono-num ml-2 text-teal-700 dark:text-teal-400">{idx + 1}.</span>
                {prompt.promptAr}
              </p>

              <div className="mt-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p dir="ltr" lang="en" className="font-en text-base font-bold text-slate-900 dark:text-white">
                  {prompt.targetEn}
                </p>
                {prompt.phoneticTip && (
                  <p dir="ltr" className="font-mono-num mt-1 text-xs text-slate-500">
                    Pronunciation guide: {prompt.phoneticTip}
                  </p>
                )}
                {prompt.sampleResponseEn && (
                  <p dir="ltr" className="font-en mt-2 text-xs text-slate-600 dark:text-slate-300">
                    Sample: {prompt.sampleResponseEn}
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <AudioPlayButton text={prompt.targetEn} labelAr="استمع للنموذج" />
                {recognitionSupported && (
                  <button
                    type="button"
                    onClick={() => handleRecordPrompt(prompt.id)}
                    className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                      recordingId === prompt.id
                        ? 'bg-rose-700'
                        : 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700'
                    }`}
                  >
                    {recordingId === prompt.id ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                    <span>{recordingId === prompt.id ? 'جارٍ الاستماع لصوتك...' : 'جرب النطق بالميكروفون'}</span>
                  </button>
                )}
              </div>

              {transcripts[prompt.id] && (
                <p className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-3 text-xs dark:border-teal-800 dark:bg-teal-950/40">
                  ما تم التعرف عليه:{' '}
                  <span dir="ltr" className="font-en font-bold">
                    "{transcripts[prompt.id]}"
                  </span>
                </p>
              )}

              {recError && <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{recError}</p>}

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500">قائمة التحقق الذاتي من النطق:</p>
                {prompt.checklistAr.map((chk, cIdx) => {
                  const key = `${prompt.id}_${cIdx}`;
                  return (
                    <label
                      key={key}
                      className="flex min-h-[40px] cursor-pointer items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200"
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedItems[key]}
                        onChange={(e) =>
                          setCheckedItems((prev) => ({ ...prev, [key]: e.target.checked }))
                        }
                        className="h-5 w-5 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                      />
                      <span>{chk}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => handleCompleteSpeaking(selectedActivity)}
          className="min-h-[48px] rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 dark:bg-teal-600"
        >
          إتمام نشاط المحادثة وحفظ التقدم
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          أكاديمية المحادثة (Speaking Academy)
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          أنشطة نطق متدرجة من تكرار الكلمات إلى وصف الصور وتمثيل المواقف، مع بديل ذاتي متكامل لكل المتصفحات.
        </p>
      </div>

      <div className="phosphor-card flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200/70 dark:border-slate-800 sm:block">
            <IllustrationImage
              src="/src/assets/images/topic_listening_audiolab_1795681975070.jpg"
              alt="المختبر الصوتي التفاعلي"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              هل تريد قياس دقة نطقك ومواكبة تحسنك كلمة بكلمة؟
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              استخدم المختبر الصوتي التفاعلي للتدرب على مخارج الحروف وتسجيل نسبة الدقة في سجلك الشخصي.
            </p>
          </div>
        </div>
        <Link
          to="/audio-lab"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-800 dark:bg-teal-600"
        >
          <AudioLines className="h-4 w-4" />
          <span>الانتقال إلى المختبر الصوتي</span>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activities.map((act) => {
          const prog = completedMap.get(act.id);
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => openActivity(act)}
              className="phosphor-card-interactive group flex flex-col justify-between rounded-xl bg-white p-4 text-right dark:bg-slate-900"
            >
              <div>
                <div className="mb-3 aspect-[16/10] w-full overflow-hidden rounded-lg border border-slate-200/70 dark:border-slate-800">
                  <IllustrationImage
                    src={act.illustrationPath}
                    alt={act.titleAr}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span dir="ltr" className="font-en font-bold text-teal-700 dark:text-teal-400">
                    {act.level} · {act.activityTypeAr}
                  </span>
                  {prog?.completed ? (
                    <span className="inline-flex items-center gap-1 font-mono-num text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      {prog.score}%
                    </span>
                  ) : (
                    <Mic className="h-4 w-4 text-slate-400" />
                  )}
                </div>
                <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                  {act.titleAr}
                </h2>
                <p dir="ltr" className="font-en text-xs text-slate-500 dark:text-slate-400">
                  {act.titleEn}
                </p>
              </div>
              <p className="mt-4 text-xs font-semibold text-teal-700 dark:text-teal-400">
                بدء التدريب الشفهي ←
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
