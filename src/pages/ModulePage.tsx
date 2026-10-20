import { Link, Navigate, useParams } from 'react-router-dom';
import { Badge, Card } from '../components/ui';
import { COURSE, lessonKey } from '../content/course';
import { useProgress } from '../lib/progress';

export function ModulePage() {
  const { moduleId } = useParams();
  const module = COURSE.find((m) => m.id === moduleId);
  const { completed, quiz } = useProgress();

  if (!module) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <div className="text-4xl">{module.icon}</div>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          โมดูล {module.num}: {module.title}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{module.description}</p>
      </div>

      {module.status === 'soon' ? (
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Badge tone="amber">กำลังพัฒนา · Phase {module.phase}</Badge>
          </div>
          <p className="mb-3 text-slate-600 dark:text-slate-400">หัวข้อที่จะมีในโมดูลนี้:</p>
          <ul className="list-disc space-y-1 pl-6">
            {module.upcoming?.map((u) => <li key={u}>{u}</li>)}
          </ul>
        </Card>
      ) : (
        <ol className="space-y-3">
          {module.lessons.map((l, i) => {
            const key = lessonKey(module.id, l.id);
            const score = quiz[key];
            return (
              <li key={l.id}>
                <Link
                  to={`/learn/${module.id}/${l.id}`}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-500 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold ${
                      completed[key]
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {completed[key] ? '✓' : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white">{l.title}</div>
                    <div className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{l.summary}</div>
                  </div>
                  <div className="hidden shrink-0 text-right text-xs text-slate-500 sm:block">
                    <div>~{l.minutes} นาที</div>
                    {score && (
                      <div className="mt-1">
                        แบบทดสอบ {score[0]}/{score[1]}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
