import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { STRATEGY_MAP } from '../../data/strategies';
import { fmtNum, fmtSignedUsd, fmtUsd } from '../../lib/format';
import { analyzePayoff, netEntryCost, payoffSeries, type Market } from '../../lib/payoff';
import { PayoffChart } from '../charts/PayoffChart';
import { Badge } from '../ui';
import { presetLegs } from './PayoffBuilder';

const MARKET: Market = { spot: 100, iv: 0.3, rate: 0.04 };

const legLabel = (l: { type: string; side: number; qty: number; strike: number; days: number }) =>
  l.type === 'stock'
    ? `${l.side === 1 ? 'Buy' : 'Sell'} หุ้น ${l.qty * 100} หุ้น`
    : `${l.side === 1 ? 'Buy' : 'Sell'} ${l.qty > 1 ? `${l.qty} ` : ''}${l.type === 'call' ? 'Call' : 'Put'} $${l.strike} (${l.days} วัน)`;

/** การ์ดสรุปกลยุทธ์ พร้อมกราฟ payoff ขนาดเล็ก */
export function StrategyCard({ id }: { id: string }) {
  const s = STRATEGY_MAP[id];
  const legs = useMemo(() => presetLegs(id), [id]);
  const data = useMemo(() => payoffSeries(legs, MARKET, 0, 0, 81), [legs]);
  const stats = useMemo(() => analyzePayoff(legs, MARKET), [legs]);
  const net = netEntryCost(legs, MARKET);
  if (!s) return null;

  return (
    <article className="not-prose my-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-0 lg:grid-cols-[1fr_1.1fr]">
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{s.name}</h3>
            <Badge tone={s.definedRisk ? 'green' : 'red'}>{s.definedRisk ? 'ความเสี่ยงจำกัด' : 'ความเสี่ยงสูง/ไม่จำกัด'}</Badge>
            {s.flow !== 'stock' && <Badge tone={s.flow === 'credit' ? 'violet' : 'slate'}>{s.flow === 'credit' ? 'Credit' : 'Debit'}</Badge>}
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{s.summary}</p>

          <ul className="mt-3 space-y-1 text-sm">
            {s.legs.map((l, i) => (
              <li key={i} className="flex items-center gap-2 font-mono text-[13px]">
                <span className={l.side === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>●</span>
                {legLabel(l)}
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="font-medium text-slate-900 dark:text-white">ใช้เมื่อไร</dt>
              <dd className="text-slate-600 dark:text-slate-400">{s.whenToUse}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-900 dark:text-white">ความเสี่ยง</dt>
              <dd className="text-slate-600 dark:text-slate-400">{s.risk}</dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-slate-200 bg-slate-50/60 p-3 lg:border-t-0 lg:border-l dark:border-slate-800 dark:bg-slate-950/40">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-slate-500">{s.flow === 'stock' ? 'ต้นทุนรวม' : net >= 0 ? 'Debit' : 'Credit'}</div>
              <div className="num font-mono font-semibold">{fmtUsd(Math.abs(net), 0)}</div>
            </div>
            <div>
              <div className="text-slate-500">กำไรสูงสุด</div>
              <div className="num font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {stats.unlimitedProfit ? 'ไม่จำกัด' : fmtSignedUsd(stats.maxProfit, 0)}
              </div>
            </div>
            <div>
              <div className="text-slate-500">ขาดทุนสูงสุด</div>
              <div className="num font-mono font-semibold text-rose-600 dark:text-rose-400">
                {stats.unlimitedLoss ? 'ไม่จำกัด' : fmtSignedUsd(stats.maxLoss, 0)}
              </div>
            </div>
          </div>
          <PayoffChart data={data} spot={MARKET.spot} breakevens={stats.breakevens} showNow={false} height={210} compact />
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
            <span>
              จุดคุ้มทุน: {stats.breakevens.map((b) => `$${fmtNum(b, 2)}`).join(', ') || '—'} · หุ้น $100, IV 30%
            </span>
            <Link to={`/tools/payoff?s=${s.id}`} className="font-medium text-teal-700 hover:underline dark:text-teal-300">
              ปรับแต่งใน Payoff Builder →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
