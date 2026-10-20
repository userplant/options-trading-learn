export type OptionType = 'call' | 'put';

export interface BSInput {
  type: OptionType;
  /** ราคาสินทรัพย์อ้างอิง */
  S: number;
  /** Strike price */
  K: number;
  /** เวลาถึงวันหมดอายุ (ปี) */
  T: number;
  /** อัตราดอกเบี้ยไร้ความเสี่ยง (ทศนิยม เช่น 0.04) */
  r: number;
  /** Volatility (ทศนิยม เช่น 0.3) */
  sigma: number;
}

export interface Greeks {
  price: number;
  delta: number;
  gamma: number;
  /** Theta ต่อวัน (calendar day) */
  theta: number;
  /** Vega ต่อ IV เปลี่ยน 1 จุด (1%) */
  vega: number;
  /** Rho ต่อดอกเบี้ยเปลี่ยน 1 จุด (1%) */
  rho: number;
}

/** Standard normal PDF */
export function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/** Standard normal CDF (Abramowitz & Stegun 26.2.17, error < 7.5e-8) */
export function normCdf(x: number): number {
  if (x < 0) return 1 - normCdf(-x);
  const t = 1 / (1 + 0.2316419 * x);
  const poly =
    t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return 1 - normPdf(x) * poly;
}

export function intrinsicValue(type: OptionType, S: number, K: number): number {
  return type === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0);
}

export function bsPrice(input: BSInput): number {
  return bsGreeks(input).price;
}

export function bsGreeks({ type, S, K, T, r, sigma }: BSInput): Greeks {
  if (T <= 0 || sigma <= 0) {
    const itm = type === 'call' ? S > K : S < K;
    return {
      price: intrinsicValue(type, S, K),
      delta: itm ? (type === 'call' ? 1 : -1) : 0,
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0,
    };
  }

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const disc = Math.exp(-r * T);
  const pdfD1 = normPdf(d1);

  const gamma = pdfD1 / (S * sigma * sqrtT);
  const vega = (S * pdfD1 * sqrtT) / 100;
  const decay = -(S * pdfD1 * sigma) / (2 * sqrtT);

  if (type === 'call') {
    return {
      price: S * normCdf(d1) - K * disc * normCdf(d2),
      delta: normCdf(d1),
      gamma,
      theta: (decay - r * K * disc * normCdf(d2)) / 365,
      vega,
      rho: (K * T * disc * normCdf(d2)) / 100,
    };
  }
  return {
    price: K * disc * normCdf(-d2) - S * normCdf(-d1),
    delta: normCdf(d1) - 1,
    gamma,
    theta: (decay + r * K * disc * normCdf(-d2)) / 365,
    vega,
    rho: (-K * T * disc * normCdf(-d2)) / 100,
  };
}

/**
 * ความน่าจะเป็นที่ราคา ณ วันหมดอายุจะต่ำกว่า x
 * (สมมติราคาเป็น lognormal ด้วย drift = r และ volatility = sigma)
 */
export function lognormalCdf(x: number, S: number, T: number, r: number, sigma: number): number {
  if (x <= 0) return 0;
  if (T <= 0 || sigma <= 0) return x >= S ? 1 : 0;
  const z = (Math.log(x / S) - (r - 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  return normCdf(z);
}
