import { expect, it } from 'vitest';

import valueToCSSAttribute from './valueToCSSAttribute';

it('helpers/valueToCSSAttribute - number', () => {
  expect(valueToCSSAttribute(100)).toBe('100px');
});

it('helpers/valueToCSSAttribute - string', () => {
  expect(valueToCSSAttribute('50%')).toBe('50%');
});
