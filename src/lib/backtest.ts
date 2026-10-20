import { atr, bollinger, ema, highestPrior, lowestPrior, roc, rsi, sma, type Candle, type Series } from './indicators';
import { maxDrawdownPct, seededRandom } from './risk';

export type StrategyId = 'ma-cross' | 'momentum' | 'breakout' | 'pullback' | 'rsi-reversion' | 'bb-reversion';

export interface ParamDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

/** เส้นที่วาดทับกราฟราคา (color = index ใน palette.series) */
export interface OverlayLine {
  label: string;
  values: Series;
  color: number;
  dash?: boolean;
}

/** กราฟ indicator แยกด้านล่าง */
export interface IndicatorPaneDef {
  title: string;
  lines: OverlayLine[];
  hist?: Series;
  hlines?: number[];
  domain?: [number, number];
}

export interface SignalResult {
  entry: boolean[];
  exit: boolean[];
  overlays: OverlayLine[];
  pane?: IndicatorPaneDef;
}

export interface StrategyDef {
  id: StrategyId;
  name: string;
  family: 'trend' | 'breakout' | 'reversion';
  entryRule: string;
  exitRule: string;
  params: ParamDef[];
  signals: (candles: Candle[], p: Record<string, number>) => SignalResult;
}

const closes = (c: Candle[]) => c.map((x) => x.c);
const crossAbove = (a: Series, b: Series, i: number) =>
  i > 0 && a[i] !== null && b[i] !== null && a[i - 1] !== null && b[i - 1] !== null && a[i - 1]! <= b[i - 1]! && a[i]! > b[i]!;

