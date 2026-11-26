import { ArrowLeft, AudioLines, BookOpen, CheckCircle2, Compass, GraduationCap, Headphones, Mic, PenTool } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { IllustrationImage } from '../components/IllustrationImage';
import { useAcademy } from '../context/AcademyContext';
import { ACADEMY_MODULES, CEFR_LEVELS } from '../data/curriculumMeta';
import { ModuleId } from '../types/academy';

const MODULE_ICONS: Record<ModuleId, React.ReactNode> = {
  vocabulary: <BookOpen className="h-5 w-5 text-teal-700 dark:text-teal-400" />,
  grammar: <GraduationCap className="h-5 w-5 text-teal-700 dark:text-teal-400" />,
  reading: <Compass className="h-5 w-5 text-teal-700 dark:text-teal-400" />,
  listening: <Headphones className="h-5 w-5 text-teal-700 dark:text-teal-400" />,
  speaking: <Mic className="h-5 w-5 text-teal-700 dark:text-teal-400" />,
  writing: <PenTool className="h-5 w-5 text-teal-700 dark:text-teal-400" />,
  exams: <CheckCircle2 className="h-5 w-5 text-teal-700 dark:text-teal-400" />,
  audio_lab: <AudioLines className="h-5 w-5 text-teal-700 dark:text-teal-400" />,
};

export const HomePage: React.FC = () => {
  const { activeProfile, lessonProgress } = useAcademy();
  const completedCount = lessonProgress.filter((l) => l.completed).length;

  return (
    <div className="space-y-12">
      {/* Hero Split Section */}
      <section className="phosphor-card grid items-stretch gap-8 rounded-2xl bg-white p-6 dark:bg-slate-900 lg:grid-cols-12 lg:p-8">
        <div className="flex flex-col justify-between space-y-6 lg:col-span-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              المراحل الابتدائية والمتوسطة والإعدادية · إطار CEFR من Pre-A1 إلى B2
            </p>
            <h1 className="text-balance text-3xl font-bold leading-snug text-slate-900 dark:text-white sm:text-4xl">
              أكاديمية تعلم اللغة الإنجليزية خطوة بخطوة
            </h1>
            <p
              dir="ltr"
              lang="en"
              className="font-en text-base font-semibold text-slate-500 dark:text-slate-400"
            >
              ENGLISH LEARNING ACADEMY — Learn English Step by Step
            </p>
            <p className="max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              منصة تعليمية متكاملة مصممة للطلاب الناطقين بالعربية لبناء المفردات والقواعد ومهارات القراءة والاستماع والمحادثة والكتابة بتدرج علمي واضح، مع حفظ كامل لتقدمك على جهازك والعمل دون إنترنت.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {activeProfile?.placementCompleted ? (
              <Link
                to="/learning-path"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
              >
                <span>متابعة مسارك ({activeProfile.currentLevel})</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/placement"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
              >
                <span>ابدأ اختبار تحديد المستوى</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            )}
            <Link
              to="/modules"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              تصفح الوحدات والمختبر الصوتي
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="phosphor-card h-full min-h-[240px] overflow-hidden rounded-xl">
            <IllustrationImage
              src="/src/assets/images/academy_hero_desk_1795680222000.jpg"
              alt="مكتب دراسي في أكاديمية اللغة الإنجليزية"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 4-Column Academy Pillars Strip */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="phosphor-card rounded-xl bg-white p-5 dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">المستوى الحالي</p>
          <p dir="ltr" className="font-en mt-2 text-2xl font-bold text-teal-700 dark:text-teal-400 tabular-nums">
            {activeProfile?.currentLevel || 'Pre-A1'}
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            {activeProfile?.placementCompleted ? 'تم تحديده بالاختبار' : 'يوصى بإجراء اختبار المستوى'}
          </p>
        </div>

        <div className="phosphor-card rounded-xl bg-white p-5 dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">الدروس المنجزة</p>
          <p className="font-mono-num mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {completedCount}
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            محفوظة محلياً على جهازك
          </p>
        </div>

        <div className="phosphor-card rounded-xl bg-white p-5 dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">منهجية الانغماس التدريجي</p>
          <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
            عربي ← إنجليزي متدرج
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            شروحات عربية دقيقة وأمثلة ناطقة
          </p>
        </div>

        <div className="phosphor-card rounded-xl bg-white p-5 dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">جاهزية الأجهزة اللوحية</p>
          <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
            يعمل دون إنترنت (PWA)
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            مُحسّن لأجهزة iPad وAndroid والكمبيوتر
          </p>
        </div>
      </section>

      {/* 7 Learning Modules Grid */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              الوحدات التعليمية المستقلة
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              اختر المهارة التي تريد التركيز عليها أو اتبع المسار التعليمي الموصى به.
            </p>
          </div>
          <Link
            to="/modules"
            className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400"
          >
            عرض جميع الوحدات ←
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ACADEMY_MODULES.map((mod, index) => (
            <Link
              key={mod.id}
              to={mod.route}
              className="phosphor-card-interactive group flex flex-col justify-between rounded-xl bg-white p-4 dark:bg-slate-900"
            >
              <div>
                <div className="mb-3 aspect-[16/10] w-full overflow-hidden rounded-lg border border-slate-200/70 dark:border-slate-800">
                  <IllustrationImage
                    src={mod.illustrationPath}
                    alt={mod.titleAr}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60">
                    {MODULE_ICONS[mod.id]}
                  </span>
                  <span dir="ltr" className="font-en text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    0{index + 1} · {mod.titleEn}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-400">
                  {mod.titleAr}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {mod.descriptionAr}
                </p>
              </div>
              <div className="mt-3 pt-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
                دخول الوحدة ←
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CEFR Curriculum Progression Ladder */}
      <section className="phosphor-card space-y-6 rounded-2xl bg-white p-6 dark:bg-slate-900 sm:p-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            التدرج الأكاديمي وفق الإطار الأوروبي (CEFR)
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            يبدأ الطالب من مستواه الفعلي بناءً على اختبار تحديد المستوى، وينتقل تدريجياً نحو الاستقلالية اللغوية في المستوى B1 وصولاً إلى إتقان المرحلة الإعدادية في المستوى B2.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CEFR_LEVELS.map((lvl) => (
            <div
              key={lvl.level}
              className="phosphor-card flex flex-col justify-between rounded-xl bg-slate-50/70 p-4 dark:bg-slate-800/40"
            >
              <div>
                <div className="mb-3 h-28 w-full overflow-hidden rounded-lg border border-slate-200/70 dark:border-slate-700">
                  <IllustrationImage
                    src={lvl.illustrationPath}
                    alt={lvl.titleAr}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span dir="ltr" className="font-en font-bold text-teal-700 dark:text-teal-400">
                    {lvl.level} · {lvl.titleEn}
                  </span>
                  <span>{lvl.stageAr}</span>
                </div>
                <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                  {lvl.titleAr}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {lvl.descriptionAr}
                </p>
              </div>
              <p className="mt-3 border-t border-slate-200/70 pt-2.5 text-[11px] font-medium text-slate-500 dark:border-slate-700/70 dark:text-slate-400">
                أسلوب اللغة: {lvl.immersionModeAr}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
