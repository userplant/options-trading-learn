import type { ComponentType } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { CandleAnatomy, IndicatorLab, PatternGame, TrendStructure, ValuationCalc } from '../components/tools/AnalysisTools';
import { BacktestPlayground, OverfitDemo } from '../components/tools/BacktestTools';
import { GreeksVisualizer } from '../components/tools/GreeksVisualizer';
import { LeverageCalc, OrderBookSim } from '../components/tools/MarketTools';
import { TimeDecayChart } from '../components/tools/OptionPlaygrounds';
import { PayoffBuilder } from '../components/tools/PayoffBuilder';
import { DrawdownRecovery, ExpectancySimulator, PositionSizeCalculator } from '../components/tools/RiskTools';
import { ScenarioGame, TradingJournal, TradingPlanBuilder } from '../components/tools/PsychTools';
import { StrategyFinder } from '../components/tools/StrategyFinder';
import { StyleQuiz, TimeframeZoom, TradingCostByStyle } from '../components/tools/StyleTools';
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
    id: 'backtest',
    title: 'Backtest Playground',
    icon: '🧪',
    description: 'ทดสอบ 6 กลยุทธ์บนข้อมูลจำลอง ดู equity curve, drawdown และ Monte Carlo',
    lesson: '/learn/trading-strategies/backtest-playground',
    Component: BacktestPlayground,
  },
  {
    id: 'indicator-lab',
    title: 'Indicator Lab',
    icon: '📊',
    description: 'กราฟแท่งเทียนพร้อม SMA, EMA, Bollinger, RSI, MACD ปรับค่าได้',
    lesson: '/learn/analysis/indicators',
    Component: () => <IndicatorLab initial={['sma', 'ema', 'rsi', 'macd']} />,
  },
  {
    id: 'journal',
    title: 'Trading Journal',
    icon: '📓',
    description: 'บันทึกการเทรด วิเคราะห์ expectancy แยกตาม setup และอารมณ์',
    lesson: '/learn/psychology/journal-plan',
    Component: TradingJournal,
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
  {
    id: 'pattern-game',
    title: 'เกมทายรูปแบบกราฟ',
    icon: '🎯',
    description: 'ดูกราฟที่ซ่อนช่วงทะลุไว้ แล้วทายว่าเป็น chart pattern อะไร',
    lesson: '/learn/analysis/chart-patterns',
    Component: PatternGame,
  },
  {
    id: 'trend-structure',
    title: 'Trend Structure',
    icon: '〽️',
    description: 'หา Swing high/low, ป้าย HH/HL/LH/LL และแนวรับแนวต้านอัตโนมัติ',
    lesson: '/learn/analysis/trend-support-resistance',
    Component: TrendStructure,
  },
  {
    id: 'candle-anatomy',
    title: 'Candle Anatomy',
    icon: '🕯️',
    description: 'ปรับ OHLC แล้วดูว่าแท่งเทียนเป็นรูปแบบอะไร',
    lesson: '/learn/analysis/candlesticks',
    Component: CandleAnatomy,
  },
  {
    id: 'valuation',
    title: 'Valuation Calculator',
    icon: '🏷️',
    description: 'P/E, Earnings Yield, PEG และประมาณผลตอบแทนจากการเติบโตของกำไร',
    lesson: '/learn/analysis/fundamentals',
    Component: ValuationCalc,
  },
  {
    id: 'overfit',
    title: 'Overfitting Demo',
    icon: '🔥',
    description: 'หาพารามิเตอร์ที่ดีที่สุดในอดีต แล้วดูว่ายังดีอยู่ไหมกับข้อมูลใหม่',
    lesson: '/learn/trading-strategies/backtest-pitfalls',
    Component: OverfitDemo,
  },
  {
    id: 'timeframe',
    title: 'Timeframe Zoom',
    icon: '🔍',
    description: 'ข้อมูลชุดเดียวกันในกรอบเวลา 15 นาที, 1 ชั่วโมง และ 1 วัน',
    lesson: '/learn/trading-styles/styles-timeframes',
    Component: TimeframeZoom,
  },
  {
    id: 'trading-cost',
    title: 'ต้นทุนตามสไตล์การเทรด',
    icon: '💸',
    description: 'ต้นทุน spread และค่าคอมต่อปีของ Scalping, Day, Swing, Position',
    lesson: '/learn/trading-styles/costs-rules',
    Component: TradingCostByStyle,
  },
  {
    id: 'style-quiz',
    title: 'สไตล์ไหนเหมาะกับคุณ',
    icon: '🧩',
    description: 'แบบทดสอบ 5 ข้อ หาสไตล์การเทรดที่เข้ากับเวลาและนิสัยของคุณ',
    lesson: '/learn/trading-styles/find-your-style',
    Component: StyleQuiz,
  },
  {
    id: 'scenarios',
    title: 'สถานการณ์จำลอง',
    icon: '🧠',
    description: 'ฝึกตัดสินใจใน 6 สถานการณ์ แล้วดูว่าอคติไหนกำลังทำงาน',
    lesson: '/learn/psychology/scenarios',
    Component: ScenarioGame,
  },
  {
    id: 'trading-plan',
    title: 'Trading Plan Builder',
    icon: '📝',
    description: 'เขียนแผนการเทรดของคุณ แล้วคัดลอกเป็น Markdown',
    lesson: '/learn/psychology/journal-plan',
    Component: TradingPlanBuilder,
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
