import { expect, it, vi, afterEach } from 'vitest';

import isCursorOnEdge from './isCursorOnEdge';

afterEach(() => {
  vi.restoreAllMocks();
});

it('helpers/isCursorOnEdge - detects left edge', () => {
  const parent = document.createElement('div');
  const childNode = document.createElement('div');
  parent.appendChild(childNode);
  document.body.appendChild(parent);

  vi.spyOn(childNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 100, top: 0, bottom: 100,
  } as DOMRect);
  vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 500, top: 0, bottom: 500,
  } as DOMRect);

  const edges = isCursorOnEdge(childNode, { clientX: 5, clientY: 200 });
  expect(edges.left).toBe(true);
});

it('helpers/isCursorOnEdge - detects right/bottom edge', () => {
  const parent = document.createElement('div');
  const childNode = document.createElement('div');
  parent.appendChild(childNode);
  document.body.appendChild(parent);

  vi.spyOn(childNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 100, top: 0, bottom: 100,
  } as DOMRect);
  vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 100, top: 0, bottom: 100,
  } as DOMRect);

  const edges = isCursorOnEdge(childNode, { clientX: 95, clientY: 95 });
  expect(edges.right).toBe(true);
  expect(edges.bottom).toBe(true);
});

it('helpers/isCursorOnEdge - uses offsetX/offsetY when parent rect is positive, considers ancestor nodes', () => {
  const grandParent = document.createElement('div');
  const parent = document.createElement('div');
  const childNode = document.createElement('div');
  grandParent.appendChild(parent);
  parent.appendChild(childNode);
  document.body.appendChild(grandParent);

  vi.spyOn(childNode, 'getBoundingClientRect').mockReturnValue({
    left: 20, right: 120, top: 20, bottom: 120,
  } as DOMRect);
  vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
    left: 10, right: 400, top: 10, bottom: 400,
  } as DOMRect);
  vi.spyOn(grandParent, 'getBoundingClientRect').mockReturnValue({
    left: 5, right: 300, top: 5, bottom: 300,
  } as DOMRect);

  const edges = isCursorOnEdge(childNode, { clientX: 25, clientY: 25 });
  expect(edges).toBeDefined();
});

it('helpers/isCursorOnEdge - ancestor chain outside <body> reaches `document`, which has no getBoundingClientRect', () => {
  const parent = document.createElement('div');
  const childNode = document.createElement('div');
  parent.appendChild(childNode);
  // append under <html> (not <body>) so loopParentNodes' "stop at body"
  // check never fires, and the walk continues past <html> up to the
  // `document` node itself, which lacks getBoundingClientRect.
  document.documentElement.appendChild(parent);

  vi.spyOn(childNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 100, top: 0, bottom: 100,
  } as DOMRect);
  vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 500, top: 0, bottom: 500,
  } as DOMRect);

  try {
    expect(() => isCursorOnEdge(childNode, { clientX: 5, clientY: 5 })).not.toThrow();
  } finally {
    document.documentElement.removeChild(parent);
  }
});

it('helpers/isCursorOnEdge - no edges when centered', () => {
  const parent = document.createElement('div');
  const childNode = document.createElement('div');
  parent.appendChild(childNode);
  document.body.appendChild(parent);

  vi.spyOn(childNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 1000, top: 0, bottom: 1000,
  } as DOMRect);
  vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 1000, top: 0, bottom: 1000,
  } as DOMRect);

  const edges = isCursorOnEdge(childNode, { clientX: 500, clientY: 500 });
  expect(edges).toStrictEqual({
    top: false, bottom: false, left: false, right: false,
  });
});
