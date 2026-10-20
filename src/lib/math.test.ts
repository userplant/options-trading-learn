import { describe, expect, it } from 'vitest';
import { bsGreeks, normCdf } from './blackScholes';
import { analyzePayoff, netEntryCost, positionPnL, type Leg, type Market } from './payoff';
import { breakevenWinRate, drawdownAfterLosses, expectancyR, recoveryGainPct, stockPositionSize } from './risk';

const leg = (p: Partial<Leg>): Leg => ({ id: Math.random().toString(), type: 'call', side: 1, qty: 1, strike: 100, days: 30, ...p });
const mkt: Market = { spot: 100, iv: 0.3, rate: 0.04 };

describe('Black-Scholes', () => {
  it('normCdf', () => {
    expect(normCdf(0)).toBeCloseTo(0.5, 7);
    expect(normCdf(1.96)).toBeCloseTo(0.975, 3);
  });

  it('matches textbook values (S=K=100, T=1, r=5%, σ=20%)', () => {
    const base = { S: 100, K: 100, T: 1, r: 0.05, sigma: 0.2 };
    const c = bsGreeks({ type: 'call', ...base });
    const p = bsGreeks({ type: 'put', ...base });
    expect(c.price).toBeCloseTo(10.4506, 3);
    expect(p.price).toBeCloseTo(5.5735, 3);
    expect(c.delta).toBeCloseTo(0.6368, 3);
    expect(p.delta).toBeCloseTo(-0.3632, 3);
    expect(c.gamma).toBeCloseTo(0.01876, 4);
    expect(c.vega).toBeCloseTo(0.3752, 3);
  });

  it('satisfies put-call parity', () => {
    const base = { S: 105, K: 100, T: 0.25, r: 0.04, sigma: 0.35 };
    const c = bsGreeks({ type: 'call', ...base }).price;
    const p = bsGreeks({ type: 'put', ...base }).price;
    expect(c - p).toBeCloseTo(105 - 100 * Math.exp(-0.04 * 0.25), 6);
  });

  it('returns intrinsic value at expiry', () => {
    expect(bsGreeks({ type: 'call', S: 110, K: 100, T: 0, r: 0.04, sigma: 0.3 }).price).toBe(10);
    expect(bsGreeks({ type: 'put', S: 110, K: 100, T: 0, r: 0.04, sigma: 0.3 }).price).toBe(0);
  });
});

describe('payoff', () => {
  it('long call: limited loss = premium, unlimited profit, breakeven = K + premium', () => {
    const legs = [leg({})];
    const cost = netEntryCost(legs, mkt);
    const s = analyzePayoff(legs, mkt);
    expect(s.unlimitedProfit).toBe(true);
    expect(s.unlimitedLoss).toBe(false);
    expect(s.maxLoss).toBeCloseTo(-cost, 6);
    expect(s.breakevens).toHaveLength(1);
    expect(s.breakevens[0]).toBeCloseTo(100 + cost / 100, 1);
  });

  it('short call has unlimited loss', () => {
    const s = analyzePayoff([leg({ side: -1 })], mkt);
    expect(s.unlimitedLoss).toBe(true);
  });

  it('bull call spread: max profit + max loss = width × 100', () => {
    const legs = [leg({ strike: 100 }), leg({ strike: 110, side: -1 })];
    const s = analyzePayoff(legs, mkt);
    expect(s.unlimitedProfit || s.unlimitedLoss).toBe(false);
    expect(s.maxProfit - s.maxLoss).toBeCloseTo(1000, 1);
  });

  it('iron condor has two breakevens', () => {
    const legs = [
      leg({ type: 'put', strike: 85 }),
      leg({ type: 'put', strike: 90, side: -1 }),
      leg({ type: 'call', strike: 110, side: -1 }),
      leg({ type: 'call', strike: 115 }),
    ];
    const s = analyzePayoff(legs, mkt);
    expect(s.breakevens).toHaveLength(2);
    expect(s.probProfit).toBeGreaterThan(0.4);
    expect(s.probProfit).toBeLessThan(1);
  });

  it('P/L is zero at entry', () => {
    const legs = [leg({}), leg({ type: 'stock', side: -1 })];
    expect(positionPnL(legs, mkt, 100, 0)).toBeCloseTo(0, 8);
  });
});

describe('risk', () => {
  it('position size', () => {
    const r = stockPositionSize({ account: 10000, riskPct: 1, entry: 50, stop: 48 });
    expect(r?.shares).toBe(50);
    expect(r?.actualRisk).toBe(100);
  });

  it('expectancy and breakeven win rate', () => {
    expect(expectancyR(0.5, 2)).toBeCloseTo(0.5);
    expect(breakevenWinRate(2)).toBeCloseTo(1 / 3);
  });

  it('recovery and drawdown', () => {
    expect(recoveryGainPct(50)).toBeCloseTo(100);
    expect(drawdownAfterLosses(10, 1)).toBeCloseTo(10);
    expect(drawdownAfterLosses(2, 10)).toBeCloseTo(18.29, 1);
  });
});
