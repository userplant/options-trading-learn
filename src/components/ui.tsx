import type { ReactNode } from 'react';

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** กรอบเครื่องมือ interactive ในบทเรียน */
export function Playground({ title, children, hint }: { title: string; children: ReactNode; hint?: string }) {
  return (
    <section className="not-prose my-6 rounded-2xl border border-teal-200 bg-gradient-to-b from-teal-50/80 to-white p-4 sm:p-5 dark:border-teal-900/60 dark:from-teal-950/40 dark:to-slate-900">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-teal-600 px-2 py-0.5 text-xs font-semibold text-white">ลองเล่น</span>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      {hint && <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{hint}</p>}
      {children}
    </section>
  );
}

const CALLOUT_STYLE = {
  info: { box: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40', icon: 'ℹ️', label: 'รู้ไว้' },
  tip: { box: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40', icon: '💡', label: 'เคล็ดลับ' },
  warn: { box: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40', icon: '⚠️', label: 'ระวัง' },
  example: { box: 'border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/40', icon: '🧮', label: 'ตัวอย่าง' },
} as const;

export function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: keyof typeof CALLOUT_STYLE;
  title?: string;
  children: ReactNode;
}) {
  const s = CALLOUT_STYLE[type];
  return (
    <div className={cx('my-4 rounded-xl border p-4 text-[15px]', s.box)}>
      <div className="mb-1 font-semibold text-slate-900 dark:text-white">
        <span aria-hidden className="mr-1.5">
          {s.icon}
        </span>
        {title ?? s.label}
      </div>
      <div className="[&>p:first-child]:mt-0 [&>p:last-child]:mb-0">{children}</div>
    </div>
  );
}

export function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl bg-slate-900 px-4 py-3 font-mono text-sm text-teal-200 dark:bg-black/40">
      {children}
    </div>
  );
}

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format = (v) => String(v),
}: {
  label: ReactNode;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="num font-mono font-semibold text-slate-900 dark:text-white">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min,
  prefix,
  suffix,
}: {
  label: ReactNode;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    // label ยืดเต็มความสูงแถว ช่องกรอกจึงชิดล่างเสมอ แม้ label ข้างๆ จะขึ้นบรรทัดใหม่
    <label className="flex h-full flex-col text-sm">
      <span className="mb-1 block flex-1 text-slate-600 dark:text-slate-400">{label}</span>
      <div className="flex items-center rounded-lg border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-teal-500 dark:border-slate-700 dark:bg-slate-950">
        {prefix && <span className="pl-3 text-slate-500">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          className="num w-full min-w-0 bg-transparent px-3 py-2 font-mono outline-none"
          value={Number.isFinite(value) ? value : ''}
          step={step}
          min={min}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        />
        {suffix && <span className="pr-3 text-slate-500">{suffix}</span>}
      </div>
    </label>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="inline-flex flex-wrap rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx(
            'rounded-md font-medium transition',
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
            value === o.value
              ? 'bg-white text-teal-700 shadow-sm dark:bg-slate-950 dark:text-teal-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Stat({
  label,
  value,
  tone = 'default',
  sub,
}: {
  label: ReactNode;
  value: ReactNode;
  tone?: 'default' | 'profit' | 'loss' | 'accent';
  sub?: ReactNode;
}) {
  const color = {
    default: 'text-slate-900 dark:text-white',
    profit: 'text-emerald-600 dark:text-emerald-400',
    loss: 'text-rose-600 dark:text-rose-400',
    accent: 'text-teal-700 dark:text-teal-300',
  }[tone];
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className={cx('num mt-0.5 font-mono text-lg font-semibold', color)}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</div>}
    </div>
  );
}

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'teal' | 'green' | 'red' | 'amber' | 'violet' }) {
  const styles = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
    green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    red: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    violet: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300',
  }[tone];
  return <span className={cx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', styles)}>{children}</span>;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  className,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'outline';
  className?: string;
  type?: 'button' | 'submit';
}) {
  const styles = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400',
    outline:
      'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      className={cx('inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition', styles, className)}
    >
      {children}
    </button>
  );
}
