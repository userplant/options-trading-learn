import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  BT_MAP,
  BT_STRATEGIES,
  DEFAULT_BT_OPTIONS,
  backtestStrategy,
  defaultParams,
  monteCarlo,
  percentile,
  type BacktestOptions,
  type StrategyId,
} from '../../lib/backtest';
import { fmtNum, fmtPct, fmtSignedUsd, fmtUsd } from '../../lib/format';
import { generateCandles, REGIME_LABEL, type Regime } from '../../lib/marketData';
import { tooltipStyle, useTheme } from '../../lib/theme';
import { CandleChart, type ChartMarker } from '../charts/CandleChart';
import { Button, NumberField, Segmented, Slider, Stat, cx } from '../ui';

const FAMILY_LABEL = { trend: 'Trend', breakout: 'Breakout', reversion: 'Mean Reversion' } as const;

interface PlaygroundProps {
  initialStrategy?: StrategyId;
  /** จำกัดตัวเลือกกลยุทธ์ (ใช้ในบทเรียนแต่ละตระกูล) */
  strategies?: StrategyId[];
  initialRegime?: Regime;
  initialSeed?: number;
  /** แสดงแบบย่อ: ไม่มีแท็บ Monte Carlo และตัวเลือกต้นทุน */
  compact?: boolean;
}

