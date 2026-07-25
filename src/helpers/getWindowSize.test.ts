import { expect, it, vi, afterEach } from 'vitest';

import getWindowSize from './getWindowSize';

afterEach(() => {
  vi.restoreAllMocks();
});

it('helpers/getWindowSize - falls back to window size when body rect is empty', () => {
  vi.spyOn(document.body, 'getBoundingClientRect').mockReturnValue({ width: 0, height: 0 } as DOMRect);

  const size = getWindowSize();
  expect(size).toStrictEqual({ width: window.innerWidth, height: window.innerHeight });
});

it('helpers/getWindowSize - uses min of body rect and window size', () => {
  vi.spyOn(document.body, 'getBoundingClientRect').mockReturnValue({ width: 100, height: 200 } as DOMRect);

  const size = getWindowSize();
  expect(size).toStrictEqual({
    width: Math.min(100, window.innerWidth),
    height: Math.min(200, window.innerHeight),
  });
});
