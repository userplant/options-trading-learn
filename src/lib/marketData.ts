import type { Candle } from './indicators';
import { seededRandom } from './risk';

export type Regime = 'bull' | 'bear' | 'range' | 'mixed' | 'volatile';

export const REGIME_LABEL: Record<Regime, string> = {
  bull: 'ขาขึ้น',
  bear: 'ขาลง',
  range: 'ออกข้าง (Sideway)',
  mixed: 'ผสม (เปลี่ยนสภาพตลาด)',
  volatile: 'ผันผวนสูง',
};

/** สุ่มค่าแจกแจงปกติมาตรฐาน (Box-Muller) */
export function gaussian(rand: () => number): number {
  const u = Math.max(rand(), 1e-12);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** สร้างแท่งเทียนจากเส้นทางราคาย่อยภายในแท่ง */
function candleFromPath(path: number[], rand: () => number, baseVol: number): Candle {
  const o = path[0];
  const c = path[path.length - 1];
  const h = Math.max(...path);
  const l = Math.min(...path);
  const move = Math.abs(c - o) / o;
  return { o, h, l, c, v: Math.round(baseVol * (0.6 + rand() * 0.8) * (1 + move * 40)) };
}

interface GenOptions {
  bars?: number;
  start?: number;
  regime?: Regime;
  seed?: number;
  /** volatility รายแท่ง (ทศนิยม) */
  vol?: number;
}

/**
 * สร้างข้อมูลราคาจำลองแบบ seeded (ผลเหมือนเดิมทุกครั้งเมื่อใช้ seed เดิม)
 * - bull/bear: random walk ที่มี drift
 * - range: mean-reverting รอบราคาเริ่มต้น
 * - mixed: สลับ regime ทุกๆ ช่วง
 */
export function generateCandles({ bars = 250, start = 100, regime = 'mixed', seed = 1, vol = 0.015 }: GenOptions = {}): Candle[] {
  const rand = seededRandom(seed);
  const candles: Candle[] = [];
  let price = start;
  let anchor = start;
  let current: Exclude<Regime, 'mixed'> = regime === 'mixed' ? 'bull' : regime;
  let regimeLeft = 60 + Math.floor(rand() * 60);
  const steps = 6;

  for (let b = 0; b < bars; b++) {
    if (regime === 'mixed' && --regimeLeft <= 0) {
      const options: Exclude<Regime, 'mixed'>[] = ['bull', 'bear', 'range', 'bull'];
      current = options[Math.floor(rand() * options.length)];
      regimeLeft = 50 + Math.floor(rand() * 70);
      anchor = price;
    }
    const v = current === 'volatile' ? vol * 2.2 : vol;
    const drift = current === 'bull' ? 0.0018 : current === 'bear' ? -0.0018 : 0;
    const pull = current === 'range' ? 0.12 : current === 'volatile' ? 0.03 : 0;

    // gap เล็กน้อยระหว่างวัน
    const open = price * (1 + gaussian(rand) * v * 0.15);
    const path = [open];
    let p = open;
    for (let s = 0; s < steps; s++) {
      const meanRev = pull * Math.log(anchor / p);
      p *= Math.exp((drift + meanRev) / steps + (gaussian(rand) * v) / Math.sqrt(steps));
      path.push(p);
    }
    candles.push(candleFromPath(path, rand, 1_000_000));
    price = p;
  }
  return candles;
}

/** สร้างแท่งเทียนจากจุดสำคัญของรูปแบบราคา (ใช้กับ chart patterns) */
export function candlesFromKeypoints(
  keypoints: [number, number][],
  bars: number,
  seed: number,
  noise = 0.006,
  base = 100,
): Candle[] {
  const rand = seededRandom(seed);
  const at = (t: number) => {
    for (let k = 1; k < keypoints.length; k++) {
      const [t0, p0] = keypoints[k - 1];
      const [t1, p1] = keypoints[k];
      if (t <= t1) return p0 + ((p1 - p0) * (t - t0)) / (t1 - t0 || 1);
    }
    return keypoints[keypoints.length - 1][1];
  };
  const steps = 4;
  const candles: Candle[] = [];
  let prev = base * at(0);
  for (let b = 0; b < bars; b++) {
    const path = [prev];
    for (let s = 1; s <= steps; s++) {
      const t = (b + s / steps) / bars;
      path.push(base * at(t) * (1 + gaussian(rand) * noise));
    }
    candles.push(candleFromPath(path, rand, 1_000_000));
    prev = path[path.length - 1];
  }
  return candles;
}
