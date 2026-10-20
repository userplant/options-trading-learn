import { useId, useState, type ReactNode } from 'react';
import { GLOSSARY } from '../data/glossary';

/** คำศัพท์ที่ชี้/แตะแล้วแสดงคำอธิบายจากอภิธานศัพท์ */
export function Term({ id, children }: { id: string; children?: ReactNode }) {
  const entry = GLOSSARY[id];
  const [open, setOpen] = useState(false);
  const tipId = useId();

  if (!entry) return <>{children}</>;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-describedby={open ? tipId : undefined}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="cursor-help border-b border-dashed border-teal-500 font-medium text-inherit decoration-teal-500"
      >
        {children ?? entry.term}
      </button>
      {open && (
        <span
          id={tipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-30 mb-2 block w-64 max-w-[80vw] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 text-left text-sm leading-snug font-normal shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <span className="block font-semibold text-slate-900 dark:text-white">{entry.term}</span>
          <span className="block text-xs text-teal-700 dark:text-teal-300">{entry.thai}</span>
          <span className="mt-1 block text-slate-600 dark:text-slate-300">{entry.definition}</span>
        </span>
      )}
    </span>
  );
}
