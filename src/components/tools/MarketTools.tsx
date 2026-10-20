import { useState } from 'react';
import { fmtNum, fmtPct, fmtSignedUsd, fmtUsd } from '../../lib/format';
import { Button, NumberField, Segmented, Slider, Stat, cx } from '../ui';

interface Level {
  price: number;
  size: number;
}

const INITIAL_ASKS: Level[] = [
  { price: 100.05, size: 300 },
  { price: 100.1, size: 500 },
  { price: 100.15, size: 800 },
  { price: 100.25, size: 1200 },
  { price: 100.4, size: 2000 },
];
const INITIAL_BIDS: Level[] = [
  { price: 99.98, size: 400 },
  { price: 99.95, size: 600 },
  { price: 99.9, size: 900 },
  { price: 99.8, size: 1500 },
  { price: 99.65, size: 2500 },
];

interface Fill {
  price: number;
  size: number;
}

interface LogEntry {
  text: string;
  tone: 'profit' | 'loss' | 'info';
}

/** จับคู่คำสั่งกับ order book ฝั่งตรงข้าม */
function matchOrder(book: Level[], qty: number, limit: number | null, isBuy: boolean) {
  const fills: Fill[] = [];
  const rest = book.map((l) => ({ ...l }));
  let remaining = qty;
  for (const lvl of rest) {
    if (remaining <= 0) break;
    if (limit !== null && (isBuy ? lvl.price > limit : lvl.price < limit)) break;
    const take = Math.min(remaining, lvl.size);
    fills.push({ price: lvl.price, size: take });
    lvl.size -= take;
    remaining -= take;
  }
  return { fills, remaining, book: rest.filter((l) => l.size > 0) };
}

