import { bsGreeks, lognormalCdf, type Greeks } from './blackScholes';

/** สัญญา options ในตลาดสหรัฐ 1 สัญญา = 100 หุ้น */
export const CONTRACT_SIZE = 100;

export type LegType = 'call' | 'put' | 'stock';

export interface Leg {
  id: string;
  type: LegType;
  /** 1 = Buy (Long), -1 = Sell (Short) */
  side: 1 | -1;
  /** จำนวนสัญญา (stock: 1 = 100 หุ้น) */
  qty: number;
  /** Strike (ไม่ใช้กับ stock) */
  strike: number;
  /** จำนวนวันถึงวันหมดอายุ (ไม่ใช้กับ stock) */
  days: number;
}

export interface Market {
  /** ราคาหุ้น ณ วันที่เปิดสถานะ */
  spot: number;
  /** Implied volatility (ทศนิยม) */
  iv: number;
  /** อัตราดอกเบี้ย (ทศนิยม) */
  rate: number;
}

const YEAR = 365;

/** ราคาต่อหุ้นของ leg ที่ราคาหุ้น S เมื่อเวลาผ่านไป elapsedDays วัน */
export function legUnitValue(leg: Leg, S: number, elapsedDays: number, iv: number, rate: number): number {
  if (leg.type === 'stock') return S;
  const T = Math.max(leg.days - elapsedDays, 0) / YEAR;
  return bsGreeks({ type: leg.type, S, K: leg.strike, T, r: rate, sigma: iv }).price;
}

/** ราคาต่อหุ้นที่จ่าย/ได้รับตอนเปิดสถานะ (premium หรือราคาหุ้น) */
export function legEntryPrice(leg: Leg, market: Market): number {
  return legUnitValue(leg, market.spot, 0, market.iv, market.rate);
}

/** เงินสดสุทธิตอนเปิดสถานะ: ค่าบวก = จ่ายออก (debit), ค่าลบ = ได้รับ (credit) */
export function netEntryCost(legs: Leg[], market: Market): number {
  return legs.reduce((sum, leg) => sum + leg.side * leg.qty * CONTRACT_SIZE * legEntryPrice(leg, market), 0);
}

/**
 * กำไร/ขาดทุน (ดอลลาร์) ของทั้งสถานะที่ราคาหุ้น S หลังเวลาผ่านไป elapsedDays วัน
 * ivShift = IV ที่เปลี่ยนไปจากตอนเปิดสถานะ (ทศนิยม)
 */
export function positionPnL(
  legs: Leg[],
  market: Market,
  S: number,
  elapsedDays: number,
  ivShift = 0,
): number {
  const iv = Math.max(market.iv + ivShift, 0.001);
  return legs.reduce((sum, leg) => {
    const entry = legEntryPrice(leg, market);
    const now = legUnitValue(leg, S, elapsedDays, iv, market.rate);
    return sum + leg.side * leg.qty * CONTRACT_SIZE * (now - entry);
  }, 0);
}

/** วันหมดอายุที่ใกล้ที่สุดในสถานะ (ใช้เป็นจุดวัด "ณ วันหมดอายุ") */
export function nearestExpiry(legs: Leg[]): number {
  const days = legs.filter((l) => l.type !== 'stock').map((l) => l.days);
  return days.length ? Math.min(...days) : 0;
}

