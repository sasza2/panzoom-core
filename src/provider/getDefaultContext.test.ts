import { expect, it } from 'vitest';

import getDefaultContext from './getDefaultContext';

it('provider/getDefaultContext - defaults when no options given', () => {
  const parent = document.createElement('div');
  const childNode = document.createElement('div');
  parent.appendChild(childNode);

  const context = getDefaultContext(childNode, {});

  expect(context.className).toBe('panzoom-core');
  expect(context.disabledScrollHorizontal).toBe(true);
  expect(context.disabledScrollVertical).toBe(true);
  expect(context.elementsAutoMoveAtEdge).toBe(true);
  expect(context.width).toBe('100%');
  expect(context.height).toBe('100%');
  expect(context.zoomRef.current).toBe(1);
});

it('provider/getDefaultContext - respects provided options', () => {
  const parent = document.createElement('div');
  const childNode = document.createElement('div');
  parent.appendChild(childNode);

  const context = getDefaultContext(childNode, {
    className: 'custom',
    disabled: true,
    disabledScrollHorizontal: false,
    disabledScrollVertical: false,
    elementsAutoMoveAtEdge: false,
    width: 200,
    height: 300,
    zoomInitial: 2,
    zoomMin: 0.5,
    zoomMax: 4,
  });

  expect(context.className).toBe('custom');
  expect(context.disabled).toBe(true);
  expect(context.disabledScrollHorizontal).toBe(false);
  expect(context.disabledScrollVertical).toBe(false);
  expect(context.elementsAutoMoveAtEdge).toBe(false);
  expect(context.width).toBe(200);
  expect(context.height).toBe(300);
  expect(context.zoomRef.current).toBe(2);
  expect(context.zoomMin).toBe(0.5);
  expect(context.zoomMax).toBe(4);
});
