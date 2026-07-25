import { expect, it } from 'vitest';

import applyClassName from './applyClassName';

it('helpers/applyClassName', () => {
  const node = document.createElement('div');

  const clean = applyClassName(node, ' foo bar ');
  expect(node.classList.contains('foo')).toBe(true);
  expect(node.classList.contains('bar')).toBe(true);

  clean();
  expect(node.classList.contains('foo')).toBe(false);
  expect(node.classList.contains('bar')).toBe(false);
  expect(node.hasAttribute('class')).toBe(false);
});
