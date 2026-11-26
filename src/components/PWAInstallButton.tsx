import { Download, Share, X } from 'lucide-react';
import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'compact' | 'card' }> = ({
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={
          variant === 'card'
            ? 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800 whitespace-nowrap shrink-0'
            : 'inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-teal-700/30 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 transition-colors hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:bg-teal-900/60 whitespace-nowrap shrink-0'
        }
      >
        <Download className="h-4 w-4" />
        <span>تثبيت التطبيق</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
        >
          <Share className="h-4 w-4" />
          <span>تثبيت على iPad / iPhone</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="phosphor-card w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <h3
                  id="ios-install-title"
                  className="text-lg font-bold text-slate-900 dark:text-slate-100"
                >
                  تثبيت الأكاديمية على iPad أو iPhone
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  aria-label="إغلاق"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <li>1. اضغط على زر المشاركة (Share) في شريط متصفح Safari.</li>
                <li>2. مرر للأسفل واختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen).</li>
                <li>3. اضغط «إضافة» (Add) لتعمل الأكاديمية كتطبيق مستقل وحتى دون إنترنت.</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 min-h-[44px] w-full rounded-lg bg-teal-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
              >
                فهمت
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
