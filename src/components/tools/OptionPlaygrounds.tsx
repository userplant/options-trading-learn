import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { bsGreeks, intrinsicValue, type OptionType } from '../../lib/blackScholes';
import { fmtNum, fmtSignedUsd, fmtUsd } from '../../lib/format';
import { analyzePayoff, newLegId, payoffSeries, type Leg, type Market } from '../../lib/payoff';
import { tooltipStyle, useTheme } from '../../lib/theme';
import { PayoffChart } from '../charts/PayoffChart';
import { Segmented, Slider, Stat } from '../ui';

/** บทที่ 5.1: ซื้อ/ขาย Call/Put ขาเดียว */
export function SingleOptionPlayground() {
  const [type, setType] = useState<OptionType>('call');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [strike, setStrike] = useState(100);
  const [iv, setIv] = useState(30);
  const market: Market = useMemo(() => ({ spot: 100, iv: iv / 100, rate: 0.04 }), [iv]);
  const legs: Leg[] = useMemo(
    () => [{ id: newLegId(), type, side: side === 'buy' ? 1 : -1, qty: 1, strike, days: 30 }],
    [type, side, strike],
  );
  const data = useMemo(() => payoffSeries(legs, market, 0, 0, 101), [legs, market]);
  const stats = useMemo(() => analyzePayoff(legs, market), [legs, market]);
  const premium = bsGreeks({ type, S: 100, K: strike, T: 30 / 365, r: 0.04, sigma: iv / 100 }).price;

  const story =
    side === 'buy'
      ? type === 'call'
        ? `คุณจ่าย ${fmtUsd(premium * 100, 0)} เพื่อได้ "สิทธิซื้อ" หุ้น 100 หุ้นที่ราคา $${strike} ถ้าหุ้นขึ้นเกิน $${fmtNum(strike + premium)} คุณกำไร ถ้าไม่ขึ้นเสียแค่ค่า premium`
        : `คุณจ่าย ${fmtUsd(premium * 100, 0)} เพื่อได้ "สิทธิขาย" หุ้น 100 หุ้นที่ราคา $${strike} ถ้าหุ้นลงต่ำกว่า $${fmtNum(strike - premium)} คุณกำไร`
      : type === 'call'
        ? `คุณรับ ${fmtUsd(premium * 100, 0)} แต่มี "ภาระ" ต้องขายหุ้นที่ $${strike} ถ้าผู้ซื้อใช้สิทธิ ถ้าหุ้นพุ่งแรง ขาดทุนไม่จำกัด!`
        : `คุณรับ ${fmtUsd(premium * 100, 0)} แต่มี "ภาระ" ต้องซื้อหุ้นที่ $${strike} ถ้าผู้ซื้อใช้สิทธิ ถ้าหุ้นร่วงแรงจะขาดทุนมาก`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Segmented
          value={side}
          onChange={setSide}
          options={[
            { value: 'buy', label: 'ซื้อ (Buy / Long)' },
            { value: 'sell', label: 'ขาย (Sell / Short)' },
          ]}
        />
        <Segmented
          value={type}
          onChange={setType}
          options={[
            { value: 'call', label: 'Call' },
            { value: 'put', label: 'Put' },
          ]}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Strike" value={strike} min={80} max={120} format={(v) => fmtUsd(v, 0)} onChange={setStrike} />
        <Slider label="IV (ความผันผวน → ราคา premium)" value={iv} min={10} max={80} format={(v) => `${v}%`} onChange={setIv} />
      </div>
      <p className="rounded-xl bg-white p-3 text-sm dark:bg-slate-950/60">{story}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Premium / หุ้น" value={fmtUsd(premium)} sub={`= ${fmtUsd(premium * 100, 0)} ต่อสัญญา`} />
        <Stat label="กำไรสูงสุด" value={stats.unlimitedProfit ? 'ไม่จำกัด' : fmtSignedUsd(stats.maxProfit, 0)} tone="profit" />
        <Stat label="ขาดทุนสูงสุด" value={stats.unlimitedLoss ? 'ไม่จำกัด' : fmtSignedUsd(stats.maxLoss, 0)} tone="loss" />
        <Stat label="จุดคุ้มทุน" value={stats.breakevens.map((b) => `$${fmtNum(b)}`).join(', ') || '—'} />
      </div>
      <PayoffChart data={data} spot={100} breakevens={stats.breakevens} showNow={false} height={260} />
    </div>
  );
}

