import {
  AudioLines,
  Award,
  BarChart3,
  BookOpen,
  Compass,
  Home,
  Moon,
  Sun,
  UserCircle2,
  WifiOff,
  X,
} from 'lucide-react';
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAcademy } from '../context/AcademyContext';
import { CURRICULUM_DISCLAIMER_AR } from '../data/curriculumMeta';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { CelebrationOverlay } from './CelebrationOverlay';
import { IllustrationImage } from './IllustrationImage';
import { PWAInstallButton } from './PWAInstallButton';
import { SpeechSpeedControl } from './SpeechSpeedControl';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeProfile, settings, toggleTheme, celebrationMessage, dismissCelebration } =
    useAcademy();
  const isOnline = useOnlineStatus();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
      isActive
        ? 'border-teal-700 text-teal-800 dark:border-teal-400 dark:text-teal-300'
        : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
    }`;

  const mobileTabClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center min-h-[48px] text-[11px] font-semibold transition-colors ${
      isActive
        ? 'text-teal-700 dark:text-teal-400'
        : 'text-slate-500 dark:text-slate-400'
    }`;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <CelebrationOverlay />
      {/* Top Bar: Strictly 1 row, 3 zones (optimized for iPad Portrait/Landscape & Tablets) */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 pt-safe backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex min-h-[56px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 md:gap-4 lg:gap-8 lg:px-8">
          {/* Zone 1: Single-line brand mark */}
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 sm:gap-2.5 focus-visible:outline-2 focus-visible:outline-teal-600"
          >
            <IllustrationImage
              src="/src/assets/images/academy_crest_emblem_1795680222767.jpg"
              alt="شعار الأكاديمية"
              className="h-8 w-8 shrink-0 rounded-lg object-cover"
            />
            <span dir="ltr" className="font-en truncate text-xs font-bold tracking-tight text-slate-900 dark:text-white sm:text-sm lg:text-base">
              ENGLISH LEARNING ACADEMY
            </span>
          </Link>

          {/* Zone 2: 4 single-line navigation links */}
          <nav className="hidden items-center gap-4 md:flex lg:gap-6" aria-label="التنقل الرئيسي">
            <NavLink to="/" end className={navLinkClass}>
              الرئيسية
            </NavLink>
            <NavLink to="/learning-path" className={navLinkClass}>
              المسار التعليمي
            </NavLink>
            <NavLink to="/modules" className={navLinkClass}>
              الوحدات
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              لوحة الطالب
            </NavLink>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <Link
              to="/placement"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-teal-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 whitespace-nowrap shrink-0 sm:px-4"
            >
              تحديد المستوى
            </Link>
          </div>
        </div>
      </header>

      {/* Non-sticky Workspace Utility Strip */}
      <div className="border-b border-slate-200/80 bg-white/70 dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:gap-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300 sm:gap-3">
            <Link
              to="/profiles"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-2 py-1 font-semibold text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <UserCircle2 className="h-4 w-4 text-teal-700 dark:text-teal-400" />
              <span>{activeProfile?.nickname || 'طالب الأكاديمية'}</span>
              <span aria-hidden="true">·</span>
              <span dir="ltr" className="font-en font-bold text-teal-700 dark:text-teal-400">
                {activeProfile?.currentLevel || 'Pre-A1'}
              </span>
            </Link>
            <span aria-hidden="true" className="hidden sm:inline text-slate-300 dark:text-slate-700">
              /
            </span>
            <span className="hidden sm:inline font-mono-num">
              {activeProfile?.points ?? 0} نقطة · سلسلة {activeProfile?.streakDays ?? 1} يوم
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/audio-lab"
              className="phosphor-card-interactive inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-lime-300 whitespace-nowrap shrink-0"
            >
              <AudioLines className="h-4 w-4 text-lime-600 dark:text-lime-400" />
              <span>المختبر الصوتي</span>
            </Link>
            <SpeechSpeedControl />
            <PWAInstallButton />
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
              aria-label={settings.theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
            >
              {settings.theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span className="hidden sm:inline">نهاري</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-slate-600" />
                  <span className="hidden sm:inline">ليلي</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Offline Status Notice */}
      {!isOnline && (
        <div className="bg-amber-600 px-4 py-2 text-center text-xs font-semibold text-white">
          <span className="inline-flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            أنت تعمل الآن دون اتصال بالإنترنت — جميع الدروس المحفوظة متاحة وتُخزن نتائجك محلياً.
          </span>
        </div>
      )}

      {/* Achievement Celebration Banner */}
      {celebrationMessage && (
        <div className="mx-auto mt-4 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            role="status"
            className="phosphor-card flex items-center justify-between gap-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
          >
            <div className="flex items-center gap-2.5">
              <Award className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
              <span>{celebrationMessage}</span>
            </div>
            <button
              type="button"
              onClick={dismissCelebration}
              className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900"
              aria-label="إغلاق الإشعار"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-10 lg:px-8">
        {children}
      </main>

      {/* Clean Academic Footer */}
      <footer className="border-t border-slate-200 bg-white pb-20 pt-8 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 md:pb-8">
        <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p dir="ltr" className="font-en text-sm font-bold text-slate-800 dark:text-slate-200">
                ENGLISH LEARNING ACADEMY · Learn English Step by Step
              </p>
              <p className="mt-1">
                بيئة تعليمية مستقلة مجانية للطلاب في المراحل الابتدائية والمتوسطة والإعدادية · تعمل محلياً وتدعم الأجهزة اللوحية.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 font-semibold text-slate-700 dark:text-slate-300">
              <Link to="/audio-lab" className="hover:text-teal-700 dark:hover:text-teal-400">
                المختبر الصوتي
              </Link>
              <Link to="/profiles" className="hover:text-teal-700 dark:hover:text-teal-400">
                الملفات والنسخ الاحتياطي
              </Link>
              <Link to="/modules" className="hover:text-teal-700 dark:hover:text-teal-400">
                جميع الوحدات
              </Link>
              <Link to="/placement" className="hover:text-teal-700 dark:hover:text-teal-400">
                اختبار تحديد المستوى
              </Link>
            </div>
          </div>
          <p className="border-t border-slate-100 pt-4 leading-relaxed dark:border-slate-800">
            {CURRICULUM_DISCLAIMER_AR}
          </p>
        </div>
      </footer>

      {/* Tablet / Mobile Thumb-Zone Bottom Tab Bar (under 15% cap, >=44px targets) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white/95 backdrop-blur-md pb-safe dark:border-slate-800 dark:bg-slate-900/95 md:hidden"
        aria-label="التنقل السريع"
      >
        <NavLink to="/" end className={mobileTabClass}>
          <Home className="h-5 w-5" />
          <span className="mt-0.5">الرئيسية</span>
        </NavLink>
        <NavLink to="/learning-path" className={mobileTabClass}>
          <Compass className="h-5 w-5" />
          <span className="mt-0.5">المسار</span>
        </NavLink>
        <NavLink to="/modules" className={mobileTabClass}>
          <BookOpen className="h-5 w-5" />
          <span className="mt-0.5">الوحدات</span>
        </NavLink>
        <NavLink to="/dashboard" className={mobileTabClass}>
          <BarChart3 className="h-5 w-5" />
          <span className="mt-0.5">لوحتي</span>
        </NavLink>
      </nav>
    </div>
  );
};
