import { useMemo, useState } from 'react';
import { CHART_PATTERNS, type ChartPattern } from '../../data/chartPatterns';
import type { IndicatorPaneDef, OverlayLine } from '../../lib/backtest';
import { fmtNum, fmtPct, fmtUsd } from '../../lib/format';
import { bollinger, ema, findPivots, macd, rsi, sma, type Candle } from '../../lib/indicators';
import { candlesFromKeypoints, generateCandles, REGIME_LABEL, type Regime } from '../../lib/marketData';
import { spreadLabels } from '../../lib/labelLayout';
import { seededRandom } from '../../lib/risk';
import { useTheme } from '../../lib/theme';
import { CandleChart, type ChartHLine, type ChartMarker, type ChartSegment } from '../charts/CandleChart';
import { Badge, Button, NumberField, Segmented, Slider, Stat, cx } from '../ui';

/* ---------- 3.1 แท่งเทียน ---------- */

export function classifyCandle({ o, h, l, c }: Omit<Candle, 'v'>): { name: string; note: string } {
  const range = h - l || 1e-9;
  const body = Math.abs(c - o);
  const upper = h - Math.max(o, c);
  const lower = Math.min(o, c) - l;
  if (body <= range * 0.08) {
    if (lower > range * 0.6) return { name: 'Dragonfly Doji', note: 'ผู้ขายกดลงแรงแต่ผู้ซื้อดันกลับมาปิดที่จุดเปิด สัญญาณกลับตัวขึ้นเมื่อเกิดที่แนวรับ' };
    if (upper > range * 0.6) return { name: 'Gravestone Doji', note: 'ผู้ซื้อดันขึ้นแต่ถูกกดกลับมาปิดที่จุดเปิด สัญญาณกลับตัวลงเมื่อเกิดที่แนวต้าน' };
    return { name: 'Doji', note: 'เปิดและปิดใกล้กัน ตลาดลังเล ไม่มีฝ่ายไหนชนะ' };
  }
  if (lower >= body * 2 && upper <= body * 0.5)
    return { name: 'Hammer / Hanging Man', note: 'ไส้ล่างยาว: ถ้าเกิดหลังขาลงเรียก Hammer (สัญญาณกลับขึ้น) ถ้าเกิดหลังขาขึ้นเรียก Hanging Man (เตือนขาลง)' };
  if (upper >= body * 2 && lower <= body * 0.5)
    return { name: 'Shooting Star / Inverted Hammer', note: 'ไส้บนยาว: หลังขาขึ้นเรียก Shooting Star (เตือนขาลง) หลังขาลงเรียก Inverted Hammer' };
  if (body >= range * 0.9) return { name: c > o ? 'Bullish Marubozu' : 'Bearish Marubozu', note: 'แทบไม่มีไส้ ฝ่ายหนึ่งคุมตลาดทั้งแท่ง โมเมนตัมแรง' };
  if (body <= range * 0.3) return { name: 'Spinning Top', note: 'ตัวเล็ก ไส้สองข้าง ตลาดลังเล' };
  return { name: c > o ? 'แท่งเขียว (Bullish)' : 'แท่งแดง (Bearish)', note: c > o ? 'ปิดสูงกว่าเปิด ผู้ซื้อชนะในช่วงนี้' : 'ปิดต่ำกว่าเปิด ผู้ขายชนะในช่วงนี้' };
}

const ANATOMY_PRESETS: { label: string; v: [number, number, number, number] }[] = [
  { label: 'Hammer', v: [104, 105.5, 96, 105] },
  { label: 'Shooting Star', v: [101, 109, 100.5, 100] },
  { label: 'Doji', v: [102, 106, 98, 102.1] },
  { label: 'Marubozu', v: [98, 106, 97.9, 105.9] },
];

