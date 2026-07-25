import { expect, it } from 'vitest';

import produceNextZoom from './produceNextZoom';

it('helpers/produceNextZoom - no deltaY returns current zoom', () => {
  const zoomRef = { current: 1.2 };
  expect(
    produceNextZoom({
      e: { deltaY: 0 } as any, isTouchEvent: false, zoomRef, zoomSpeed: 1,
    }),
  ).toBe(1.2);
});

it('helpers/produceNextZoom - zoom in desktop', () => {
  const zoomRef = { current: 1 };
  const result = produceNextZoom({
    e: { deltaY: -1 } as any, isTouchEvent: false, zoomRef, zoomSpeed: 1,
  });
  expect(result).toBeGreaterThan(1);
});

it('helpers/produceNextZoom - zoom in touch capped at zoomMax', () => {
  const zoomRef = { current: 1 };
  const result = produceNextZoom({
    e: { deltaY: -1 } as any, isTouchEvent: true, zoomRef, zoomSpeed: 1, zoomMax: 1.01,
  });
  expect(result).toBe(1.01);
});

it('helpers/produceNextZoom - zoom out', () => {
  const zoomRef = { current: 1 };
  const result = produceNextZoom({
    e: { deltaY: 1 } as any, isTouchEvent: false, zoomRef, zoomSpeed: 1,
  });
  expect(result).toBeLessThan(1);
});

it('helpers/produceNextZoom - zoom out capped at zoomMin', () => {
  const zoomRef = { current: 1 };
  const result = produceNextZoom({
    e: { deltaY: 1 } as any, isTouchEvent: false, zoomRef, zoomSpeed: 1, zoomMin: 0.99,
  });
  expect(result).toBe(0.99);
});