export function BacktestPlayground({ initialStrategy = 'ma-cross', strategies, initialRegime = 'mixed', initialSeed = 1, compact }: PlaygroundProps) {
  const { palette } = useTheme();
  const list = strategies ? BT_STRATEGIES.filter((s) => strategies.includes(s.id)) : BT_STRATEGIES;
  const [id, setId] = useState<StrategyId>(initialStrategy);
  const [params, setParams] = useState<Record<string, number>>(() => defaultParams(initialStrategy));
  const [regime, setRegime] = useState<Regime>(initialRegime);
  const [seed, setSeed] = useState(initialSeed);
  const [bars, setBars] = useState(400);
  const [opts, setOpts] = useState<BacktestOptions>(DEFAULT_BT_OPTIONS);
  const [tab, setTab] = useState<'chart' | 'trades' | 'mc'>('chart');

  const def = BT_MAP[id];
  const candles = useMemo(() => generateCandles({ bars, regime, seed }), [bars, regime, seed]);
  const result = useMemo(() => backtestStrategy(candles, id, params, opts), [candles, id, params, opts]);
  const { stats, trades, equity, signals } = result;

  const markers: ChartMarker[] = trades.flatMap((t) => [
    { i: t.entryIdx, price: candles[t.entryIdx].l, kind: 'buy' as const },
    { i: t.exitIdx, price: candles[t.exitIdx].h, kind: t.reason === 'stop' ? ('stop' as const) : ('sell' as const) },
  ]);

  const equityData = equity.map((e, i) => ({
    i,
    strategy: e,
    buyHold: (opts.startEquity * candles[i].c) / candles[0].o,
  }));

  const choose = (next: StrategyId) => {
    setId(next);
    setParams(defaultParams(next));
  };
  const setOpt = <K extends keyof BacktestOptions>(k: K, v: BacktestOptions[K]) => setOpts((o) => ({ ...o, [k]: v }));

  return (
    <div className="space-y-4">
      {/* กลยุทธ์ */}
      <div className="space-y-3 rounded-xl bg-white p-3 dark:bg-slate-950/60">
        {list.length > 1 && (
          <Segmented size="sm" value={id} onChange={choose} options={list.map((s) => ({ value: s.id, label: s.name }))} />
        )}
        <div className="grid gap-1 text-sm sm:grid-cols-2">
          <div>
            <span className="font-medium text-emerald-700 dark:text-emerald-400">เข้า:</span> {def.entryRule}
          </div>
          <div>
            <span className="font-medium text-rose-700 dark:text-rose-400">ออก:</span> {def.exitRule}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {def.params.map((p) => (
            <Slider
              key={p.key}
              label={p.label}
              value={params[p.key]}
              min={p.min}
              max={p.max}
              step={p.step}
              format={(v) => (p.step < 1 ? fmtNum(v, 1) : String(v))}
              onChange={(v) => setParams((ps) => ({ ...ps, [p.key]: v }))}
            />
          ))}
        </div>
      </div>

      {/* ข้อมูลตลาดและความเสี่ยง */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl bg-white p-3 dark:bg-slate-950/60">
          <div className="text-sm font-medium">ข้อมูลราคาจำลอง</div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented size="sm" value={regime} onChange={setRegime} options={(Object.keys(REGIME_LABEL) as Regime[]).map((r) => ({ value: r, label: REGIME_LABEL[r] }))} />
            <Button variant="ghost" onClick={() => setSeed((s) => s + 1)}>
              🎲 สุ่มใหม่ (#{seed})
            </Button>
          </div>
          <Slider label="จำนวนแท่ง (วันทำการ)" value={bars} min={200} max={1000} step={50} onChange={setBars} />
        </div>
        <div className="space-y-3 rounded-xl bg-white p-3 dark:bg-slate-950/60">
          <div className="text-sm font-medium">Stop Loss และขนาดสถานะ</div>
          <div className="flex flex-wrap gap-2">
            <Segmented
              size="sm"
              value={opts.stopType}
              onChange={(v) => setOpts((o) => ({ ...o, stopType: v, stopValue: v === 'atr' ? 3 : 8 }))}
              options={[
                { value: 'none', label: 'ไม่มี Stop' },
                { value: 'percent', label: 'Stop %' },
                { value: 'atr', label: 'Stop × ATR' },
              ]}
            />
            <Segmented
              size="sm"
              value={opts.sizing}
              onChange={(v) => setOpt('sizing', v)}
              options={[
                { value: 'all-in', label: 'ใช้เงินทั้งหมด' },
                { value: 'risk', label: 'เสี่ยง % ต่อไม้' },
              ]}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {opts.stopType !== 'none' && (
              <Slider
                label={opts.stopType === 'percent' ? 'ระยะ Stop' : 'Stop = ATR(14) ×'}
                value={opts.stopValue}
                min={opts.stopType === 'percent' ? 1 : 0.5}
                max={opts.stopType === 'percent' ? 25 : 6}
                step={opts.stopType === 'percent' ? 1 : 0.5}
                format={(v) => (opts.stopType === 'percent' ? `${v}%` : `${v}×`)}
                onChange={(v) => setOpt('stopValue', v)}
              />
            )}
            {opts.sizing === 'risk' && (
              <Slider label="เสี่ยงต่อไม้" value={opts.riskPct} min={0.5} max={10} step={0.5} format={(v) => `${v}%`} onChange={(v) => setOpt('riskPct', v)} />
            )}
          </div>
          {!compact && (
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="ค่าคอม/ครั้ง" prefix="$" value={opts.commission} step={0.5} onChange={(v) => setOpt('commission', Math.max(v, 0))} />
              <NumberField label="Slippage/ครั้ง" suffix="%" value={opts.slippagePct} step={0.05} onChange={(v) => setOpt('slippagePct', Math.max(v, 0))} />
            </div>
          )}
        </div>
      </div>

      {/* ผลลัพธ์ */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="ผลตอบแทนรวม" value={fmtPct(stats.totalReturnPct)} tone={stats.totalReturnPct >= 0 ? 'profit' : 'loss'} sub={`Buy & Hold ${fmtPct(stats.buyHoldPct)}`} />
        <Stat label="Max Drawdown" value={`−${fmtPct(stats.maxDrawdownPct)}`} tone="loss" sub={`Buy & Hold −${fmtPct(stats.buyHoldMaxDrawdownPct)}`} />
        <Stat label="จำนวนเทรด" value={stats.trades} sub={`ถือเฉลี่ย ${fmtNum(stats.avgBars, 0)} แท่ง`} />
        <Stat label="Win Rate" value={fmtPct(stats.winRate, 0)} sub={`ชนะเฉลี่ย ${fmtPct(stats.avgWinPct)} / แพ้ ${fmtPct(stats.avgLossPct)}`} />
        <Stat label="Profit Factor" value={Number.isFinite(stats.profitFactor) ? fmtNum(stats.profitFactor, 2) : '∞'} tone={stats.profitFactor >= 1 ? 'profit' : 'loss'} sub="กำไรรวม ÷ ขาดทุนรวม" />
        <Stat
          label="Exposure / ต้นทุน"
          value={fmtPct(stats.exposurePct, 0)}
          sub={`ค่าคอม+slippage ${fmtUsd(stats.totalCosts, 0)}`}
        />
      </div>

      <Segmented
        size="sm"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'chart', label: '📈 กราฟ' },
          { value: 'trades', label: `📋 รายการเทรด (${trades.length})` },
          ...(compact ? [] : [{ value: 'mc' as const, label: '🎲 Monte Carlo' }]),
        ]}
      />

      {tab === 'chart' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/40">
            <CandleChart candles={candles} overlays={signals.overlays} panes={signals.pane ? [signals.pane] : []} markers={markers} height={280} paneHeight={90} />
            <div className="mt-1 flex flex-wrap gap-3 px-1 text-xs text-slate-500">
              <span style={{ color: palette.profit }}>▲ ซื้อ</span>
              <span style={{ color: palette.series[3] }}>▼ ขายตามสัญญาณ</span>
              <span style={{ color: palette.loss }}>▼ โดน Stop</span>
            </div>
          </div>
          <div className="h-56 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equityData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" />
                <XAxis dataKey="i" tick={{ fill: palette.axis, fontSize: 11 }} stroke={palette.grid} minTickGap={40} />
                <YAxis tick={{ fill: palette.axis, fontSize: 11 }} stroke={palette.grid} width={52} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} domain={['auto', 'auto']} />
                <Tooltip {...tooltipStyle(palette)} labelFormatter={(v) => `แท่งที่ ${v}`} formatter={(v, n) => [fmtUsd(Number(v), 0), String(n)]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={opts.startEquity} stroke={palette.axis} strokeDasharray="4 4" />
                <Line dataKey="buyHold" name="Buy & Hold" stroke={palette.muted} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line dataKey="strategy" name={def.name} stroke={palette.accent} strokeWidth={2.25} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'trades' && (
        <div className="max-h-80 overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 text-left text-xs text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">เข้า (แท่ง)</th>
                <th className="px-3 py-2">ออก (แท่ง)</th>
                <th className="px-3 py-2 text-right">ราคาเข้า</th>
                <th className="px-3 py-2 text-right">ราคาออก</th>
                <th className="px-3 py-2 text-right">P/L</th>
                <th className="px-3 py-2 text-right">R</th>
                <th className="px-3 py-2">เหตุผล</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t, k) => (
                <tr key={k} className="border-t border-slate-100 font-mono dark:border-slate-800">
                  <td className="px-3 py-1">{k + 1}</td>
                  <td className="px-3 py-1">{t.entryIdx}</td>
                  <td className="px-3 py-1">{t.exitIdx}</td>
                  <td className="px-3 py-1 text-right">{fmtNum(t.entryPrice)}</td>
                  <td className="px-3 py-1 text-right">{fmtNum(t.exitPrice)}</td>
                  <td className={cx('px-3 py-1 text-right', t.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                    {fmtSignedUsd(t.pnl, 0)}
                  </td>
                  <td className="px-3 py-1 text-right">{t.r === null ? '—' : fmtNum(t.r, 1)}</td>
                  <td className="px-3 py-1 font-sans">{t.reason === 'stop' ? 'Stop' : t.reason === 'end' ? 'จบข้อมูล' : 'สัญญาณ'}</td>
                </tr>
              ))}
              {trades.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-center font-sans text-slate-500">
                    ไม่มีสัญญาณเข้าเลยในข้อมูลชุดนี้ ลองปรับพารามิเตอร์หรือเปลี่ยนสภาพตลาด
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'mc' && <MonteCarloPanel trades={result.trades} startEquity={opts.startEquity} actualDd={stats.maxDrawdownPct} />}

      <p className="text-xs text-slate-500">
        กลยุทธ์ตระกูล {FAMILY_LABEL[def.family]} · Long-only · สัญญาณคำนวณตอนราคาปิด แล้วส่งคำสั่งที่ราคาเปิดแท่งถัดไป ·
        ข้อมูลเป็นราคาจำลอง ผลในอดีตไม่รับประกันผลในอนาคต
      </p>
    </div>
  );
}

function MonteCarloPanel({ trades, startEquity, actualDd }: { trades: ReturnType<typeof backtestStrategy>['trades']; startEquity: number; actualDd: number }) {
  const { palette } = useTheme();
  const [seed, setSeed] = useState(1);
  const mc = useMemo(() => monteCarlo(trades, 500, seed, 25), [trades, seed]);

  if (trades.length < 5) {
    return <p className="rounded-xl bg-slate-100 p-4 text-sm dark:bg-slate-800/60">ต้องมีอย่างน้อย 5 เทรดถึงจะทำ Monte Carlo ได้ ลองเพิ่มจำนวนแท่งหรือปรับพารามิเตอร์</p>;
  }

  const maxLen = trades.length + 1;
  const curveData = Array.from({ length: maxLen }, (_, i) => {
    const row: Record<string, number> = { i };
    mc.samples.forEach((s, k) => (row[`s${k}`] = s[i] * startEquity));
    return row;
  });

  const bins = 12;
  const minDd = Math.min(...mc.drawdowns);
  const maxDd = Math.max(...mc.drawdowns, minDd + 1);
  const width = (maxDd - minDd) / bins;
  const hist = Array.from({ length: bins }, (_, b) => {
    const lo = minDd + b * width;
    const hi = minDd + (b + 1) * width;
    return { label: `${fmtNum(lo, 0)}–${fmtNum(hi, 0)}%`, mid: (lo + hi) / 2, count: mc.drawdowns.filter((d) => d >= lo && (b === bins - 1 ? d <= hi : d < hi)).length };
  });

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        สลับลำดับของ {trades.length} เทรดเดิมแบบสุ่ม 500 รอบ ผลรวมท้ายสุดเท่าเดิม (เทรดชุดเดียวกัน) แต่ <strong>Drawdown ต่างกันมาก</strong>{' '}
        ขึ้นกับว่าไม้ที่แพ้มาติดกันหรือไม่
      </p>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label="Max DD จาก Backtest จริง" value={`−${fmtPct(actualDd)}`} />
        <Stat label="Max DD กลาง (median)" value={`−${fmtPct(percentile(mc.drawdowns, 50))}`} />
        <Stat label="Max DD กรณีแย่ 5%" value={`−${fmtPct(percentile(mc.drawdowns, 95))}`} tone="loss" sub="ควรเตรียมใจรับได้ขนาดนี้" />
        <Stat label="Max DD แย่ที่สุด" value={`−${fmtPct(Math.max(...mc.drawdowns))}`} tone="loss" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="h-60 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curveData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" />
              <XAxis dataKey="i" tick={{ fill: palette.axis, fontSize: 11 }} stroke={palette.grid} />
              <YAxis tick={{ fill: palette.axis, fontSize: 11 }} stroke={palette.grid} width={52} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} domain={['auto', 'auto']} />
              {mc.samples.map((_, k) => (
                <Line key={k} dataKey={`s${k}`} stroke={palette.series[k % palette.series.length]} strokeOpacity={0.45} strokeWidth={1.25} dot={false} isAnimationActive={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-60 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hist} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: palette.axis, fontSize: 9 }} stroke={palette.grid} interval={1} />
              <YAxis tick={{ fill: palette.axis, fontSize: 11 }} stroke={palette.grid} width={32} />
              <Tooltip {...tooltipStyle(palette)} formatter={(v) => [`${Number(v)} รอบ`, 'จำนวน']} labelFormatter={(l) => `Max DD ${l}`} cursor={{ fill: palette.grid, opacity: 0.4 }} />
              <Bar dataKey="count" fill={palette.loss} fillOpacity={0.6} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <Button variant="ghost" onClick={() => setSeed((s) => s + 1)}>
        🎲 สุ่มลำดับใหม่
      </Button>
    </div>
  );
}

