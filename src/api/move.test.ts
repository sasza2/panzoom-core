import { expect, it } from 'vitest';

import { Ref } from 'types'
import { createRef } from '@/helpers/effects'
import move from './move';
import { Position, Zoom } from 'types';

it('api/move', () => {
  const childNode = document.createElement('div')

  const positionRef = createRef() as Ref<Position>;
  positionRef.current = { x: 250, y: 400 };

  const zoomRef = createRef() as Zoom;
  zoomRef.current = 1.1;

  // Move (40, -30)
  move({ childNode, positionRef, zoomRef })(40, -30);

  expect(childNode.style.transform).toBe('translate(290px, 370px) scale(1.1)');
  expect(positionRef.current).toStrictEqual({ x: 290, y: 370 });
  expect(zoomRef.current).toBe(1.1);

  // Move (-120, 60)
  move({ childNode, positionRef, zoomRef })(-120, 60);

  expect(childNode.style.transform).toBe('translate(170px, 430px) scale(1.1)');
  expect(positionRef.current).toStrictEqual({ x: 170, y: 430 });
  expect(zoomRef.current).toBe(1.1);
});
