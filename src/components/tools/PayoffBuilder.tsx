import { useMemo, useState } from 'react';
import { STRATEGIES, STRATEGY_MAP } from '../../data/strategies';
import { fmtNum, fmtPct, fmtSignedUsd, fmtUsd } from '../../lib/format';
import {
  analyzePayoff,
  CONTRACT_SIZE,
  legEntryPrice,
  nearestExpiry,
  netEntryCost,
  newLegId,
  payoffSeries,
  positionGreeks,
  type Leg,
  type LegType,
  type Market,
} from '../../lib/payoff';
import { PayoffChart } from '../charts/PayoffChart';
import { Button, Segmented, Slider, Stat, cx } from '../ui';

const DEFAULT_SPOT = 100;

function roundStrike(v: number, spot: number) {
  const inc = spot >= 200 ? 5 : spot >= 50 ? 1 : 0.5;
  return Math.max(Math.round(v / inc) * inc, inc);
}

export function presetLegs(id: string, spot = DEFAULT_SPOT): Leg[] {
  const s = STRATEGY_MAP[id] ?? STRATEGIES[0];
  return s.legs.map((l) => ({
    ...l,
    id: newLegId(),
    strike: l.type === 'stock' ? 0 : roundStrike((l.strike * spot) / DEFAULT_SPOT, spot),
  }));
}

