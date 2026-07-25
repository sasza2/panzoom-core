import { expect, it, vi } from 'vitest';

import updateFamilyOfElementsPosition from './updateFamilyOfElementsPosition';

it('helpers/updateFamilyOfElementsPosition - updates positions keeping family relative offset', () => {
  const node1 = document.createElement('div');
  const node2 = document.createElement('div');

  const elementsRef = {
    current: {
      a: { id: 'a', position: { x: 10, y: 10 }, node: { current: node1 } },
      b: { id: 'b', position: { x: 50, y: 50 }, node: { current: node2 } },
    },
  } as any;

  const elementsInMove = {
    a: { x: 5, y: 5 },
    b: { x: 45, y: 45 },
  };

  const onElementsChange = vi.fn();

  updateFamilyOfElementsPosition({
    elementsRef,
    elementsInMove,
    produceNextPosition: (from) => ({ x: from.x + 5, y: from.y + 5 }),
    onElementsChange,
  });

  expect(onElementsChange).toHaveBeenCalledTimes(1);
  expect(node1.style.transform).toContain('translate(');
  expect(node2.style.transform).toContain('translate(');
});

it('helpers/updateFamilyOfElementsPosition - works without onElementsChange callback', () => {
  const node1 = document.createElement('div');

  const elementsRef = {
    current: {
      a: { id: 'a', position: { x: 0, y: 0 }, node: { current: node1 } },
    },
  } as any;

  updateFamilyOfElementsPosition({
    elementsRef,
    elementsInMove: { a: { x: 0, y: 0 } },
    produceNextPosition: (from) => from,
  });

  expect(node1.style.transform).toContain('translate(');
});
