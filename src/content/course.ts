import { MODULE1_LESSONS } from './module1';
import { MODULE2_LESSONS } from './module2';
import { MODULE3_LESSONS } from './module3';
import { MODULE4_LESSONS } from './module4';
import { MODULE6_LESSONS } from './module6';
import { MODULE7_LESSONS } from './module7';
import { OPTIONS_BASICS_LESSONS } from './optionsBasics';
import { OPTIONS_STRATEGY_LESSONS } from './optionsStrategies';
import type { Lesson, Module } from './types';

export const COURSE: Module[] = [
  {
    id: 'market-basics',
    num: 1,
    title: 'พื้นฐานตลาด',
    description: 'ประเภทสินทรัพย์, Bid/Ask, ประเภทคำสั่ง, Long/Short และ Leverage',
    icon: '🏛️',
    status: 'ready',
    phase: 1,
    lessons: MODULE1_LESSONS,
  },
  {
    id: 'trading-styles',
    num: 2,
    title: 'รูปแบบการเทรดตามกรอบเวลา',
    description: 'Scalping, Day Trading, Swing, Position และการลงทุนระยะยาว',
    icon: '⏱️',
    status: 'ready',
    phase: 2,
    lessons: MODULE2_LESSONS,
  },
  {
    id: 'analysis',
    num: 3,
    title: 'การวิเคราะห์',
    description: 'Technical, Indicators และ Fundamental เบื้องต้น',
    icon: '📊',
    status: 'ready',
    phase: 2,
    lessons: MODULE3_LESSONS,
  },
  {
    id: 'trading-strategies',
    num: 4,
    title: 'กลยุทธ์การเทรดทั่วไป',
    description: 'Trend Following, Breakout, Mean Reversion + Backtest Playground',
    icon: '🧭',
    status: 'ready',
    phase: 3,
    lessons: MODULE4_LESSONS,
  },
  {
    id: 'options',
    num: 5,
    title: 'Options',
    description: 'Call/Put, Greeks, IV, Time Decay และกลยุทธ์ 16 แบบ',
    icon: '🎯',
    status: 'ready',
    phase: 1,
    lessons: [...OPTIONS_BASICS_LESSONS, ...OPTIONS_STRATEGY_LESSONS],
  },
  {
    id: 'risk-management',
    num: 6,
    title: 'การบริหารความเสี่ยง',
    description: 'Risk per trade, Position Sizing, Expectancy และ Drawdown',
    icon: '🛡️',
    status: 'ready',
    phase: 1,
    lessons: MODULE6_LESSONS,
  },
  {
    id: 'psychology',
    num: 7,
    title: 'จิตวิทยาและวินัยการเทรด',
    description: 'FOMO, Revenge Trading, Trading Journal และ Trading Plan',
    icon: '🧠',
    status: 'ready',
    phase: 2,
    lessons: MODULE7_LESSONS,
  },
];

export const lessonKey = (moduleId: string, lessonId: string) => `${moduleId}/${lessonId}`;

export interface FlatLesson {
  module: Module;
  lesson: Lesson;
  key: string;
}

export const ALL_LESSONS: FlatLesson[] = COURSE.flatMap((m) =>
  m.lessons.map((lesson) => ({ module: m, lesson, key: lessonKey(m.id, lesson.id) })),
);

export function findLesson(moduleId: string, lessonId: string) {
  const idx = ALL_LESSONS.findIndex((l) => l.module.id === moduleId && l.lesson.id === lessonId);
  if (idx < 0) return null;
  return { ...ALL_LESSONS[idx], prev: ALL_LESSONS[idx - 1], next: ALL_LESSONS[idx + 1] };
}
