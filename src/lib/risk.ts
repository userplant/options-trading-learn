export interface StockSizeInput {
  account: number;
  riskPct: number;
  entry: number;
  stop: number;
}

export interface StockSizeResult {
  riskAmount: number;
  riskPerShare: number;
  shares: number;
  positionValue: number;
  pctOfAccount: number;
  /** ขาดทุนจริงถ้าโดน stop (หลังปัดจำนวนหุ้นลง) */
  actualRisk: number;
}

export function stockPositionSize({ account, riskPct, entry, stop }: StockSizeInput): StockSizeResult | null {
  const riskPerShare = Math.abs(entry - stop);
  if (account <= 0 || entry <= 0 || riskPerShare <= 0 || riskPct <= 0) return null;
  const riskAmount = (account * riskPct) / 100;
  const shares = Math.floor(riskAmount / riskPerShare);
  const positionValue = shares * entry;
  return {
    riskAmount,
    riskPerShare,
    shares,
    positionValue,
    pctOfAccount: (positionValue / account) * 100,
    actualRisk: shares * riskPerShare,
  };
}

/** จำนวนสัญญา options สูงสุดเมื่อรู้ขาดทุนสูงสุดต่อสัญญา (ดอลลาร์) */
export function optionContracts(account: number, riskPct: number, maxLossPerContract: number): number {
  if (account <= 0 || riskPct <= 0 || maxLossPerContract <= 0) return 0;
  return Math.floor((account * riskPct) / 100 / maxLossPerContract);
}

/** Expectancy ในหน่วย R: winRate (0-1), avgWinR = กำไรเฉลี่ยเป็นกี่เท่าของความเสี่ยง */
export function expectancyR(winRate: number, avgWinR: number, avgLossR = 1): number {
  return winRate * avgWinR - (1 - winRate) * avgLossR;
}

/** Win rate ขั้นต่ำที่ทำให้ expectancy = 0 */
export function breakevenWinRate(rewardRisk: number): number {
  return 1 / (1 + rewardRisk);
}

/** ต้องกำไรกี่ % เพื่อกลับมาเท่าทุนหลังขาดทุน lossPct % */
export function recoveryGainPct(lossPct: number): number {
  if (lossPct >= 100) return Infinity;
  return (lossPct / (100 - lossPct)) * 100;
}

/** Drawdown หลังแพ้ติดกัน n ครั้ง โดยเสี่ยง riskPct % ของพอร์ตปัจจุบันทุกครั้ง */
export function drawdownAfterLosses(riskPct: number, n: number): number {
  return (1 - Math.pow(1 - riskPct / 100, n)) * 100;
}

/** Pseudo-random ที่กำหนด seed ได้ (mulberry32) ให้ผลการจำลองคงที่เมื่อใช้ seed เดิม */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** จำลอง equity curve: เสี่ยง riskPct % ของพอร์ตปัจจุบันต่อไม้ */
export function simulateEquity(
  start: number,
  trades: number,
  winRate: number,
  rewardRisk: number,
  riskPct: number,
  rand: () => number,
): number[] {
  const curve = [start];
  let equity = start;
  for (let i = 0; i < trades; i++) {
    const risk = (equity * riskPct) / 100;
    equity += rand() < winRate ? risk * rewardRisk : -risk;
    curve.push(Math.max(equity, 0));
  }
  return curve;
}

export function maxDrawdownPct(curve: number[]): number {
  let peak = curve[0];
  let maxDd = 0;
  for (const v of curve) {
    peak = Math.max(peak, v);
    if (peak > 0) maxDd = Math.max(maxDd, ((peak - v) / peak) * 100);
  }
  return maxDd;
}
