import { useMemo, useState } from 'react';
import { stableOrder } from '../../lib/shuffle';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fmtNum, fmtPct } from '../../lib/format';
import { loadJSON, saveJSON } from '../../lib/storage';
import { tooltipStyle, useTheme } from '../../lib/theme';
import { Badge, Button, NumberField, Stat, cx } from '../ui';

/* ---------- 7.2 สถานการณ์จำลอง ---------- */

interface Scenario {
  title: string;
  situation: string;
  choices: { label: string; disciplined: boolean; bias?: string; feedback: string }[];
}

const RAW_SCENARIOS: Scenario[] = [
  {
    title: 'หุ้นพุ่งแรงโดยที่คุณไม่ได้ถือ',
    situation: 'หุ้น XYZ ขึ้นมา 25% ใน 3 วันจากข่าว AI ทุกคนในกลุ่มแชทพูดถึง คุณไม่มีแผนเทรดหุ้นตัวนี้มาก่อน',
    choices: [
      { label: 'รีบซื้อด้วย Market order ก่อนจะขึ้นไปอีก', disciplined: false, bias: 'FOMO', feedback: 'การไล่ราคาหลังวิ่งแรงมักได้ราคาแย่และไม่มีจุด stop ที่ชัดเจน นี่คือ FOMO แบบคลาสสิก' },
      { label: 'เพิ่มเข้า watchlist รอจังหวะย่อตัวตามแผน และกำหนด stop ก่อนเข้า', disciplined: true, feedback: 'ดีมาก ถ้ายังน่าสนใจ ให้รอ setup ที่มีจุดเข้าและจุดตัดขาดทุนชัดเจน' },
      { label: 'ซื้อ Call OTM ใกล้หมดอายุ เพราะถูกและได้ leverage สูง', disciplined: false, bias: 'FOMO + Overconfidence', feedback: 'IV หลังข่าวมักสูงมาก Call OTM ใกล้หมดอายุมีโอกาสหมดค่าสูง เป็น FOMO ที่แพงกว่าเดิม' },
    ],
  },
  {
    title: 'หลังขาดทุน 3 ไม้ติด',
    situation: 'วันนี้คุณโดน stop 3 ไม้ติดกัน ขาดทุนรวม 3R ถึง daily loss limit ที่ตั้งไว้แล้ว แต่เห็น setup ใหม่ที่ดูดีมาก',
    choices: [
      { label: 'เข้าไม้ใหม่ด้วยขนาด 2 เท่า จะได้ได้คืนในไม้เดียว', disciplined: false, bias: 'Revenge Trading', feedback: 'การเพิ่มขนาดเพื่อเอาคืนคือ Revenge Trading ทำให้วันที่แย่กลายเป็นวันหายนะ' },
      { label: 'หยุดเทรดวันนี้ตามกฎ จดบันทึกว่าเกิดอะไรขึ้น', disciplined: true, feedback: 'ถูกต้อง Daily loss limit มีไว้ปกป้องคุณจากการตัดสินใจตอนอารมณ์ไม่ปกติ' },
      { label: 'เข้าไม้ใหม่ขนาดปกติ เพราะ setup ดีจริงๆ', disciplined: false, bias: 'ละเมิดกฎ', feedback: 'แม้ขนาดปกติ แต่การละเมิดกฎที่ตั้งไว้เองทำลายวินัยในระยะยาว setup ดีๆ มีมาใหม่เสมอ' },
    ],
  },
  {
    title: 'ราคาใกล้จุด Stop',
    situation: 'คุณซื้อหุ้นที่ $50 stop ที่ $47 ตอนนี้ราคา $47.20 และกำลังลงต่อ',
    choices: [
      { label: 'เลื่อน stop ลงไป $44 ให้มีที่หายใจ', disciplined: false, bias: 'Loss Aversion', feedback: 'การเลื่อน stop หนีคือการไม่ยอมรับว่าผิด ขาดทุน 1R จะกลายเป็น 2R หรือมากกว่า' },
      { label: 'ปล่อยให้ stop ทำงานตามแผน', disciplined: true, feedback: 'ถูกต้อง Stop ถูกตั้งตอนที่คุณคิดอย่างมีเหตุผล ให้เคารพการตัดสินใจนั้น' },
      { label: 'ซื้อเพิ่มเพื่อถัวเฉลี่ยต้นทุน', disciplined: false, bias: 'Sunk Cost', feedback: 'การถัวขาลงโดยไม่มีแผนเพิ่มทั้งขนาดและความเสี่ยงในไม้ที่ตลาดบอกว่าคุณผิด' },
    ],
  },
  {
    title: 'กำไรเร็วกว่าที่คิด',
    situation: 'ซื้อที่ $100 stop $96 เป้า $112 วันแรกราคาขึ้นไป $104 แล้ว คุณรู้สึกกลัวกำไรจะหาย',
    choices: [
      { label: 'ขายทันทีเพื่อล็อกกำไร +1R', disciplined: false, bias: 'Disposition Effect', feedback: 'การรีบตัดกำไรแต่ปล่อยขาดทุนยาวทำให้ expectancy ติดลบ แม้ win rate สูง' },
      { label: 'ทำตามแผน หรือเลื่อน stop ขึ้นมาที่ทุนตามกฎ trailing ที่กำหนดไว้', disciplined: true, feedback: 'ดีมาก ถ้ามีกฎ trailing stop ไว้ก่อน ก็ใช้ได้ สิ่งสำคัญคือทำตามแผน ไม่ใช่ตามอารมณ์' },
    ],
  },
  {
    title: 'ข้อมูลขัดแย้งกับมุมมอง',
    situation: 'คุณ Long หุ้นอยู่และเชื่อมั่นมาก มีบทวิเคราะห์ใหม่ชี้ความเสี่ยงสำคัญของบริษัท',
    choices: [
      { label: 'ไม่อ่าน หาแต่บทความที่สนับสนุนมุมมองตัวเอง', disciplined: false, bias: 'Confirmation Bias', feedback: 'การเลือกรับแต่ข้อมูลที่ตรงกับความเชื่อ ทำให้มองไม่เห็นความเสี่ยงจริง' },
      { label: 'อ่านอย่างเป็นกลาง ถ้าข้อสมมติเปลี่ยนก็ปรับแผน', disciplined: true, feedback: 'ถูกต้อง เทรดเดอร์ที่ดีพร้อมเปลี่ยนใจเมื่อหลักฐานเปลี่ยน' },
    ],
  },
  {
    title: 'ตลาดเงียบ ไม่มี setup',
    situation: 'สัปดาห์นี้ไม่มีหุ้นตัวไหนตรงเงื่อนไขในแผนเลย คุณรู้สึกว่าต้องเทรดอะไรสักอย่าง',
    choices: [
      { label: 'ผ่อนเงื่อนไขลงเพื่อให้ได้เทรด', disciplined: false, bias: 'Overtrading', feedback: 'การเทรดเพราะเบื่อ ไม่ใช่เพราะมี edge เป็นต้นเหตุของการขาดทุนจากค่าธรรมเนียมและ setup คุณภาพต่ำ' },
      { label: 'ไม่เทรด ใช้เวลาทบทวน journal และ backtest', disciplined: true, feedback: 'การไม่เทรดก็เป็นสถานะหนึ่ง (cash is a position) และช่วยรักษาเงินทุน' },
    ],
  },
];

