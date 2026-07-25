import { expect, it } from 'vitest';

import stopEventPropagation from './stopEventPropagation';

it('helpers/stopEventPropagation', () => {
  const cb = stopEventPropagation();
  expect(cb.done).toBe(false);
  cb();
  expect(cb.done).toBe(true);
});
