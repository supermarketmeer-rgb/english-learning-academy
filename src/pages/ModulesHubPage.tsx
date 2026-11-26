import { AudioLines, BookOpen, CheckCircle2, Compass, GraduationCap, Headphones, Mic, PenTool } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { IllustrationImage } from '../components/IllustrationImage';
import { useAcademy } from '../context/AcademyContext';
import { ACADEMY_MODULES } from '../data/curriculumMeta';
import { LessonContentService } from '../services/LessonContentService';
import { ModuleId } from '../types/academy';
import { getModuleImage } from '../utils/assetLoader';

const ICONS: Record<ModuleId, React.ReactNode> = {
  vocabulary: <BookOpen className="h-6 w-6 text-teal-700 dark:text-teal-400" />,
  grammar: <GraduationCap className="h-6 w-6 text-teal-700 dark:text-teal-400" />,
  reading: <Compass className="h-6 w-6 text-teal-700 dark:text-teal-400" />,
  listening: <Headphones className="h-6 w-6 text-teal-700 dark:text-teal-400" />,
  speaking: <Mic className="h-6 w-6 text-teal-700 dark:text-teal-400" />,
  writing: <PenTool className="h-6 w-6 text-teal-700 dark:text-teal-400" />,
  exams: <CheckCircle2 className="h-6 w-6 text-teal-700 dark:text-teal-400" />,
  audio_lab: <AudioLines className="h-6 w-6 text-teal-700 dark:text-teal-400" />,
};

export const ModulesHubPage: React.FC = () => {
  const { lessonProgress } = useAcademy();
  const allLessons = LessonContentService.getAllUnifiedLessons();
  const completedSet = new Set(lessonProgress.filter((p) => p.completed).map((p) => p.lessonId));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          الوحدات التعليمية والمختبر الصوتي
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          كل وحدة تحتوي على دروس وتدريبات متكاملة ومتدرجة للمراحل الابتدائية والمتوسطة والإعدادية من Pre-A1 إلى B2 بالإضافة إلى المختبر الصوتي.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {ACADEMY_MODULES.map((mod) => {
          const modLessons = allLessons.filter((l) => l.moduleId === mod.id);
          const doneCount = modLessons.filter((l) => completedSet.has(l.id)).length;
          return (
            <Link
              key={mod.id}
              to={mod.route}
              className="phosphor-card-interactive group flex flex-col justify-between rounded-2xl bg-white p-5 dark:bg-slate-900"
            >
              <div>
                <div className="mb-4 aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                  <IllustrationImage
                    src={getModuleImage(mod.id, mod.illustrationPath)}
                    alt={mod.titleAr}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60">
                    {ICONS[mod.id]}
                  </div>
                  <span className="font-mono-num text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {doneCount} / {modLessons.length} منجز
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                  {mod.titleAr}
                </h2>
                <p dir="ltr" className="font-en text-xs font-semibold text-slate-400">
                  {mod.titleEn}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {mod.descriptionAr}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-teal-700 dark:border-slate-800 dark:text-teal-400">
                <span>فتح الوحدة</span>
                <span>←</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
