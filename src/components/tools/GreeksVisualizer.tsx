import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { bsGreeks, type Greeks, type OptionType } from '../../lib/blackScholes';
import { fmtNum, fmtUsd } from '../../lib/format';
import { tooltipStyle, useTheme } from '../../lib/theme';
import { Segmented, Slider, Stat } from '../ui';

type GreekKey = keyof Greeks;

const GREEK_INFO: Record<GreekKey, { label: string; desc: string; digits: number }> = {
  price: { label: 'ราคา Option', desc: 'ราคาทฤษฎีต่อหุ้นจาก Black-Scholes', digits: 2 },
  delta: { label: 'Delta', desc: 'ราคา option เปลี่ยนเท่าไรเมื่อหุ้นขึ้น $1', digits: 3 },
  gamma: { label: 'Gamma', desc: 'Delta เปลี่ยนเท่าไรเมื่อหุ้นขึ้น $1', digits: 4 },
  theta: { label: 'Theta', desc: 'ราคา option เปลี่ยนเท่าไรต่อ 1 วันที่ผ่านไป', digits: 3 },
  vega: { label: 'Vega', desc: 'ราคา option เปลี่ยนเท่าไรเมื่อ IV เพิ่ม 1%', digits: 3 },
  rho: { label: 'Rho', desc: 'ราคา option เปลี่ยนเท่าไรเมื่อดอกเบี้ยเพิ่ม 1%', digits: 3 },
};

const COMPARE_DAYS = [60, 30, 7];

export function GreeksVisualizer({ initialGreek = 'delta' as GreekKey }: { initialGreek?: GreekKey }) {
  const { palette } = useTheme();
  const [type, setType] = useState<OptionType>('call');
  const [S, setS] = useState(100);
  const [K, setK] = useState(100);
  const [iv, setIv] = useState(30);
  const [days, setDays] = useState(30);
  const [greek, setGreek] = useState<GreekKey>(initialGreek);
  const r = 0.04;

  const g = bsGreeks({ type, S, K, T: days / 365, r, sigma: iv / 100 });

  const data = useMemo(() => {
    const lo = K * 0.6;
    const hi = K * 1.4;
    return Array.from({ length: 81 }, (_, i) => {
      const price = lo + ((hi - lo) * i) / 80;
      const row: Record<string, number> = { price: Math.round(price * 100) / 100 };
      for (const d of COMPARE_DAYS) {
        row[`d${d}`] = bsGreeks({ type, S: price, K, T: d / 365, r, sigma: iv / 100 })[greek];
      }
      row.current = bsGreeks({ type, S: price, K, T: days / 365, r, sigma: iv / 100 })[greek];
      return row;
    });
  }, [type, K, iv, greek, days]);

  const info = GREEK_INFO[greek];
  const moneyness = Math.abs(S - K) < K * 0.01 ? 'ATM' : (type === 'call' ? S > K : S < K) ? 'ITM' : 'OTM';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          value={type}
          onChange={setType}
          options={[
            { value: 'call', label: 'Call' },
            { value: 'put', label: 'Put' },
          ]}
        />
        <span className="text-sm text-slate-500">
          สถานะ: <strong className="text-slate-900 dark:text-white">{moneyness}</strong>
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Slider label="ราคาหุ้น (S)" value={S} min={50} max={150} format={(v) => fmtUsd(v, 0)} onChange={setS} />
        <Slider label="Strike (K)" value={K} min={70} max={130} format={(v) => fmtUsd(v, 0)} onChange={setK} />
        <Slider label="IV" value={iv} min={5} max={100} format={(v) => `${v}%`} onChange={setIv} />
        <Slider label="วันถึงหมดอายุ" value={days} min={1} max={180} format={(v) => `${v} วัน`} onChange={setDays} />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {(Object.keys(GREEK_INFO) as GreekKey[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setGreek(k)}
            className={`rounded-xl text-left ring-teal-500 transition ${greek === k ? 'ring-2' : 'hover:ring-1'}`}
          >
            <Stat
              label={GREEK_INFO[k].label}
              value={k === 'price' ? fmtUsd(g[k]) : fmtNum(g[k], GREEK_INFO[k].digits)}
              tone={greek === k ? 'accent' : 'default'}
            />
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        <strong className="text-slate-900 dark:text-white">{info.label}:</strong> {info.desc} — กราฟแสดงค่า {info.label}{' '}
        ที่ราคาหุ้นต่างๆ เทียบกันหลายช่วงอายุ (กดการ์ดด้านบนเพื่อเปลี่ยน Greek)
      </p>

      <div className="h-72 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="price"
              type="number"
              domain={['dataMin', 'dataMax']}
              tick={{ fill: palette.axis, fontSize: 11 }}
              tickFormatter={(v) => `$${Math.round(v)}`}
              stroke={palette.grid}
            />
            <YAxis tick={{ fill: palette.axis, fontSize: 11 }} stroke={palette.grid} width={48} tickFormatter={(v) => fmtNum(v, info.digits > 2 ? 2 : 1)} />
            <Tooltip
              {...tooltipStyle(palette)}
              labelFormatter={(v) => `ราคาหุ้น ${fmtUsd(Number(v))}`}
              formatter={(v, name) => [fmtNum(Number(v), info.digits), String(name)]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine x={K} stroke={palette.muted} strokeDasharray="3 3" label={{ value: 'K', fill: palette.axis, fontSize: 11, position: 'top' }} />
            <ReferenceLine x={S} stroke={palette.accent} strokeDasharray="4 4" />
            {COMPARE_DAYS.map((d, i) => (
              <Line
                key={d}
                dataKey={`d${d}`}
                name={`${d} วัน`}
                stroke={palette.series[i + 1]}
                strokeWidth={1.5}
                strokeOpacity={0.6}
                dot={false}
                isAnimationActive={false}
              />
            ))}
            <Line dataKey="current" name={`ปัจจุบัน (${days} วัน)`} stroke={palette.series[0]} strokeWidth={3} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
