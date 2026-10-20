import { describe, expect, it } from 'vitest';
import { aggregate, atr, bollinger, ema, findPivots, macd, rsi, sma, type Candle } from './indicators';
import { generateCandles, candlesFromKeypoints } from './marketData';
import { BT_STRATEGIES, DEFAULT_BT_OPTIONS, backtestStrategy, defaultParams, monteCarlo, percentile, runBacktest } from './backtest';
import { CHART_PATTERNS } from '../data/chartPatterns';

const flat = (closes: number[]): Candle[] => closes.map((c) => ({ o: c, h: c, l: c, c, v: 1 }));

describe('indicators', () => {
  it('sma / ema', () => {
    expect(sma([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4]);
    const e = ema([1, 2, 3, 4, 5], 3);
    expect(e[2]).toBeCloseTo(2);
    expect(e[3]).toBeCloseTo(3);
    expect(e[4]).toBeCloseTo(4);
  });

  it('rsi is 100 for straight gains and ~50 for alternating moves', () => {
    expect(rsi([1, 2, 3, 4, 5, 6], 3)[5]).toBe(100);
    const alt = Array.from({ length: 60 }, (_, i) => 100 + (i % 2));
    expect(rsi(alt, 14)[59]).toBeGreaterThan(40);
    expect(rsi(alt, 14)[59]).toBeLessThan(60);
  });

  it('bollinger bands are symmetric around the mean', () => {
    const b = bollinger([1, 2, 3, 4, 5], 5, 2);
    expect(b.mid[4]).toBe(3);
    expect(b.upper[4]! - 3).toBeCloseTo(3 - b.lower[4]!);
    expect(b.upper[4]! - 3).toBeCloseTo(2 * Math.sqrt(2));
  });

  it('macd histogram = macd − signal', () => {
    const closes = generateCandles({ bars: 120, seed: 3 }).map((c) => c.c);
    const m = macd(closes);
    const i = 100;
    expect(m.hist[i]).toBeCloseTo(m.macd[i]! - m.signal[i]!);
  });

  it('atr of constant-range candles equals the range', () => {
    const c = Array.from({ length: 30 }, () => ({ o: 10, h: 11, l: 9, c: 10, v: 1 }));
    expect(atr(c, 14)[29]).toBeCloseTo(2);
  });

  it('pivots and aggregation', () => {
    const c = flat([1, 2, 5, 2, 1, 0, 1]);
    const p = findPivots(c, 2);
    expect(p.find((x) => x.kind === 'high')?.i).toBe(2);
    const agg = aggregate(flat([1, 3, 2, 4]), 2);
    expect(agg).toHaveLength(2);
    expect(agg[0]).toMatchObject({ o: 1, h: 3, l: 1, c: 3 });
  });
});

describe('market data', () => {
  it('is deterministic per seed and internally consistent', () => {
    const a = generateCandles({ seed: 42, bars: 100 });
    const b = generateCandles({ seed: 42, bars: 100 });
    expect(a).toEqual(b);
    for (const c of a) {
      expect(c.h).toBeGreaterThanOrEqual(Math.max(c.o, c.c));
      expect(c.l).toBeLessThanOrEqual(Math.min(c.o, c.c));
    }
  });

  it('bull regime trends up, bear trends down on average', () => {
    let up = 0;
    for (let s = 1; s <= 10; s++) {
      const bull = generateCandles({ regime: 'bull', seed: s });
      const bear = generateCandles({ regime: 'bear', seed: s });
      if (bull[bull.length - 1].c > bear[bear.length - 1].c) up++;
    }
    expect(up).toBeGreaterThanOrEqual(9);
  });

  it('pattern templates produce candles following the keypoints', () => {
    for (const p of CHART_PATTERNS) {
      const c = candlesFromKeypoints(p.keypoints, 60, 1, 0.002);
      const last = p.keypoints[p.keypoints.length - 1][1] * 100;
      expect(Math.abs(c[c.length - 1].c - last) / last).toBeLessThan(0.03);
    }
  });
});

describe('backtest', () => {
  it('executes on the next bar open (no look-ahead)', () => {
    const c = flat([10, 10, 11, 12, 13, 12]);
    const entry = [false, true, false, false, false, false];
    const exit = [false, false, false, true, false, false];
    const r = runBacktest(c, entry, exit, { ...DEFAULT_BT_OPTIONS, stopType: 'none', commission: 0, slippagePct: 0 });
    expect(r.trades).toHaveLength(1);
    expect(r.trades[0]).toMatchObject({ entryIdx: 2, exitIdx: 4, entryPrice: 11, exitPrice: 13, reason: 'signal' });
    expect(r.stats.totalReturnPct).toBeCloseTo(((909 * 2) / 10000) * 100, 6);
  });

  it('stop loss fills at the stop, or at the open on a gap', () => {
    const c: Candle[] = [
      { o: 100, h: 100, l: 100, c: 100, v: 1 },
      { o: 100, h: 101, l: 99, c: 100, v: 1 },
      { o: 100, h: 100, l: 94, c: 95, v: 1 },
    ];
    const opts = { ...DEFAULT_BT_OPTIONS, stopType: 'percent' as const, stopValue: 5, commission: 0, slippagePct: 0 };
    const r = runBacktest(c, [true, false, false], [false, false, false], opts);
    expect(r.trades[0].reason).toBe('stop');
    expect(r.trades[0].exitPrice).toBeCloseTo(95);
    expect(r.trades[0].r).toBeCloseTo(-1);

    const gap: Candle[] = [...c.slice(0, 2), { o: 90, h: 91, l: 89, c: 90, v: 1 }];
    const g = runBacktest(gap, [true, false, false], [false, false, false], opts);
    expect(g.trades[0].exitPrice).toBeCloseTo(90);
  });

  it('risk sizing limits loss to riskPct of equity at the stop', () => {
    const c: Candle[] = [
      { o: 50, h: 50, l: 50, c: 50, v: 1 },
      { o: 50, h: 51, l: 49, c: 50, v: 1 },
      { o: 50, h: 50, l: 40, c: 41, v: 1 },
    ];
    const r = runBacktest(c, [true, false, false], [false, false, false], {
      ...DEFAULT_BT_OPTIONS, stopType: 'percent', stopValue: 10, sizing: 'risk', riskPct: 1, commission: 0, slippagePct: 0,
    });
    expect(r.trades[0].shares).toBe(20);
    expect(r.trades[0].pnl).toBeCloseTo(-100);
  });

  it('every strategy runs on every regime without NaN', () => {
    for (const regime of ['bull', 'bear', 'range', 'mixed', 'volatile'] as const) {
      const candles = generateCandles({ regime, seed: 5, bars: 300 });
      for (const s of BT_STRATEGIES) {
        const r = backtestStrategy(candles, s.id, defaultParams(s.id), DEFAULT_BT_OPTIONS);
        expect(Number.isFinite(r.stats.totalReturnPct)).toBe(true);
        expect(r.equity.every((e) => Number.isFinite(e) && e >= 0)).toBe(true);
      }
    }
  });

  it('monte carlo preserves the final result and varies drawdown', () => {
    const candles = generateCandles({ regime: 'mixed', seed: 9, bars: 500 });
    const r = backtestStrategy(candles, 'ma-cross', { fast: 10, slow: 30 }, DEFAULT_BT_OPTIONS);
    const mc = monteCarlo(r.trades, 100, 1);
    const product = r.trades.reduce((p, t) => p * (1 + t.equityReturn), 1);
    expect(mc.finals[0]).toBeCloseTo(product, 8);
    expect(percentile(mc.drawdowns, 95)).toBeGreaterThanOrEqual(percentile(mc.drawdowns, 5));
  });
});

describe('chart pattern labels', () => {
  it('mirrored patterns relabel support/resistance', () => {
    const desc = CHART_PATTERNS.find((p) => p.id === 'descending-triangle')!;
    expect(desc.lines.map((l) => l.label)).toEqual(['Support', 'Falling resistance']);
    const db = CHART_PATTERNS.find((p) => p.id === 'double-bottom')!;
    expect(db.lines[0].label).toBe('Support');
  });
});
