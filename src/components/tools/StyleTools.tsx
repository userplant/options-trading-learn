import { useMemo, useState } from 'react';
import { fmtNum, fmtPct, fmtUsd } from '../../lib/format';
import { aggregate } from '../../lib/indicators';
import { generateCandles } from '../../lib/marketData';
import { CandleChart } from '../charts/CandleChart';
import { Button, NumberField, Segmented, Stat, cx } from '../ui';

const BARS_PER_DAY = 26; // แท่ง 15 นาที × 6.5 ชั่วโมง
const TIMEFRAMES = [
  { value: '15m', label: '15 นาที', n: 1, styles: 'Scalping / Day Trading' },
  { value: '1h', label: '1 ชั่วโมง', n: 4, styles: 'Day Trading / Swing' },
  { value: '1d', label: '1 วัน', n: BARS_PER_DAY, styles: 'Swing / Position' },
] as const;
type TfValue = (typeof TIMEFRAMES)[number]['value'];

/** บทที่ 2.1: ข้อมูลชุดเดียวกัน มองต่าง timeframe */
export function TimeframeZoom() {
  const [tf, setTf] = useState<TfValue>('1d');
  const [seed, setSeed] = useState(11);
  const base = useMemo(() => generateCandles({ bars: BARS_PER_DAY * 40, regime: 'mixed', seed, vol: 0.004 }), [seed]);
  const def = TIMEFRAMES.find((t) => t.value === tf)!;
  const candles = useMemo(() => {
    const agg = aggregate(base, def.n);
    return agg.slice(-Math.min(agg.length, 80));
  }, [base, def.n]);
  const span = (candles.length * def.n) / BARS_PER_DAY;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented value={tf} onChange={setTf} options={TIMEFRAMES.map((t) => ({ value: t.value, label: t.label }))} />
        <Button variant="ghost" onClick={() => setSeed((s) => s + 1)}>
          🎲 ข้อมูลชุดใหม่
        </Button>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        แสดง {candles.length} แท่ง ≈ <strong className="text-slate-900 dark:text-white">{fmtNum(span, span < 5 ? 1 : 0)} วันทำการ</strong> ·
        เหมาะกับ <strong className="text-slate-900 dark:text-white">{def.styles}</strong>
      </p>
      <CandleChart candles={candles} height={260} />
    </div>
  );
}

interface StylePreset {
  value: string;
  label: string;
  tradesPerMonth: number;
  position: number;
  spreadCents: number;
}

const COST_PRESETS: StylePreset[] = [
  { value: 'scalp', label: 'Scalping', tradesPerMonth: 400, position: 20000, spreadCents: 1 },
  { value: 'day', label: 'Day Trading', tradesPerMonth: 60, position: 15000, spreadCents: 2 },
  { value: 'swing', label: 'Swing', tradesPerMonth: 8, position: 8000, spreadCents: 3 },
  { value: 'position', label: 'Position', tradesPerMonth: 1, position: 10000, spreadCents: 3 },
];

