import { expect, it } from 'vitest';

import getScrollOffset from './getScrollOffset';

it('helpers/getScrollOffset - accumulates scroll from ancestor nodes', () => {
  const outer = document.createElement('div');
  const middle = document.createElement('div');
  const parent = document.createElement('div');
  const childNode = document.createElement('div');

  outer.appendChild(middle);
  middle.appendChild(parent);
  parent.appendChild(childNode);
  document.body.appendChild(outer);

  Object.defineProperty(outer, 'scrollLeft', { value: 10, configurable: true });
  Object.defineProperty(outer, 'scrollTop', { value: 20, configurable: true });
  Object.defineProperty(middle, 'scrollLeft', { value: 5, configurable: true });
  Object.defineProperty(middle, 'scrollTop', { value: 7, configurable: true });

  expect(getScrollOffset(childNode)).toStrictEqual({ x: 15, y: 27 });
});
