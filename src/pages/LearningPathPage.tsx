import { AlertCircle, ArrowLeft, CheckCircle2, Lock, PlayCircle, RotateCcw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IllustrationImage } from '../components/IllustrationImage';
import { useAcademy } from '../context/AcademyContext';
import { CEFR_LEVELS } from '../data/curriculumMeta';
import { LearningPathNode, StudentProgressService } from '../services/StudentProgressService';
import { CEFRLevel, GradeBand } from '../types/academy';

const STAGE_OPTIONS: { band: GradeBand; label: string }[] = [
  { band: 'primary', label: 'الابتدائية' },
  { band: 'middle', label: 'المتوسطة' },
  { band: 'preparatory', label: 'الإعدادية' },
];

export const LearningPathPage: React.FC = () => {
  const { activeProfile, lessonProgress, changeActiveGradeBand } = useAcademy();
  const [nodes, setNodes] = useState<LearningPathNode[]>([]);
  const [levelFilter, setLevelFilter] = useState<'all' | CEFRLevel>('all');

  useEffect(() => {
    let mounted = true;
    if (activeProfile) {
      StudentProgressService.buildLearningPath(activeProfile).then((data) => {
        if (mounted) setNodes(data);
      });
    }
    return () => {
      mounted = false;
    };
  }, [activeProfile, lessonProgress]);

  const filtered =
    levelFilter === 'all' ? nodes : nodes.filter((n) => n.lesson.level === levelFilter);

  const recommendedNode = nodes.find((n) => n.status === 'recommended') || nodes.find((n) => n.status === 'available');
  const reviewNodes = nodes.filter((n) => n.status === 'needs_review');

  return (
    <div className="space-y-8">
      <div className="phosphor-card space-y-5 rounded-2xl bg-white p-6 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              مسار التعلم التكيفي · مستواك الحالي {activeProfile?.currentLevel || 'Pre-A1'}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              خارطة التعلم المتدرجة
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              تُفتح دروس كل مرحلة فور اختيارها، أو تلقائياً عند إتمام الدروس السابقة، مع إمكانية مراجعة أي درس في أي وقت.
            </p>
          </div>

          {recommendedNode && (
            <Link
              to={recommendedNode.lesson.route}
              className="inline-flex min-h-[48px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 dark:bg-teal-600"
            >
              <span>النشاط الموصى به: {recommendedNode.lesson.titleAr}</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            المرحلة الدراسية (فتح فوري):
          </span>
          <div className="inline-flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
            {STAGE_OPTIONS.map((opt) => {
              const active = activeProfile?.gradeBand === opt.band;
              return (
                <button
                  key={opt.band}
                  type="button"
                  onClick={() => changeActiveGradeBand(opt.band)}
                  className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-teal-700 text-white shadow-xs dark:bg-teal-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {reviewNodes.length > 0 && (
        <div className="phosphor-card rounded-xl bg-amber-50 p-5 dark:bg-amber-950/30">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-200">
            <AlertCircle className="h-5 w-5" />
            <span>توصية بالمراجعة بناءً على نتائج التقييم ({reviewNodes.length})</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {reviewNodes.map((node) => (
              <Link
                key={node.lesson.id}
                to={node.lesson.route}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-amber-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-slate-900 dark:text-amber-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{node.lesson.titleAr} ({node.score}%)</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Level Filter Controls */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setLevelFilter('all')}
          className={`min-h-[40px] rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
            levelFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          جميع المستويات ({nodes.length})
        </button>
        {CEFR_LEVELS.map((lvl) => (
          <button
            key={lvl.level}
            type="button"
            onClick={() => setLevelFilter(lvl.level)}
            className={`min-h-[40px] rounded-lg px-4 py-1.5 font-en text-xs font-semibold transition-colors ${
              levelFilter === lvl.level
                ? 'bg-white text-teal-700 shadow-xs dark:bg-slate-800 dark:text-teal-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            {lvl.level}
          </button>
        ))}
      </div>

      {/* Lessons List */}
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((node) => {
          const isLocked = node.status === 'locked';
          const isCompleted = node.status === 'completed';
          const isNeedsReview = node.status === 'needs_review';
          const isRecommended = node.status === 'recommended';

          const statusText = isCompleted
            ? `مكتمل · ${node.score ?? 100}%`
            : isNeedsReview
              ? `يُنصح بالمراجعة · ${node.score ?? 0}%`
              : isRecommended
                ? 'موصى به الآن'
                : isLocked
                  ? 'سيُفتح عند التقدم للمستوى الأعلى'
                  : 'متاح للدراسة';

          const cardContent = (
            <div
              className={`flex h-full items-center justify-between gap-4 rounded-xl p-4 ${
                isLocked
                  ? 'phosphor-card bg-slate-100/70 opacity-75 dark:bg-slate-900/40'
                  : isRecommended
                    ? 'phosphor-card-interactive bg-teal-50/40 dark:bg-teal-950/30'
                    : 'phosphor-card-interactive bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="h-16 w-22 shrink-0 overflow-hidden rounded-lg border border-slate-200/70 dark:border-slate-800">
                  <IllustrationImage
                    src={node.lesson.illustrationPath}
                    alt={node.lesson.titleAr}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span dir="ltr" className="font-en font-bold text-teal-700 dark:text-teal-400">
                      {node.lesson.level}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{statusText}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {node.lesson.titleAr}
                  </h3>
                  <p dir="ltr" className="font-en text-xs text-slate-500 dark:text-slate-400">
                    {node.lesson.titleEn}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                ) : isLocked ? (
                  <Lock className="h-5 w-5 text-slate-400" />
                ) : (
                  <PlayCircle className="h-6 w-6 text-teal-700 dark:text-teal-400" />
                )}
              </div>
            </div>
          );

          if (isLocked) {
            return <div key={node.lesson.id}>{cardContent}</div>;
          }

          return (
            <Link key={node.lesson.id} to={node.lesson.route}>
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
