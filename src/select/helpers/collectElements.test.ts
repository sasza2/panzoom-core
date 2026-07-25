import { expect, it } from 'vitest';

import collectElements from './collectElements';

it('select/helpers/collectElements - filters elements within boundary', () => {
  const elements = {
    a: { id: 'a', position: { x: 10, y: 10 } },
    b: { id: 'b', position: { x: 100, y: 100 } },
  } as any;

  const boundary = {
    left: 0, right: 50, top: 0, bottom: 50,
  } as any;

  expect(collectElements(boundary, elements)).toStrictEqual({
    a: elements.a,
  });
});

it('select/helpers/collectElements - supports string boundary edges', () => {
  const elements = {
    a: { id: 'a', position: { x: 10, y: 10 } },
  } as any;

  const boundary = {
    left: '0', right: '50', top: '0', bottom: '50',
  } as any;

  expect(collectElements(boundary, elements)).toStrictEqual({ a: elements.a });
});
