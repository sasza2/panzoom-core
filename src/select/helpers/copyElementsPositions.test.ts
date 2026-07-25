import { expect, it } from 'vitest';

import copyElementsPositions from './copyElementsPositions';

it('select/helpers/copyElementsPositions - clones positions of all elements', () => {
  const elements = {
    a: { position: { x: 1, y: 2 } },
    b: { position: { x: 3, y: 4 } },
  } as any;

  const result = copyElementsPositions(elements);

  expect(result).toStrictEqual({ a: { x: 1, y: 2 }, b: { x: 3, y: 4 } });
  expect(result.a).not.toBe(elements.a.position);
});
