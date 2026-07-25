import { expect, it } from 'vitest';

import setNextZIndex from './setNextZIndex';

it('helpers/setNextZIndex', () => {
  const elementNode = document.createElement('div');
  setNextZIndex(elementNode);
  const firstZIndex = parseInt(elementNode.style.zIndex, 10);

  setNextZIndex(elementNode);
  const secondZIndex = parseInt(elementNode.style.zIndex, 10);

  expect(secondZIndex).toBe(firstZIndex + 1);
});
