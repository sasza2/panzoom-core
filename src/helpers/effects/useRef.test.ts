import { expect, it } from 'vitest';

import { createComponentQueue, render, useRef } from './index';

it('effects/useRef - persists value across renders and default null', () => {
  const results: Array<unknown> = [];
  const initializeComponent = createComponentQueue();
  const component = initializeComponent(() => {
    const ref = useRef();
    results.push(ref.current);
    ref.current = 'set';
  });

  render([component]);
  render([component]);

  expect(results[0]).toBe(null);
  expect(results[1]).toBe('set');
});
