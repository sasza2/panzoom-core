import { expect, it, vi, afterEach } from 'vitest';

import isEdgeVisible, { distanceToRightEdge, distanceToBottomEdge } from './isEdgeVisible';

afterEach(() => {
  vi.restoreAllMocks();
});

const setup = () => {
  const parent = document.createElement('div');
  const childNode = document.createElement('div');
  parent.appendChild(childNode);
  document.body.appendChild(parent);
  return { parent, childNode };
};

it('helpers/isEdgeVisible - distanceToRightEdge / left visible', () => {
  const { parent, childNode } = setup();

  vi.spyOn(childNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 100, top: 0, bottom: 100, width: 100, height: 100,
  } as DOMRect);
  vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 500, top: 0, bottom: 500, width: 500, height: 500,
  } as DOMRect);

  expect(distanceToRightEdge(childNode)).toBeLessThanOrEqual(0);
  expect(distanceToBottomEdge(childNode)).toBeLessThanOrEqual(0);

  const positionRef = { current: { x: 0, y: 0 } };
  expect(isEdgeVisible.left(childNode, positionRef)).toBe(true);
  expect(isEdgeVisible.top(childNode, positionRef)).toBe(true);
  expect(isEdgeVisible.right(childNode, positionRef)).toBe(true);
  expect(isEdgeVisible.bottom(childNode, positionRef)).toBe(true);
});

it('helpers/isEdgeVisible - not visible when far off screen', () => {
  const { parent, childNode } = setup();

  vi.spyOn(childNode, 'getBoundingClientRect').mockReturnValue({
    left: -2000, right: -1900, top: -2000, bottom: -1900, width: 100, height: 100,
  } as DOMRect);
  vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
    left: -2000, right: -1500, top: -2000, bottom: -1500, width: 500, height: 500,
  } as DOMRect);

  const positionRef = { current: { x: -2000, y: -2000 } };
  expect(isEdgeVisible.left(childNode, positionRef)).toBe(false);
  expect(isEdgeVisible.top(childNode, positionRef)).toBe(false);
});