export const BT_STRATEGIES: StrategyDef[] = [
  {
    id: 'ma-cross',
    name: 'Moving Average Crossover',
    family: 'trend',
    entryRule: 'EMA เร็ว ตัดขึ้นเหนือ EMA ช้า (Golden Cross)',
    exitRule: 'EMA เร็ว ตัดลงใต้ EMA ช้า (Death Cross)',
    params: [
      { key: 'fast', label: 'EMA เร็ว', min: 5, max: 50, step: 1, default: 20 },
      { key: 'slow', label: 'EMA ช้า', min: 20, max: 200, step: 5, default: 50 },
    ],
    signals: (candles, p) => {
      const c = closes(candles);
      const f = ema(c, p.fast);
      const s = ema(c, p.slow);
      return {
        entry: c.map((_, i) => crossAbove(f, s, i)),
        exit: c.map((_, i) => crossAbove(s, f, i)),
        overlays: [
          { label: `EMA ${p.fast}`, values: f, color: 0 },
          { label: `EMA ${p.slow}`, values: s, color: 2 },
        ],
      };
    },
  },
  {
    id: 'momentum',
    name: 'Momentum (Rate of Change)',
    family: 'trend',
    entryRule: 'ราคาเปลี่ยนแปลงใน N แท่ง (ROC) ขึ้นเกินเกณฑ์',
    exitRule: 'ROC กลับมาต่ำกว่า 0 (โมเมนตัมหมด)',
    params: [
      { key: 'period', label: 'ROC ย้อนหลัง (แท่ง)', min: 10, max: 120, step: 5, default: 40 },
      { key: 'threshold', label: 'เกณฑ์เข้า (%)', min: 0, max: 20, step: 1, default: 5 },
    ],
    signals: (candles, p) => {
      const r = roc(closes(candles), p.period);
      const th: Series = r.map((v) => (v === null ? null : p.threshold));
      const zero: Series = r.map((v) => (v === null ? null : 0));
      return {
        entry: r.map((_, i) => crossAbove(r, th, i)),
        exit: r.map((_, i) => crossAbove(zero, r, i)),
        overlays: [],
        pane: {
          title: `ROC ${p.period}`,
          lines: [{ label: 'ROC %', values: r, color: 1 }],
          hlines: [0, p.threshold],
        },
      };
    },
  },
  {
    id: 'breakout',
    name: 'Donchian Breakout',
    family: 'breakout',
    entryRule: 'ราคาปิดทะลุ high สูงสุดของ N แท่งก่อนหน้า',
    exitRule: 'ราคาปิดหลุด low ต่ำสุดของ M แท่งก่อนหน้า',
    params: [
      { key: 'entryN', label: 'ช่องเข้า N แท่ง', min: 10, max: 100, step: 5, default: 20 },
      { key: 'exitN', label: 'ช่องออก M แท่ง', min: 5, max: 50, step: 5, default: 10 },
    ],
    signals: (candles, p) => {
      const hi = highestPrior(candles.map((x) => x.h), p.entryN);
      const lo = lowestPrior(candles.map((x) => x.l), p.exitN);
      return {
        entry: candles.map((x, i) => hi[i] !== null && x.c > hi[i]! && (i === 0 || hi[i - 1] === null || candles[i - 1].c <= hi[i - 1]!)),
        exit: candles.map((x, i) => lo[i] !== null && x.c < lo[i]!),
        overlays: [
          { label: `High ${p.entryN}`, values: hi, color: 0, dash: true },
          { label: `Low ${p.exitN}`, values: lo, color: 2, dash: true },
        ],
      };
    },
  },
  {
    id: 'pullback',
    name: 'Pullback in Trend',
    family: 'breakout',
    entryRule: 'อยู่ในขาขึ้น (เหนือ SMA ยาว) ราคาย่อลงแตะ EMA สั้น แล้วปิดกลับขึ้นเป็นแท่งเขียว',
    exitRule: 'ราคาปิดหลุด SMA ยาว (เทรนด์จบ)',
    params: [
      { key: 'trend', label: 'SMA เทรนด์', min: 50, max: 200, step: 10, default: 100 },
      { key: 'pb', label: 'EMA จุดย่อ', min: 5, max: 30, step: 1, default: 10 },
    ],
    signals: (candles, p) => {
      const c = closes(candles);
      const t = sma(c, p.trend);
      const e = ema(c, p.pb);
      return {
        entry: candles.map((x, i) => t[i] !== null && e[i] !== null && x.c > t[i]! && x.l <= e[i]! && x.c > e[i]! && x.c > x.o),
        exit: candles.map((x, i) => t[i] !== null && x.c < t[i]!),
        overlays: [
          { label: `SMA ${p.trend}`, values: t, color: 2 },
          { label: `EMA ${p.pb}`, values: e, color: 0 },
        ],
      };
    },
  },
  {
    id: 'rsi-reversion',
    name: 'RSI Mean Reversion',
    family: 'reversion',
    entryRule: 'RSI ต่ำกว่าระดับ Oversold',
    exitRule: 'RSI กลับขึ้นเหนือระดับออก',
    params: [
      { key: 'period', label: 'RSI period', min: 2, max: 21, step: 1, default: 7 },
      { key: 'lower', label: 'Oversold', min: 5, max: 40, step: 1, default: 30 },
      { key: 'exitLevel', label: 'ระดับออก', min: 40, max: 80, step: 1, default: 55 },
    ],
    signals: (candles, p) => {
      const r = rsi(closes(candles), p.period);
      return {
        entry: r.map((v) => v !== null && v < p.lower),
        exit: r.map((v) => v !== null && v > p.exitLevel),
        overlays: [],
        pane: {
          title: `RSI ${p.period}`,
          lines: [{ label: 'RSI', values: r, color: 1 }],
          hlines: [p.lower, p.exitLevel],
          domain: [0, 100],
        },
      };
    },
  },
  {
    id: 'bb-reversion',
    name: 'Bollinger Band Reversion',
    family: 'reversion',
    entryRule: 'ราคาปิดต่ำกว่า Bollinger Band ล่าง',
    exitRule: 'ราคาปิดกลับขึ้นเหนือเส้นกลาง (SMA)',
    params: [
      { key: 'period', label: 'BB period', min: 10, max: 50, step: 1, default: 20 },
      { key: 'mult', label: 'ส่วนเบี่ยงเบน (σ)', min: 1, max: 3, step: 0.1, default: 2 },
    ],
    signals: (candles, p) => {
      const bb = bollinger(closes(candles), p.period, p.mult);
      return {
        entry: candles.map((x, i) => bb.lower[i] !== null && x.c < bb.lower[i]!),
        exit: candles.map((x, i) => bb.mid[i] !== null && x.c > bb.mid[i]!),
        overlays: [
          { label: 'Upper', values: bb.upper, color: 3, dash: true },
          { label: 'Mid', values: bb.mid, color: 2 },
          { label: 'Lower', values: bb.lower, color: 3, dash: true },
        ],
      };
    },
  },
];

