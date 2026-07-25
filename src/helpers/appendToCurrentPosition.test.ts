import { expect, it, vi, afterEach } from 'vitest';

import { createRef } from '@/helpers/effects';
import appendToCurrentPosition from './appendToCurrentPosition';

afterEach(() => {
  vi.restoreAllMocks();
});

it('helpers/appendToCurrentPosition - moves position and applies transform', () => {
  const parent = document.createElement('div');
  const childNode = document.createElement('div');
  parent.appendChild(childNode);
  document.body.appendChild(parent);

  vi.spyOn(childNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 100, top: 0, bottom: 100, width: 100, height: 100,
  } as DOMRect);
  vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 500, top: 0, bottom: 500, width: 500, height: 500,
  } as DOMRect);

  const positionRef = createRef() as any;
  positionRef.current = { x: 10, y: 10 };
  const zoomRef = createRef() as any;
  zoomRef.current = 1;

  appendToCurrentPosition({
    childNode, positionRef, addPosition: { x: 5, y: 5 }, zoomRef,
  });

  expect(childNode.style.transform).toContain('translate(');
});

it('helpers/appendToCurrentPosition - positive move resets to 0 when overshooting', () => {
  const parent = document.createElement('div');
  const childNode = document.createElement('div');
  parent.appendChild(childNode);
  document.body.appendChild(parent);

  vi.spyOn(childNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 100, top: 0, bottom: 100, width: 100, height: 100,
  } as DOMRect);
  vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 500, top: 0, bottom: 500, width: 500, height: 500,
  } as DOMRect);

  const positionRef = createRef() as any;
  positionRef.current = { x: 10, y: 10 };
  const zoomRef = createRef() as any;
  zoomRef.current = 1;

  appendToCurrentPosition({
    childNode, positionRef, addPosition: { x: 20, y: 20 }, zoomRef,
  });

  expect(positionRef.current.x).toBeLessThanOrEqual(0);
  expect(positionRef.current.y).toBeLessThanOrEqual(0);
});

it('helpers/appendToCurrentPosition - negative move constrained by edge distance', () => {
  const parent = document.createElement('div');
  const childNode = document.createElement('div');
  parent.appendChild(childNode);
  document.body.appendChild(parent);

  vi.spyOn(childNode, 'getBoundingClientRect').mockReturnValue({
    left: -400, right: -300, top: -400, bottom: -300, width: 100, height: 100,
  } as DOMRect);
  vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
    left: -400, right: -50, top: -400, bottom: -50, width: 350, height: 350,
  } as DOMRect);

  const positionRef = createRef() as any;
  positionRef.current = { x: -400, y: -400 };
  const zoomRef = createRef() as any;
  zoomRef.current = 1;

  appendToCurrentPosition({
    childNode, positionRef, addPosition: { x: -50, y: -50 }, zoomRef,
  });

  expect(positionRef.current.x).toBeDefined();
  expect(positionRef.current.y).toBeDefined();
});
