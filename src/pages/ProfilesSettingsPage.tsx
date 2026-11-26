import { AlertTriangle, CheckCircle2, Download, Plus, RotateCcw, Upload, UserCheck } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { IllustrationImage } from '../components/IllustrationImage';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { useAcademy } from '../context/AcademyContext';
import { StudentProgressService } from '../services/StudentProgressService';
import { SyncService } from '../services/SyncService';
import { GradeBand } from '../types/academy';

export const ProfilesSettingsPage: React.FC = () => {
  const {
    profiles,
    activeProfile,
    settings,
    updateSettings,
    toggleTheme,
    createAndActivateProfile,
    switchProfile,
    changeActiveGradeBand,
    resetActiveProgress,
    importBackup,
  } = useAcademy();

  const [nickname, setNickname] = useState('');
  const [gradeBand, setGradeBand] = useState<GradeBand>('primary');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const syncStatus = SyncService.getStatus();

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    await createAndActivateProfile(nickname, gradeBand);
    setNickname('');
    setStatusMessage({ type: 'ok', text: 'تم إنشاء ملف الطالب وتفعيله بنجاح.' });
  };

  const handleExportBackup = async () => {
    if (!activeProfile) return;
    try {
      const payload = await StudentProgressService.exportProfileBackup(activeProfile.id);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `english-academy-backup-${activeProfile.nickname}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMessage({ type: 'ok', text: 'تم تنزيل ملف النسخة الاحتياطية بنجاح.' });
    } catch {
      setStatusMessage({ type: 'err', text: 'تعذر تصدير النسخة الاحتياطية.' });
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importBackup(text);
      setStatusMessage({ type: 'ok', text: 'تم التحقق من الملف واستعادة التقدم بنجاح.' });
    } catch (err) {
      setStatusMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'ملف النسخة الاحتياطية غير صالح.',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmReset = async () => {
    await resetActiveProgress();
    setConfirmResetOpen(false);
    setStatusMessage({ type: 'ok', text: 'تمت إعادة ضبط تقدم الملف الحالي بنجاح.' });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="phosphor-card grid items-center gap-5 rounded-2xl bg-white p-6 dark:bg-slate-900 sm:grid-cols-12">
        <div className="sm:col-span-9">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            ملفات الطلاب والإعدادات المحلية
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            أنشئ ملفاً باسم مستعار فقط دون الحاجة لبريد إلكتروني أو رقم هاتف، وتحكم في النسخ الاحتياطي وتفضيلات النطق.
          </p>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 sm:col-span-3">
          <IllustrationImage
            src="/src/assets/images/academy_crest_emblem_1795680222767.jpg"
            alt="شعار الأكاديمية"
            className="h-28 w-full object-cover"
          />
        </div>
      </div>

      {statusMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-4 text-sm font-semibold ${
            statusMessage.type === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
          }`}
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Local Storage Notice */}
      <section className="phosphor-card rounded-2xl bg-amber-50/80 p-5 text-sm leading-relaxed text-amber-950 dark:bg-amber-950/30 dark:text-amber-200">
        <h2 className="font-bold">تنبيه مهم حول التخزين المحلي:</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs sm:text-sm">
          <li>جميع الملفات والنتائج محفوظة محلياً على هذا الجهاز والمتصفح فقط (IndexedDB).</li>
          <li>مسح بيانات المتصفح أو ذاكرة الموقع قد يؤدي إلى فقدان التقدم المحفوظ.</li>
          <li>لا تنتقل البيانات تلقائياً بين الأجهزة المختلفة في هذا الإصدار المجاني؛ استخدم ميزة «تصدير نسخة احتياطية» أدناه لنقل تقدمك.</li>
          <li>{syncStatus.messageAr}</li>
        </ul>
      </section>

      {/* Switch or Create Profile */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            الملفات المحفوظة على هذا الجهاز
          </h2>
          <div className="mt-4 space-y-2.5">
            {profiles.map((prof) => {
              const isActive = prof.id === activeProfile?.id;
              return (
                <button
                  key={prof.id}
                  type="button"
                  onClick={() => switchProfile(prof.id)}
                  className={`flex min-h-[54px] w-full items-center justify-between rounded-xl border px-4 py-3 text-right transition-colors ${
                    isActive
                      ? 'border-teal-700 bg-teal-50 dark:border-teal-500 dark:bg-teal-950/50'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{prof.nickname}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {prof.gradeBand === 'primary'
                        ? 'المرحلة الابتدائية'
                        : prof.gradeBand === 'middle'
                          ? 'المرحلة المتوسطة'
                          : 'المرحلة الإعدادية'}{' '}
                      ·{' '}
                      <span dir="ltr" className="font-en font-semibold">
                        {prof.currentLevel}
                      </span>{' '}
                      · {prof.points} نقطة
                    </p>
                  </div>
                  {isActive && <UserCheck className="h-5 w-5 text-teal-700 dark:text-teal-400" />}
                </button>
              );
            })}
          </div>

          {activeProfile && (
            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                تغيير مرحلة الملف الحالي (يفتح دروسها فوراً):
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(
                  [
                    { band: 'primary', label: 'الابتدائية' },
                    { band: 'middle', label: 'المتوسطة' },
                    { band: 'preparatory', label: 'الإعدادية' },
                  ] as const
                ).map((item) => {
                  const selected = activeProfile.gradeBand === item.band;
                  return (
                    <button
                      key={item.band}
                      type="button"
                      onClick={async () => {
                        await changeActiveGradeBand(item.band);
                        setStatusMessage({
                          type: 'ok',
                          text: `تم تحويل الملف إلى ${item.label} وفتح جميع دروسها فوراً.`,
                        });
                      }}
                      className={`min-h-[40px] whitespace-nowrap rounded-xl border px-2 text-xs font-semibold transition-colors ${
                        selected
                          ? 'border-teal-700 bg-teal-700 text-white dark:border-teal-500 dark:bg-teal-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            إنشاء ملف طالب جديد
          </h2>
          <form onSubmit={handleCreateProfile} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="student-nickname"
                className="block text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                الاسم المستعار (بدون بيانات شخصية)
              </label>
              <input
                id="student-nickname"
                type="text"
                required
                maxLength={32}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="مثال: بطل القراءة أو سارة"
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                المرحلة الدراسية
              </span>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setGradeBand('primary')}
                  className={`min-h-[44px] rounded-xl border px-2 text-xs font-semibold sm:text-sm ${
                    gradeBand === 'primary'
                      ? 'border-teal-700 bg-teal-50 text-teal-900 dark:border-teal-500 dark:bg-teal-950/50 dark:text-teal-200'
                      : 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  الابتدائية
                </button>
                <button
                  type="button"
                  onClick={() => setGradeBand('middle')}
                  className={`min-h-[44px] rounded-xl border px-2 text-xs font-semibold sm:text-sm ${
                    gradeBand === 'middle'
                      ? 'border-teal-700 bg-teal-50 text-teal-900 dark:border-teal-500 dark:bg-teal-950/50 dark:text-teal-200'
                      : 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  المتوسطة
                </button>
                <button
                  type="button"
                  onClick={() => setGradeBand('preparatory')}
                  className={`min-h-[44px] rounded-xl border px-2 text-xs font-semibold sm:text-sm ${
                    gradeBand === 'preparatory'
                      ? 'border-teal-700 bg-teal-50 text-teal-900 dark:border-teal-500 dark:bg-teal-950/50 dark:text-teal-200'
                      : 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  الإعدادية
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                تُفتح جميع دروس المرحلة المختارة تلقائياً فور إنشاء الملف.
              </p>
            </div>

            <button
              type="submit"
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 dark:bg-teal-600"
            >
              <Plus className="h-4 w-4" />
              <span>إنشاء وتفعيل الملف</span>
            </button>
          </form>
        </section>
      </div>

      {/* Speech & Display Preferences */}
      <section className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          تفضيلات الصوت والمظهر وتثبيت التطبيق
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">سرعة النطق الصوتي</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[0.75, 0.9, 1.0, 1.15].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => updateSettings({ speechRate: rate })}
                  className={`min-h-[40px] rounded-lg border px-3 py-1 font-mono-num text-xs font-semibold ${
                    settings.speechRate === rate
                      ? 'border-teal-700 bg-teal-700 text-white'
                      : 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">لهجة النطق المفضلة</p>
            <div className="mt-2 flex gap-2">
              {(['en-GB', 'en-US'] as const).map((acc) => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => updateSettings({ preferredVoiceAccent: acc })}
                  className={`min-h-[40px] rounded-lg border px-3 py-1 font-en text-xs font-semibold ${
                    settings.preferredVoiceAccent === acc
                      ? 'border-teal-700 bg-teal-700 text-white'
                      : 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {acc === 'en-GB' ? 'British (UK)' : 'American (US)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">المظهر والتثبيت</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="min-h-[40px] rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                المظهر: {settings.theme === 'dark' ? 'ليلي' : 'نهاري'}
              </button>
              <PWAInstallButton variant="card" />
            </div>
          </div>
        </div>
      </section>

      {/* Backup, Restore, and Reset */}
      <section className="phosphor-card rounded-2xl bg-white p-6 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          النسخ الاحتياطي وإعادة ضبط التقدم
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <Download className="h-4 w-4" />
            <span>تصدير نسخة احتياطية (JSON)</span>
          </button>

          <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
            <Upload className="h-4 w-4" />
            <span>استيراد نسخة احتياطية</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="sr-only"
            />
          </label>

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
          >
            <RotateCcw className="h-4 w-4" />
            <span>إعادة ضبط تقدم الملف الحالي</span>
          </button>
        </div>
      </section>

      {confirmResetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="phosphor-card w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold">تأكيد إعادة ضبط التقدم</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              سيؤدي هذا الإجراء إلى مسح الدروس المكتملة والنقاط ونتائج الاختبارات للملف «{activeProfile?.nickname}» على هذا الجهاز نهائياً. يُنصح بتصدير نسخة احتياطية أولاً.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="min-h-[44px] rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="min-h-[44px] rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
              >
                نعم، أعد الضبط
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
