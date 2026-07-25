import { expect, it } from 'vitest';

import lineToVariable from './lineToVariable';

it('helpers/lineToVariable - number input', () => {
  expect(lineToVariable(15)).toBe(15);
});

it('helpers/lineToVariable - numeric string input', () => {
  expect(lineToVariable('42')).toBe('42');
});

it('helpers/lineToVariable - px string is returned unchanged (parseInt succeeds early)', () => {
  expect(lineToVariable('100px')).toBe('100px');
});

it('helpers/lineToVariable - variable', () => {
  expect(lineToVariable('containerWidth', { containerWidth: 500, containerHeight: 300, childWidth: 0, childHeight: 0 })).toBe(500);
});

it('helpers/lineToVariable - addition', () => {
  expect(lineToVariable('containerWidth + 20px', { containerWidth: 500, containerHeight: 0, childWidth: 0, childHeight: 0 })).toBe(520);
});

it('helpers/lineToVariable - subtraction', () => {
  expect(lineToVariable('containerWidth - 20px', { containerWidth: 500, containerHeight: 0, childWidth: 0, childHeight: 0 })).toBe(480);
});

it('helpers/lineToVariable - multiple operations', () => {
  expect(lineToVariable('containerWidth - 20px + 10px', { containerWidth: 500, containerHeight: 0, childWidth: 0, childHeight: 0 })).toBe(490);
});

it('helpers/lineToVariable - plain number string without unit', () => {
  expect(lineToVariable('childWidth + 5', { containerWidth: 0, containerHeight: 0, childWidth: 100, childHeight: 0 })).toBe(105);
});

it('helpers/lineToVariable - zero-valued left operand exercises the `a || 0` fallback', () => {
  expect(lineToVariable('containerWidth - 5px', { containerWidth: 0, containerHeight: 0, childWidth: 0, childHeight: 0 })).toBe(-5);
});

it('helpers/lineToVariable - zero-valued right operand exercises the `b || 0` fallback', () => {
  expect(lineToVariable('containerHeight + containerWidth', { containerWidth: 0, containerHeight: 5, childWidth: 0, childHeight: 0 })).toBe(5);
});