export const BT_MAP = Object.fromEntries(BT_STRATEGIES.map((s) => [s.id, s])) as Record<StrategyId, StrategyDef>;

export const defaultParams = (id: StrategyId) => Object.fromEntries(BT_MAP[id].params.map((p) => [p.key, p.default]));

export interface BacktestOptions {
  startEquity: number;
  stopType: 'none' | 'percent' | 'atr';
  /** % สำหรับ percent, จำนวนเท่าของ ATR(14) สำหรับ atr */
  stopValue: number;
  sizing: 'all-in' | 'risk';
  /** % ของพอร์ตที่ยอมเสี่ยงต่อไม้ (ใช้เมื่อ sizing = risk และมี stop) */
  riskPct: number;
  /** ค่าคอมมิชชั่นต่อครั้ง ($) */
  commission: number;
  /** slippage ต่อครั้ง (%) */
  slippagePct: number;
}

export const DEFAULT_BT_OPTIONS: BacktestOptions = {
  startEquity: 10000,
  stopType: 'percent',
  stopValue: 8,
  sizing: 'all-in',
  riskPct: 2,
  commission: 1,
  slippagePct: 0.05,
};

export interface Trade {
  entryIdx: number;
  exitIdx: number;
  entryPrice: number;
  exitPrice: number;
  shares: number;
  pnl: number;
  pnlPct: number;
  /** ผลตอบแทนเทียบกับพอร์ตตอนเข้า */
  equityReturn: number;
  /** กำไร/ขาดทุนเป็นเท่าของความเสี่ยงเริ่มต้น (มีเฉพาะเมื่อมี stop) */
  r: number | null;
  reason: 'signal' | 'stop' | 'end';
}

export interface BacktestStats {
  totalReturnPct: number;
  buyHoldPct: number;
  trades: number;
  winRate: number;
  avgWinPct: number;
  avgLossPct: number;
  profitFactor: number;
  maxDrawdownPct: number;
  buyHoldMaxDrawdownPct: number;
  exposurePct: number;
  avgBars: number;
  expectancyR: number | null;
  totalCosts: number;
}

export interface BacktestResult {
  trades: Trade[];
  equity: number[];
  stats: BacktestStats;
}

/**
 * Backtest แบบ long-only
 * สัญญาณเกิดตอนราคาปิดแท่ง i → ส่งคำสั่งที่ราคาเปิดแท่ง i+1 (ไม่ใช้ข้อมูลอนาคต)
 * Stop loss ตรวจระหว่างแท่ง: ถ้าเปิด gap ต่ำกว่า stop จะขายที่ราคาเปิด
 */
