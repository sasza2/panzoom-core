import { expect, it } from 'vitest';

import { Ref } from 'types'
import { createRef } from '@/helpers/effects'
import { getZoom, setZoom, zoomIn, zoomOut } from './zoom';
import { Position, Zoom } from 'types';

it('api/zoom/get', () => {
  const zoomRef = createRef() as Zoom;

  zoomRef.current = 1.1;
  expect(getZoom({ zoomRef })()).toBe(1.1);

  zoomRef.current = 0.5;
  expect(getZoom({ zoomRef })()).toBe(0.5);
});

it('api/zoom/set', () => {
  const childNode = document.createElement('div')

  const positionRef = createRef() as Ref<Position>;
  const zoomRef = createRef() as Zoom;

  // Change to 1.5
  positionRef.current = { x: 15, y: 30 };
  setZoom({ childNode, positionRef, zoomRef, zoomMin: 1, zoomMax: 2 })(1.5);

  expect(childNode.style.transform).toBe('translate(15px, 30px) scale(1.5)');
  expect(positionRef.current).toStrictEqual({ x: 15, y: 30 });
  expect(zoomRef.current).toBe(1.5);

  // Change to 2.1
  setZoom({ childNode, positionRef, zoomRef, zoomMin: 1, zoomMax: 3 })(2.1);

  expect(childNode.style.transform).toBe('translate(15px, 30px) scale(2.1)');
  expect(positionRef.current).toStrictEqual({ x: 15, y: 30 });
  expect(zoomRef.current).toBe(2.1);
});

it('api/zoom/in', () => {
  const childNode = document.createElement('div')

  const positionRef = createRef() as Ref<Position>;
  const zoomRef = createRef() as Zoom;
  zoomRef.current = 1;

  positionRef.current = { x: 20, y: 40 };
  zoomIn({ childNode, positionRef, zoomRef, zoomMin: 0.2, zoomMax: 1.5 })(0.2);

  expect(childNode.style.transform).toBe('translate(20px, 40px) scale(1.2)');
  expect(positionRef.current).toStrictEqual({ x: 20, y: 40 });
  expect(zoomRef.current).toBe(1.2);

  zoomIn({ childNode, positionRef, zoomRef, zoomMin: 0.3, zoomMax: 2 })(0.3);

  expect(childNode.style.transform).toBe('translate(20px, 40px) scale(1.5)');
  expect(positionRef.current).toStrictEqual({ x: 20, y: 40 });
  expect(zoomRef.current).toBe(1.5);
});

it('api/zoom/out', () => {
  const childNode = document.createElement('div')

  const positionRef = createRef() as Ref<Position>;
  const zoomRef = createRef() as Zoom;
  zoomRef.current = 1.5;

  positionRef.current = { x: 20, y: 40 };
  zoomOut({ childNode, positionRef, zoomRef, zoomMin: 0.1, zoomMax: 1.5 })(0.2);

  expect(childNode.style.transform).toBe('translate(20px, 40px) scale(1.3)');
  expect(positionRef.current).toStrictEqual({ x: 20, y: 40 });
  expect(zoomRef.current).toBe(1.3);

  zoomOut({ childNode, positionRef, zoomRef, zoomMin: 0.3, zoomMax: 1 })(0.3);

  expect(childNode.style.transform).toBe('translate(20px, 40px) scale(1)');
  expect(positionRef.current).toStrictEqual({ x: 20, y: 40 });
  expect(zoomRef.current).toBe(1);
});