const SCENARIOS: Scenario[] = RAW_SCENARIOS.map((sc, i) => ({
  ...sc,
  choices: stableOrder(sc.choices.length, `scenario#${i}`).map((k) => sc.choices[k]),
}));

export function ScenarioGame() {
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>(SCENARIOS.map(() => null));
  const s = SCENARIOS[idx];
  const picked = picks[idx];
  const finished = picks.every((p) => p !== null);
  const score = picks.filter((p, i) => p !== null && SCENARIOS[i].choices[p].disciplined).length;
  const biases = picks
    .map((p, i) => (p !== null ? SCENARIOS[i].choices[p].bias : undefined))
    .filter((b): b is string => !!b);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {SCENARIOS.map((sc, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`สถานการณ์ ${i + 1}`}
            className={cx(
              'h-8 w-8 rounded-full text-sm font-semibold',
              i === idx && 'ring-2 ring-teal-500',
              picks[i] === null
                ? 'bg-slate-100 dark:bg-slate-800'
                : sc.choices[picks[i]!].disciplined
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-500 text-white',
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-white p-4 dark:bg-slate-950/60">
        <div className="text-xs text-slate-500">
          สถานการณ์ {idx + 1}/{SCENARIOS.length}
        </div>
        <div className="font-semibold text-slate-900 dark:text-white">{s.title}</div>
        <p className="mt-1 text-sm">{s.situation}</p>
        <div className="mt-3 grid gap-2">
          {s.choices.map((c, ci) => (
            <button
              key={ci}
              type="button"
              disabled={picked !== null}
              onClick={() => setPicks((p) => p.map((v, i) => (i === idx ? ci : v)))}
              className={cx(
                'rounded-xl border px-3 py-2.5 text-left text-sm',
                picked === null && 'border-slate-200 hover:border-teal-500 dark:border-slate-700',
                picked !== null && c.disciplined && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                picked === ci && !c.disciplined && 'border-rose-500 bg-rose-50 dark:bg-rose-950/40',
                picked !== null && picked !== ci && !c.disciplined && 'border-slate-200 opacity-50 dark:border-slate-800',
              )}
            >
              {c.label}
              {picked !== null && (picked === ci || c.disciplined) && (
                <span className="mt-1 block text-xs text-slate-600 dark:text-slate-300">
                  {c.bias && <Badge tone="red">{c.bias}</Badge>} {c.feedback}
                </span>
              )}
            </button>
          ))}
        </div>
        {picked !== null && idx < SCENARIOS.length - 1 && (
          <Button className="mt-3" onClick={() => setIdx(idx + 1)}>
            สถานการณ์ถัดไป →
          </Button>
        )}
      </div>

      {finished && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/40">
          <div className="font-semibold">
            คะแนนวินัย: {score}/{SCENARIOS.length}
          </div>
          {biases.length > 0 ? (
            <p className="mt-1 text-sm">
              Bias ที่ต้องระวัง: {[...new Set(biases)].map((b) => <Badge key={b} tone="red">{b}</Badge>)}
            </p>
          ) : (
            <p className="mt-1 text-sm">ยอดเยี่ยม! ทำตามแผนได้ทุกสถานการณ์ — ส่วนที่ยากคือทำแบบนี้ได้ตอนเงินจริงอยู่ในตลาด</p>
          )}
          <Button
            variant="ghost"
            className="mt-2"
            onClick={() => {
              setPicks(SCENARIOS.map(() => null));
              setIdx(0);
            }}
          >
            เริ่มใหม่
          </Button>
        </div>
      )}
    </div>
  );
}

/* ---------- 7.3 Trading Journal ---------- */

export const EMOTIONS = ['มั่นใจตามแผน', 'FOMO', 'กลัว', 'โลภ', 'เอาคืน', 'เบื่อ'] as const;

export interface JournalEntry {
  id: string;
  date: string;
  symbol: string;
  setup: string;
  r: number;
  emotion: (typeof EMOTIONS)[number];
  followedPlan: boolean;
  note: string;
}

const JOURNAL_KEY = 'trading-lab-journal-v1';

const SAMPLE: JournalEntry[] = [
  { id: 's1', date: '2026-09-01', symbol: 'AAPL', setup: 'Pullback', r: 1.8, emotion: 'มั่นใจตามแผน', followedPlan: true, note: '' },
  { id: 's2', date: '2026-09-03', symbol: 'NVDA', setup: 'Breakout', r: -1, emotion: 'มั่นใจตามแผน', followedPlan: true, note: '' },
  { id: 's3', date: '2026-09-04', symbol: 'TSLA', setup: 'Breakout', r: -2.4, emotion: 'FOMO', followedPlan: false, note: 'ไล่ราคา ไม่ได้ตั้ง stop' },
  { id: 's4', date: '2026-09-08', symbol: 'MSFT', setup: 'Pullback', r: 2.2, emotion: 'มั่นใจตามแผน', followedPlan: true, note: '' },
  { id: 's5', date: '2026-09-09', symbol: 'AMD', setup: 'Breakout', r: -1.6, emotion: 'เอาคืน', followedPlan: false, note: 'เข้าหลังโดน stop TSLA' },
  { id: 's6', date: '2026-09-12', symbol: 'META', setup: 'Pullback', r: -1, emotion: 'มั่นใจตามแผน', followedPlan: true, note: '' },
  { id: 's7', date: '2026-09-15', symbol: 'GOOGL', setup: 'Pullback', r: 2.5, emotion: 'มั่นใจตามแผน', followedPlan: true, note: '' },
  { id: 's8', date: '2026-09-18', symbol: 'AMZN', setup: 'Breakout', r: 3, emotion: 'มั่นใจตามแผน', followedPlan: true, note: '' },
];

function groupStats(entries: JournalEntry[], key: (e: JournalEntry) => string) {
  const map = new Map<string, number[]>();
  for (const e of entries) map.set(key(e), [...(map.get(key(e)) ?? []), e.r]);
  return [...map.entries()].map(([k, rs]) => ({
    k,
    n: rs.length,
    winRate: (rs.filter((r) => r > 0).length / rs.length) * 100,
    expectancy: rs.reduce((a, b) => a + b, 0) / rs.length,
    total: rs.reduce((a, b) => a + b, 0),
  }));
}

export function TradingJournal() {
  const { palette } = useTheme();
  const [entries, setEntries] = useState<JournalEntry[]>(() => loadJSON(JOURNAL_KEY, [] as JournalEntry[]));
  const [form, setForm] = useState({ symbol: '', setup: 'Pullback', r: 1, emotion: EMOTIONS[0] as JournalEntry['emotion'], followedPlan: true, note: '' });

  const persist = (next: JournalEntry[]) => {
    setEntries(next);
    saveJSON(JOURNAL_KEY, next);
  };

  const add = () => {
    if (!form.symbol.trim()) return;
    persist([
      ...entries,
      { ...form, symbol: form.symbol.trim().toUpperCase(), id: `${Date.now()}`, date: new Date().toISOString().slice(0, 10) },
    ]);
    setForm((f) => ({ ...f, symbol: '', note: '' }));
  };

  const curve = useMemo(() => {
    let cum = 0;
    return [{ n: 0, r: 0 }, ...entries.map((e, i) => ({ n: i + 1, r: (cum += e.r) }))];
  }, [entries]);

  const total = entries.reduce((s, e) => s + e.r, 0);
  const wins = entries.filter((e) => e.r > 0).length;
  const bySetup = groupStats(entries, (e) => e.setup);
  const byPlan = groupStats(entries, (e) => (e.followedPlan ? 'ทำตามแผน' : 'ไม่ทำตามแผน'));
  const byEmotion = groupStats(entries, (e) => e.emotion);

  const exportCsv = () => {
    const rows = [['date', 'symbol', 'setup', 'r', 'emotion', 'followedPlan', 'note'], ...entries.map((e) => [e.date, e.symbol, e.setup, e.r, e.emotion, e.followedPlan, e.note.replace(/"/g, '""')])];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trading-journal.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950';

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl bg-white p-3 sm:grid-cols-2 lg:grid-cols-6 dark:bg-slate-950/60">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600 dark:text-slate-400">Symbol</span>
          <input className={input} value={form.symbol} placeholder="AAPL" onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600 dark:text-slate-400">Setup</span>
          <input className={input} value={form.setup} list="setups" onChange={(e) => setForm({ ...form, setup: e.target.value })} />
          <datalist id="setups">
            {['Pullback', 'Breakout', 'Mean Reversion', 'Earnings', 'Options: Credit Spread'].map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <NumberField label="ผลลัพธ์ (R)" value={form.r} step={0.1} onChange={(r) => setForm({ ...form, r })} />
        <label className="text-sm">
          <span className="mb-1 block text-slate-600 dark:text-slate-400">อารมณ์ตอนเข้า</span>
          <select className={input} value={form.emotion} onChange={(e) => setForm({ ...form, emotion: e.target.value as JournalEntry['emotion'] })}>
            {EMOTIONS.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" className="accent-teal-600" checked={form.followedPlan} onChange={(e) => setForm({ ...form, followedPlan: e.target.checked })} />
          ทำตามแผน
        </label>
        <div className="flex items-end">
          <Button onClick={add} className="w-full">
            + บันทึก
          </Button>
        </div>
        <label className="text-sm sm:col-span-2 lg:col-span-6">
          <span className="mb-1 block text-slate-600 dark:text-slate-400">บันทึกเพิ่มเติม</span>
          <input className={input} value={form.note} placeholder="เหตุผลที่เข้า/ออก, สิ่งที่เรียนรู้" onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </label>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl bg-slate-100 p-6 text-center text-sm dark:bg-slate-800/60">
          ยังไม่มีบันทึก{' '}
          <button type="button" className="font-medium text-teal-700 underline dark:text-teal-300" onClick={() => persist(SAMPLE)}>
            โหลดตัวอย่าง 8 รายการ
          </button>{' '}
          เพื่อดูว่า journal วิเคราะห์อะไรได้บ้าง
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat label="จำนวนไม้" value={entries.length} />
            <Stat label="Win Rate" value={fmtPct((wins / entries.length) * 100, 0)} />
            <Stat label="Expectancy" value={`${fmtNum(total / entries.length, 2)}R`} tone={total >= 0 ? 'profit' : 'loss'} />
            <Stat label="รวม" value={`${total >= 0 ? '+' : ''}${fmtNum(total, 1)}R`} tone={total >= 0 ? 'profit' : 'loss'} />
          </div>

          <div className="h-48 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curve} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" />
                <XAxis dataKey="n" tick={{ fill: palette.axis, fontSize: 11 }} stroke={palette.grid} />
                <YAxis tick={{ fill: palette.axis, fontSize: 11 }} stroke={palette.grid} width={40} tickFormatter={(v) => `${v}R`} />
                <Tooltip {...tooltipStyle(palette)} labelFormatter={(v) => `หลังไม้ที่ ${v}`} formatter={(v) => [`${fmtNum(Number(v), 1)}R`, 'สะสม']} />
                <ReferenceLine y={0} stroke={palette.axis} />
                <Line dataKey="r" stroke={palette.accent} strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {[
              { title: 'แยกตาม Setup', rows: bySetup },
              { title: 'ทำตามแผน vs ไม่ทำ', rows: byPlan },
              { title: 'แยกตามอารมณ์', rows: byEmotion },
            ].map((g) => (
              <div key={g.title} className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-950/60">
                <div className="mb-2 font-semibold">{g.title}</div>
                <table className="w-full">
                  <tbody>
                    {g.rows.map((r) => (
                      <tr key={r.k} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="py-1">{r.k}</td>
                        <td className="py-1 text-right text-slate-500">{r.n} ไม้</td>
                        <td className={cx('num py-1 text-right font-mono', r.expectancy >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                          {fmtNum(r.expectancy, 2)}R
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="px-3 py-2">วันที่</th>
                  <th className="px-3 py-2">Symbol</th>
                  <th className="px-3 py-2">Setup</th>
                  <th className="px-3 py-2 text-right">R</th>
                  <th className="px-3 py-2">อารมณ์</th>
                  <th className="px-3 py-2">แผน</th>
                  <th className="px-3 py-2">บันทึก</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {[...entries].reverse().map((e) => (
                  <tr key={e.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-1.5 whitespace-nowrap">{e.date}</td>
                    <td className="px-3 py-1.5 font-mono">{e.symbol}</td>
                    <td className="px-3 py-1.5">{e.setup}</td>
                    <td className={cx('num px-3 py-1.5 text-right font-mono', e.r >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                      {e.r > 0 ? '+' : ''}
                      {fmtNum(e.r, 1)}
                    </td>
                    <td className="px-3 py-1.5">{e.emotion}</td>
                    <td className="px-3 py-1.5">{e.followedPlan ? '✓' : '✗'}</td>
                    <td className="px-3 py-1.5 text-slate-500">{e.note}</td>
                    <td className="px-2">
                      <button type="button" aria-label="ลบ" className="text-slate-400 hover:text-rose-600" onClick={() => persist(entries.filter((x) => x.id !== e.id))}>
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportCsv}>
              ⬇ Export CSV
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (window.confirm('ลบบันทึกทั้งหมด?')) persist([]);
              }}
            >
              ล้างทั้งหมด
            </Button>
          </div>
          <p className="text-xs text-slate-500">บันทึกเก็บไว้ในเบราว์เซอร์นี้เท่านั้น ควร Export CSV สำรองไว้เป็นระยะ</p>
        </>
      )}
    </div>
  );
}

/* ---------- 7.3 Trading Plan ---------- */

const PLAN_KEY = 'trading-lab-plan-v1';

const PLAN_FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: 'goal', label: 'เป้าหมาย', placeholder: 'เช่น ผลตอบแทน 15%/ปี โดย Max Drawdown ไม่เกิน 15%' },
  { key: 'market', label: 'ตลาดและสินทรัพย์', placeholder: 'เช่น หุ้นสหรัฐขนาดใหญ่ใน S&P 500 และ options ของ SPY/QQQ' },
  { key: 'style', label: 'สไตล์และ timeframe', placeholder: 'เช่น Swing trading กราฟรายวัน ถือ 3–15 วัน' },
  { key: 'setups', label: 'Setup ที่เทรด', placeholder: 'เช่น Pullback ในขาขึ้น (เหนือ SMA 100) ย่อแตะ EMA 20' },
  { key: 'entry', label: 'กฎการเข้า', placeholder: 'เช่น เข้าเมื่อแท่งเขียวปิดเหนือ EMA 20 หลังย่อตัว volume ไม่ต่ำกว่าค่าเฉลี่ย' },
  { key: 'exit', label: 'กฎการออก (Stop / Target)', placeholder: 'เช่น Stop ใต้ swing low ล่าสุด, Target 2R, trailing stop เมื่อได้ 1R' },
  { key: 'risk', label: 'การบริหารความเสี่ยง', placeholder: 'เช่น เสี่ยงไม้ละ 1%, รวมไม่เกิน 5%, Daily loss limit 3R, หยุด 1 สัปดาห์ถ้า drawdown 10%' },
  { key: 'routine', label: 'กิจวัตร', placeholder: 'เช่น สแกนหุ้นวันอาทิตย์, เช็คข่าวก่อนตลาดเปิด, เขียน journal ทุกไม้, ทบทวนทุกสิ้นเดือน' },
];

export function TradingPlanBuilder() {
  const [plan, setPlan] = useState<Record<string, string>>(() => loadJSON(PLAN_KEY, {} as Record<string, string>));
  const [copied, setCopied] = useState(false);

  const update = (key: string, v: string) => {
    const next = { ...plan, [key]: v };
    setPlan(next);
    saveJSON(PLAN_KEY, next);
  };

  const markdown = ['# Trading Plan', '', ...PLAN_FIELDS.flatMap((f) => [`## ${f.label}`, plan[f.key]?.trim() || `_${f.placeholder}_`, ''])].join('\n');
  const filled = PLAN_FIELDS.filter((f) => plan[f.key]?.trim()).length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-600 dark:text-slate-400">
        กรอกแล้ว {filled}/{PLAN_FIELDS.length} หัวข้อ · บันทึกอัตโนมัติในเบราว์เซอร์
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {PLAN_FIELDS.map((f) => (
          <label key={f.key} className="block text-sm">
            <span className="mb-1 block font-medium">{f.label}</span>
            <textarea
              rows={2}
              value={plan[f.key] ?? ''}
              placeholder={f.placeholder}
              onChange={(e) => update(f.key, e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={copy}>{copied ? '✓ คัดลอกแล้ว' : '📋 คัดลอกเป็น Markdown'}</Button>
        <Button variant="ghost" onClick={() => window.print()}>
          🖨 พิมพ์
        </Button>
      </div>
    </div>
  );
}
