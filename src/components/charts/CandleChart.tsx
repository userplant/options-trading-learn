import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { IndicatorPaneDef, OverlayLine } from '../../lib/backtest';
import { fmtNum } from '../../lib/format';
import type { Candle, Series } from '../../lib/indicators';
import { useTheme } from '../../lib/theme';

export interface ChartMarker {
  i: number;
  price: number;
  kind: 'buy' | 'sell' | 'stop' | 'high' | 'low';
  label?: string;
}

export interface ChartHLine {
  price: number;
  label?: string;
  tone?: 'support' | 'resistance' | 'neutral';
}

export interface ChartSegment {
  i1: number;
  p1: number;
  i2: number;
  p2: number;
  label?: string;
}

interface Props {
  candles: Candle[];
  overlays?: OverlayLine[];
  bands?: { upper: Series; lower: Series; color: number }[];
  markers?: ChartMarker[];
  hlines?: ChartHLine[];
  segments?: ChartSegment[];
  panes?: IndicatorPaneDef[];
  height?: number;
  paneHeight?: number;
  showVolume?: boolean;
  /** ไม่แสดงตัวเลขราคา (ใช้กับเกมทายรูปแบบ) */
  hideAxis?: boolean;
  /** แสดงเฉพาะแท่งจากต้นจนถึง index นี้ (ใช้ซ่อนอนาคต) */
  revealTo?: number;
}