/** บทที่ 5.2: ITM/ATM/OTM และ Intrinsic vs Time Value */
export function MoneynessExplorer() {
  const { palette } = useTheme();
  const [S, setS] = useState(105);
  const [days, setDays] = useState(30);
  const K = 100;
  const iv = 0.3;

  const rows = (['call', 'put'] as OptionType[]).map((type) => {
    const price = bsGreeks({ type, S, K, T: days / 365, r: 0.04, sigma: iv }).price;
    const intrinsic = intrinsicValue(type, S, K);
    const status = Math.abs(S - K) < 0.5 ? 'ATM' : (type === 'call' ? S > K : S < K) ? 'ITM' : 'OTM';
    return { name: type === 'call' ? `Call $${K}` : `Put $${K}`, intrinsic, time: Math.max(price - intrinsic, 0), price, status };
  });

  const statusTone: Record<string, string> = {
    ITM: 'text-emerald-600 dark:text-emerald-400',
    ATM: 'text-amber-600 dark:text-amber-400',
    OTM: 'text-rose-600 dark:text-rose-400',
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="ราคาหุ้นปัจจุบัน" value={S} min={80} max={120} format={(v) => fmtUsd(v, 0)} onChange={setS} />
        <Slider label="วันถึงหมดอายุ" value={days} min={0} max={120} format={(v) => `${v} วัน`} onChange={setDays} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.name} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{r.name}</span>
              <span className={`font-mono text-lg font-bold ${statusTone[r.status]}`}>{r.status}</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-slate-500">Premium</div>
                <div className="num font-mono text-sm font-semibold">{fmtUsd(r.price)}</div>
              </div>
              <div>
                <div className="text-slate-500">Intrinsic</div>
                <div className="num font-mono text-sm font-semibold" style={{ color: palette.series[0] }}>
                  {fmtUsd(r.intrinsic)}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Time Value</div>
                <div className="num font-mono text-sm font-semibold" style={{ color: palette.series[1] }}>
                  {fmtUsd(r.time)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ left: 10, right: 16 }}>
            <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fill: palette.axis, fontSize: 11 }} stroke={palette.grid} tickFormatter={(v) => `$${v}`} domain={[0, 'auto']} />
            <YAxis type="category" dataKey="name" tick={{ fill: palette.axis, fontSize: 12 }} stroke={palette.grid} width={70} />
            <Tooltip {...tooltipStyle(palette)} formatter={(v, n) => [fmtUsd(Number(v)), String(n)]} cursor={{ fill: palette.grid, opacity: 0.4 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="intrinsic" name="Intrinsic Value" stackId="a" fill={palette.series[0]} isAnimationActive={false} />
            <Bar dataKey="time" name="Time Value" stackId="a" fill={palette.series[1]} radius={[0, 6, 6, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** บทที่ 5.5: Time Decay */
export function TimeDecayChart() {
  const { palette } = useTheme();
  const [iv, setIv] = useState(30);
  const [offset, setOffset] = useState(10);
  const K = 100;

  const data = useMemo(
    () =>
      Array.from({ length: 91 }, (_, i) => {
        const d = 90 - i;
        const T = d / 365;
        const sigma = iv / 100;
        return {
          days: d,
          atm: bsGreeks({ type: 'call', S: K, K, T, r: 0.04, sigma }).price,
          otm: bsGreeks({ type: 'call', S: K, K: K + offset, T, r: 0.04, sigma }).price,
          itm: bsGreeks({ type: 'call', S: K, K: K - offset, T, r: 0.04, sigma }).price - offset,
        };
      }),
    [iv, offset],
  );

  const at = (d: number) => data.find((x) => x.days === d)!;
  const loss30to20 = at(30).atm - at(20).atm;
  const loss10to0 = at(10).atm - at(0).atm;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="IV" value={iv} min={10} max={80} format={(v) => `${v}%`} onChange={setIv} />
        <Slider label="ระยะห่าง strike ของ ITM/OTM" value={offset} min={2} max={25} format={(v) => `±$${v}`} onChange={setOffset} />
      </div>
      <div className="h-72 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 16 }}>
            <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="days"
              reversed
              tick={{ fill: palette.axis, fontSize: 11 }}
              stroke={palette.grid}
              label={{ value: 'วันถึงหมดอายุ (เวลาเดินจากซ้ายไปขวา)', position: 'insideBottom', offset: -10, fill: palette.axis, fontSize: 12 }}
            />
            <YAxis tick={{ fill: palette.axis, fontSize: 11 }} stroke={palette.grid} width={44} tickFormatter={(v) => `$${v}`} />
            <Tooltip {...tooltipStyle(palette)} labelFormatter={(v) => `เหลือ ${v} วัน`} formatter={(v, n) => [fmtUsd(Number(v)), String(n)]} />
            <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12 }} />
            <Line dataKey="atm" name="ATM Call: Time Value" stroke={palette.series[0]} strokeWidth={3} dot={false} isAnimationActive={false} />
            <Line dataKey="otm" name={`OTM Call ($${K + offset})`} stroke={palette.series[2]} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="itm" name={`ITM Call ($${K - offset}): Time Value`} stroke={palette.series[1]} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Stat label="ATM เสียมูลค่าช่วงวันที่ 30 → 20" value={fmtUsd(loss30to20)} sub="10 วัน" />
        <Stat label="ATM เสียมูลค่าช่วงวันที่ 10 → 0" value={fmtUsd(loss10to0)} tone="loss" sub={`10 วันเท่ากัน แต่เสียมากกว่า ${fmtNum(loss10to0 / loss30to20, 1)} เท่า`} />
      </div>
    </div>
  );
}

/** บทที่ 5.3: ปัจจัยที่กำหนดราคา option */
export function PricingFactors() {
  const [S, setS] = useState(100);
  const [K, setK] = useState(100);
  const [days, setDays] = useState(30);
  const [iv, setIv] = useState(30);
  const [rate, setRate] = useState(4);
  const base = { S, K, T: days / 365, r: rate / 100, sigma: iv / 100 };
  const call = bsGreeks({ type: 'call', ...base });
  const put = bsGreeks({ type: 'put', ...base });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Slider label="ราคาหุ้น (S)" value={S} min={60} max={140} format={(v) => fmtUsd(v, 0)} onChange={setS} />
        <Slider label="Strike (K)" value={K} min={60} max={140} format={(v) => fmtUsd(v, 0)} onChange={setK} />
        <Slider label="วันถึงหมดอายุ (T)" value={days} min={0} max={365} format={(v) => `${v} วัน`} onChange={setDays} />
        <Slider label="Implied Volatility (σ)" value={iv} min={5} max={120} format={(v) => `${v}%`} onChange={setIv} />
        <Slider label="อัตราดอกเบี้ย (r)" value={rate} min={0} max={10} step={0.25} format={(v) => `${v}%`} onChange={setRate} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="text-sm text-slate-600 dark:text-slate-400">Call ${K}</div>
          <div className="num font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-300">{fmtUsd(call.price)}</div>
          <div className="text-xs text-slate-500">{fmtUsd(call.price * 100, 0)} / สัญญา</div>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center dark:border-rose-900 dark:bg-rose-950/30">
          <div className="text-sm text-slate-600 dark:text-slate-400">Put ${K}</div>
          <div className="num font-mono text-2xl font-bold text-rose-700 dark:text-rose-300">{fmtUsd(put.price)}</div>
          <div className="text-xs text-slate-500">{fmtUsd(put.price * 100, 0)} / สัญญา</div>
        </div>
      </div>
    </div>
  );
}