/* ---------- 4.5 Overfitting ---------- */

const FASTS = [5, 10, 15, 20, 30, 40];
const SLOWS = [30, 50, 80, 100, 150, 200];

export function OverfitDemo() {
  const { palette } = useTheme();
  const [seed, setSeed] = useState(4);
  const inSample = useMemo(() => generateCandles({ bars: 600, regime: 'mixed', seed }), [seed]);
  const outSample = useMemo(() => generateCandles({ bars: 600, regime: 'mixed', seed: seed + 1000 }), [seed]);

  const grid = useMemo(() => {
    const opts = { ...DEFAULT_BT_OPTIONS, stopType: 'none' as const };
    return FASTS.flatMap((fast) =>
      SLOWS.filter((slow) => slow > fast).map((slow) => ({
        fast,
        slow,
        is: backtestStrategy(inSample, 'ma-cross', { fast, slow }, opts).stats.totalReturnPct,
        oos: backtestStrategy(outSample, 'ma-cross', { fast, slow }, opts).stats.totalReturnPct,
      })),
    );
  }, [inSample, outSample]);

  const best = grid.reduce((a, b) => (b.is > a.is ? b : a));
  const medianOos = percentile(grid.map((g) => g.oos), 50);
  const maxAbs = Math.max(...grid.flatMap((g) => [Math.abs(g.is), Math.abs(g.oos)]), 1);
  const cellColor = (v: number) => {
    const a = Math.min(Math.abs(v) / maxAbs, 1) * 0.75 + 0.1;
    const hex = v >= 0 ? palette.profit : palette.loss;
    const alpha = Math.round(a * 255).toString(16).padStart(2, '0');
    return `${hex}${alpha}`;
  };

  const Heat = ({ title, k }: { title: string; k: 'is' | 'oos' }) => (
    <div className="min-w-0">
      <div className="mb-1.5 text-sm font-medium">{title}</div>
      <div className="overflow-x-auto">
        <table className="text-xs">
          <thead>
            <tr>
              <th className="px-1 py-1 text-slate-500">เร็ว\ช้า</th>
              {SLOWS.map((s) => (
                <th key={s} className="px-1 py-1 text-slate-500">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FASTS.map((f) => (
              <tr key={f}>
                <th className="px-1 py-1 text-slate-500">{f}</th>
                {SLOWS.map((s) => {
                  const g = grid.find((x) => x.fast === f && x.slow === s);
                  const isBest = g && g.fast === best.fast && g.slow === best.slow;
                  return (
                    <td key={s} className="p-0.5">
                      {g ? (
                        <div
                          className={cx('num w-12 rounded px-1 py-1.5 text-center font-mono', isBest && 'ring-2 ring-slate-900 dark:ring-white')}
                          style={{ background: cellColor(g[k]) }}
                        >
                          {fmtNum(g[k], 0)}%
                        </div>
                      ) : (
                        <div className="w-12" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        ทดสอบ EMA Crossover {grid.length} คู่ค่า บนข้อมูลชุดที่ 1 (In-Sample) แล้วเลือกคู่ที่ดีที่สุด จากนั้นนำคู่เดิมไปใช้กับข้อมูลชุดใหม่
        (Out-of-Sample) ที่ไม่เคยเห็นมาก่อน
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <Heat title="① In-Sample: ข้อมูลที่ใช้หาค่าที่ดีที่สุด" k="is" />
        <Heat title="② Out-of-Sample: ข้อมูลใหม่" k="oos" />
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label="คู่ที่ดีที่สุด (In-Sample)" value={`${best.fast} / ${best.slow}`} tone="accent" />
        <Stat label="ผลตอบแทน In-Sample" value={fmtPct(best.is)} tone={best.is >= 0 ? 'profit' : 'loss'} />
        <Stat label="คู่เดิม บนข้อมูลใหม่" value={fmtPct(best.oos)} tone={best.oos >= 0 ? 'profit' : 'loss'} />
        <Stat label="ค่ากลางทุกคู่ บนข้อมูลใหม่" value={fmtPct(medianOos)} sub="ถ้าเลือกแบบสุ่ม" />
      </div>
      <Button variant="ghost" onClick={() => setSeed((s) => s + 1)}>
        🎲 ทดลองกับข้อมูลชุดอื่น
      </Button>
    </div>
  );
}