/** บทที่ 1.3: จำลอง Order Book */
export function OrderBookSim() {
  const [asks, setAsks] = useState(INITIAL_ASKS);
  const [bids, setBids] = useState(INITIAL_BIDS);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [kind, setKind] = useState<'market' | 'limit'>('market');
  const [qty, setQty] = useState(1000);
  const [limit, setLimit] = useState(100.1);
  const [log, setLog] = useState<LogEntry[]>([]);

  const bestBid = bids[0]?.price;
  const bestAsk = asks[0]?.price;
  const maxSize = Math.max(...asks.map((a) => a.size), ...bids.map((b) => b.size), 1);

  const submit = () => {
    const isBuy = side === 'buy';
    const opposite = isBuy ? asks : bids;
    const lim = kind === 'limit' ? limit : null;
    const { fills, remaining, book } = matchOrder(opposite, qty, lim, isBuy);
    const filled = fills.reduce((s, f) => s + f.size, 0);
    const avg = filled ? fills.reduce((s, f) => s + f.price * f.size, 0) / filled : 0;
    const ref = isBuy ? bestAsk : bestBid;
    const entries: LogEntry[] = [];

    if (filled > 0) {
      const slip = (avg - ref) * filled * (isBuy ? 1 : -1);
      entries.push({
        text: `${isBuy ? 'ซื้อ' : 'ขาย'}ได้ ${filled.toLocaleString()} หุ้น ราคาเฉลี่ย ${fmtUsd(avg, 4)} (${fills.length} ระดับราคา)${
          slip > 0.001 ? ` · Slippage ${fmtUsd(slip)}` : ''
        }`,
        tone: slip > 0.001 ? 'loss' : 'profit',
      });
    }
    const addRest = (levels: Level[]) => {
      const next = levels.map((l) => (l.price === limit ? { ...l, size: l.size + remaining } : l));
      if (!next.some((l) => l.price === limit)) next.push({ price: limit, size: remaining });
      return next.sort((a, b) => (isBuy ? b.price - a.price : a.price - b.price));
    };
    const rests = remaining > 0 && kind === 'limit';
    if (isBuy) {
      setAsks(book);
      if (rests) setBids(addRest(bids));
    } else {
      setBids(book);
      if (rests) setAsks(addRest(asks));
    }

    if (rests) {
      entries.push({ text: `เหลือ ${remaining.toLocaleString()} หุ้น ไปรอใน order book ที่ ${fmtUsd(limit)} (ยังไม่ได้ของ)`, tone: 'info' });
    } else if (remaining > 0) {
      entries.push({ text: `สภาพคล่องไม่พอ! ส่วนที่เหลือ ${remaining.toLocaleString()} หุ้น ไม่ได้รับการจับคู่`, tone: 'loss' });
    }
    setLog((l) => [...entries, ...l].slice(0, 6));
  };

  const reset = () => {
    setAsks(INITIAL_ASKS);
    setBids(INITIAL_BIDS);
    setLog([]);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-xl border border-slate-200 bg-white p-3 font-mono text-sm dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mb-2 grid grid-cols-2 text-xs text-slate-500">
          <span>ราคา (Ask/Bid)</span>
          <span className="text-right">จำนวนหุ้น</span>
        </div>
        {[...asks].reverse().map((a) => (
          <BookRow key={`a${a.price}`} level={a} max={maxSize} tone="ask" />
        ))}
        <div className="my-1.5 flex items-center justify-between rounded-md bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
          <span>Spread</span>
          <span className="num font-semibold">{bestAsk && bestBid ? fmtUsd(bestAsk - bestBid) : '—'}</span>
        </div>
        {bids.map((b) => (
          <BookRow key={`b${b.price}`} level={b} max={maxSize} tone="bid" />
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Segmented
            value={side}
            onChange={setSide}
            options={[
              { value: 'buy', label: 'ซื้อ' },
              { value: 'sell', label: 'ขาย' },
            ]}
          />
          <Segmented
            value={kind}
            onChange={setKind}
            options={[
              { value: 'market', label: 'Market' },
              { value: 'limit', label: 'Limit' },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="จำนวนหุ้น" value={qty} step={100} min={1} onChange={(v) => setQty(Math.max(1, Math.round(v)))} />
          {kind === 'limit' && <NumberField label="ราคา Limit" prefix="$" value={limit} step={0.05} onChange={setLimit} />}
        </div>
        <div className="flex gap-2">
          <Button onClick={submit} className={side === 'sell' ? '!bg-rose-600 hover:!bg-rose-700' : ''}>
            ส่งคำสั่ง{side === 'buy' ? 'ซื้อ' : 'ขาย'}
          </Button>
          <Button variant="ghost" onClick={reset}>
            รีเซ็ต
          </Button>
        </div>
        <ul className="space-y-1.5 text-sm">
          {log.length === 0 && <li className="text-slate-500">ลองส่ง Market order ซื้อ 1,000 หุ้น แล้วดูว่าได้ราคาเฉลี่ยเท่าไร</li>}
          {log.map((e, i) => (
            <li
              key={i}
              className={cx(
                'rounded-lg px-3 py-2',
                e.tone === 'profit' && 'bg-emerald-50 dark:bg-emerald-950/40',
                e.tone === 'loss' && 'bg-rose-50 dark:bg-rose-950/40',
                e.tone === 'info' && 'bg-sky-50 dark:bg-sky-950/40',
                i > 0 && 'opacity-60',
              )}
            >
              {e.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BookRow({ level, max, tone }: { level: Level; max: number; tone: 'ask' | 'bid' }) {
  return (
    <div className="relative grid grid-cols-2 px-2 py-0.5">
      <div
        className={cx('absolute inset-y-0 right-0 rounded', tone === 'ask' ? 'bg-rose-500/15' : 'bg-emerald-500/15')}
        style={{ width: `${(level.size / max) * 100}%` }}
      />
      <span className={cx('num relative', tone === 'ask' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400')}>
        {fmtNum(level.price)}
      </span>
      <span className="num relative text-right">{level.size.toLocaleString()}</span>
    </div>
  );
}

/** บทที่ 1.2: ต้นทุนจาก Spread */
export function SpreadCostCalc() {
  const [price, setPrice] = useState(50);
  const [spreadCents, setSpreadCents] = useState(5);
  const [shares, setShares] = useState(200);
  const [tradesPerMonth, setTrades] = useState(20);
  const spread = spreadCents / 100;
  const perTrade = spread * shares;
  const pct = (spread / price) * 100;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="ราคาหุ้น" value={price} min={1} max={500} format={(v) => fmtUsd(v, 0)} onChange={setPrice} />
        <Slider label="Spread" value={spreadCents} min={1} max={100} format={(v) => `${v}¢ (${fmtUsd(v / 100)})`} onChange={setSpreadCents} />
        <Slider label="จำนวนหุ้นต่อไม้" value={shares} min={10} max={2000} step={10} format={(v) => v.toLocaleString()} onChange={setShares} />
        <Slider label="จำนวนไม้ต่อเดือน (ซื้อ+ขาย = 1 รอบ)" value={tradesPerMonth} min={1} max={200} onChange={setTrades} />
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label="Spread เป็น % ของราคา" value={fmtPct(pct, 2)} />
        <Stat label="ต้นทุนแฝงต่อรอบ" value={fmtUsd(perTrade)} tone="loss" sub="ซื้อที่ Ask ขายที่ Bid" />
        <Stat label="ต้นทุนแฝงต่อเดือน" value={fmtUsd(perTrade * tradesPerMonth, 0)} tone="loss" />
        <Stat label="ต้นทุนต่อปี" value={fmtUsd(perTrade * tradesPerMonth * 12, 0)} tone="loss" />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        ทันทีที่ซื้อแล้วขายคืนในราคาตลาด คุณจะขาดทุน {fmtUsd(perTrade)} แม้ราคาไม่ขยับเลย — เทรดยิ่งถี่ ต้นทุนนี้ยิ่งสำคัญ
      </p>
    </div>
  );
}

/** บทที่ 1.4: Leverage & Margin */
export function LeverageCalc() {
  const [capital, setCapital] = useState(10000);
  const [lev, setLev] = useState(2);
  const [move, setMove] = useState(-10);
  const maintenance = 25;

  const position = capital * lev;
  const loan = position - capital;
  const pnl = (position * move) / 100;
  const equity = capital + pnl;
  const roe = (pnl / capital) * 100;
  // ราคาลดลงกี่ % ถึงจะโดน margin call: equity / position_value = maintenance
  const callDrop = lev > 1 ? (1 - loan / (position * (1 - maintenance / 100))) * 100 : 100;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider label="เงินทุนของตัวเอง" value={capital} min={1000} max={50000} step={1000} format={(v) => fmtUsd(v, 0)} onChange={setCapital} />
        <Slider label="Leverage" value={lev} min={1} max={10} step={0.5} format={(v) => `${v}x`} onChange={setLev} />
        <Slider label="ราคาเปลี่ยนแปลง" value={move} min={-50} max={50} format={(v) => `${v > 0 ? '+' : ''}${v}%`} onChange={setMove} />
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label="มูลค่าสถานะ" value={fmtUsd(position, 0)} sub={`ยืมโบรกเกอร์ ${fmtUsd(loan, 0)}`} />
        <Stat label="กำไร/ขาดทุน" value={fmtSignedUsd(pnl, 0)} tone={pnl >= 0 ? 'profit' : 'loss'} />
        <Stat label="ผลตอบแทนต่อเงินทุน" value={`${roe > 0 ? '+' : ''}${fmtPct(roe, 0)}`} tone={roe >= 0 ? 'profit' : 'loss'} sub={`ราคาขยับ ${move}% → พอร์ตขยับ ${fmtNum(roe, 0)}%`} />
        <Stat label="เงินคงเหลือ" value={fmtUsd(Math.max(equity, 0), 0)} tone={equity <= 0 ? 'loss' : 'default'} sub={equity <= 0 ? 'ล้างพอร์ต!' : undefined} />
      </div>
      {lev > 1 && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm dark:bg-amber-950/40">
          ⚠️ ด้วย leverage {lev}x และ maintenance margin {maintenance}% คุณจะโดน <strong>Margin Call</strong> เมื่อราคาลดลงประมาณ{' '}
          <strong>{fmtPct(Math.max(callDrop, 0), 1)}</strong> และ<strong>ล้างพอร์ต</strong>เมื่อราคาลดลง {fmtPct(100 / lev, 1)}
        </p>
      )}
    </div>
  );
}