export function positionGreeks(legs: Leg[], market: Market, S = market.spot, elapsedDays = 0): Greeks {
  const total: Greeks = { price: 0, delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
  for (const leg of legs) {
    const mult = leg.side * leg.qty * CONTRACT_SIZE;
    if (leg.type === 'stock') {
      total.delta += mult;
      continue;
    }
    const T = Math.max(leg.days - elapsedDays, 0) / YEAR;
    const g = bsGreeks({ type: leg.type, S, K: leg.strike, T, r: market.rate, sigma: market.iv });
    total.delta += g.delta * mult;
    total.gamma += g.gamma * mult;
    total.theta += g.theta * mult;
    total.vega += g.vega * mult;
    total.rho += g.rho * mult;
  }
  return total;
}

export interface PayoffStats {
  maxProfit: number;
  maxLoss: number;
  unlimitedProfit: boolean;
  unlimitedLoss: boolean;
  breakevens: number[];
  /** ความน่าจะเป็นโดยประมาณที่ ณ วันหมดอายุจะมีกำไร */
  probProfit: number;
}

/**
 * วิเคราะห์ payoff ณ วันหมดอายุที่ใกล้ที่สุด
 * ใช้ grid ละเอียดจาก 0 ถึง 4 เท่าของราคาสูงสุดที่เกี่ยวข้อง
 */
export function analyzePayoff(legs: Leg[], market: Market): PayoffStats {
  const expiry = nearestExpiry(legs);
  const strikes = legs.filter((l) => l.type !== 'stock').map((l) => l.strike);
  const hi = Math.max(market.spot, ...strikes) * 4;
  const steps = 4000;
  const dx = hi / steps;
  const pnlAt = (S: number) => positionPnL(legs, market, S, expiry);

  let maxProfit = -Infinity;
  let maxLoss = Infinity;
  const breakevens: number[] = [];
  let probProfit = 0;
  let prevS = 0;
  let prevP = pnlAt(0);
  maxProfit = Math.max(maxProfit, prevP);
  maxLoss = Math.min(maxLoss, prevP);

  const T = expiry / YEAR;
  let prevCdf = 0;
  for (let i = 1; i <= steps; i++) {
    const S = i * dx;
    const p = pnlAt(S);
    maxProfit = Math.max(maxProfit, p);
    maxLoss = Math.min(maxLoss, p);
    if ((prevP < 0 && p >= 0) || (prevP > 0 && p <= 0)) {
      const be = prevS + ((0 - prevP) / (p - prevP)) * (S - prevS);
      if (!breakevens.some((b) => Math.abs(b - be) < dx * 2)) breakevens.push(be);
    }
    const cdf = lognormalCdf(S, market.spot, T, market.rate, market.iv);
    if ((p + prevP) / 2 > 0) probProfit += cdf - prevCdf;
    prevCdf = cdf;
    prevS = S;
    prevP = p;
  }
  if (prevP > 0) probProfit += 1 - prevCdf;

  // ความชันที่ปลายขวา บอกว่ากำไร/ขาดทุนไม่จำกัดหรือไม่
  const slope = (pnlAt(hi) - pnlAt(hi - dx)) / dx;
  const unlimitedProfit = slope > 1e-6;
  const unlimitedLoss = slope < -1e-6;

  return {
    maxProfit,
    maxLoss,
    unlimitedProfit,
    unlimitedLoss,
    breakevens: breakevens.filter((b) => b > 0.01),
    probProfit: Math.min(Math.max(probProfit, 0), 1),
  };
}

/** ช่วงราคาที่เหมาะสำหรับแสดงกราฟ payoff */
export function chartRange(legs: Leg[], market: Market): [number, number] {
  const strikes = legs.filter((l) => l.type !== 'stock').map((l) => l.strike);
  const lo = Math.min(market.spot, ...strikes);
  const hi = Math.max(market.spot, ...strikes);
  const pad = Math.max((hi - lo) * 0.6, market.spot * 0.25);
  return [Math.max(lo - pad, 0), hi + pad];
}

export interface PayoffPoint {
  price: number;
  expiry: number;
  now: number;
}

export function payoffSeries(
  legs: Leg[],
  market: Market,
  elapsedDays: number,
  ivShift = 0,
  points = 121,
): PayoffPoint[] {
  const [lo, hi] = chartRange(legs, market);
  const expiry = nearestExpiry(legs);
  const step = (hi - lo) / (points - 1);
  return Array.from({ length: points }, (_, i) => {
    const price = lo + i * step;
    return {
      price: Math.round(price * 100) / 100,
      expiry: positionPnL(legs, market, price, expiry, ivShift),
      now: positionPnL(legs, market, price, Math.min(elapsedDays, expiry), ivShift),
    };
  });
}

let legCounter = 0;
export function newLegId(): string {
  legCounter += 1;
  return `leg-${Date.now().toString(36)}-${legCounter}`;
}
