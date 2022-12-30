import { expect, it } from 'vitest';

import { Ref } from 'types'
import { createRef } from '@/helpers/effects'
import reset from './reset';
import { Position, Zoom } from 'types';

it('api/reset', () => {
  const childNode = document.createElement('div')
  const positionRef = createRef() as Ref<Position>;
  const zoomRef = createRef() as Zoom;

  reset({ childNode, positionRef, zoomRef })();

  expect(childNode.style.transform).toBe('translate(0px, 0px) scale(1)');
  expect(positionRef.current).toStrictEqual({ x: 0, y: 0 });
  expect(zoomRef.current).toBe(1);
});
