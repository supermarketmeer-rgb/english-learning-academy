import { AudioLines, Award, Flame, Target, TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { IllustrationImage } from '../components/IllustrationImage';
import { useAcademy } from '../context/AcademyContext';
import { BADGE_DEFINITIONS } from '../data/curriculumMeta';
import { LessonContentService } from '../services/LessonContentService';
import { ModuleId } from '../types/academy';

const MODULE_LABELS: Record<ModuleId, string> = {
  vocabulary: 'المفردات',
  grammar: 'القواعد',
  reading: 'القراءة',
  listening: 'الاستماع',
  speaking: 'المحادثة',
  writing: 'الكتابة',
  exams: 'الاختبارات',
  audio_lab: 'المختبر الصوتي',
};

export const DashboardPage: React.FC = () => {
  const { activeProfile, lessonProgress, vocabSrs, assessments, pronunciationLogs } = useAcademy();

  const stats = useMemo(() => {
    const allUnified = LessonContentService.getAllUnifiedLessons();
    const completedSet = new Set(
      lessonProgress.filter((p) => p.completed).map((p) => p.lessonId)
    );

    const byModule = (
      ['vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing', 'exams', 'audio_lab'] as ModuleId[]
    ).map((modId) => {
      const total = allUnified.filter((l) => l.moduleId === modId).length;
      const done = allUnified.filter((l) => l.moduleId === modId && completedSet.has(l.id)).length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return { modId, label: MODULE_LABELS[modId], total, done, pct };
    });

    const totalLessons = allUnified.length;
    const completedLessons = completedSet.size;
    const overallPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const vocabLearned = vocabSrs.filter((v) => v.repetitions >= 1).length;
    const vocabMastered = vocabSrs.filter((v) => v.masteryLevel === 'mastered').length;

    const nextRecommended =
      allUnified.find((l) => !completedSet.has(l.id) && l.level === (activeProfile?.currentLevel || 'Pre-A1')) ||
      allUnified.find((l) => !completedSet.has(l.id));

    // Last 7 days daily activity
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString('ar-EG', { weekday: 'short' });
      const count = activeProfile?.dailyActivity?.[key] ?? 0;
      return { key, dayLabel, count };
    });

    const weeklyCompleted = last7Days.reduce((sum, day) => sum + day.count, 0);

    return {
      byModule,
      totalLessons,
      completedLessons,
      overallPct,
      vocabLearned,
      vocabMastered,
      nextRecommended,
      last7Days,
      weeklyCompleted,
    };
  }, [activeProfile, lessonProgress, vocabSrs]);

  const weeklyGoal = activeProfile?.weeklyGoalLessons ?? 5;
  const weeklyGoalPct = Math.min(100, Math.round((stats.weeklyCompleted / weeklyGoal) * 100));

  const totalAudioDrills = LessonContentService.getAudioLabDrills().length;
  const avgPronunciationAccuracy =
    pronunciationLogs.length > 0
      ? Math.round(
          pronunciationLogs.reduce((sum, l) => sum + l.bestAccuracy, 0) / pronunciationLogs.length
        )
      : 0;
  const totalPronunciationAttempts = pronunciationLogs.reduce((sum, l) => sum + l.attempts, 0);

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="phosphor-card flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          {stats.nextRecommended && (
            <div className="hidden h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200/70 dark:border-slate-800 sm:block">
              <IllustrationImage
                src={stats.nextRecommended.illustrationPath}
                alt={stats.nextRecommended.titleAr}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              لوحة تقدم الطالب · محفوظة محلياً على هذا الجهاز
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              مرحباً، {activeProfile?.nickname || 'طالب الأكاديمية'}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {activeProfile?.gradeBand === 'preparatory'
                ? 'المرحلة الإعدادية'
                : activeProfile?.gradeBand === 'middle'
                  ? 'المرحلة المتوسطة'
                  : 'المرحلة الابتدائية'}
              {' · '}
              المستوى الحالي:{' '}
              <span dir="ltr" className="font-en font-bold text-teal-700 dark:text-teal-400">
                {activeProfile?.currentLevel || 'Pre-A1'}
              </span>
              {' · '}
              النسبة الكلية للإنجاز: <span className="font-mono-num font-bold">{stats.overallPct}%</span>
            </p>
          </div>
        </div>

        {stats.nextRecommended && (
          <Link
            to={stats.nextRecommended.route}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 dark:bg-teal-600"
          >
            الدرس الموصى به: {stats.nextRecommended.titleAr}
          </Link>
        )}
      </div>

      {/* Top Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="phosphor-card rounded-xl bg-white p-5 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>الدروس المكتملة</span>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </div>
          <p className="font-mono-num mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.completedLessons} / {stats.totalLessons}
          </p>
        </div>

        <div className="phosphor-card rounded-xl bg-white p-5 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>المفردات المتعلَّمة</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <p className="font-mono-num mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.vocabLearned}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            منها {stats.vocabMastered} كلمة متقنة
          </p>
        </div>

        <div className="phosphor-card rounded-xl bg-white p-5 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>النقاط وسلسلة الالتزام</span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <p className="font-mono-num mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {activeProfile?.points ?? 0} نقطة
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            سلسلة التعلم: {activeProfile?.streakDays ?? 1} يوم
          </p>
        </div>

        <div className="phosphor-card rounded-xl bg-white p-5 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>الهدف الأسبوعي</span>
            <Target className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="font-mono-num mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.weeklyCompleted} / {weeklyGoal} أنشطة
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-emerald-600 transition-all"
              style={{ width: `${weeklyGoalPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pronunciation & Audio Lab Summary Card */}
      <section className="phosphor-card flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="hidden h-18 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200/70 dark:border-slate-800 sm:block">
            <IllustrationImage
              src="/src/assets/images/topic_listening_audiolab_1795681975070.jpg"
              alt="المختبر الصوتي ومواكبة النطق"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
              <AudioLines className="h-4 w-4" />
              <span>المختبر الصوتي ومواكبة النطق</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              تطور دقة النطق:{' '}
              <span className="font-mono-num text-teal-700 dark:text-teal-400">
                {avgPronunciationAccuracy}%
              </span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              التمارين الصوتية المُجرّبة:{' '}
              <span className="font-mono-num font-bold">{pronunciationLogs.length} / {totalAudioDrills}</span>
              {' · '}
              إجمالي محاولات التدريب: <span className="font-mono-num font-bold">{totalPronunciationAttempts}</span>
            </p>
          </div>
        </div>
        <Link
          to="/audio-lab"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 dark:bg-teal-600"
        >
          <AudioLines className="h-4 w-4" />
          <span>فتح المختبر الصوتي</span>
        </Link>
      </section>

      {/* Progress Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Progress per Module */}
        <div className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900 lg:col-span-7">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            التقدم في كل مهارة ووحدة
          </h2>
          <div className="mt-5 space-y-4">
            {stats.byModule.map((m) => (
              <div key={m.modId} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {m.label}
                  </span>
                  <span className="font-mono-num text-xs text-slate-500 dark:text-slate-400">
                    {m.done} / {m.total} ({m.pct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-teal-700 transition-all dark:bg-teal-500"
                    style={{ width: `${Math.max(m.done > 0 ? 4 : 0, m.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Activity Chart */}
        <div className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900 lg:col-span-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            النشاط التعليمي اليومي (آخر 7 أيام)
          </h2>
          <div className="mt-6 flex h-44 items-end justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
            {stats.last7Days.map((day) => {
              const heightPct = Math.min(100, day.count * 20);
              return (
                <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
                  <span className="font-mono-num text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {day.count}
                  </span>
                  <div className="flex h-28 w-full items-end justify-center">
                    <div
                      className="w-full max-w-[32px] rounded-t-lg bg-teal-700/90 transition-all dark:bg-teal-500/90"
                      style={{ height: `${Math.max(day.count > 0 ? 14 : 4, heightPct)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Badges & Milestones */}
      <section className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          الشارات ومعالم الإنجاز
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGE_DEFINITIONS.map((badge) => {
            const unlocked = activeProfile?.unlockedBadges.includes(badge.id) ?? false;
            return (
              <div
                key={badge.id}
                className={`phosphor-card rounded-xl p-4 ${
                  unlocked
                    ? 'bg-amber-50/70 dark:bg-amber-950/30'
                    : 'bg-slate-50/60 opacity-75 dark:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={unlocked ? 'text-amber-700 dark:text-amber-300' : 'text-slate-500'}>
                    {unlocked ? 'مكتسبة' : badge.criteriaTextAr}
                  </span>
                  <span dir="ltr" className="font-en text-slate-400">
                    {badge.titleEn}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                  {badge.titleAr}
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {badge.descriptionAr}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Assessment Results History */}
      <section className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          سجل التقييمات والاختبارات الأخيرة
        </h2>
        {assessments.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            لم تسجل نتائج تقييمات بعد. أكمل درساً أو اختباراً تدريبياً لتظهر نتائجك هنا.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2.5 font-semibold">الوحدة</th>
                  <th className="py-2.5 font-semibold">المستوى</th>
                  <th className="py-2.5 font-semibold">النتيجة</th>
                  <th className="py-2.5 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assessments.slice(0, 8).map((a) => (
                  <tr key={a.id}>
                    <td className="py-3 font-semibold">{MODULE_LABELS[a.moduleId]}</td>
                    <td dir="ltr" className="py-3 font-en font-semibold">
                      {a.level}
                    </td>
                    <td className="py-3 font-mono-num font-bold text-teal-700 dark:text-teal-400">
                      {a.score}% ({a.correctAnswers}/{a.totalQuestions})
                    </td>
                    <td className="py-3 font-mono-num text-xs text-slate-500 dark:text-slate-400">
                      {new Date(a.completedAt).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
