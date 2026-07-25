import { expect, it, vi, afterEach } from 'vitest';

import produceElementPosition from './produceElementPosition';

afterEach(() => {
  vi.restoreAllMocks();
});

const mockRects = (elementRect: Partial<DOMRect>, childRect: Partial<DOMRect>) => {
  const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect');
  spy.mockImplementationOnce(() => elementRect as DOMRect);
  spy.mockImplementationOnce(() => childRect as DOMRect);
};

it('helpers/produceElementPosition - clamps within bounds', () => {
  mockRects({ width: 100, height: 50 } as DOMRect, { width: 400, height: 300 } as DOMRect);

  const elementNode = document.createElement('div');
  const childNode = document.createElement('div');

  expect(
    produceElementPosition({
      elementNode, childNode, x: 50, y: 20, zoom: 1,
    }),
  ).toStrictEqual({ x: 50, y: 20 });
});

it('helpers/produceElementPosition - clamps negative to 0', () => {
  mockRects({ width: 100, height: 50 } as DOMRect, { width: 400, height: 300 } as DOMRect);

  const elementNode = document.createElement('div');
  const childNode = document.createElement('div');

  expect(
    produceElementPosition({
      elementNode, childNode, x: -10, y: -5, zoom: 1,
    }),
  ).toStrictEqual({ x: 0, y: 0 });
});

it('helpers/produceElementPosition - clamps to max right/bottom', () => {
  mockRects({ width: 100, height: 50 } as DOMRect, { width: 400, height: 300 } as DOMRect);

  const elementNode = document.createElement('div');
  const childNode = document.createElement('div');

  expect(
    produceElementPosition({
      elementNode, childNode, x: 1000, y: 1000, zoom: 1,
    }),
  ).toStrictEqual({ x: 300, y: 250 });
});
