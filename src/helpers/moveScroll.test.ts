import {
  afterEach, expect, it,
} from 'vitest';

import moveScroll from './moveScroll';

const mockRect = (node: HTMLElement, rect: Partial<DOMRect>) => {
  node.getBoundingClientRect = () => ({
    x: rect.left || 0,
    y: rect.top || 0,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    toJSON: () => {},
    ...rect,
  } as DOMRect);
};

afterEach(() => {
  document.body.innerHTML = '';
});

it('helpers/moveScroll scrolls a scrollable ancestor when nothing blocks the move', () => {
  const scrollable = document.createElement('div');
  const parent = document.createElement('div');
  const childNode = document.createElement('div');

  scrollable.appendChild(parent);
  parent.appendChild(childNode);
  document.body.appendChild(scrollable);

  mockRect(parent, {
    left: -500, top: -500, right: -10, bottom: -10,
  });

  Object.defineProperty(scrollable, 'clientHeight', { value: 100, configurable: true });
  Object.defineProperty(scrollable, 'scrollHeight', { value: 500, configurable: true });
  scrollable.scrollLeft = 10;
  scrollable.scrollTop = 10;

  const result = moveScroll(childNode, -5, -5);

  expect(scrollable.scrollLeft).toBe(15);
  expect(scrollable.scrollTop).toBe(15);
  expect(result.x).toBe(0);
  expect(result.y).toBe(0);
});

it('helpers/moveScroll skips ancestors that are not scrollable', () => {
  const notScrollable = document.createElement('div');
  const parent = document.createElement('div');
  const childNode = document.createElement('div');

  notScrollable.appendChild(parent);
  parent.appendChild(childNode);
  document.body.appendChild(notScrollable);

  mockRect(parent, {
    left: -500, top: -500, right: -10, bottom: -10,
  });

  Object.defineProperty(notScrollable, 'clientHeight', { value: 100, configurable: true });
  Object.defineProperty(notScrollable, 'scrollHeight', { value: 100, configurable: true });

  const result = moveScroll(childNode, 5, 5);
  expect(result.x).toBe(5);
  expect(result.y).toBe(5);
});

it('helpers/moveScroll blocks horizontal and vertical movement at the edges (blockRight/blockBottom)', () => {
  const scrollable = document.createElement('div');
  const parent = document.createElement('div');
  const childNode = document.createElement('div');

  scrollable.appendChild(parent);
  parent.appendChild(childNode);
  document.body.appendChild(scrollable);

  mockRect(parent, {
    left: 10, top: 10, right: 50, bottom: 50,
  });

  Object.defineProperty(scrollable, 'clientHeight', { value: 100, configurable: true });
  Object.defineProperty(scrollable, 'scrollHeight', { value: 500, configurable: true });

  const result = moveScroll(childNode, -5, -5);

  expect(result).toStrictEqual({ x: -5, y: -5 });
  expect(scrollable.scrollLeft).toBe(0);
  expect(scrollable.scrollTop).toBe(0);
});

it('helpers/moveScroll blocks horizontal and vertical movement at the edges (blockLeft/blockTop)', () => {
  const scrollable = document.createElement('div');
  const parent = document.createElement('div');
  const childNode = document.createElement('div');

  scrollable.appendChild(parent);
  parent.appendChild(childNode);
  document.body.appendChild(scrollable);

  mockRect(parent, {
    left: 5, top: 5, right: 500, bottom: 500,
  });

  Object.defineProperty(scrollable, 'clientHeight', { value: 100, configurable: true });
  Object.defineProperty(scrollable, 'scrollHeight', { value: 500, configurable: true });

  const result = moveScroll(childNode, 5, 5);

  expect(result).toStrictEqual({ x: 5, y: 5 });
});

it('helpers/moveScroll only blocks the axis it needs to (mixed block)', () => {
  const scrollable = document.createElement('div');
  const parent = document.createElement('div');
  const childNode = document.createElement('div');

  scrollable.appendChild(parent);
  parent.appendChild(childNode);
  document.body.appendChild(scrollable);

  // blockLeft true (nextX > 0 && left >= 0), blockVertical false (bottom <= 0)
  mockRect(parent, {
    left: 5, top: -500, right: 500, bottom: -10,
  });

  Object.defineProperty(scrollable, 'clientHeight', { value: 100, configurable: true });
  Object.defineProperty(scrollable, 'scrollHeight', { value: 500, configurable: true });
  scrollable.scrollTop = 10;

  const result = moveScroll(childNode, 5, -5);

  expect(result.x).toBe(5);
  expect(scrollable.scrollTop).toBe(15);
});
