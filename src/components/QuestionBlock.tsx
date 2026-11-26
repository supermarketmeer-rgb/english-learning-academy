import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { AssessmentService } from '../services/AssessmentService';
import { InteractiveQuestion } from '../types/academy';

interface QuestionBlockProps {
  question: InteractiveQuestion;
  index: number;
  selectedAnswer: string;
  onSelectAnswer: (answer: string) => void;
  showFeedback: boolean;
}

export const QuestionBlock: React.FC<QuestionBlockProps> = ({
  question,
  index,
  selectedAnswer,
  onSelectAnswer,
  showFeedback,
}) => {
  const [orderedWords, setOrderedWords] = useState<string[]>(() =>
    selectedAnswer ? selectedAnswer.split(' ') : []
  );

  const isCorrect =
    showFeedback &&
    AssessmentService.normalizeAnswer(selectedAnswer) ===
      AssessmentService.normalizeAnswer(question.correctAnswer);

  const handleToggleWord = (word: string, wordIdx: number) => {
    if (showFeedback) return;
    // Allow building answer from wordsToOrder while supporting repeated tokens cleanly
    const tokenKey = `${word}__${wordIdx}`;
    const currentTokens = orderedWords;
    const exists = currentTokens.includes(tokenKey);
    const nextTokens = exists
      ? currentTokens.filter((t) => t !== tokenKey)
      : [...currentTokens, tokenKey];
    setOrderedWords(nextTokens);
    onSelectAnswer(nextTokens.map((t) => t.split('__')[0]).join(' '));
  };

  const handleResetReorder = () => {
    if (showFeedback) return;
    setOrderedWords([]);
    onSelectAnswer('');
  };

  return (
    <div className="phosphor-card rounded-xl bg-white p-5 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <p className="text-base font-semibold leading-relaxed text-slate-900 dark:text-slate-100">
          <span className="font-mono-num ml-2 text-teal-700 dark:text-teal-400">
            {index + 1}.
          </span>
          {question.promptAr}
        </p>
      </div>

      {question.promptEn && (
        <p
          dir="ltr"
          lang="en"
          className="font-en mt-2 rounded-lg bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-800 dark:bg-slate-800/70 dark:text-slate-200"
        >
          {question.promptEn}
        </p>
      )}

      {question.type === 'reorder' && question.wordsToOrder ? (
        <div className="mt-4 space-y-3" dir="ltr">
          <div className="min-h-[52px] rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 font-en text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100">
            {orderedWords.length > 0
              ? orderedWords.map((t) => t.split('__')[0]).join(' ')
              : 'Tap words below in order...'}
          </div>
          <div className="flex flex-wrap gap-2">
            {question.wordsToOrder.map((word, wIdx) => {
              const tokenKey = `${word}__${wIdx}`;
              const used = orderedWords.includes(tokenKey);
              return (
                <button
                  key={tokenKey}
                  type="button"
                  disabled={showFeedback}
                  onClick={() => handleToggleWord(word, wIdx)}
                  className={`min-h-[44px] rounded-lg border px-3.5 py-2 font-en text-sm font-semibold transition-colors ${
                    used
                      ? 'border-teal-700 bg-teal-700 text-white dark:border-teal-500 dark:bg-teal-600'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {word}
                </button>
              );
            })}
            {!showFeedback && orderedWords.length > 0 && (
              <button
                type="button"
                onClick={handleResetReorder}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2" dir="ltr">
          {question.options?.map((option) => {
            const isSelected = selectedAnswer === option;
            const isOptionCorrect =
              AssessmentService.normalizeAnswer(option) ===
              AssessmentService.normalizeAnswer(question.correctAnswer);

            let btnStyle =
              'border-slate-200 bg-white text-slate-800 hover:border-teal-600/50 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-800';
            if (showFeedback) {
              if (isOptionCorrect) {
                btnStyle =
                  'border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200';
              } else if (isSelected && !isOptionCorrect) {
                btnStyle =
                  'border-rose-600 bg-rose-50 text-rose-900 dark:border-rose-500 dark:bg-rose-950/60 dark:text-rose-200';
              }
            } else if (isSelected) {
              btnStyle =
                'border-teal-700 bg-teal-50 text-teal-900 dark:border-teal-400 dark:bg-teal-950/70 dark:text-teal-100';
            }

            return (
              <button
                key={option}
                type="button"
                disabled={showFeedback}
                onClick={() => onSelectAnswer(option)}
                className={`min-h-[46px] rounded-lg border px-4 py-2.5 text-left font-en text-sm font-medium transition-colors ${btnStyle}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {showFeedback && (
        <div
          className={`mt-4 flex items-start gap-2.5 rounded-lg border p-3.5 text-sm ${
            isCorrect
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200'
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <div className="space-y-1">
            <p className="font-semibold">
              {isCorrect ? 'إجابة صحيحة!' : 'الإجابة تحتاج مراجعة'}
            </p>
            {!isCorrect && (
              <p className="text-xs">
                الإجابة الصحيحة:{' '}
                <span dir="ltr" className="font-en font-bold">
                  {question.correctAnswer}
                </span>
              </p>
            )}
            <p className="text-xs leading-relaxed opacity-90">{question.explanationAr}</p>
          </div>
        </div>
      )}
    </div>
  );
};
