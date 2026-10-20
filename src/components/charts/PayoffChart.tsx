import { useId } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PayoffPoint } from '../../lib/payoff';
import { fmtSignedUsd, fmtUsd } from '../../lib/format';
import { tooltipStyle, useTheme } from '../../lib/theme';

interface Props {
  data: PayoffPoint[];
  spot: number;
  breakevens?: number[];
  showNow?: boolean;
  nowLabel?: string;
  height?: number;
  compact?: boolean;
}

export function PayoffChart({ data, spot, breakevens = [], showNow = true, nowLabel = 'วันนี้', height = 320, compact }: Props) {
  const { palette } = useTheme();
  const gid = useId().replace(/:/g, '');

  const values = data.map((d) => d.expiry);
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const off = max - min === 0 ? 0.5 : max / (max - min);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: compact ? 10 : 24, right: 12, left: compact ? -10 : 4, bottom: compact ? 0 : 16 }}>
          <defs>
            <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor={palette.profit} stopOpacity={0.35} />
              <stop offset={off} stopColor={palette.profit} stopOpacity={0.08} />
              <stop offset={off} stopColor={palette.loss} stopOpacity={0.08} />
              <stop offset={1} stopColor={palette.loss} stopOpacity={0.35} />
            </linearGradient>
            <linearGradient id={`stroke-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset={off} stopColor={palette.profit} />
              <stop offset={off} stopColor={palette.loss} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="price"
            type="number"
            domain={['dataMin', 'dataMax']}
            tick={{ fill: palette.axis, fontSize: 11 }}
            tickFormatter={(v) => `$${Math.round(v)}`}
            stroke={palette.grid}
            label={
              compact ? undefined : { value: 'ราคาหุ้น ณ วันหมดอายุ', position: 'insideBottom', offset: -10, fill: palette.axis, fontSize: 12 }
            }
          />
          <YAxis
            tick={{ fill: palette.axis, fontSize: 11 }}
            tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v)))}
            stroke={palette.grid}
            width={compact ? 40 : 52}
          />
          <Tooltip
            {...tooltipStyle(palette)}
            labelFormatter={(v) => `ราคาหุ้น ${fmtUsd(Number(v))}`}
            formatter={(v: number, name: string) => [fmtSignedUsd(v), name]}
          />
          <ReferenceLine y={0} stroke={palette.axis} strokeWidth={1} />
          <ReferenceLine
            x={spot}
            stroke={palette.accent}
            strokeDasharray="4 4"
            label={compact ? undefined : { value: `ราคาปัจจุบัน $${spot}`, position: 'top', fill: palette.accent, fontSize: 11 }}
          />
          {breakevens.map((b) => (
            <ReferenceLine key={b} x={b} stroke={palette.muted} strokeDasharray="2 3" />
          ))}
          <Area
            type="linear"
            dataKey="expiry"
            name="ณ วันหมดอายุ"
            stroke={`url(#stroke-${gid})`}
            strokeWidth={2.5}
            fill={`url(#fill-${gid})`}
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 4 }}
          />
          {showNow && (
            <Line
              type="monotone"
              dataKey="now"
              name={nowLabel}
              stroke={palette.series[1]}
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
