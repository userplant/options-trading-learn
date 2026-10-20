import { Link } from 'react-router-dom';
import { Badge, Button } from '../components/ui';
import { ALL_LESSONS, COURSE, lessonKey } from '../content/course';
import { useProgress } from '../lib/progress';
import { TOOLS } from './ToolsPage';

export function HomePage() {
  const { completed, reset } = useProgress();
  const total = ALL_LESSONS.length;
  const done = ALL_LESSONS.filter((l) => completed[l.key]).length;
  const nextLesson = ALL_LESSONS.find((l) => !completed[l.key]);

  return (
    <div className="mx-auto max-w-5xl">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 p-6 text-white sm:p-10">
        <svg className="absolute right-0 bottom-0 h-full w-1/2 opacity-15" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden>
          <path d="M0 80 L30 60 L50 70 L80 35 L100 45 L130 20 L160 30 L200 5" stroke="white" strokeWidth="3" fill="none" />
        </svg>
        <div className="relative max-w-2xl">
          <Badge tone="teal">Interactive Learning</Badge>
          <h1 className="mt-3 text-3xl leading-tight font-bold sm:text-4xl">เรียนรู้การเทรดและ Options ด้วยการลงมือเล่นจริง</h1>
          <p className="mt-3 text-teal-50/90">
            อ่านสั้นๆ ลองเล่นกับเครื่องมือจำลอง แล้วทดสอบความเข้าใจ ตั้งแต่พื้นฐานตลาดไปจนถึงกลยุทธ์ Options หลาย leg
            และการบริหารความเสี่ยง ยกตัวอย่างจากตลาดสหรัฐ
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {nextLesson ? (
              <Link to={`/learn/${nextLesson.module.id}/${nextLesson.lesson.id}`}>
                <Button className="!bg-white !text-teal-800 hover:!bg-teal-50">
                  {done === 0 ? 'เริ่มเรียนเลย →' : `เรียนต่อ: ${nextLesson.lesson.title} →`}
                </Button>
              </Link>
            ) : (
              <span className="font-semibold">🎉 เรียนครบทุกบทแล้ว!</span>
            )}
            <Link to="/tools/payoff" className="text-sm font-medium text-teal-100 underline-offset-4 hover:underline">
              ลอง Payoff Builder
            </Link>
          </div>
          <div className="mt-6">
            <div className="mb-1 flex justify-between text-xs text-teal-100">
              <span>ความคืบหน้า</span>
              <span className="num font-mono">
                {done}/{total} บท
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${(done / total) * 100}%` }} />
            </div>
          </div>
        </div>
      </section>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-slate-900 dark:text-white">หลักสูตร</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COURSE.map((m) => {
          const mDone = m.lessons.filter((l) => completed[lessonKey(m.id, l.id)]).length;
          return (
            <Link
              key={m.id}
              to={`/learn/${m.id}`}
              className={`group flex flex-col rounded-2xl border bg-white p-5 transition hover:shadow-md dark:bg-slate-900 ${
                m.status === 'ready' ? 'border-slate-200 hover:border-teal-500 dark:border-slate-800' : 'border-dashed border-slate-300 opacity-75 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{m.icon}</span>
                {m.status === 'ready' ? (
                  <span className="num font-mono text-xs text-slate-500">
                    {mDone}/{m.lessons.length}
                  </span>
                ) : (
                  <Badge tone="amber">Phase {m.phase}</Badge>
                )}
              </div>
              <div className="mt-3 text-xs font-semibold text-slate-500">โมดูล {m.num}</div>
              <div className="font-semibold text-slate-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">{m.title}</div>
              <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-400">{m.description}</p>
              {m.status === 'ready' && (
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-teal-500" style={{ width: `${(mDone / m.lessons.length) * 100}%` }} />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-slate-900 dark:text-white">เครื่องมือ Interactive</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.slice(0, 4).map((t) => (
          <Link
            key={t.id}
            to={`/tools/${t.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-500 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-2xl">{t.icon}</div>
            <div className="mt-2 font-semibold text-slate-900 dark:text-white">{t.title}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.description}</div>
          </Link>
        ))}
      </div>

      {done > 0 && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('ล้างความคืบหน้าทั้งหมด?')) reset();
            }}
            className="text-xs text-slate-400 hover:text-rose-600"
          >
            ล้างความคืบหน้า
          </button>
        </div>
      )}
    </div>
  );
}
