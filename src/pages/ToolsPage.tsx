import type { ComponentType } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { GreeksVisualizer } from '../components/tools/GreeksVisualizer';
import { LeverageCalc, OrderBookSim } from '../components/tools/MarketTools';
import { TimeDecayChart } from '../components/tools/OptionPlaygrounds';
import { PayoffBuilder } from '../components/tools/PayoffBuilder';
import { DrawdownRecovery, ExpectancySimulator, PositionSizeCalculator } from '../components/tools/RiskTools';
import { StrategyFinder } from '../components/tools/StrategyFinder';
import { Card } from '../components/ui';

interface ToolDef {
  id: string;
  title: string;
  icon: string;
  description: string;
  lesson: string;
  Component: ComponentType;
}

function PayoffBuilderRoute() {
  const [params] = useSearchParams();
  const s = params.get('s') ?? undefined;
  return <PayoffBuilder key={s} initialStrategy={s} />;
}

export const TOOLS: ToolDef[] = [
  {
    id: 'payoff',
    title: 'Payoff Builder',
    icon: '📈',
    description: 'สร้างสถานะ options หลาย leg ดูกราฟกำไร/ขาดทุน จุดคุ้มทุน และ Greeks',
    lesson: '/learn/options/strategy-workshop',
    Component: PayoffBuilderRoute,
  },
  {
    id: 'strategy-finder',
    title: 'Strategy Finder',
    icon: '🧭',
    description: 'เลือกมุมมองตลาดและ IV แล้วรับคำแนะนำกลยุทธ์ที่เหมาะ',
    lesson: '/learn/options/strategy-workshop',
    Component: StrategyFinder,
  },
  {
    id: 'greeks',
    title: 'Greeks Visualizer',
    icon: 'Δ',
    description: 'ปรับราคา, IV, เวลา แล้วดู Delta, Gamma, Theta, Vega เปลี่ยนแบบเรียลไทม์',
    lesson: '/learn/options/greeks',
    Component: GreeksVisualizer,
  },
  {
    id: 'position-size',
    title: 'Position Size Calculator',
    icon: '🧮',
    description: 'คำนวณจำนวนหุ้น/สัญญาที่เหมาะสมตามความเสี่ยงที่รับได้',
    lesson: '/learn/risk-management/position-sizing',
    Component: PositionSizeCalculator,
  },
  {
    id: 'time-decay',
    title: 'Time Decay',
    icon: '⏳',
    description: 'ดูมูลค่าเวลาของ option ITM/ATM/OTM ลดลงเมื่อใกล้หมดอายุ',
    lesson: '/learn/options/time-decay',
    Component: TimeDecayChart,
  },
  {
    id: 'expectancy',
    title: 'Expectancy Simulator',
    icon: '🎲',
    description: 'จำลอง equity curve จาก Win Rate, R:R และความเสี่ยงต่อไม้',
    lesson: '/learn/risk-management/expectancy',
    Component: ExpectancySimulator,
  },
  {
    id: 'drawdown',
    title: 'Drawdown & Recovery',
    icon: '📉',
    description: 'ขาดทุนเท่าไรต้องกำไรเท่าไรถึงจะกลับมา และผลของการแพ้ติดกัน',
    lesson: '/learn/risk-management/drawdown',
    Component: DrawdownRecovery,
  },
  {
    id: 'order-book',
    title: 'Order Book Simulator',
    icon: '📒',
    description: 'ส่ง Market/Limit order แล้วดูการจับคู่ และ slippage',
    lesson: '/learn/market-basics/order-types',
    Component: OrderBookSim,
  },
  {
    id: 'leverage',
    title: 'Leverage Calculator',
    icon: '⚖️',
    description: 'ผลของ leverage ต่อกำไร/ขาดทุน และจุด Margin Call',
    lesson: '/learn/market-basics/long-short-leverage',
    Component: LeverageCalc,
  },
];

export function ToolsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">🧰 เครื่องมือทั้งหมด</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">เครื่องมือจำลองทุกตัวจากบทเรียน เปิดใช้แยกได้</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <Link
            key={t.id}
            to={`/tools/${t.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-teal-500 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">{t.icon}</div>
            <div className="mt-2 font-semibold text-slate-900 dark:text-white">{t.title}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ToolPage() {
  const { toolId } = useParams();
  const tool = TOOLS.find((t) => t.id === toolId);
  if (!tool) return <Navigate to="/tools" replace />;
  const { Component } = tool;

  return (
    <div className="mx-auto max-w-6xl">
      <nav className="mb-3 text-sm text-slate-500">
        <Link to="/tools" className="hover:text-teal-700 dark:hover:text-teal-300">
          🧰 เครื่องมือ
        </Link>
        <span className="mx-1.5">›</span>
        {tool.title}
      </nav>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            <span className="text-teal-700 dark:text-teal-300">{tool.icon}</span> {tool.title}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">{tool.description}</p>
        </div>
        <Link to={tool.lesson} className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-300">
          📘 อ่านบทเรียนที่เกี่ยวข้อง →
        </Link>
      </div>
      <Card>
        <Component />
      </Card>
    </div>
  );
}
