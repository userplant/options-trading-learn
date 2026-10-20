import { MODULE1_LESSONS } from './module1';
import { MODULE6_LESSONS } from './module6';
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
    status: 'soon',
    phase: 2,
    lessons: [],
    upcoming: ['เปรียบเทียบแต่ละสไตล์: เวลา, ทุน, ค่าธรรมเนียม, ความเครียด', 'แบบทดสอบ "สไตล์ไหนเหมาะกับคุณ"', 'กฎ Pattern Day Trader (PDT) ของสหรัฐ'],
  },
  {
    id: 'analysis',
    num: 3,
    title: 'การวิเคราะห์',
    description: 'Technical, Indicators และ Fundamental เบื้องต้น',
    icon: '📊',
    status: 'soon',
    phase: 2,
    lessons: [],
    upcoming: ['กราฟแท่งเทียน, แนวรับแนวต้าน, Chart Patterns', 'MA/EMA, RSI, MACD, Bollinger Bands แบบปรับค่าได้', 'เกมทายรูปแบบกราฟ', 'P/E, EPS, งบการเงิน และปฏิทินเศรษฐกิจ'],
  },
  {
    id: 'trading-strategies',
    num: 4,
    title: 'กลยุทธ์การเทรดทั่วไป',
    description: 'Trend Following, Breakout, Mean Reversion, Momentum',
    icon: '🧭',
    status: 'soon',
    phase: 3,
    lessons: [],
    upcoming: ['Trend Following, Breakout, Pullback, Mean Reversion, Momentum, Range', 'Backtest Playground: ปรับพารามิเตอร์แล้วดู equity curve, win rate, drawdown'],
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
    status: 'soon',
    phase: 2,
    lessons: [],
    upcoming: ['FOMO, Revenge Trading, Overtrading, Confirmation Bias', 'สถานการณ์จำลอง: เลือกการตัดสินใจแล้วดูผลลัพธ์', 'เทมเพลต Trading Journal และ Trading Plan'],
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
