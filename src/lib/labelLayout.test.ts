import { describe, expect, it } from 'vitest';
import { spreadLabels } from './labelLayout';

describe('spreadLabels', () => {
  it('leaves well-spaced labels where they are', () => {
    expect(spreadLabels([50, 10, 100], 15, 0, 300)).toEqual([50, 10, 100]);
  });

  it('separates overlapping labels by at least minGap and keeps order', () => {
    const out = spreadLabels([100, 100, 101], 15, 0, 300);
    const sorted = [...out].sort((a, b) => a - b);
    for (let k = 1; k < sorted.length; k++) expect(sorted[k] - sorted[k - 1]).toBeGreaterThanOrEqual(15 - 1e-9);
    expect(out[2]).toBeGreaterThan(out[0]);
  });

  it('stays inside bounds', () => {
    const out = spreadLabels([295, 296, 299], 15, 10, 300);
    expect(Math.max(...out)).toBeLessThanOrEqual(300);
    expect(Math.min(...out)).toBeGreaterThanOrEqual(10);
  });
});
