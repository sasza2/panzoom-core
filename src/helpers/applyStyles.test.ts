import { expect, it } from 'vitest';

import applyStyles from './applyStyles';

it('helpers/applyStyles', () => {
  const node = document.createElement('div');

  const clean = applyStyles(node, { color: 'red', 'font-size': '12px' });
  expect(node.style.getPropertyValue('color')).toBe('red');
  expect(node.style.getPropertyValue('font-size')).toBe('12px');

  clean();
  expect(node.style.getPropertyValue('color')).toBe('');
  expect(node.hasAttribute('style')).toBe(false);
});
