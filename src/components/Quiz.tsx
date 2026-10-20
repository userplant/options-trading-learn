import { useState } from 'react';
import { useProgress } from '../lib/progress';
import { Button, cx } from './ui';

export interface QuizQuestion {
  q: string;
  choices: string[];
  answer: number;
  explain: string;
}

export function Quiz({ lessonKey, questions }: { lessonKey: string; questions: QuizQuestion[] }) {
  const { quiz, saveQuiz } = useProgress();
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const score = picked.reduce<number>((s, p, i) => s + (p === questions[i].answer ? 1 : 0), 0);
  const allAnswered = picked.every((p) => p !== null);
  const prev = quiz[lessonKey];

  const submit = () => {
    setSubmitted(true);
    saveQuiz(lessonKey, score, questions.length);
  };

  const retry = () => {
    setPicked(questions.map(() => null));
    setSubmitted(false);
  };

  return (
    <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">📝 แบบทดสอบท้ายบท</h2>
        {prev && !submitted && (
          <span className="text-sm text-slate-500">
            ครั้งล่าสุด: {prev[0]}/{prev[1]}
          </span>
        )}
      </div>

      <ol className="space-y-6">
        {questions.map((item, qi) => (
          <li key={qi}>
            <p className="mb-2 font-medium text-slate-900 dark:text-white">
              {qi + 1}. {item.q}
            </p>
            <div className="grid gap-2">
              {item.choices.map((c, ci) => {
                const chosen = picked[qi] === ci;
                const correct = ci === item.answer;
                return (
                  <button
                    key={ci}
                    type="button"
                    disabled={submitted}
                    onClick={() => setPicked((p) => p.map((v, i) => (i === qi ? ci : v)))}
                    className={cx(
                      'rounded-xl border px-3.5 py-2.5 text-left text-sm transition',
                      !submitted &&
                        (chosen
                          ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500 dark:bg-teal-950/50'
                          : 'border-slate-200 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500'),
                      submitted && correct && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                      submitted && chosen && !correct && 'border-rose-500 bg-rose-50 dark:bg-rose-950/40',
                      submitted && !chosen && !correct && 'border-slate-200 opacity-60 dark:border-slate-800',
                    )}
                  >
                    {submitted && correct && <span className="mr-1.5">✅</span>}
                    {submitted && chosen && !correct && <span className="mr-1.5">❌</span>}
                    {c}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                {item.explain}
              </p>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <Button onClick={submit} className={cx(!allAnswered && 'pointer-events-none opacity-50')}>
            ส่งคำตอบ
          </Button>
        ) : (
          <>
            <div
              className={cx(
                'rounded-lg px-3 py-2 text-sm font-semibold',
                score / questions.length >= 0.7
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
              )}
            >
              ได้ {score}/{questions.length} คะแนน{' '}
              {score / questions.length >= 0.7 ? '— ผ่าน! บทเรียนนี้ถูกบันทึกว่าเรียนจบแล้ว' : '— ต้องได้ 70% ขึ้นไปจึงจะผ่าน'}
            </div>
            <Button variant="outline" onClick={retry}>
              ทำใหม่
            </Button>
          </>
        )}
        {!submitted && !allAnswered && <span className="text-sm text-slate-500">ตอบให้ครบทุกข้อก่อนส่ง</span>}
      </div>
    </section>
  );
}
