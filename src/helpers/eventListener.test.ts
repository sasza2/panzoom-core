import { expect, it, vi } from 'vitest';

import { onMouseDown, onMouseUp, onMouseMove, onContextMenu } from './eventListener';

it('helpers/eventListener - onMouseDown', () => {
  const node = document.createElement('div');
  const callback = vi.fn();

  const clean = onMouseDown(node, callback);
  node.dispatchEvent(new MouseEvent('mousedown'));
  expect(callback).toHaveBeenCalledTimes(1);

  clean();
  node.dispatchEvent(new MouseEvent('mousedown'));
  expect(callback).toHaveBeenCalledTimes(1);
});

it('helpers/eventListener - onMouseUp', () => {
  const node = document.createElement('div');
  const callback = vi.fn();

  const clean = onMouseUp(node, callback);
  window.dispatchEvent(new MouseEvent('mouseup'));
  node.dispatchEvent(new Event('touchend'));
  expect(callback).toHaveBeenCalledTimes(2);

  clean();
  window.dispatchEvent(new MouseEvent('mouseup'));
  expect(callback).toHaveBeenCalledTimes(2);
});

it('helpers/eventListener - onMouseMove ignores multi-touch zoom events', () => {
  const callback = vi.fn();
  const clean = onMouseMove(callback);

  window.dispatchEvent(new MouseEvent('mousemove'));
  expect(callback).toHaveBeenCalledTimes(1);

  const multiTouch = new Event('touchmove') as any;
  multiTouch.touches = [{}, {}];
  window.dispatchEvent(multiTouch);
  expect(callback).toHaveBeenCalledTimes(1);

  const singleTouch = new Event('touchmove') as any;
  singleTouch.touches = [{}];
  window.dispatchEvent(singleTouch);
  expect(callback).toHaveBeenCalledTimes(2);

  clean();
  window.dispatchEvent(new MouseEvent('mousemove'));
  expect(callback).toHaveBeenCalledTimes(2);
});

it('helpers/eventListener - onContextMenu', () => {
  const node = document.createElement('div');
  const callback = vi.fn();

  const clean = onContextMenu(node, callback);
  node.dispatchEvent(new MouseEvent('contextmenu'));
  expect(callback).toHaveBeenCalledTimes(1);

  clean();
  node.dispatchEvent(new MouseEvent('contextmenu'));
  expect(callback).toHaveBeenCalledTimes(1);
});
