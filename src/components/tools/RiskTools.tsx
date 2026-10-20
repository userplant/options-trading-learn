import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fmtNum, fmtPct, fmtSignedUsd, fmtUsd } from '../../lib/format';
import {
  breakevenWinRate,
  drawdownAfterLosses,
  expectancyR,
  maxDrawdownPct,
  optionContracts,
  recoveryGainPct,
  seededRandom,
  simulateEquity,
  stockPositionSize,
} from '../../lib/risk';
import { tooltipStyle, useTheme } from '../../lib/theme';
import { Button, NumberField, Segmented, Slider, Stat } from '../ui';

/** บทที่ 6.1: Risk:Reward บนกราฟราคา */
export function RiskRewardVisual() {
  const [entry, setEntry] = useState(50);
  const [stop, setStop] = useState(48);
  const [target, setTarget] = useState(56);
  const risk = entry - stop;
  const reward = target - entry;
  const rr = risk > 0 ? reward / risk : 0;
  const valid = risk > 0 && reward > 0;
  const lo = Math.min(stop, entry) - 2;
  const hi = Math.max(target, entry) + 2;
  const pct = (v: number) => ((hi - v) / (hi - lo)) * 100;

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_220px]">
      <div className="space-y-4">
        <Slider label="ราคาเข้า (Entry)" value={entry} min={40} max={60} step={0.5} format={(v) => fmtUsd(v)} onChange={setEntry} />
        <Slider label="จุดตัดขาดทุน (Stop Loss)" value={stop} min={35} max={60} step={0.5} format={(v) => fmtUsd(v)} onChange={setStop} />
        <Slider label="เป้าหมายกำไร (Target)" value={target} min={40} max={75} step={0.5} format={(v) => fmtUsd(v)} onChange={setTarget} />
        <div className="grid grid-cols-3 gap-2">
          <Stat label="ความเสี่ยง/หุ้น" value={fmtUsd(Math.max(risk, 0))} tone="loss" />
          <Stat label="ผลตอบแทน/หุ้น" value={fmtUsd(Math.max(reward, 0))} tone="profit" />
          <Stat label="R:R" value={valid ? `1 : ${fmtNum(rr, 1)}` : '—'} tone="accent" />
        </div>
        {valid ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            ด้วย R:R 1:{fmtNum(rr, 1)} คุณต้องชนะอย่างน้อย{' '}
            <strong className="text-slate-900 dark:text-white">{fmtPct(breakevenWinRate(rr) * 100, 0)}</strong> ของจำนวนไม้
            เพื่อไม่ขาดทุนในระยะยาว
          </p>
        ) : (
          <p className="text-sm text-amber-700 dark:text-amber-400">สำหรับสถานะ Long: Stop ต้องต่ำกว่า Entry และ Target ต้องสูงกว่า Entry</p>
        )}
      </div>
      <div className="relative h-64 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/60">
        {valid && (
          <>
            <div
              className="absolute inset-x-6 rounded-t bg-emerald-500/25"
              style={{ top: `${pct(target)}%`, height: `${pct(entry) - pct(target)}%` }}
            />
            <div
              className="absolute inset-x-6 rounded-b bg-rose-500/25"
              style={{ top: `${pct(entry)}%`, height: `${pct(stop) - pct(entry)}%` }}
            />
          </>
        )}
        {[
          { v: target, label: 'Target', c: 'border-emerald-500 text-emerald-700 dark:text-emerald-300' },
          { v: entry, label: 'Entry', c: 'border-slate-500 text-slate-700 dark:text-slate-200' },
          { v: stop, label: 'Stop', c: 'border-rose-500 text-rose-700 dark:text-rose-300' },
        ].map((l) => (
          <div key={l.label} className={`absolute inset-x-2 border-t-2 border-dashed ${l.c}`} style={{ top: `${pct(l.v)}%` }}>
            <span className="absolute -top-5 right-0 font-mono text-xs font-semibold">
              {l.label} {fmtUsd(l.v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** บทที่ 6.2: Position Size Calculator */
export function PositionSizeCalculator() {
  const [mode, setMode] = useState<'stock' | 'option'>('stock');
  const [account, setAccount] = useState(10000);
  const [riskPct, setRiskPct] = useState(1);
  const [entry, setEntry] = useState(50);
  const [stop, setStop] = useState(47.5);
  const [optLoss, setOptLoss] = useState(2.5);

  const res = stockPositionSize({ account, riskPct, entry, stop });
  const contracts = optionContracts(account, riskPct, optLoss * 100);

  return (
    <div className="space-y-4">
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: 'stock', label: 'หุ้น' },
          { value: 'option', label: 'Options' },
        ]}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <NumberField label="เงินในพอร์ต" prefix="$" value={account} step={1000} onChange={setAccount} />
        <NumberField label="ยอมเสี่ยงต่อไม้" suffix="%" value={riskPct} step={0.25} onChange={setRiskPct} />
        {mode === 'stock' ? (
          <>
            <NumberField label="ราคาเข้า" prefix="$" value={entry} step={0.5} onChange={setEntry} />
            <NumberField label="Stop Loss" prefix="$" value={stop} step={0.5} onChange={setStop} />
          </>
        ) : (
          <NumberField label="ขาดทุนสูงสุดต่อหุ้น (เช่น premium ที่จ่าย)" prefix="$" value={optLoss} step={0.05} onChange={setOptLoss} />
        )}
      </div>

      {mode === 'stock' ? (
        res ? (
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat label="เงินที่ยอมเสี่ยง" value={fmtUsd(res.riskAmount, 0)} tone="loss" />
            <Stat label="ซื้อได้" value={`${res.shares.toLocaleString()} หุ้น`} tone="accent" sub={`เสี่ยงหุ้นละ ${fmtUsd(res.riskPerShare)}`} />
            <Stat label="มูลค่าสถานะ" value={fmtUsd(res.positionValue, 0)} sub={`${fmtPct(res.pctOfAccount)} ของพอร์ต`} />
            <Stat label="ขาดทุนจริงถ้าโดน Stop" value={fmtUsd(res.actualRisk, 0)} tone="loss" />
          </div>
        ) : (
          <p className="text-sm text-amber-700 dark:text-amber-400">กรอกตัวเลขให้ครบ และ Stop ต้องไม่เท่ากับราคาเข้า</p>
        )
      ) : (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          <Stat label="เงินที่ยอมเสี่ยง" value={fmtUsd((account * riskPct) / 100, 0)} tone="loss" />
          <Stat label="ขาดทุนสูงสุด/สัญญา" value={fmtUsd(optLoss * 100, 0)} sub="ต่อหุ้น × 100" />
          <Stat label="เปิดได้สูงสุด" value={`${contracts} สัญญา`} tone="accent" />
        </div>
      )}
      {res && mode === 'stock' && res.pctOfAccount > 100 && (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          ⚠️ มูลค่าสถานะเกินเงินในพอร์ต แปลว่าต้องใช้ margin ลองขยับ Stop ให้ห่างขึ้นหรือลด % ความเสี่ยง
        </p>
      )}
    </div>
  );
}

/** บทที่ 6.3: Expectancy + จำลอง equity curve */
export function ExpectancySimulator() {
  const { palette } = useTheme();
  const [winRate, setWinRate] = useState(45);
  const [rr, setRr] = useState(2);
  const [riskPct, setRiskPct] = useState(2);
  const [seed, setSeed] = useState(7);
  const trades = 100;
  const runs = 5;

  const exp = expectancyR(winRate / 100, rr);
  const curves = useMemo(() => {
    return Array.from({ length: runs }, (_, k) =>
      simulateEquity(10000, trades, winRate / 100, rr, riskPct, seededRandom(seed * 101 + k)),
    );
  }, [winRate, rr, riskPct, seed]);

  const data = Array.from({ length: trades + 1 }, (_, i) => {
    const row: Record<string, number> = { trade: i };
    curves.forEach((c, k) => (row[`r${k}`] = c[i]));
    return row;
  });
  const finals = curves.map((c) => c[c.length - 1]);
  const avgFinal = finals.reduce((a, b) => a + b, 0) / runs;
  const worstDd = Math.max(...curves.map(maxDrawdownPct));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider label="Win Rate" value={winRate} min={10} max={90} format={(v) => `${v}%`} onChange={setWinRate} />
        <Slider label="Reward : Risk" value={rr} min={0.5} max={5} step={0.1} format={(v) => `${fmtNum(v, 1)} : 1`} onChange={setRr} />
        <Slider label="เสี่ยงต่อไม้" value={riskPct} min={0.5} max={50} step={0.5} format={(v) => `${v}%`} onChange={setRiskPct} />
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label="Expectancy ต่อไม้" value={`${exp >= 0 ? '+' : ''}${fmtNum(exp, 2)}R`} tone={exp >= 0 ? 'profit' : 'loss'} />
        <Stat label="Win Rate ขั้นต่ำที่ต้องมี" value={fmtPct(breakevenWinRate(rr) * 100, 0)} />
        <Stat label={`พอร์ตเฉลี่ยหลัง ${trades} ไม้`} value={fmtUsd(avgFinal, 0)} tone={avgFinal >= 10000 ? 'profit' : 'loss'} sub="เริ่มต้น $10,000" />
        <Stat label="Max Drawdown แย่สุด" value={fmtPct(worstDd, 0)} tone="loss" />
      </div>
      <div className="h-72 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 16 }}>
            <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" />
            <XAxis dataKey="trade" tick={{ fill: palette.axis, fontSize: 11 }} stroke={palette.grid} label={{ value: 'จำนวนไม้', position: 'insideBottom', offset: -10, fill: palette.axis, fontSize: 12 }} />
            <YAxis tick={{ fill: palette.axis, fontSize: 11 }} stroke={palette.grid} width={52} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...tooltipStyle(palette)} labelFormatter={(v) => `ไม้ที่ ${v}`} formatter={(v, n) => [fmtUsd(Number(v), 0), String(n)]} />
            <ReferenceLine y={10000} stroke={palette.axis} strokeDasharray="4 4" />
            {curves.map((_, k) => (
              <Line key={k} dataKey={`r${k}`} name={`รอบที่ ${k + 1}`} stroke={palette.series[k]} strokeWidth={1.75} dot={false} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => setSeed((s) => s + 1)}>
          🎲 สุ่มใหม่
        </Button>
        <span className="text-xs text-slate-500">แต่ละเส้นคือลำดับการแพ้/ชนะแบบสุ่มด้วยสถิติเดียวกัน — ดูว่าโชคทำให้ผลต่างกันได้แค่ไหน</span>
      </div>
    </div>
  );
}

/** บทที่ 6.4: Drawdown & Recovery */
export function DrawdownRecovery() {
  const { palette } = useTheme();
  const [loss, setLoss] = useState(30);
  const [riskPct, setRiskPct] = useState(2);
  const [streak, setStreak] = useState(8);

  const data = Array.from({ length: 19 }, (_, i) => {
    const l = (i + 1) * 5;
    return { loss: l, gain: Math.min(recoveryGainPct(l), 2000) };
  });
  const gain = recoveryGainPct(loss);
  const dd = drawdownAfterLosses(riskPct, streak);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-[260px_1fr]">
        <div className="space-y-3">
          <Slider label="พอร์ตขาดทุน" value={loss} min={5} max={90} step={5} format={(v) => `−${v}%`} onChange={setLoss} />
          <Stat label="ต้องกำไรเท่าไรถึงจะกลับมาเท่าทุน" value={`+${fmtPct(gain, 0)}`} tone="loss" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            $10,000 → {fmtUsd(10000 * (1 - loss / 100), 0)} ต้องทำกำไร {fmtSignedUsd(10000 * (loss / 100), 0).replace('+', '')} จากเงินที่เหลือ
          </p>
        </div>
        <div className="h-60 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 16 }}>
              <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" />
              <XAxis dataKey="loss" tick={{ fill: palette.axis, fontSize: 11 }} stroke={palette.grid} tickFormatter={(v) => `-${v}%`} label={{ value: 'ขาดทุน', position: 'insideBottom', offset: -10, fill: palette.axis, fontSize: 12 }} />
              <YAxis tick={{ fill: palette.axis, fontSize: 11 }} stroke={palette.grid} width={48} domain={[0, 400]} allowDataOverflow tickFormatter={(v) => `${v}%`} />
              <Tooltip {...tooltipStyle(palette)} labelFormatter={(v) => `ขาดทุน ${v}%`} formatter={(v) => [`+${fmtPct(Number(v), 0)}`, 'ต้องกำไร']} />
              <Area dataKey="gain" stroke={palette.loss} fill={palette.loss} fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
              <ReferenceDot x={loss} y={Math.min(gain, 400)} r={6} fill={palette.loss} stroke={palette.surface} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 dark:bg-slate-950/60">
        <div className="mb-3 text-sm font-medium">แพ้ติดกันกี่ไม้ก็เกิดขึ้นได้ — เสี่ยงต่อไม้เท่าไรถึงจะรอด?</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Slider label="เสี่ยงต่อไม้" value={riskPct} min={0.5} max={25} step={0.5} format={(v) => `${v}%`} onChange={setRiskPct} />
          <Slider label="แพ้ติดกัน" value={streak} min={1} max={20} format={(v) => `${v} ไม้`} onChange={setStreak} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="พอร์ตย่อตัว (Drawdown)" value={`−${fmtPct(dd, 1)}`} tone="loss" />
          <Stat label="ต้องกำไรกลับมา" value={`+${fmtPct(recoveryGainPct(dd), 0)}`} tone={dd > 30 ? 'loss' : 'default'} />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          ระบบที่มี Win Rate 50% มีโอกาสแพ้ติดกัน 8 ไม้ขึ้นไปในการเทรด 500 ไม้ค่อนข้างสูง — ต้องวางแผนให้รอดในสถานการณ์นั้น
        </p>
      </div>
    </div>
  );
}
