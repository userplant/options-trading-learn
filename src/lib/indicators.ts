export interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

/** ค่าที่ยังคำนวณไม่ได้ (ข้อมูลไม่พอ) เป็น null */
export type Series = (number | null)[];

export function sma(values: number[], period: number): Series {
  const out: Series = new Array(values.length).fill(null);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

/** EMA เริ่มต้นจาก SMA ของ period แรก */
export function ema(values: number[], period: number): Series {
  const out: Series = new Array(values.length).fill(null);
  if (values.length < period) return out;
  const k = 2 / (period + 1);
  let prev = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

/** RSI แบบ Wilder smoothing */
export function rsi(values: number[], period = 14): Series {
  const out: Series = new Array(values.length).fill(null);
  if (values.length <= period) return out;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = values[i] - values[i - 1];
    if (d > 0) gain += d;
    else loss -= d;
  }
  gain /= period;
  loss /= period;
  const calc = () => (loss === 0 ? 100 : 100 - 100 / (1 + gain / loss));
  out[period] = calc();
  for (let i = period + 1; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    gain = (gain * (period - 1) + Math.max(d, 0)) / period;
    loss = (loss * (period - 1) + Math.max(-d, 0)) / period;
    out[i] = calc();
  }
  return out;
}

export interface MacdResult {
  macd: Series;
  signal: Series;
  hist: Series;
}

export function macd(values: number[], fast = 12, slow = 26, signalPeriod = 9): MacdResult {
  const ef = ema(values, fast);
  const es = ema(values, slow);
  const line: Series = values.map((_, i) => (ef[i] !== null && es[i] !== null ? ef[i]! - es[i]! : null));
  const start = line.findIndex((v) => v !== null);
  const signal: Series = new Array(values.length).fill(null);
  if (start >= 0) {
    const sig = ema(line.slice(start) as number[], signalPeriod);
    sig.forEach((v, j) => (signal[start + j] = v));
  }
  const hist: Series = line.map((v, i) => (v !== null && signal[i] !== null ? v - signal[i]! : null));
  return { macd: line, signal, hist };
}

export interface BollingerResult {
  mid: Series;
  upper: Series;
  lower: Series;
}

export function bollinger(values: number[], period = 20, mult = 2): BollingerResult {
  const mid = sma(values, period);
  const upper: Series = new Array(values.length).fill(null);
  const lower: Series = new Array(values.length).fill(null);
  for (let i = period - 1; i < values.length; i++) {
    const m = mid[i]!;
    let v = 0;
    for (let j = i - period + 1; j <= i; j++) v += (values[j] - m) ** 2;
    const sd = Math.sqrt(v / period);
    upper[i] = m + mult * sd;
    lower[i] = m - mult * sd;
  }
  return { mid, upper, lower };
}

/** Average True Range แบบ Wilder */
export function atr(candles: Candle[], period = 14): Series {
  const out: Series = new Array(candles.length).fill(null);
  if (candles.length <= period) return out;
  const tr = candles.map((c, i) =>
    i === 0 ? c.h - c.l : Math.max(c.h - c.l, Math.abs(c.h - candles[i - 1].c), Math.abs(c.l - candles[i - 1].c)),
  );
  let prev = tr.slice(1, period + 1).reduce((a, b) => a + b, 0) / period;
  out[period] = prev;
  for (let i = period + 1; i < candles.length; i++) {
    prev = (prev * (period - 1) + tr[i]) / period;
    out[i] = prev;
  }
  return out;
}

/** ค่าสูงสุด/ต่ำสุดของ N แท่ง "ก่อนหน้า" (ไม่รวมแท่งปัจจุบัน) ใช้กับ Donchian breakout */
export function highestPrior(values: number[], period: number): Series {
  return values.map((_, i) => (i < period ? null : Math.max(...values.slice(i - period, i))));
}

export function lowestPrior(values: number[], period: number): Series {
  return values.map((_, i) => (i < period ? null : Math.min(...values.slice(i - period, i))));
}

/** Rate of change เป็น % เทียบกับ N แท่งก่อน */
export function roc(values: number[], period: number): Series {
  return values.map((v, i) => (i < period ? null : ((v - values[i - period]) / values[i - period]) * 100));
}

export interface Pivot {
  i: number;
  price: number;
  kind: 'high' | 'low';
}

/** Swing high/low: แท่งที่ high (low) สูงกว่า (ต่ำกว่า) ทุกแท่งในระยะ lookback ทั้งสองข้าง */
export function findPivots(candles: Candle[], lookback: number): Pivot[] {
  const pivots: Pivot[] = [];
  for (let i = lookback; i < candles.length - lookback; i++) {
    let isHigh = true;
    let isLow = true;
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j === i) continue;
      if (candles[j].h >= candles[i].h) isHigh = false;
      if (candles[j].l <= candles[i].l) isLow = false;
    }
    if (isHigh) pivots.push({ i, price: candles[i].h, kind: 'high' });
    if (isLow) pivots.push({ i, price: candles[i].l, kind: 'low' });
  }
  return pivots;
}

/** รวมแท่งเทียนทีละ n แท่งเป็นแท่งเดียว (เปลี่ยน timeframe) */
export function aggregate(candles: Candle[], n: number): Candle[] {
  const out: Candle[] = [];
  for (let i = 0; i < candles.length; i += n) {
    const g = candles.slice(i, i + n);
    out.push({
      o: g[0].o,
      h: Math.max(...g.map((c) => c.h)),
      l: Math.min(...g.map((c) => c.l)),
      c: g[g.length - 1].c,
      v: g.reduce((s, c) => s + c.v, 0),
    });
  }
  return out;
}