/** บทที่ 2.2: ต้นทุนการเทรดตามสไตล์ */
export function TradingCostByStyle() {
  const [style, setStyle] = useState('day');
  const [capital, setCapital] = useState(30000);
  const [trades, setTrades] = useState(60);
  const [position, setPosition] = useState(15000);
  const [spreadCents, setSpread] = useState(2);
  const [commission, setCommission] = useState(0);
  const [price, setPrice] = useState(50);

  const pick = (v: string) => {
    const p = COST_PRESETS.find((x) => x.value === v)!;
    setStyle(v);
    setTrades(p.tradesPerMonth);
    setPosition(p.position);
    setSpread(p.spreadCents);
  };

  const shares = Math.floor(position / price);
  // spread จ่ายครึ่งหนึ่งตอนเข้า ครึ่งหนึ่งตอนออก (เทียบกับราคากลาง) = spread เต็ม 1 ครั้งต่อรอบ
  const perRound = shares * (spreadCents / 100) + commission * 2;
  const yearly = perRound * trades * 12;
  const yearlyPct = (yearly / capital) * 100;
  const edgeNeeded = (perRound / position) * 100;

  return (
    <div className="space-y-4">
      <Segmented value={style} onChange={pick} options={COST_PRESETS.map((p) => ({ value: p.value, label: p.label }))} />
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <NumberField label="เงินทุน" prefix="$" value={capital} step={1000} onChange={setCapital} />
        <NumberField label="จำนวนรอบ/เดือน" value={trades} onChange={setTrades} />
        <NumberField label="ขนาดสถานะ" prefix="$" value={position} step={1000} onChange={setPosition} />
        <NumberField label="ราคาหุ้น" prefix="$" value={price} onChange={setPrice} />
        <NumberField label="Spread" suffix="¢" value={spreadCents} onChange={setSpread} />
        <NumberField label="ค่าคอม/ครั้ง" prefix="$" value={commission} step={0.5} onChange={setCommission} />
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label="ต้นทุนต่อรอบ" value={fmtUsd(perRound)} sub={`${shares.toLocaleString()} หุ้น`} />
        <Stat label="ต้นทุนต่อปี" value={fmtUsd(yearly, 0)} tone="loss" />
        <Stat label="คิดเป็น % ของเงินทุน/ปี" value={fmtPct(yearlyPct)} tone={yearlyPct > 10 ? 'loss' : 'default'} />
        <Stat label="ต้องกำไรต่อรอบอย่างน้อย" value={fmtPct(edgeNeeded, 3)} sub="เพื่อแค่คุ้มต้นทุน" tone="accent" />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        ยิ่งเทรดถี่ ต้นทุนเล็กๆ ต่อรอบยิ่งทบกันเป็นก้อนใหญ่ Scalper ต้องมีความได้เปรียบต่อรอบสูงกว่าต้นทุนนี้ ซึ่งยากมากสำหรับรายย่อย
      </p>
    </div>
  );
}

type StyleKey = 'scalp' | 'day' | 'swing' | 'position' | 'invest';

const STYLE_INFO: Record<StyleKey, { name: string; desc: string }> = {
  scalp: { name: 'Scalping', desc: 'เข้าออกภายในไม่กี่วินาทีถึงนาที ต้องโฟกัสหน้าจอตลอด ต้นทุนต่ำและการส่งคำสั่งเร็วเป็นหัวใจ' },
  day: { name: 'Day Trading', desc: 'ปิดสถานะทั้งหมดภายในวัน ไม่ถือข้ามคืน ต้องมีเวลาช่วงตลาดเปิด (ดึกสำหรับคนไทย) และทุนตามกฎ PDT' },
  swing: { name: 'Swing Trading', desc: 'ถือไม่กี่วันถึงไม่กี่สัปดาห์ ใช้กราฟรายวัน วิเคราะห์ตอนตลาดปิดได้ เหมาะกับคนมีงานประจำ' },
  position: { name: 'Position Trading', desc: 'ถือหลายสัปดาห์ถึงหลายเดือนตามเทรนด์ใหญ่ ใช้เวลาน้อย ต้องทนความผันผวนระหว่างทาง' },
  invest: { name: 'ลงทุนระยะยาว', desc: 'ถือเป็นปีตามพื้นฐานบริษัท ใช้เวลาน้อยที่สุด ต้นทุนต่ำ และได้ประโยชน์จากดอกเบี้ยทบต้น' },
};

