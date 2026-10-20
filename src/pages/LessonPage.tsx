import { Link, Navigate, useParams } from 'react-router-dom';
import { Quiz } from '../components/Quiz';
import { Button } from '../components/ui';
import { findLesson } from '../content/course';
import { useProgress } from '../lib/progress';

export function LessonPage() {
  const { moduleId = '', lessonId = '' } = useParams();
  const found = findLesson(moduleId, lessonId);
  const { completed, markComplete } = useProgress();

  if (!found) return <Navigate to={`/learn/${moduleId}`} replace />;

  const { module, lesson, key, prev, next } = found;
  const idx = module.lessons.findIndex((l) => l.id === lesson.id);
  const Body = lesson.Body;
  const done = !!completed[key];

  return (
    <article className="mx-auto max-w-4xl">
      <nav className="mb-4 text-sm text-slate-500">
        <Link to={`/learn/${module.id}`} className="hover:text-teal-700 dark:hover:text-teal-300">
          {module.icon} โมดูล {module.num}: {module.title}
        </Link>
        <span className="mx-1.5">›</span>
        บทที่ {idx + 1}/{module.lessons.length}
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">{lesson.title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {lesson.summary} · ⏱ ~{lesson.minutes} นาที
          {done && <span className="ml-2 text-emerald-600 dark:text-emerald-400">✓ เรียนจบแล้ว</span>}
        </p>
      </header>

      <div className="prose-lesson">
        <Body />
      </div>

      <Quiz key={key} lessonKey={key} questions={lesson.quiz} />

      <div className="mt-6 flex justify-end">
        <Button variant={done ? 'outline' : 'ghost'} onClick={() => markComplete(key, !done)}>
          {done ? '↺ ยกเลิกสถานะเรียนจบ' : '✓ ทำเครื่องหมายว่าเรียนจบ'}
        </Button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            to={`/learn/${prev.module.id}/${prev.lesson.id}`}
            className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 dark:border-slate-800"
          >
            <div className="text-xs text-slate-500">← บทก่อนหน้า</div>
            <div className="font-medium">{prev.lesson.title}</div>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            to={`/learn/${next.module.id}/${next.lesson.id}`}
            className="rounded-xl border border-slate-200 p-4 text-right hover:border-teal-500 dark:border-slate-800"
          >
            <div className="text-xs text-slate-500">บทถัดไป →</div>
            <div className="font-medium">{next.lesson.title}</div>
          </Link>
        )}
      </div>
    </article>
  );
}
