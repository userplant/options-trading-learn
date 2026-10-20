import { useState } from 'react';
import { GLOSSARY, type GlossaryEntry } from '../data/glossary';
import { Segmented } from '../components/ui';

const CATEGORIES: (GlossaryEntry['category'] | 'ทั้งหมด')[] = ['ทั้งหมด', 'ตลาด', 'คำสั่ง', 'Options', 'Greeks', 'ความเสี่ยง'];

export function GlossaryPage() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('ทั้งหมด');
  const query = q.trim().toLowerCase();

  const entries = Object.values(GLOSSARY)
    .filter((e) => cat === 'ทั้งหมด' || e.category === cat)
    .filter((e) => !query || [e.term, e.thai, e.definition].some((s) => s.toLowerCase().includes(query)))
    .sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">📖 อภิธานศัพท์</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        ศัพท์การเทรดไทย–อังกฤษ {Object.keys(GLOSSARY).length} คำ · ในบทเรียน ชี้หรือแตะคำที่มีเส้นประเพื่อดูความหมาย
      </p>

      <div className="mt-6 space-y-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหาคำศัพท์ เช่น delta, ค่าพรีเมียม, spread…"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900"
        />
        <Segmented size="sm" value={cat} onChange={setCat} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
      </div>

      <dl className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {entries.map((e) => (
          <div key={e.term} className="grid gap-1 p-4 sm:grid-cols-[220px_1fr] sm:gap-4">
            <dt>
              <div className="font-semibold text-slate-900 dark:text-white">{e.term}</div>
              <div className="text-sm text-teal-700 dark:text-teal-300">{e.thai}</div>
            </dt>
            <dd className="text-sm text-slate-600 dark:text-slate-300">
              {e.definition}
              <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 dark:bg-slate-800">{e.category}</span>
            </dd>
          </div>
        ))}
        {entries.length === 0 && <div className="p-6 text-center text-sm text-slate-500">ไม่พบคำที่ค้นหา</div>}
      </dl>
    </div>
  );
}
