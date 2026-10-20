const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const fmtUsd = (v: number, digits = 2) => (digits === 0 ? usd0 : usd).format(v);

export const fmtSignedUsd = (v: number, digits = 2) => (v > 0 ? '+' : v < 0 ? '−' : '') + fmtUsd(Math.abs(v), digits);

export const fmtNum = (v: number, digits = 2) =>
  v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtPct = (v: number, digits = 1) => `${fmtNum(v, digits)}%`;
