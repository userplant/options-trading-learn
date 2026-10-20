import { createContext, useContext, useState, type ReactNode } from 'react';
import { loadJSON, saveJSON } from './storage';

interface ProgressState {
  completed: Record<string, true>;
  /** คะแนนแบบทดสอบล่าสุด: lessonKey -> [ได้, เต็ม] */
  quiz: Record<string, [number, number]>;
}

interface ProgressCtx extends ProgressState {
  markComplete: (key: string, done?: boolean) => void;
  saveQuiz: (key: string, score: number, total: number) => void;
  reset: () => void;
}

const KEY = 'trading-lab-progress-v1';
const EMPTY: ProgressState = { completed: {}, quiz: {} };

const Ctx = createContext<ProgressCtx>({ ...EMPTY, markComplete: () => {}, saveQuiz: () => {}, reset: () => {} });

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => ({ ...EMPTY, ...loadJSON(KEY, EMPTY) }));

  const update = (fn: (s: ProgressState) => ProgressState) =>
    setState((s) => {
      const next = fn(s);
      saveJSON(KEY, next);
      return next;
    });

  const markComplete = (key: string, done = true) =>
    update((s) => {
      const completed = { ...s.completed };
      if (done) completed[key] = true;
      else delete completed[key];
      return { ...s, completed };
    });

  const saveQuiz = (key: string, score: number, total: number) =>
    update((s) => ({
      completed: score / total >= 0.7 ? { ...s.completed, [key]: true } : s.completed,
      quiz: { ...s.quiz, [key]: [score, total] },
    }));

  const reset = () => update(() => EMPTY);

  return <Ctx.Provider value={{ ...state, markComplete, saveQuiz, reset }}>{children}</Ctx.Provider>;
}

export const useProgress = () => useContext(Ctx);
