import { expect, it } from 'vitest';

import { Ref } from 'types'
import { createRef } from '@/helpers/effects'
import { getPosition, setPosition } from './position';
import { Position, Zoom } from 'types';

it('api/position/get', () => {
  const positionRef = createRef() as Ref<Position>;

  positionRef.current = { x: 30, y: 40 };
  expect(getPosition({ positionRef })()).toStrictEqual({ x: 30, y: 40 });

  positionRef.current = { x: 60, y: 25 };
  expect(getPosition({ positionRef })()).toStrictEqual({ x: 60, y: 25 });
});

it('api/position/set', () => {
  const childNode = document.createElement('div')

  const positionRef = createRef() as Ref<Position>;
  positionRef.current = { x: 250, y: 400 };

  const zoomRef = createRef() as Zoom;
  zoomRef.current = 1.1;

  // To (200, 300)
  setPosition({ childNode, positionRef, zoomRef })(200, 300);

  expect(positionRef.current).toStrictEqual({ x: 200, y: 300 });
  expect(zoomRef.current).toBe(1.1);
  expect(childNode.style.transform).toBe('translate(200px, 300px) scale(1.1)');

  // To (600, 100)
  setPosition({ childNode, positionRef, zoomRef })(600, 100);

  expect(positionRef.current).toStrictEqual({ x: 600, y: 100 });
  expect(zoomRef.current).toBe(1.1);
  expect(childNode.style.transform).toBe('translate(600px, 100px) scale(1.1)');
});