export function runBacktest(candles: Candle[], entry: boolean[], exit: boolean[], opts: BacktestOptions): BacktestResult {
  const n = candles.length;
  const atrS = atr(candles, 14);
  const slip = opts.slippagePct / 100;
  const trades: Trade[] = [];
  const equity: number[] = new Array(n).fill(opts.startEquity);

  let cash = opts.startEquity;
  let shares = 0;
  let entryPrice = 0;
  let entryIdx = -1;
  let stop = 0;
  let riskPerShare = 0;
  let equityAtEntry = 0;
  let barsIn = 0;
  let costs = 0;

  const close = (i: number, rawPrice: number, reason: Trade['reason']) => {
    const price = rawPrice * (1 - slip);
    costs += opts.commission + rawPrice * slip * shares;
    cash += shares * price - opts.commission;
    const pnl = cash - equityAtEntry;
    trades.push({
      entryIdx,
      exitIdx: i,
      entryPrice,
      exitPrice: price,
      shares,
      pnl,
      pnlPct: ((price - entryPrice) / entryPrice) * 100,
      equityReturn: pnl / equityAtEntry,
      r: riskPerShare > 0 ? pnl / (riskPerShare * shares) : null,
      reason,
    });
    shares = 0;
  };

  for (let i = 1; i < n; i++) {
    const bar = candles[i];

    if (shares > 0) {
      if (exit[i - 1]) close(i, bar.o, 'signal');
      else if (stop > 0 && bar.o <= stop) close(i, bar.o, 'stop');
    } else if (entry[i - 1]) {
      const raw = bar.o;
      const price = raw * (1 + slip);
      const a = atrS[i - 1];
      stop =
        opts.stopType === 'percent'
          ? price * (1 - opts.stopValue / 100)
          : opts.stopType === 'atr' && a !== null
            ? price - a * opts.stopValue
            : 0;
      riskPerShare = stop > 0 ? price - stop : 0;
      const affordable = Math.floor((cash - opts.commission) / price);
      const byRisk = riskPerShare > 0 ? Math.floor((cash * opts.riskPct) / 100 / riskPerShare) : affordable;
      const qty = Math.max(0, opts.sizing === 'risk' ? Math.min(byRisk, affordable) : affordable);
      if (qty > 0) {
        equityAtEntry = cash;
        shares = qty;
        entryPrice = price;
        entryIdx = i;
        cash -= qty * price + opts.commission;
        costs += opts.commission + raw * slip * qty;
      }
    }

    // stop ระหว่างแท่ง (รวมถึงแท่งที่เพิ่งเข้า)
    if (shares > 0 && stop > 0 && bar.l <= stop) close(i, Math.min(stop, bar.o), 'stop');

    if (shares > 0) barsIn++;
    equity[i] = cash + shares * bar.c;
  }
  if (shares > 0) {
    close(n - 1, candles[n - 1].c, 'end');
    equity[n - 1] = cash;
  }

  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);
  const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = -losses.reduce((s, t) => s + t.pnl, 0);
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const rs = trades.map((t) => t.r).filter((r): r is number => r !== null);
  const bh = candles.map((c) => c.c);

  return {
    trades,
    equity,
    stats: {
      totalReturnPct: (equity[n - 1] / opts.startEquity - 1) * 100,
      buyHoldPct: (candles[n - 1].c / candles[0].o - 1) * 100,
      trades: trades.length,
      winRate: trades.length ? (wins.length / trades.length) * 100 : 0,
      avgWinPct: avg(wins.map((t) => t.pnlPct)),
      avgLossPct: avg(losses.map((t) => t.pnlPct)),
      profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0,
      maxDrawdownPct: maxDrawdownPct(equity),
      buyHoldMaxDrawdownPct: maxDrawdownPct(bh),
      exposurePct: (barsIn / (n - 1)) * 100,
      avgBars: avg(trades.map((t) => t.exitIdx - t.entryIdx)),
      expectancyR: rs.length === trades.length && rs.length > 0 ? avg(rs) : null,
      totalCosts: costs,
    },
  };
}

export function backtestStrategy(candles: Candle[], id: StrategyId, params: Record<string, number>, opts: BacktestOptions) {
  const sig = BT_MAP[id].signals(candles, params);
  return { ...runBacktest(candles, sig.entry, sig.exit, opts), signals: sig };
}

export interface MonteCarloResult {
  finals: number[];
  drawdowns: number[];
  /** equity curve ตัวอย่างบางเส้น (หน่วย: เท่าของเงินต้น) */
  samples: number[][];
}

/** สลับลำดับผลการเทรดแบบสุ่ม เพื่อดูว่าลำดับแพ้/ชนะส่งผลต่อ drawdown แค่ไหน */
export function monteCarlo(trades: Trade[], runs = 300, seed = 1, sampleCount = 20): MonteCarloResult {
  const rand = seededRandom(seed);
  const rets = trades.map((t) => t.equityReturn);
  const finals: number[] = [];
  const drawdowns: number[] = [];
  const samples: number[][] = [];
  for (let k = 0; k < runs; k++) {
    const seq = [...rets];
    for (let i = seq.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [seq[i], seq[j]] = [seq[j], seq[i]];
    }
    const curve = [1];
    for (const r of seq) curve.push(curve[curve.length - 1] * (1 + r));
    finals.push(curve[curve.length - 1]);
    drawdowns.push(maxDrawdownPct(curve));
    if (k < sampleCount) samples.push(curve);
  }
  return { finals, drawdowns, samples };
}

export function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const idx = Math.min(s.length - 1, Math.max(0, Math.round((p / 100) * (s.length - 1))));
  return s[idx];
}
