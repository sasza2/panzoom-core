import { expect, it } from 'vitest';

import clearStyleAttribute from './clearStyleAttribute';

it('helpers/clearStyleAttribute - removes empty style attribute', () => {
  const node = document.createElement('div');
  node.setAttribute('style', '');
  clearStyleAttribute(node);
  expect(node.hasAttribute('style')).toBe(false);
});

it('helpers/clearStyleAttribute - keeps non-empty style attribute', () => {
  const node = document.createElement('div');
  node.style.color = 'red';
  clearStyleAttribute(node);
  expect(node.hasAttribute('style')).toBe(true);
});
