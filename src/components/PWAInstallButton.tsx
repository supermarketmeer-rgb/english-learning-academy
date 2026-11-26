import { Download, Share, Smartphone, X } from 'lucide-react';
import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'compact' | 'card' }> = ({
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // Hide completely once installed or launched from the home screen / desktop icon
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuide(true);
  };

  const buttonClass =
    variant === 'card'
      ? 'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 whitespace-nowrap shrink-0'
      : 'inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-teal-700/30 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 transition-colors hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:bg-teal-900/60 whitespace-nowrap shrink-0';

  return (
    <>
      <button type="button" onClick={handleClick} className={buttonClass}>
        {isIOS && !isInstallable ? (
          <Share className="h-4 w-4 shrink-0" />
        ) : (
          <Download className="h-4 w-4 shrink-0" />
        )}
        <span>تثبيت التطبيق</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-guide-title"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="phosphor-card w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                  <Smartphone className="h-5 w-5" />
                </span>
                <h3
                  id="pwa-install-guide-title"
                  className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg"
                >
                  {isIOS
                    ? 'تثبيت التطبيق على iPad أو iPhone'
                    : 'تثبيت التطبيق على جهازك'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isIOS ? (
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <li>1. اضغط على زر المشاركة (Share) في شريط متصفح Safari.</li>
                <li>
                  2. مرّر للأسفل واختر <strong>«إضافة إلى الشاشة الرئيسية»</strong> (Add to Home
                  Screen).
                </li>
                <li>
                  3. اضغط <strong>«إضافة»</strong> (Add) لتظهر أيقونة التطبيق على الشاشة الرئيسية
                  ويعمل مباشرة وحتى دون إنترنت.
                </li>
              </ol>
            ) : isAndroid ? (
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <li>1. اضغط على قائمة المتصفح (⋮) في أعلى الشاشة.</li>
                <li>
                  2. اختر <strong>«تثبيت التطبيق»</strong> (Install app) أو{' '}
                  <strong>«إضافة إلى الشاشة الرئيسية»</strong>.
                </li>
                <li>
                  3. اضغط <strong>«تثبيت»</strong> لتتولد أيقونة التطبيق على جهازك ويختفي زر
                  التثبيت عند فتحه من الأيقونة.
                </li>
              </ol>
            ) : (
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <li>
                  1. اضغط على أيقونة التثبيت في شريط العنوان (أو قائمة المتصفح ⋮ ←{' '}
                  <strong>تثبيت ENGLISH LEARNING ACADEMY</strong>).
                </li>
                <li>
                  2. وافق على التثبيت لتتولد أيقونة مباشرة على سطح المكتب أو شاشة التطبيقات.
                </li>
                <li>
                  3. عند تشغيل التطبيق من الأيقونة سيعمل بنافذة مستقلة ويختفي زر التثبيت تلقائياً.
                </li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-6 min-h-[44px] w-full rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
            >
              فهمت
            </button>
          </div>
        </div>
      )}
    </>
  );
};
