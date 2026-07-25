import { expect, it } from 'vitest';

import getAllowedProps from './getAllowedProps';

it('provider/getAllowedProps - returns list of allowed option keys', () => {
  const props = getAllowedProps();
  expect(props).toContain('boundary');
  expect(props).toContain('zoomMin');
  expect(props.length).toBeGreaterThan(0);
});
