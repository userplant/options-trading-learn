import { describe, expect, it } from 'vitest';
import { ALL_LESSONS } from '../content/course';
import { stableOrder } from './shuffle';

describe('stableOrder', () => {
  it('is a deterministic permutation', () => {
    expect(stableOrder(4, 'a')).toEqual(stableOrder(4, 'a'));
    expect([...stableOrder(4, 'b')].sort()).toEqual([0, 1, 2, 3]);
  });

  it('spreads quiz answers across positions', () => {
    const counts = [0, 0, 0, 0];
    for (const { lesson, key } of ALL_LESSONS) {
      lesson.quiz.forEach((q, qi) => {
        counts[stableOrder(q.choices.length, `${key}#${qi}`).indexOf(q.answer)]++;
      });
    }
    const total = counts.reduce((a, b) => a + b, 0);
    console.log('answer position counts', counts);
    for (let p = 0; p < 4; p++) expect(counts[p] / total).toBeLessThan(0.45);
  });
});
