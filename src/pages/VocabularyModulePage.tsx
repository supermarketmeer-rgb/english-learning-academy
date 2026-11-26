import { ArrowRight, CheckCircle2, Layers, RefreshCw } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AudioPlayButton } from '../components/AudioPlayButton';
import { IllustrationImage } from '../components/IllustrationImage';
import { useAcademy } from '../context/AcademyContext';
import { AnalyticsService } from '../services/AnalyticsService';
import { LessonContentService } from '../services/LessonContentService';
import { VocabTopic } from '../types/academy';
import { getVocabularyTopicImage } from '../utils/assetLoader';

export const VocabularyModulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const topicParam = searchParams.get('topic');
  const topics = LessonContentService.getVocabTopics();
  const allWords = useMemo(() => LessonContentService.getAllVocabWords(), []);

  const { vocabSrs, lessonProgress, reviewWord, completeLesson } = useAcademy();
  const [mode, setMode] = useState<'topics' | 'srs'>('topics');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Spaced Repetition state
  const [srsIndex, setSrsIndex] = useState(0);
  const [showSrsAnswer, setShowSrsAnswer] = useState(false);

  const selectedTopic: VocabTopic | undefined = topicParam
    ? LessonContentService.getVocabTopicById(topicParam)
    : undefined;

  const srsMap = useMemo(() => new Map(vocabSrs.map((r) => [r.wordId, r])), [vocabSrs]);
  const completedLessonsSet = useMemo(
    () => new Set(lessonProgress.filter((p) => p.completed).map((p) => p.lessonId)),
    [lessonProgress]
  );

  const dueWords = useMemo(() => {
    const now = new Date().toISOString();
    const due = allWords.filter((w) => {
      const rec = srsMap.get(w.id);
      if (!rec) return true;
      return rec.nextReviewAt <= now;
    });
    return due.length > 0 ? due.slice(0, 12) : allWords.slice(0, 12);
  }, [allWords, srsMap]);

  const openTopic = (topic: VocabTopic) => {
    setSearchParams({ topic: topic.id });
    setQuizAnswers({});
    setQuizSubmitted(false);
    AnalyticsService.logLessonStarted('vocabulary', `vocab_${topic.id}`, topic.level);
  };

  const handleSubmitTopicQuiz = async (topic: VocabTopic) => {
    let correct = 0;
    for (const w of topic.words) {
      if (quizAnswers[w.id] === w.arabic) correct += 1;
    }
    const score = Math.round((correct / topic.words.length) * 100);
    setQuizSubmitted(true);
    await completeLesson(`vocab_${topic.id}`, 'vocabulary', topic.level, score);
  };

  if (selectedTopic) {
    const distractorPool = allWords
      .filter((w) => w.topicId !== selectedTopic.id)
      .map((w) => w.arabic);

    return (
      <div className="space-y-8">
        <button
          type="button"
          onClick={() => setSearchParams({})}
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة إلى جميع المحاور ({topics.length})</span>
        </button>

        <div className="phosphor-card grid items-stretch gap-6 rounded-2xl bg-white p-6 dark:bg-slate-900 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-8">
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              <span dir="ltr" className="font-en">{selectedTopic.level}</span> · {selectedTopic.words.length} مفردات
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {selectedTopic.titleAr}
            </h1>
            <p dir="ltr" className="font-en text-sm font-semibold text-slate-500 dark:text-slate-400">
              {selectedTopic.titleEn}
            </p>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {selectedTopic.descriptionAr}
            </p>
          </div>
          <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 lg:col-span-4">
            <IllustrationImage
              src={getVocabularyTopicImage(selectedTopic.id, selectedTopic.illustrationPath)}
              alt={selectedTopic.titleAr}
              className="h-full max-h-48 w-full object-cover"
            />
          </div>
        </div>

        {/* Vocabulary Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {selectedTopic.words.map((item) => {
            const srsRecord = srsMap.get(item.id);
            return (
              <div
                key={item.id}
                className="phosphor-card flex flex-col justify-between rounded-xl bg-white p-5 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl" aria-hidden="true">
                          {item.visualEmoji}
                        </span>
                        <h2 dir="ltr" className="font-en text-xl font-bold text-slate-900 dark:text-white">
                          {item.word}
                        </h2>
                      </div>
                      <p className="mt-1 text-base font-bold text-teal-700 dark:text-teal-400">
                        {item.arabic}
                      </p>
                      <p dir="ltr" className="font-mono-num mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {item.pronunciation} · {item.partOfSpeech}
                      </p>
                    </div>
                    <AudioPlayButton text={`${item.word}. ${item.exampleEn}`} size="sm" labelAr="استمع" />
                  </div>

                  <div className="mt-4 space-y-1.5 rounded-lg bg-slate-50 p-3.5 dark:bg-slate-800/60">
                    <p dir="ltr" lang="en" className="font-en text-sm font-medium text-slate-900 dark:text-slate-100">
                      {item.exampleEn}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{item.exampleAr}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">
                    الحالة:{' '}
                    {srsRecord?.masteryLevel === 'mastered'
                      ? 'متقنة'
                      : srsRecord?.masteryLevel === 'learning'
                        ? 'قيد المراجعة'
                        : 'جديدة'}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => reviewWord(item.id, selectedTopic.id, 1)}
                      className="min-h-[36px] rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      تحتاج تكرار
                    </button>
                    <button
                      type="button"
                      onClick={() => reviewWord(item.id, selectedTopic.id, 5)}
                      className="min-h-[36px] rounded-lg bg-teal-50 px-2.5 py-1 font-semibold text-teal-800 hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300"
                    >
                      تم حفظها
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Topic Practice Quiz */}
        <section className="phosphor-card space-y-4 rounded-2xl bg-white p-6 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            تدريب سريع على مفردات المحور
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {selectedTopic.words.map((w, idx) => {
              const options = [
                w.arabic,
                distractorPool[(idx * 3 + 1) % distractorPool.length],
                distractorPool[(idx * 3 + 5) % distractorPool.length],
                distractorPool[(idx * 3 + 9) % distractorPool.length],
              ].sort();
              const selected = quizAnswers[w.id];
              return (
                <div key={w.id} className="phosphor-card rounded-xl bg-white p-4 dark:bg-slate-900">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    ما معنى كلمة <span dir="ltr" className="font-en text-teal-700 dark:text-teal-400">{w.word}</span>؟
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {options.map((opt) => {
                      let cls =
                        'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';
                      if (quizSubmitted) {
                        if (opt === w.arabic) {
                          cls = 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200';
                        } else if (selected === opt) {
                          cls = 'border-rose-600 bg-rose-50 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200';
                        }
                      } else if (selected === opt) {
                        cls = 'border-teal-700 bg-teal-50 text-teal-900 dark:border-teal-400 dark:bg-teal-950/60 dark:text-teal-100';
                      }
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [w.id]: opt }))}
                          className={`min-h-[44px] rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${cls}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleSubmitTopicQuiz(selectedTopic)}
              className="min-h-[48px] rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 dark:bg-teal-600"
            >
              التحقق وحفظ التقدم
            </button>
          </div>
        </section>
      </div>
    );
  }

  const currentSrsWord = dueWords[srsIndex % Math.max(1, dueWords.length)];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            وحدة بناء المفردات (Vocabulary Builder)
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {topics.length} محوراً حياتياً وعلمياً وأكاديمياً مع النطق الصوتي والأمثلة ونظام التكرار المتباعد للمراحل الثلاث.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setMode('topics')}
            className={`inline-flex min-h-[42px] items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-semibold ${
              mode === 'topics'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>المحاور ({topics.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('srs');
              setShowSrsAnswer(false);
            }}
            className={`inline-flex min-h-[42px] items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-semibold ${
              mode === 'srs'
                ? 'bg-white text-teal-700 shadow-xs dark:bg-slate-800 dark:text-teal-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            <span>المراجعة المتباعدة ({dueWords.length})</span>
          </button>
        </div>
      </div>

      {mode === 'srs' && currentSrsWord ? (
        <div className="phosphor-card mx-auto max-w-xl rounded-2xl bg-white p-6 text-center dark:bg-slate-900 sm:p-8">
          <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
            نظام التكرار المتباعد · البطاقة {(srsIndex % dueWords.length) + 1} من {dueWords.length}
          </p>
          <div className="my-5 space-y-3">
            <div className="mx-auto h-28 w-44 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              <IllustrationImage
                src={getVocabularyTopicImage(currentSrsWord.topicId)}
                alt={currentSrsWord.topicTitleAr}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="inline-block text-3xl" aria-hidden="true">{currentSrsWord.visualEmoji}</span>
            <h2 dir="ltr" className="font-en text-3xl font-bold text-slate-900 dark:text-white">
              {currentSrsWord.word}
            </h2>
            <p dir="ltr" className="font-mono-num text-xs text-slate-500">
              {currentSrsWord.pronunciation}
            </p>
            <div className="flex justify-center pt-1">
              <AudioPlayButton text={currentSrsWord.word} labelAr="نطق الكلمة" />
            </div>
          </div>

          {!showSrsAnswer ? (
            <button
              type="button"
              onClick={() => setShowSrsAnswer(true)}
              className="min-h-[48px] w-full rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
            >
              إظهار المعنى والمثال
            </button>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xl font-bold text-teal-700 dark:text-teal-400">
                  {currentSrsWord.arabic}
                </p>
                <p dir="ltr" className="font-en mt-2 text-sm text-slate-800 dark:text-slate-200">
                  {currentSrsWord.exampleEn}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {currentSrsWord.exampleAr}
                </p>
              </div>
              <p className="text-xs font-semibold text-slate-500">كيف كان تذكّرك لهذه الكلمة؟</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await reviewWord(currentSrsWord.id, currentSrsWord.topicId, 1);
                    setShowSrsAnswer(false);
                    setSrsIndex((i) => i + 1);
                  }}
                  className="min-h-[46px] rounded-xl border border-rose-200 bg-rose-50 px-2 py-2 text-xs font-semibold text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                >
                  صعبة (غداً)
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await reviewWord(currentSrsWord.id, currentSrsWord.topicId, 3);
                    setShowSrsAnswer(false);
                    setSrsIndex((i) => i + 1);
                  }}
                  className="min-h-[46px] rounded-xl border border-amber-200 bg-amber-50 px-2 py-2 text-xs font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                >
                  جيدة
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await reviewWord(currentSrsWord.id, currentSrsWord.topicId, 5);
                    setShowSrsAnswer(false);
                    setSrsIndex((i) => i + 1);
                  }}
                  className="min-h-[46px] rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-2 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                >
                  متقنة!
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map((topic) => {
            const done = completedLessonsSet.has(`vocab_${topic.id}`);
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => openTopic(topic)}
                className="phosphor-card-interactive group flex flex-col justify-between rounded-xl bg-white p-4 text-right dark:bg-slate-900"
              >
                <div>
                  <div className="mb-3 aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                    <IllustrationImage
                      src={getVocabularyTopicImage(topic.id, topic.illustrationPath)}
                      alt={topic.titleAr}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span dir="ltr" className="font-en font-bold text-teal-700 dark:text-teal-400">
                      {topic.level} · {topic.words.length} كلمات
                    </span>
                    {done && <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <h2 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                    {topic.titleAr}
                  </h2>
                  <p dir="ltr" className="font-en text-xs text-slate-500 dark:text-slate-400">
                    {topic.titleEn}
                  </p>
                </div>
                <p className="mt-3 text-xs font-semibold text-teal-700 dark:text-teal-400">
                  فتح المحور ←
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