const QUIZ: { q: string; choices: { label: string; score: Partial<Record<StyleKey, number>> }[] }[] = [
  {
    q: 'คุณมีเวลาดูกราฟช่วงตลาดสหรัฐเปิด (20:30–03:00 น.) ได้แค่ไหน?',
    choices: [
      { label: 'ได้ตลอดทุกคืน', score: { scalp: 2, day: 2 } },
      { label: 'บางคืน ไม่กี่ชั่วโมง', score: { day: 1, swing: 2 } },
      { label: 'แทบไม่ได้เลย ดูได้แค่เช้า/เย็น', score: { swing: 1, position: 2, invest: 2 } },
    ],
  },
  {
    q: 'เงินทุนสำหรับเทรดของคุณประมาณเท่าไร?',
    choices: [
      { label: 'ต่ำกว่า $25,000', score: { swing: 2, position: 2, invest: 2 } },
      { label: '$25,000 ขึ้นไป', score: { day: 2, scalp: 1, swing: 1 } },
    ],
  },
  {
    q: 'ถ้าถือหุ้นแล้วเปิดตลาดมา gap ลง 5% คุณรู้สึกอย่างไร?',
    choices: [
      { label: 'นอนไม่หลับ ไม่ชอบถือข้ามคืน', score: { scalp: 2, day: 2 } },
      { label: 'กังวลบ้าง แต่มีแผนรองรับ', score: { swing: 2, position: 1 } },
      { label: 'เฉยๆ มองระยะยาว', score: { position: 2, invest: 2 } },
    ],
  },
  {
    q: 'คุณชอบตัดสินใจแบบไหน?',
    choices: [
      { label: 'เร็ว ตามจังหวะ ใช้สัญชาตญาณ', score: { scalp: 2, day: 1 } },
      { label: 'มีเวลาวิเคราะห์ก่อน วางแผนล่วงหน้า', score: { swing: 2, position: 1 } },
      { label: 'ศึกษาพื้นฐานลึกๆ แล้วถือยาว', score: { invest: 2, position: 1 } },
    ],
  },
  {
    q: 'คุณคาดหวังจำนวนการเทรดต่อเดือนแค่ไหน?',
    choices: [
      { label: 'หลายร้อยครั้ง', score: { scalp: 2 } },
      { label: 'หลายสิบครั้ง', score: { day: 2 } },
      { label: 'ไม่กี่ครั้ง', score: { swing: 2, position: 1 } },
      { label: 'ปีละไม่กี่ครั้ง', score: { invest: 2, position: 1 } },
    ],
  },
];

/** บทที่ 2.3: แบบทดสอบสไตล์ */
export function StyleQuiz() {
  const [answers, setAnswers] = useState<(number | null)[]>(QUIZ.map(() => null));
  const done = answers.every((a) => a !== null);

  const scores: Record<StyleKey, number> = { scalp: 0, day: 0, swing: 0, position: 0, invest: 0 };
  answers.forEach((a, qi) => {
    if (a === null) return;
    for (const [k, v] of Object.entries(QUIZ[qi].choices[a].score)) scores[k as StyleKey] += v!;
  });
  const ranked = (Object.keys(scores) as StyleKey[]).sort((a, b) => scores[b] - scores[a]);
  const max = Math.max(...Object.values(scores), 1);

  return (
    <div className="space-y-5">
      {QUIZ.map((item, qi) => (
        <div key={qi}>
          <p className="mb-2 text-sm font-medium">
            {qi + 1}. {item.q}
          </p>
          <div className="flex flex-wrap gap-2">
            {item.choices.map((c, ci) => (
              <button
                key={ci}
                type="button"
                onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? ci : v)))}
                className={cx(
                  'rounded-lg border px-3 py-1.5 text-sm transition',
                  answers[qi] === ci
                    ? 'border-teal-500 bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-200'
                    : 'border-slate-200 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950/60',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {done ? (
        <div className="rounded-xl bg-white p-4 dark:bg-slate-950/60">
          <div className="text-sm text-slate-500">สไตล์ที่เหมาะกับคุณที่สุด</div>
          <div className="text-xl font-bold text-teal-700 dark:text-teal-300">{STYLE_INFO[ranked[0]].name}</div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{STYLE_INFO[ranked[0]].desc}</p>
          <div className="mt-4 space-y-1.5">
            {ranked.map((k) => (
              <div key={k} className="grid grid-cols-[130px_1fr] items-center gap-2 text-sm">
                <span>{STYLE_INFO[k].name}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-teal-500" style={{ width: `${(scores[k] / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="mt-3" onClick={() => setAnswers(QUIZ.map(() => null))}>
            ทำใหม่
          </Button>
        </div>
      ) : (
        <p className="text-sm text-slate-500">ตอบให้ครบ {QUIZ.length} ข้อเพื่อดูผล</p>
      )}
    </div>
  );
}