const AXIS_W = 52;
const GAP = 10;

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  useLayoutEffect(() => {
    if (!ref.current) return;
    setW(ref.current.clientWidth);
    const ro = new ResizeObserver((e) => setW(e[0].contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function niceTicks(min: number, max: number, count = 5): number[] {
  const range = max - min || 1;
  const raw = range / (count - 1);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return ticks;
}

function linePath(values: Series, x: (i: number) => number, y: (v: number) => number, upto: number) {
  let d = '';
  let pen = false;
  for (let i = 0; i <= upto && i < values.length; i++) {
    const v = values[i];
    if (v === null || !Number.isFinite(v)) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
    pen = true;
  }
  return d;
}

export function CandleChart({
  candles,
  overlays = [],
  bands = [],
  markers = [],
  hlines = [],
  segments = [],
  panes = [],
  height = 300,
  paneHeight = 110,
  showVolume = true,
  hideAxis = false,
  revealTo,
}: Props) {
  const { palette } = useTheme();
  const [ref, width] = useWidth();
  const [hover, setHover] = useState<number | null>(null);

  const n = candles.length;
  const last = Math.min(revealTo ?? n - 1, n - 1);
  const plotW = Math.max(width - (hideAxis ? 0 : AXIS_W), 50);
  const step = plotW / Math.max(n, 1);
  const bodyW = Math.max(Math.min(step * 0.7, 14), 1);
  const x = (i: number) => i * step + step / 2;

  // ช่วงราคาจากแท่งที่แสดง + เส้นทับ
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i <= last; i++) {
    lo = Math.min(lo, candles[i].l);
    hi = Math.max(hi, candles[i].h);
  }
  for (const o of [...overlays.map((o) => o.values), ...bands.flatMap((b) => [b.upper, b.lower])]) {
    for (let i = 0; i <= last; i++) {
      const v = o[i];
      if (v !== null && v !== undefined && Number.isFinite(v)) {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
    }
  }
  for (const h of hlines) {
    lo = Math.min(lo, h.price);
    hi = Math.max(hi, h.price);
  }
  const pad = (hi - lo) * 0.06 || 1;
  lo -= pad;
  hi += pad;

  const top = 8;
  const mainH = height - top - 4;
  const y = (v: number) => top + ((hi - v) / (hi - lo)) * mainH;
  const maxVol = Math.max(...candles.slice(0, last + 1).map((c) => c.v), 1);
  const volH = mainH * 0.18;

  const paneTops = panes.map((_, k) => height + GAP + k * (paneHeight + GAP));
  const totalH = height + panes.reduce((s) => s + paneHeight + GAP, 0) + 4;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = Math.floor((e.clientX - rect.left) / step);
    setHover(i >= 0 && i <= last ? i : null);
  };

  const hc = hover !== null ? candles[hover] : null;
  const readout: ReactNode = hc && !hideAxis && (
    <>
      <span className="text-slate-500">#{hover! + 1}</span> O <b>{fmtNum(hc.o)}</b> H <b>{fmtNum(hc.h)}</b> L <b>{fmtNum(hc.l)}</b> C{' '}
      <b className={hc.c >= hc.o ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{fmtNum(hc.c)}</b>
      {overlays.map((o) =>
        o.values[hover!] != null ? (
          <span key={o.label} style={{ color: palette.series[o.color] }}>
            {' '}
            {o.label} {fmtNum(o.values[hover!]!)}
          </span>
        ) : null,
      )}
    </>
  );

  const hlineColor = (t: ChartHLine['tone']) => (t === 'support' ? palette.profit : t === 'resistance' ? palette.loss : palette.muted);

  return (
    <div ref={ref} className="w-full select-none">
      <div className="mb-1 flex min-h-5 flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
        {readout ??
          overlays.map((o) => (
            <span key={o.label} className="flex items-center gap-1">
              <span className="inline-block h-0.5 w-4" style={{ background: palette.series[o.color] }} />
              {o.label}
            </span>
          ))}
      </div>
      <svg
        width={width}
        height={totalH}
        className="block touch-none"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="กราฟแท่งเทียน"
      >
        {/* grid + axis */}
        {!hideAxis &&
          niceTicks(lo, hi).map((t) => (
            <g key={t}>
              <line x1={0} x2={plotW} y1={y(t)} y2={y(t)} stroke={palette.grid} strokeDasharray="3 3" />
              <text x={plotW + 6} y={y(t) + 4} fontSize={10} fill={palette.axis} className="font-mono">
                {fmtNum(t, t >= 100 ? 0 : 1)}
              </text>
            </g>
          ))}

        {/* bands */}
        {bands.map((b, k) => {
          const pts: string[] = [];
          const back: string[] = [];
          for (let i = 0; i <= last; i++) {
            if (b.upper[i] != null && b.lower[i] != null) {
              pts.push(`${x(i)},${y(b.upper[i]!)}`);
              back.unshift(`${x(i)},${y(b.lower[i]!)}`);
            }
          }
          return pts.length ? <polygon key={k} points={[...pts, ...back].join(' ')} fill={palette.series[b.color]} opacity={0.08} /> : null;
        })}

        {/* volume */}
        {showVolume &&
          candles.slice(0, last + 1).map((c, i) => (
            <rect
              key={`v${i}`}
              x={x(i) - bodyW / 2}
              y={top + mainH - (c.v / maxVol) * volH}
              width={bodyW}
              height={(c.v / maxVol) * volH}
              fill={c.c >= c.o ? palette.profit : palette.loss}
              opacity={0.15}
            />
          ))}

        {/* horizontal levels */}
        {hlines.map((h, k) => (
          <g key={`h${k}`}>
            <line x1={0} x2={plotW} y1={y(h.price)} y2={y(h.price)} stroke={hlineColor(h.tone)} strokeWidth={1.5} strokeDasharray="6 4" />
            {h.label && (
              <text x={4} y={y(h.price) - 4} fontSize={10} fill={hlineColor(h.tone)} fontWeight={600}>
                {h.label}
              </text>
            )}
          </g>
        ))}

        {/* candles */}
        {candles.slice(0, last + 1).map((c, i) => {
          const up = c.c >= c.o;
          const color = up ? palette.profit : palette.loss;
          const yTop = y(Math.max(c.o, c.c));
          const bh = Math.max(Math.abs(y(c.o) - y(c.c)), 1);
          return (
            <g key={i}>
              <line x1={x(i)} x2={x(i)} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth={1} />
              <rect x={x(i) - bodyW / 2} y={yTop} width={bodyW} height={bh} fill={up ? palette.surface : color} stroke={color} strokeWidth={1} />
            </g>
          );
        })}

        {/* overlays */}
        {overlays.map((o) => (
          <path
            key={o.label}
            d={linePath(o.values, x, y, last)}
            fill="none"
            stroke={palette.series[o.color]}
            strokeWidth={1.75}
            strokeDasharray={o.dash ? '5 4' : undefined}
          />
        ))}

        {/* segments (trendline, neckline) */}
        {segments.map((s, k) => (
          <g key={`s${k}`}>
            <line x1={x(s.i1)} y1={y(s.p1)} x2={x(s.i2)} y2={y(s.p2)} stroke={palette.series[1]} strokeWidth={2} />
            {s.label && (
              <text x={x(s.i2) + 4} y={y(s.p2) + 4} fontSize={10} fill={palette.series[1]} fontWeight={600}>
                {s.label}
              </text>
            )}
          </g>
        ))}

        {/* markers */}
        {markers
          .filter((m) => m.i <= last)
          .map((m, k) => {
            const below = m.kind === 'buy' || m.kind === 'low';
            const color = m.kind === 'buy' ? palette.profit : m.kind === 'sell' ? palette.series[3] : m.kind === 'stop' ? palette.loss : palette.series[1];
            const cy = below ? y(m.price) + 10 : y(m.price) - 10;
            const tri = below ? `${x(m.i)},${cy - 5} ${x(m.i) - 5},${cy + 3} ${x(m.i) + 5},${cy + 3}` : `${x(m.i)},${cy + 5} ${x(m.i) - 5},${cy - 3} ${x(m.i) + 5},${cy - 3}`;
            return (
              <g key={`m${k}`}>
                {m.kind === 'high' || m.kind === 'low' ? (
                  <circle cx={x(m.i)} cy={below ? y(m.price) + 6 : y(m.price) - 6} r={3.5} fill={color} />
                ) : (
                  <polygon points={tri} fill={color} />
                )}
                {m.label && (
                  <text x={x(m.i)} y={below ? cy + 14 : cy - 8} fontSize={9} fill={color} textAnchor="middle" fontWeight={600}>
                    {m.label}
                  </text>
                )}
              </g>
            );
          })}

        {/* indicator panes */}
        {panes.map((p, k) => {
          const pt = paneTops[k];
          let plo = p.domain?.[0] ?? Infinity;
          let phi = p.domain?.[1] ?? -Infinity;
          if (!p.domain) {
            for (const s of [...p.lines.map((l) => l.values), ...(p.hist ? [p.hist] : [])]) {
              for (let i = 0; i <= last; i++) {
                const v = s[i];
                if (v != null && Number.isFinite(v)) {
                  plo = Math.min(plo, v);
                  phi = Math.max(phi, v);
                }
              }
            }
            for (const h of p.hlines ?? []) {
              plo = Math.min(plo, h);
              phi = Math.max(phi, h);
            }
            if (!Number.isFinite(plo)) [plo, phi] = [0, 1];
            const pp = (phi - plo) * 0.08 || 1;
            plo -= pp;
            phi += pp;
          }
          const py = (v: number) => pt + ((phi - v) / (phi - plo)) * paneHeight;
          const zero = py(Math.min(Math.max(0, plo), phi));
          return (
            <g key={`p${k}`}>
              <rect x={0} y={pt} width={plotW} height={paneHeight} fill="none" stroke={palette.grid} />
              <text x={4} y={pt + 12} fontSize={10} fill={palette.axis} fontWeight={600}>
                {p.title}
                {hover !== null &&
                  p.lines.map((l) => (l.values[hover] != null ? `  ${l.label} ${fmtNum(l.values[hover]!)}` : '')).join('')}
              </text>
              {(p.hlines ?? []).map((h) => (
                <g key={h}>
                  <line x1={0} x2={plotW} y1={py(h)} y2={py(h)} stroke={palette.muted} strokeDasharray="3 3" />
                  {!hideAxis && (
                    <text x={plotW + 6} y={py(h) + 4} fontSize={10} fill={palette.axis} className="font-mono">
                      {fmtNum(h, 0)}
                    </text>
                  )}
                </g>
              ))}
              {p.hist &&
                p.hist.slice(0, last + 1).map((v, i) =>
                  v == null ? null : (
                    <rect
                      key={i}
                      x={x(i) - bodyW / 2}
                      y={Math.min(py(v), zero)}
                      width={bodyW}
                      height={Math.max(Math.abs(py(v) - zero), 0.5)}
                      fill={v >= 0 ? palette.profit : palette.loss}
                      opacity={0.5}
                    />
                  ),
                )}
              {p.lines.map((l) => (
                <path
                  key={l.label}
                  d={linePath(l.values, x, py, last)}
                  fill="none"
                  stroke={palette.series[l.color]}
                  strokeWidth={1.5}
                  strokeDasharray={l.dash ? '4 3' : undefined}
                />
              ))}
            </g>
          );
        })}

        {/* crosshair */}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={0} y2={totalH} stroke={palette.axis} strokeOpacity={0.4} />}
      </svg>
    </div>
  );
}
