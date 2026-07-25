import { expect, it } from 'vitest';

import { getZoomPositionInParentRect } from './zoomPositionInParentRect';

const parentRect = { left: 10, top: 20, width: 200, height: 100 } as DOMRect;

it('helpers/zoomPositionInParentRect - no zoomPosition uses event position', () => {
  expect(
    getZoomPositionInParentRect({ e: { clientX: 50, clientY: 60 } as any, parentRect }),
  ).toStrictEqual({ x: 40, y: 40 });
});

it('helpers/zoomPositionInParentRect - center x/y', () => {
  expect(
    getZoomPositionInParentRect({
      e: { clientX: 50, clientY: 60 } as any,
      parentRect,
      zoomPosition: { x: 'center', y: 'center' },
    }),
  ).toStrictEqual({ x: 100, y: 50 });
});

it('helpers/zoomPositionInParentRect - explicit x/y', () => {
  expect(
    getZoomPositionInParentRect({
      e: { clientX: 50, clientY: 60 } as any,
      parentRect,
      zoomPosition: { x: 15, y: 25 },
    }),
  ).toStrictEqual({ x: 15, y: 25 });
});