export function PayoffBuilder({ initialStrategy = 'bull-call-spread' }: { initialStrategy?: string }) {
  const [presetId, setPresetId] = useState(STRATEGY_MAP[initialStrategy] ? initialStrategy : 'bull-call-spread');
  const [market, setMarket] = useState<Market>({ spot: DEFAULT_SPOT, iv: 0.3, rate: 0.04 });
  const [legs, setLegs] = useState<Leg[]>(() => presetLegs(presetId));
  const [elapsed, setElapsed] = useState(0);
  const [ivShift, setIvShift] = useState(0);

  const expiry = nearestExpiry(legs);
  const elapsedClamped = Math.min(elapsed, expiry);
  const hasLegs = legs.length > 0;

  const series = useMemo(
    () => (hasLegs ? payoffSeries(legs, market, elapsedClamped, ivShift) : []),
    [legs, market, elapsedClamped, ivShift, hasLegs],
  );
  const stats = useMemo(() => (hasLegs ? analyzePayoff(legs, market) : null), [legs, market, hasLegs]);
  const greeks = useMemo(() => positionGreeks(legs, market), [legs, market]);
  const net = netEntryCost(legs, market);

  const loadPreset = (id: string) => {
    setPresetId(id);
    setLegs(presetLegs(id, market.spot));
    setElapsed(0);
    setIvShift(0);
  };

  const updateLeg = (id: string, patch: Partial<Leg>) => {
    setPresetId('');
    setLegs((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const addLeg = () => {
    setPresetId('');
    setLegs((ls) => [
      ...ls,
      { id: newLegId(), type: 'call', side: 1, qty: 1, strike: roundStrike(market.spot, market.spot), days: expiry || 30 },
    ]);
  };

  const preset = STRATEGY_MAP[presetId];

  return (
    <div className="space-y-5">
      {/* Preset + market */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">เลือกกลยุทธ์สำเร็จรูป</label>
          <select
            value={presetId}
            onChange={(e) => loadPreset(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="">— กำหนดเอง —</option>
            {STRATEGIES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {preset && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{preset.summary}</p>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Slider
            label="ราคาหุ้นปัจจุบัน"
            value={market.spot}
            min={10}
            max={500}
            step={1}
            format={(v) => fmtUsd(v, 0)}
            onChange={(spot) => {
              setMarket((m) => ({ ...m, spot }));
            }}
          />
          <Slider
            label="Implied Volatility (IV)"
            value={Math.round(market.iv * 100)}
            min={5}
            max={150}
            format={(v) => `${v}%`}
            onChange={(v) => setMarket((m) => ({ ...m, iv: v / 100 }))}
          />
        </div>
      </div>

      {/* Legs */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="hidden grid-cols-[110px_110px_70px_1fr_1fr_110px_36px] gap-2 border-b border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 md:grid dark:border-slate-800">
          <span>ฝั่ง</span>
          <span>ประเภท</span>
          <span>จำนวน</span>
          <span>Strike</span>
          <span>วันถึงหมดอายุ</span>
          <span className="text-right">ราคา/หุ้น</span>
          <span />
        </div>
        {legs.map((leg) => {
          const price = legEntryPrice(leg, market);
          return (
            <div
              key={leg.id}
              className="grid grid-cols-2 items-center gap-2 border-b border-slate-100 px-3 py-3 last:border-b-0 md:grid-cols-[110px_110px_70px_1fr_1fr_110px_36px] md:py-2 dark:border-slate-800/60"
            >
              <Segmented
                size="sm"
                value={leg.side === 1 ? 'buy' : 'sell'}
                onChange={(v) => updateLeg(leg.id, { side: v === 'buy' ? 1 : -1 })}
                options={[
                  { value: 'buy', label: 'Buy' },
                  { value: 'sell', label: 'Sell' },
                ]}
              />
              <select
                value={leg.type}
                onChange={(e) => {
                  const type = e.target.value as LegType;
                  updateLeg(leg.id, {
                    type,
                    strike: type === 'stock' ? 0 : leg.strike || roundStrike(market.spot, market.spot),
                    days: type === 'stock' ? 0 : leg.days || 30,
                  });
                }}
                className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="call">Call</option>
                <option value="put">Put</option>
                <option value="stock">หุ้น (100)</option>
              </select>
              <LegNumber label="จำนวน" value={leg.qty} min={1} onChange={(qty) => updateLeg(leg.id, { qty: Math.max(1, Math.round(qty)) })} />
              <LegNumber
                label="Strike"
                value={leg.strike}
                disabled={leg.type === 'stock'}
                step={roundStrike(market.spot, market.spot) >= 200 ? 5 : 1}
                onChange={(strike) => updateLeg(leg.id, { strike: Math.max(strike, 0.5) })}
              />
              <LegNumber
                label="วัน"
                value={leg.days}
                disabled={leg.type === 'stock'}
                onChange={(days) => updateLeg(leg.id, { days: Math.max(1, Math.round(days)) })}
              />
              <div className="num text-right font-mono text-sm">
                <span className={leg.side === 1 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                  {leg.side === 1 ? '−' : '+'}
                  {fmtUsd(price)}
                </span>
              </div>
              <button
                type="button"
                aria-label="ลบ leg"
                onClick={() => {
                  setPresetId('');
                  setLegs((ls) => ls.filter((l) => l.id !== leg.id));
                }}
                className="justify-self-end rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
              >
                ✕
              </button>
            </div>
          );
        })}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
          <Button variant="outline" onClick={addLeg}>
            + เพิ่ม Leg
          </Button>
          <span className="text-xs text-slate-500">ราคา option คำนวณด้วย Black-Scholes · 1 สัญญา = {CONTRACT_SIZE} หุ้น</span>
        </div>
      </div>

      {!hasLegs ? (
        <p className="rounded-xl bg-slate-100 p-6 text-center text-sm text-slate-500 dark:bg-slate-800/60">
          เพิ่มอย่างน้อย 1 leg เพื่อดูกราฟ
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <Stat
              label={net >= 0 ? 'จ่ายสุทธิ (Debit)' : 'รับสุทธิ (Credit)'}
              value={fmtUsd(Math.abs(net), 0)}
              tone={net >= 0 ? 'loss' : 'profit'}
            />
            <Stat
              label="กำไรสูงสุด"
              value={stats!.unlimitedProfit ? 'ไม่จำกัด' : fmtSignedUsd(stats!.maxProfit, 0)}
              tone="profit"
            />
            <Stat
              label="ขาดทุนสูงสุด"
              value={stats!.unlimitedLoss ? 'ไม่จำกัด' : fmtSignedUsd(stats!.maxLoss, 0)}
              tone="loss"
            />
            <Stat
              label="จุดคุ้มทุน"
              value={stats!.breakevens.length ? stats!.breakevens.map((b) => `$${fmtNum(b, 2)}`).join(' / ') : '—'}
            />
            <Stat label="โอกาสกำไร*" value={fmtPct(stats!.probProfit * 100, 0)} tone="accent" />
            <Stat
              label="Delta / Theta"
              value={
                <span className="text-base">
                  {fmtNum(greeks.delta, 0)} / {fmtSignedUsd(greeks.theta, 0)}
                </span>
              }
              sub="ต่อสถานะ (Theta ต่อวัน)"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-2 sm:p-3 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="mb-1 flex flex-wrap gap-4 px-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-5 bg-emerald-500" /> ณ วันหมดอายุ (วันที่ {expiry})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-violet-500" /> ผ่านไป {elapsedClamped} วัน
                {ivShift !== 0 && ` · IV ${ivShift > 0 ? '+' : ''}${Math.round(ivShift * 100)}%`}
              </span>
            </div>
            <PayoffChart
              data={series}
              spot={market.spot}
              breakevens={stats!.breakevens}
              nowLabel={`ผ่านไป ${elapsedClamped} วัน`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Slider
              label="⏳ เวลาผ่านไป (ดูเส้นประ)"
              value={elapsedClamped}
              min={0}
              max={Math.max(expiry, 1)}
              format={(v) => `${v} / ${expiry} วัน`}
              onChange={setElapsed}
            />
            <Slider
              label="🌪️ IV เปลี่ยนไป (ดูเส้นประ)"
              value={Math.round(ivShift * 100)}
              min={-Math.min(Math.round(market.iv * 100) - 5, 40)}
              max={40}
              format={(v) => `${v > 0 ? '+' : ''}${v}%`}
              onChange={(v) => setIvShift(v / 100)}
            />
          </div>
          <p className={cx('text-xs text-slate-500')}>
            * โอกาสกำไรประมาณจากการกระจายตัวแบบ lognormal ตาม IV ปัจจุบัน ไม่ใช่การรับประกัน ·
            ตัวเลขทั้งหมดยังไม่รวมค่าคอมมิชชั่นและ bid/ask spread
          </p>
        </>
      )}
    </div>
  );
}

function LegNumber({
  label,
  value,
  onChange,
  disabled,
  step = 1,
  min,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  step?: number;
  min?: number;
}) {
  return (
    <label className={cx('flex items-center gap-1.5', disabled && 'opacity-40')}>
      <span className="w-12 shrink-0 text-xs text-slate-500 md:hidden">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        aria-label={label}
        disabled={disabled}
        value={disabled ? '' : value}
        step={step}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
        className="num w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 py-1.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-950"
      />
    </label>
  );
}
