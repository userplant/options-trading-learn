import type { ComponentType } from 'react';
import type { QuizQuestion } from '../components/Quiz';

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  Body: ComponentType;
  quiz: QuizQuestion[];
}

export interface Module {
  id: string;
  num: number;
  title: string;
  description: string;
  icon: string;
  /** ready = เปิดให้เรียนแล้ว, soon = อยู่ในแผน (Phase ถัดไป) */
  status: 'ready' | 'soon';
  phase: number;
  lessons: Lesson[];
  /** หัวข้อที่จะมีใน Phase ถัดไป (แสดงเมื่อ status = soon) */
  upcoming?: string[];
}
