import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { COURSE, lessonKey } from '../content/course';
import { useProgress } from '../lib/progress';
import { useTheme } from '../lib/theme';
import { cx } from './ui';

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const { completed } = useProgress();
  const { pathname } = useLocation();

  return (
    <nav className="space-y-6 text-sm" aria-label="สารบัญบทเรียน">
      <div className="space-y-0.5">
        {[
          { to: '/', label: '🏠 หน้าแรก' },
          { to: '/tools', label: '🧰 เครื่องมือทั้งหมด' },
          { to: '/glossary', label: '📖 อภิธานศัพท์' },
        ].map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cx(
                'block rounded-lg px-3 py-1.5 font-medium',
                isActive ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800',
              )
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>

      {COURSE.map((m) => {
        const done = m.lessons.filter((l) => completed[lessonKey(m.id, l.id)]).length;
        const inModule = pathname.startsWith(`/learn/${m.id}`);
        return (
          <div key={m.id}>
            <Link
              to={`/learn/${m.id}`}
              onClick={onNavigate}
              className={cx(
                'mb-1 flex items-center justify-between gap-2 rounded-lg px-3 py-1 text-xs font-semibold tracking-wide uppercase',
                inModule ? 'text-teal-700 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400',
              )}
            >
              <span>
                {m.num}. {m.title}
              </span>
              {m.status === 'ready' ? (
                <span className="num font-mono normal-case">
                  {done}/{m.lessons.length}
                </span>
              ) : (
                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] normal-case dark:bg-slate-800">เร็วๆ นี้</span>
              )}
            </Link>
            {m.status === 'ready' && (
              <ul className="space-y-0.5">
                {m.lessons.map((l) => {
                  const key = lessonKey(m.id, l.id);
                  return (
                    <li key={l.id}>
                      <NavLink
                        to={`/learn/${m.id}/${l.id}`}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          cx(
                            'flex items-start gap-2 rounded-lg px-3 py-1.5 leading-snug',
                            isActive
                              ? 'bg-teal-50 font-medium text-teal-800 dark:bg-teal-950/60 dark:text-teal-200'
                              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                          )
                        }
                      >
                        <span
                          className={cx(
                            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]',
                            completed[key]
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-slate-300 dark:border-slate-600',
                          )}
                          aria-label={completed[key] ? 'เรียนจบแล้ว' : undefined}
                        >
                          {completed[key] && '✓'}
                        </span>
                        {l.title}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4">
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
            onClick={() => setOpen((o) => !o)}
            aria-label="เปิด/ปิดเมนู"
            aria-expanded={open}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 24l8-9 6 5 10-13" />
              </svg>
            </span>
            Trading Lab
          </Link>
          <div className="flex-1" />
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={dark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        <aside
          className={cx(
            'fixed inset-y-0 top-14 z-30 w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-3 py-5 transition-transform lg:sticky lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 dark:border-slate-800 dark:bg-slate-950',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <Sidebar onNavigate={() => setOpen(false)} />
        </aside>
        {open && <div className="fixed inset-0 top-14 z-20 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)} />}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
          <footer className="mx-auto mt-16 max-w-4xl border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800">
            ⚠️ เนื้อหาทั้งหมดเป็นสื่อการเรียนรู้ ไม่ใช่คำแนะนำการลงทุน ตัวเลขในเครื่องมือเป็นการจำลองทางทฤษฎี
            การเทรดมีความเสี่ยงสูงและอาจสูญเสียเงินทุนทั้งหมด
          </footer>
        </main>
      </div>
    </div>
  );
}
