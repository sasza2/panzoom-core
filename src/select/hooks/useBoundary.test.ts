import {
  afterEach, beforeEach, expect, it, vi,
} from 'vitest';

import initPanZoom from '@/initPanZoom';

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

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

const setup = () => {
  const containerNode = document.createElement('div');
  const childNode = document.createElement('div');
  containerNode.appendChild(childNode);
  document.body.appendChild(containerNode);

  mockRect(containerNode, {
    left: 0, top: 0, right: 500, bottom: 500, width: 500, height: 500,
  });
  mockRect(childNode, {
    left: 0, top: 0, right: 500, bottom: 500, width: 500, height: 500,
  });

  initPanZoom(childNode, { selecting: true });

  const selectNode = childNode.children[0] as HTMLDivElement;

  return { containerNode, childNode, selectNode };
};

const flush = () => vi.advanceTimersByTime(0);

const mousedown = (node: EventTarget, clientX: number, clientY: number) => {
  node.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX, clientY,
  }));
  flush();
};

const mousemove = (clientX: number, clientY: number) => {
  window.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true, clientX, clientY,
  }));
  flush();
};

const mouseup = (clientX: number, clientY: number) => {
  window.dispatchEvent(new MouseEvent('mouseup', {
    bubbles: true, clientX, clientY,
  }));
  flush();
};

it('select/hooks/useBoundary creates a boundary box from a normal drag (no clamping)', () => {
  const { selectNode } = setup();

  mousedown(selectNode, 50, 50);
  mousemove(120, 130);
  mouseup(150, 160);

  const movingRef = selectNode.children[0] as HTMLDivElement;
  expect(movingRef.style.width).toBe('100px');
  expect(movingRef.style.height).toBe('110px');
  expect(movingRef.style.transform).toBe('translate(50px, 50px)');
});

it('select/hooks/useBoundary handles dragging backwards (negative width/height)', () => {
  const { selectNode } = setup();

  mousedown(selectNode, 300, 300);
  mouseup(100, 120);

  const movingRef = selectNode.children[0] as HTMLDivElement;
  expect(movingRef.style.width).toBe('200px');
  expect(movingRef.style.height).toBe('180px');
  expect(movingRef.style.transform).toBe('translate(100px, 120px)');
});

it('select/hooks/useBoundary clamps the position to the container when dragging past the left/top edge', () => {
  const { selectNode } = setup();

  mousedown(selectNode, 50, 50);
  mouseup(-1000, -1000);

  const movingRef = selectNode.children[0] as HTMLDivElement;
  expect(movingRef.style.width).toBe('50px');
  expect(movingRef.style.height).toBe('50px');
  expect(movingRef.style.transform).toBe('translate(0px, 0px)');
});

it('select/hooks/useBoundary clamps the position to the container when dragging past the right/bottom edge', () => {
  const { selectNode } = setup();

  mousedown(selectNode, 50, 50);
  mouseup(10000, 10000);

  const movingRef = selectNode.children[0] as HTMLDivElement;
  expect(movingRef.style.width).toBe('450px');
  expect(movingRef.style.height).toBe('450px');
  expect(movingRef.style.transform).toBe('translate(50px, 50px)');
});

it('select/hooks/useBoundary clicking the select area again clears the boundary, allowing a new drag', () => {
  const { selectNode } = setup();

  mousedown(selectNode, 50, 50);
  mouseup(150, 160);

  expect(selectNode.children.length).toBe(1);

  // boundary is now set - clicking the select area (not the moving box) clears it
  mousedown(selectNode, 0, 0);

  expect(selectNode.children.length).toBe(0);

  // starting a fresh drag should work again, proving the boundary was reset
  mousedown(selectNode, 10, 10);
  mouseup(60, 70);

  const movingRef = selectNode.children[0] as HTMLDivElement;
  expect(movingRef.style.width).toBe('50px');
  expect(movingRef.style.height).toBe('60px');
});