export function CandleAnatomy() {
  const { palette } = useTheme();
  const [o, setO] = useState(100);
  const [h, setH] = useState(106);
  const [l, setL] = useState(97);
  const [c, setC] = useState(104);
  const hi = Math.max(h, o, c);
  const lo = Math.min(l, o, c);
  const cls = classifyCandle({ o, h: hi, l: lo, c });
  const up = c >= o;
  const color = up ? palette.profit : palette.loss;
  const Y = (v: number) => 20 + ((112 - v) / 22) * 260;
  const bodyTop = Math.max(o, c);
  const bodyBottom = Math.min(o, c);

  // ป้ายราคาด้านขวา: รวมป้ายที่ราคาเท่ากัน แล้วกระจายไม่ให้ซ้อน
  const priceLabels: { v: number; names: string[] }[] = [];
  for (const [name, v] of [['High', hi], ['Open', o], ['Close', c], ['Low', lo]] as const) {
    const same = priceLabels.find((p) => Math.abs(p.v - v) < 0.005);
    if (same) same.names.push(name);
    else priceLabels.push({ v, names: [name] });
  }
  const priceYs = spreadLabels(priceLabels.map((p) => Y(p.v)), 15, 12, 292);

  // ป้ายส่วนประกอบด้านซ้าย: แสดงเฉพาะส่วนที่มีความยาวจริง
  const regions = [
    { label: 'ไส้บน', from: hi, to: bodyTop },
    { label: 'ตัวเทียน', from: bodyTop, to: bodyBottom },
    { label: 'ไส้ล่าง', from: bodyBottom, to: lo },
  ].filter((r) => r.from - r.to > 0.005);
  const regionYs = spreadLabels(regions.map((r) => (Y(r.from) + Y(r.to)) / 2), 14, 12, 292);

  return (
    <div className="grid gap-5 md:grid-cols-[290px_1fr]">
      <svg viewBox="0 0 290 300" className="mx-auto w-full max-w-[290px]" role="img" aria-label={cls.name}>
        <line x1={110} x2={110} y1={Y(hi)} y2={Y(lo)} stroke={color} strokeWidth={3} />
        <rect x={80} y={Y(bodyTop)} width={60} height={Math.max(Y(bodyBottom) - Y(bodyTop), 2)} fill={color} rx={3} />
        {priceLabels.map((p, k) => (
          <g key={p.names.join()}>
            <polyline
              points={`144,${Y(p.v)} 151,${Y(p.v)} 159,${priceYs[k]} 162,${priceYs[k]}`}
              fill="none"
              stroke={palette.axis}
            />
            <text x={165} y={priceYs[k] + 4} fontSize={11} fill={palette.axis}>
              {p.names.length > 2 ? p.names.map((n) => n[0]).join('/') : p.names.join(' / ')} {fmtNum(p.v)}
            </text>
          </g>
        ))}
        {regions.map((r, k) => (
          <g key={r.label} stroke={palette.muted}>
            <path d={`M74,${Y(r.from) + 1} h-4 V${Y(r.to) - 1} h4`} fill="none" />
            <line x1={70} x2={66} y1={(Y(r.from) + Y(r.to)) / 2} y2={regionYs[k]} />
            <text x={63} y={regionYs[k] + 4} fontSize={10} fill={palette.axis} stroke="none" textAnchor="end">
              {r.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {ANATOMY_PRESETS.map((p) => (
            <Button
              key={p.label}
              variant="outline"
              onClick={() => {
                setO(p.v[0]);
                setH(p.v[1]);
                setL(p.v[2]);
                setC(p.v[3]);
              }}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Slider label="Open" value={o} min={92} max={110} step={0.5} format={(v) => fmtNum(v)} onChange={setO} />
          <Slider label="Close" value={c} min={92} max={110} step={0.5} format={(v) => fmtNum(v)} onChange={setC} />
          <Slider label="High" value={h} min={92} max={110} step={0.5} format={(v) => fmtNum(Math.max(v, o, c))} onChange={setH} />
          <Slider label="Low" value={l} min={92} max={110} step={0.5} format={(v) => fmtNum(Math.min(v, o, c))} onChange={setL} />
        </div>
        <div className="rounded-xl bg-white p-3 dark:bg-slate-950/60">
          <div className="font-semibold" style={{ color }}>
            {cls.name}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{cls.note}</p>
        </div>
      </div>
    </div>
  );
}

/** แท่งเทียนชุดเล็กแบบคงที่ สำหรับแสดงรูปแบบ 1–3 แท่ง */
export function MiniCandles({ candles, title, note, bias }: { candles: [number, number, number, number][]; title: string; note: string; bias: 'bullish' | 'bearish' | 'neutral' }) {
  const { palette } = useTheme();
  const all = candles.flat();
  const hi = Math.max(...all);
  const lo = Math.min(...all);
  const Y = (v: number) => 8 + ((hi - v) / (hi - lo || 1)) * 84;
  const w = 26;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/60">
      <svg viewBox={`0 0 ${candles.length * (w + 14) + 14} 100`} className="mx-auto h-24">
        {candles.map(([o, h, l, c], i) => {
          const color = c >= o ? palette.profit : palette.loss;
          const cx0 = 14 + i * (w + 14) + w / 2;
          return (
            <g key={i}>
              <line x1={cx0} x2={cx0} y1={Y(h)} y2={Y(l)} stroke={color} strokeWidth={2} />
              <rect x={cx0 - w / 2} y={Y(Math.max(o, c))} width={w} height={Math.max(Math.abs(Y(o) - Y(c)), 2)} fill={color} rx={2} />
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center gap-2">
        <span className="font-semibold text-slate-900 dark:text-white">{title}</span>
        <Badge tone={bias === 'bullish' ? 'green' : bias === 'bearish' ? 'red' : 'slate'}>{bias === 'bullish' ? 'กลับตัวขึ้น' : bias === 'bearish' ? 'กลับตัวลง' : 'ลังเล'}</Badge>
      </div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{note}</p>
    </div>
  );
}

/* ---------- 3.2 เทรนด์ แนวรับแนวต้าน ---------- */

function RegimePicker({ regime, setRegime, onReroll }: { regime: Regime; setRegime: (r: Regime) => void; onReroll: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Segmented size="sm" value={regime} onChange={setRegime} options={(Object.keys(REGIME_LABEL) as Regime[]).map((r) => ({ value: r, label: REGIME_LABEL[r] }))} />
      <Button variant="ghost" onClick={onReroll}>
        🎲 สุ่มข้อมูลใหม่
      </Button>
    </div>
  );
}

export function TrendStructure() {
  const [regime, setRegime] = useState<Regime>('bull');
  const [seed, setSeed] = useState(3);
  const [lookback, setLookback] = useState(5);
  const [showLevels, setShowLevels] = useState(true);
  const candles = useMemo(() => generateCandles({ bars: 140, regime, seed }), [regime, seed]);

  const { markers, hlines, verdict } = useMemo(() => {
    const pivots = findPivots(candles, lookback);
    const markers: ChartMarker[] = [];
    let lastHigh: number | null = null;
    let lastLow: number | null = null;
    const highs: string[] = [];
    const lows: string[] = [];
    for (const p of pivots) {
      if (p.kind === 'high') {
        const label = lastHigh === null ? 'H' : p.price > lastHigh ? 'HH' : 'LH';
        markers.push({ i: p.i, price: p.price, kind: 'high', label });
        if (lastHigh !== null) highs.push(label);
        lastHigh = p.price;
      } else {
        const label = lastLow === null ? 'L' : p.price > lastLow ? 'HL' : 'LL';
        markers.push({ i: p.i, price: p.price, kind: 'low', label });
        if (lastLow !== null) lows.push(label);
        lastLow = p.price;
      }
    }
    const hlines: ChartHLine[] = [];
    if (lastHigh !== null) hlines.push({ price: lastHigh, label: 'แนวต้าน (Swing high ล่าสุด)', tone: 'resistance' });
    if (lastLow !== null) hlines.push({ price: lastLow, label: 'แนวรับ (Swing low ล่าสุด)', tone: 'support' });
    const h = highs.at(-1);
    const l = lows.at(-1);
    const verdict =
      h === 'HH' && l === 'HL' ? 'ขาขึ้น (Higher High + Higher Low)' : h === 'LH' && l === 'LL' ? 'ขาลง (Lower High + Lower Low)' : 'ไม่ชัดเจน / ออกข้าง';
    return { markers, hlines, verdict };
  }, [candles, lookback]);

  return (
    <div className="space-y-3">
      <RegimePicker regime={regime} setRegime={setRegime} onReroll={() => setSeed((s) => s + 1)} />
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
        <Slider label="ความไวของ Swing (จำนวนแท่งแต่ละข้าง)" value={lookback} min={2} max={12} onChange={setLookback} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showLevels} onChange={(e) => setShowLevels(e.target.checked)} className="accent-teal-600" />
          แสดงแนวรับ/แนวต้าน
        </label>
      </div>
      <CandleChart candles={candles} markers={markers} hlines={showLevels ? hlines : []} height={300} showVolume={false} />
      <Stat label="โครงสร้างล่าสุด" value={<span className="text-base">{verdict}</span>} tone="accent" />
    </div>
  );
}

/* ---------- 3.3 Chart Patterns ---------- */

const PATTERN_BARS = 60;

function patternSegments(p: ChartPattern): ChartSegment[] {
  return p.lines.map((l) => ({
    i1: Math.round(l.t1 * (PATTERN_BARS - 1)),
    p1: l.p1 * 100,
    i2: Math.round(l.t2 * (PATTERN_BARS - 1)),
    p2: l.p2 * 100,
    label: l.label,
  }));
}

export function PatternGallery() {
  const [id, setId] = useState(CHART_PATTERNS[0].id);
  const p = CHART_PATTERNS.find((x) => x.id === id)!;
  const candles = useMemo(() => candlesFromKeypoints(p.keypoints, PATTERN_BARS, 7, 0.004), [p]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {CHART_PATTERNS.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setId(x.id)}
            className={cx(
              'rounded-lg border px-2.5 py-1 text-xs font-medium',
              x.id === id ? 'border-teal-500 bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-200' : 'border-slate-200 dark:border-slate-700',
            )}
          >
            {x.name}
          </button>
        ))}
      </div>
      <CandleChart candles={candles} segments={patternSegments(p)} height={240} showVolume={false} hideAxis />
      <div className="rounded-xl bg-white p-3 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">
            {p.name} ({p.thai})
          </span>
          <Badge tone={p.bias === 'bullish' ? 'green' : 'red'}>{p.bias === 'bullish' ? 'Bullish' : 'Bearish'}</Badge>
          <Badge tone="slate">{p.kind === 'reversal' ? 'กลับตัว (Reversal)' : 'ไปต่อ (Continuation)'}</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{p.description}</p>
        <p className="mt-1 text-sm">
          <strong>วิธีเทรด:</strong> {p.trade}
        </p>
      </div>
    </div>
  );
}

export function PatternGame() {
  const [round, setRound] = useState(1);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const { pattern, candles, choices } = useMemo(() => {
    const rand = seededRandom(round * 7919);
    const pattern = CHART_PATTERNS[Math.floor(rand() * CHART_PATTERNS.length)];
    const others = CHART_PATTERNS.filter((p) => p.id !== pattern.id).sort(() => rand() - 0.5).slice(0, 3);
    const choices = [pattern, ...others].sort(() => rand() - 0.5);
    return { pattern, candles: candlesFromKeypoints(pattern.keypoints, PATTERN_BARS, round * 31, 0.009), choices };
  }, [round]);

  const breakoutIdx = Math.round(pattern.keypoints[pattern.keypoints.length - 3][0] * (PATTERN_BARS - 1));
  const answered = answer !== null;
  const correct = answer === pattern.id;

  const pick = (id: string) => {
    if (answered) return;
    setAnswer(id);
    setScore((s) => ({ right: s.right + (id === pattern.id ? 1 : 0), total: s.total + 1 }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-400">รอบที่ {round} · รูปแบบนี้คืออะไร? (ยังไม่เห็นช่วงทะลุ)</span>
        <span className="num font-mono font-semibold">
          คะแนน {score.right}/{score.total}
        </span>
      </div>
      <CandleChart
        candles={candles}
        segments={answered ? patternSegments(pattern) : []}
        revealTo={answered ? undefined : breakoutIdx}
        height={240}
        showVolume={false}
        hideAxis
      />
      <div className="grid gap-2 sm:grid-cols-2">
        {choices.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => pick(c.id)}
            disabled={answered}
            className={cx(
              'rounded-xl border px-3 py-2.5 text-left text-sm transition',
              !answered && 'border-slate-200 bg-white hover:border-teal-500 dark:border-slate-700 dark:bg-slate-950/60',
              answered && c.id === pattern.id && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
              answered && c.id === answer && !correct && 'border-rose-500 bg-rose-50 dark:bg-rose-950/40',
              answered && c.id !== pattern.id && c.id !== answer && 'border-slate-200 opacity-50 dark:border-slate-800',
            )}
          >
            {c.name} <span className="text-slate-500">({c.thai})</span>
          </button>
        ))}
      </div>
      {answered && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3 text-sm dark:bg-slate-950/60">
          <span>
            {correct ? '✅ ถูกต้อง!' : `❌ คำตอบคือ ${pattern.name}`} — {pattern.trade}
          </span>
          <Button
            onClick={() => {
              setRound((r) => r + 1);
              setAnswer(null);
            }}
          >
            ข้อถัดไป →
          </Button>
        </div>
      )}
    </div>
  );
}

/* ---------- 3.4 Indicator Lab ---------- */

type IndKey = 'sma' | 'ema' | 'bb' | 'rsi' | 'macd';

export function IndicatorLab({ initial = ['sma', 'rsi'] as IndKey[] }: { initial?: IndKey[] }) {
  const [regime, setRegime] = useState<Regime>('mixed');
  const [seed, setSeed] = useState(21);
  const [on, setOn] = useState<Record<IndKey, boolean>>({
    sma: initial.includes('sma'),
    ema: initial.includes('ema'),
    bb: initial.includes('bb'),
    rsi: initial.includes('rsi'),
    macd: initial.includes('macd'),
  });
  const [smaP, setSmaP] = useState(50);
  const [emaP, setEmaP] = useState(20);
  const [bbP, setBbP] = useState(20);
  const [bbM, setBbM] = useState(2);
  const [rsiP, setRsiP] = useState(14);

  const candles = useMemo(() => generateCandles({ bars: 180, regime, seed }), [regime, seed]);
  const closes = useMemo(() => candles.map((c) => c.c), [candles]);

  const overlays: OverlayLine[] = [];
  const bands = [];
  const panes: IndicatorPaneDef[] = [];
  if (on.sma) overlays.push({ label: `SMA ${smaP}`, values: sma(closes, smaP), color: 2 });
  if (on.ema) overlays.push({ label: `EMA ${emaP}`, values: ema(closes, emaP), color: 0 });
  if (on.bb) {
    const b = bollinger(closes, bbP, bbM);
    overlays.push({ label: 'BB upper', values: b.upper, color: 3, dash: true }, { label: 'BB mid', values: b.mid, color: 3 }, { label: 'BB lower', values: b.lower, color: 3, dash: true });
    bands.push({ upper: b.upper, lower: b.lower, color: 3 });
  }
  if (on.rsi) panes.push({ title: `RSI ${rsiP}`, lines: [{ label: 'RSI', values: rsi(closes, rsiP), color: 1 }], hlines: [30, 70], domain: [0, 100] });
  if (on.macd) {
    const m = macd(closes);
    panes.push({
      title: 'MACD 12,26,9',
      lines: [
        { label: 'MACD', values: m.macd, color: 0 },
        { label: 'Signal', values: m.signal, color: 2 },
      ],
      hist: m.hist,
      hlines: [0],
    });
  }

  const toggles: { key: IndKey; label: string }[] = [
    { key: 'sma', label: 'SMA' },
    { key: 'ema', label: 'EMA' },
    { key: 'bb', label: 'Bollinger Bands' },
    { key: 'rsi', label: 'RSI' },
    { key: 'macd', label: 'MACD' },
  ];

  return (
    <div className="space-y-3">
      <RegimePicker regime={regime} setRegime={setRegime} onReroll={() => setSeed((s) => s + 1)} />
      <div className="flex flex-wrap gap-1.5">
        {toggles.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setOn((o) => ({ ...o, [t.key]: !o[t.key] }))}
            className={cx(
              'rounded-full border px-3 py-1 text-xs font-medium',
              on[t.key] ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300',
            )}
          >
            {on[t.key] ? '✓ ' : '+ '}
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {on.sma && <Slider label="SMA period" value={smaP} min={5} max={100} onChange={setSmaP} />}
        {on.ema && <Slider label="EMA period" value={emaP} min={5} max={100} onChange={setEmaP} />}
        {on.bb && <Slider label="BB period" value={bbP} min={10} max={50} onChange={setBbP} />}
        {on.bb && <Slider label="BB σ" value={bbM} min={1} max={3} step={0.1} format={(v) => fmtNum(v, 1)} onChange={setBbM} />}
        {on.rsi && <Slider label="RSI period" value={rsiP} min={2} max={30} onChange={setRsiP} />}
      </div>
      <CandleChart candles={candles} overlays={overlays} bands={bands} panes={panes} height={300} />
    </div>
  );
}

/* ---------- 3.5 Valuation ---------- */

export function ValuationCalc() {
  const [price, setPrice] = useState(150);
  const [eps, setEps] = useState(6);
  const [growth, setGrowth] = useState(12);
  const [years, setYears] = useState(5);
  const [exitPe, setExitPe] = useState(20);
  const [bond, setBond] = useState(4.2);

  const pe = eps > 0 ? price / eps : Infinity;
  const ey = (eps / price) * 100;
  const peg = growth > 0 ? pe / growth : Infinity;
  const futureEps = eps * (1 + growth / 100) ** years;
  const futurePrice = futureEps * exitPe;
  const cagr = ((futurePrice / price) ** (1 / years) - 1) * 100;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="ราคาหุ้น" prefix="$" value={price} onChange={setPrice} />
        <NumberField label="EPS (กำไรต่อหุ้น 12 เดือน)" prefix="$" value={eps} step={0.1} onChange={setEps} />
        <NumberField label="ผลตอบแทนพันธบัตร 10 ปี" suffix="%" value={bond} step={0.1} onChange={setBond} />
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label="P/E" value={Number.isFinite(pe) ? fmtNum(pe, 1) : '—'} tone="accent" sub="ราคาหุ้น ÷ EPS" />
        <Stat label="Earnings Yield" value={fmtPct(ey, 2)} sub={`เทียบพันธบัตร ${fmtPct(bond)}`} tone={ey > bond ? 'profit' : 'loss'} />
        <Stat label="PEG" value={Number.isFinite(peg) ? fmtNum(peg, 2) : '—'} sub="P/E ÷ อัตราเติบโต (%)" />
        <Stat label="จ่ายกี่ปีถึงคืนทุน (กำไรคงที่)" value={Number.isFinite(pe) ? `${fmtNum(pe, 0)} ปี` : '—'} />
      </div>
      <div className="rounded-xl bg-white p-4 dark:bg-slate-950/60">
        <div className="mb-3 text-sm font-medium">ประมาณมูลค่าอนาคตแบบง่าย</div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Slider label="EPS เติบโตต่อปี" value={growth} min={-10} max={40} format={(v) => `${v}%`} onChange={setGrowth} />
          <Slider label="จำนวนปี" value={years} min={1} max={10} format={(v) => `${v} ปี`} onChange={setYears} />
          <Slider label="P/E ปลายทาง" value={exitPe} min={5} max={50} onChange={setExitPe} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label={`EPS ปีที่ ${years}`} value={fmtUsd(futureEps)} />
          <Stat label="ราคาที่คาด" value={fmtUsd(futurePrice, 0)} />
          <Stat label="ผลตอบแทนต่อปี" value={fmtPct(cagr)} tone={cagr >= 0 ? 'profit' : 'loss'} />
        </div>
      </div>
    </div>
  );
}
