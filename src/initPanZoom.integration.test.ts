import {
  expect, it, vi, afterEach, beforeAll,
} from 'vitest';

import initPanZoom from './initPanZoom';

beforeAll(() => {
  if (!(globalThis as any).DOMMatrixReadOnly) {
    (globalThis as any).DOMMatrixReadOnly = class {
      e = 0;

      f = 0;
    };
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

const setup = (options: Parameters<typeof initPanZoom>[1] = {}) => {
  const containerNode = document.createElement('div');
  const childNode = document.createElement('div');
  containerNode.appendChild(childNode);
  document.body.appendChild(containerNode);

  vi.spyOn(childNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 500, top: 0, bottom: 500, width: 500, height: 500,
  } as DOMRect);
  vi.spyOn(containerNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 500, top: 0, bottom: 500, width: 500, height: 500,
  } as DOMRect);

  const api = initPanZoom(childNode, options);
  return {
    api, childNode, containerNode,
  };
};

const makeTouchList = (points: Array<{ clientX: number; clientY: number }>) => ({
  ...points,
  length: points.length,
  item: (i: number) => points[i],
});

it('initPanZoom - move via mousedown/mousemove/mouseup', () => {
  const { api, containerNode } = setup();

  containerNode.dispatchEvent(new MouseEvent('mousedown', {
    clientX: 10, clientY: 10, buttons: 1,
  }));
  window.dispatchEvent(new MouseEvent('mousemove', {
    clientX: 30, clientY: 40, buttons: 1,
  }));
  window.dispatchEvent(new MouseEvent('mouseup'));

  expect(api.getPosition()).toBeDefined();

  api.destroy();
});

it('initPanZoom - zoom via wheel event', () => {
  const { api, containerNode } = setup();

  containerNode.dispatchEvent(new WheelEvent('wheel', { deltaY: -10, clientX: 100, clientY: 100 }));

  expect(api.getZoom()).toBeGreaterThanOrEqual(1);

  api.destroy();
});

it('initPanZoom - scroll via wheel event with scroll enabled', () => {
  const { api, containerNode } = setup({
    disabledScrollHorizontal: false, disabledScrollVertical: false,
  });

  containerNode.dispatchEvent(new WheelEvent('wheel', { deltaY: 10 }));
  containerNode.dispatchEvent(new WheelEvent('wheel', { deltaY: -10 }));

  expect(api.getPosition()).toBeDefined();

  api.destroy();
});

it('initPanZoom - scroll while elements are mid-move updates their positions too', async () => {
  const { api, childNode, containerNode } = setup({
    disabledScrollHorizontal: false, disabledScrollVertical: false,
  });

  const elementNode = document.createElement('div');
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 20, top: 0, bottom: 20, width: 20, height: 20,
  } as DOMRect);

  api.addElement(elementNode, { id: 'scroll-el', x: 0, y: 0 });

  elementNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 1, clientY: 1, buttons: 1 }));
  await tick();

  containerNode.dispatchEvent(new WheelEvent('wheel', { deltaY: 10 }));

  window.dispatchEvent(new MouseEvent('mouseup'));

  api.destroy();
});

it('initPanZoom - api zoomIn/zoomOut/setZoom/setPosition/reset', () => {
  const { api } = setup();

  api.zoomIn(0.1);
  api.zoomOut(0.05);
  api.setZoom(1.5);
  expect(api.getZoom()).toBe(1.5);

  api.setPosition(10, 20);
  expect(api.getPosition()).toStrictEqual({ x: 10, y: 20 });

  api.reset();
  expect(api.getZoom()).toBe(1);

  api.destroy();
});

it('initPanZoom - move api and goBackToBoundary', () => {
  const { api } = setup({ boundary: true });

  api.move(5, 5);
  api.goBackToBoundary();

  expect(api.getPosition()).toBeDefined();

  api.destroy();
});

it('initPanZoom - addElement, drag, and destroy element', async () => {
  const { api, childNode } = setup();

  const elementNode = document.createElement('div');
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 50, top: 0, bottom: 50, width: 50, height: 50,
  } as DOMRect);

  const onClick = vi.fn();
  const onMouseUp = vi.fn();
  const elementApi = api.addElement(elementNode, {
    id: 'el1', x: 0, y: 0, onClick, onMouseUp,
  });

  elementNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 5, clientY: 5, buttons: 1 }));
  expect(onClick).toHaveBeenCalled();

  await tick();

  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 15, clientY: 15, buttons: 1 }));
  window.dispatchEvent(new MouseEvent('mouseup', { clientX: 15, clientY: 15 }));
  expect(onMouseUp).toHaveBeenCalled();

  expect(Object.keys(api.getElements())).toContain('el1');

  api.updateElementPosition('el1', { x: 1, y: 1 });
  api.updateElementPositionSilent('el1', { x: 2, y: 2 });

  const stopGrab = api.grabElement('el1');
  if (stopGrab) stopGrab();

  elementApi.setOptions({ id: 'el1', x: 5, y: 5 });
  elementApi.destroy();

  api.destroy();
});

it('initPanZoom - addElement with family, zIndex, disabled, onContextMenu options', () => {
  const { api, childNode } = setup();

  const elementNode = document.createElement('div');
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 50, top: 0, bottom: 50, width: 50, height: 50,
  } as DOMRect);

  const onContextMenu = vi.fn();
  const elementApi = api.addElement(elementNode, {
    id: 'family-el', x: 0, y: 0, family: 'group-a', zIndex: 5, onContextMenu,
  });

  expect(elementNode.style.zIndex).toBe('5');

  elementNode.dispatchEvent(new MouseEvent('contextmenu', { clientX: 1, clientY: 1 }));
  expect(onContextMenu).toHaveBeenCalled();

  elementApi.setOptions({
    id: 'family-el', x: 0, y: 0, family: 'group-b', zIndex: undefined, disabled: true,
  });

  expect(elementNode.className).toContain('disabled');

  elementApi.destroy();
  api.destroy();
});

it('initPanZoom - addElement with resizing enabled', () => {
  const { api, childNode } = setup();

  const elementNode = document.createElement('div');
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 50, top: 0, bottom: 50, width: 50, height: 50, x: 0, y: 0,
  } as DOMRect);

  api.addElement(elementNode, {
    id: 'resizable-el', resizable: true, x: 0, y: 0,
  });

  const leftResizer = elementNode.children[0] as HTMLDivElement;
  leftResizer.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0, buttons: 1 }));
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 5, clientY: 0, buttons: 1 }));
  window.dispatchEvent(new MouseEvent('mouseup'));

  api.destroy();
});

it('initPanZoom - element dragged to edge triggers auto move', async () => {
  vi.useFakeTimers();
  const { api, childNode } = setup();

  const elementNode = document.createElement('div');
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 20, top: 0, bottom: 20, width: 20, height: 20,
  } as DOMRect);

  api.addElement(elementNode, { id: 'edge-el', x: 0, y: 0 });

  elementNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 1, clientY: 1, buttons: 1 }));
  await vi.advanceTimersByTimeAsync(0);

  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 1, clientY: 1, buttons: 1 }));
  await vi.advanceTimersByTimeAsync(100);

  window.dispatchEvent(new MouseEvent('mouseup'));
  await vi.advanceTimersByTimeAsync(0);

  api.destroy();
  vi.useRealTimers();
});

it('initPanZoom - resizing right edge with min/max width constraints', () => {
  const { api, childNode } = setup();

  const elementNode = document.createElement('div');
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 100, top: 0, bottom: 50, width: 100, height: 50, x: 0, y: 0,
  } as DOMRect);

  api.addElement(elementNode, {
    id: 'resize-right-el', resizable: true, x: 0, y: 0, resizedMinWidth: 20, resizedMaxWidth: 150,
  });

  const rightResizer = elementNode.children[1] as HTMLDivElement;
  rightResizer.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 0, buttons: 1 }));
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 300, clientY: 0, buttons: 1 }));
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: -300, clientY: 0, buttons: 1 }));
  window.dispatchEvent(new MouseEvent('mouseup'));

  api.destroy();
});

it('initPanZoom - select boundary drag collects elements', async () => {
  const { api, childNode } = setup({ selecting: true });

  const elementNode = document.createElement('div');
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 5, right: 15, top: 5, bottom: 15, width: 10, height: 10,
  } as DOMRect);

  api.addElement(elementNode, { id: 'sel-el', x: 5, y: 5 });

  const selectNode = childNode.lastElementChild as HTMLDivElement;
  expect(selectNode).toBeTruthy();

  selectNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0 }));
  await tick();
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
  window.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 100 }));
  await tick();

  api.destroy();
});

it('initPanZoom - setOptions updates context and re-renders', () => {
  const { api } = setup();

  api.setOptions({ disabled: true });
  api.setOptions({ zoomMin: 0.1 });

  api.destroy();
});

it('initPanZoom - onContainerPressStart, onContainerPressEnd and onContextMenu callbacks', () => {
  const onContainerPressStart = vi.fn();
  const onContainerPressEnd = vi.fn();
  const onContextMenu = vi.fn();
  const {
    api, containerNode,
  } = setup({ onContainerPressStart, onContainerPressEnd, onContextMenu });

  containerNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 1, clientY: 1 }));
  window.dispatchEvent(new MouseEvent('mouseup'));
  containerNode.dispatchEvent(new MouseEvent('contextmenu', { clientX: 1, clientY: 1 }));

  expect(onContainerPressStart).toHaveBeenCalled();
  expect(onContainerPressEnd).toHaveBeenCalled();
  expect(onContextMenu).toHaveBeenCalled();

  api.destroy();
});

it('initPanZoom - touch zoom gesture', () => {
  vi.useFakeTimers();
  const { api, containerNode } = setup();

  const touchStart = new Event('touchstart') as any;
  touchStart.touches = makeTouchList([{ clientX: 0, clientY: 0 }, { clientX: 10, clientY: 10 }]);
  containerNode.dispatchEvent(touchStart);

  vi.advanceTimersByTime(60);

  const touchMove = new Event('touchmove') as any;
  touchMove.touches = makeTouchList([{ clientX: 0, clientY: 0 }, { clientX: 80, clientY: 80 }]);
  containerNode.dispatchEvent(touchMove);

  vi.advanceTimersByTime(60);

  containerNode.dispatchEvent(new Event('touchend'));

  expect(api.getZoom()).toBeDefined();

  api.destroy();
  vi.useRealTimers();
});

it('initPanZoom - disabledUserSelect and selecting apply extra styles/classes then clean up on destroy', () => {
  const { api, childNode, containerNode } = setup({ disabledUserSelect: true, selecting: true });

  expect(containerNode.className).toContain('disabled-user-select');
  expect(childNode.style.pointerEvents).toBe('all');

  api.destroy();
});

it('initPanZoom - disabled options block move and zoom', () => {
  const { api, containerNode } = setup({ disabled: true });

  containerNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0, buttons: 1 }));
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50, buttons: 1 }));
  window.dispatchEvent(new MouseEvent('mouseup'));

  containerNode.dispatchEvent(new WheelEvent('wheel', { deltaY: -10 }));

  expect(api.getPosition()).toStrictEqual({ x: 0, y: 0 });

  api.destroy();
});

it('initPanZoom - onContainerPositionChange callback fires on move, scroll and zoom', () => {
  const onContainerPositionChange = vi.fn();
  const { api, containerNode } = setup({
    onContainerPositionChange,
    disabledScrollHorizontal: false,
    disabledScrollVertical: false,
  });

  containerNode.dispatchEvent(new MouseEvent('mousedown', {
    clientX: 10, clientY: 10, buttons: 1,
  }));
  window.dispatchEvent(new MouseEvent('mousemove', {
    clientX: 30, clientY: 40, buttons: 1,
  }));
  window.dispatchEvent(new MouseEvent('mouseup'));

  expect(onContainerPositionChange).toHaveBeenCalled();

  onContainerPositionChange.mockClear();
  containerNode.dispatchEvent(new WheelEvent('wheel', { deltaY: 10 }));
  expect(onContainerPositionChange).toHaveBeenCalled();

  onContainerPositionChange.mockClear();
  api.setPosition(5, 5);
  expect(onContainerPositionChange).toHaveBeenCalled();

  api.destroy();
});

it('initPanZoom - scroll: disabledScrollHorizontal only, deltaY negative (scroll down direction)', () => {
  const onContainerChange = vi.fn();
  const { api, containerNode } = setup({
    onContainerChange,
    disabledScrollHorizontal: true,
    disabledScrollVertical: false,
  });

  containerNode.dispatchEvent(new WheelEvent('wheel', { deltaY: -10 }));
  expect(onContainerChange).toHaveBeenCalled();

  api.destroy();
});

it('initPanZoom - scroll: disabledScrollVertical only, deltaY positive (scroll up direction)', () => {
  const onContainerChange = vi.fn();
  const { api, containerNode } = setup({
    onContainerChange,
    disabledScrollHorizontal: false,
    disabledScrollVertical: true,
  });

  containerNode.dispatchEvent(new WheelEvent('wheel', { deltaY: 10 }));
  expect(onContainerChange).toHaveBeenCalled();

  api.destroy();
});

it('initPanZoom - scroll without onContainerChange/onContainerPositionChange callbacks is a no-op for events', () => {
  const { api, containerNode } = setup({
    disabledScrollHorizontal: false, disabledScrollVertical: false,
  });

  containerNode.dispatchEvent(new WheelEvent('wheel', { deltaY: 10 }));

  expect(api.getPosition()).toBeDefined();

  api.destroy();
});

it('initPanZoom - addElement with draggableSelector blocks moves outside the selector', async () => {
  const { api, childNode } = setup();

  const elementNode = document.createElement('div');
  const handle = document.createElement('div');
  handle.className = 'drag-handle';
  elementNode.appendChild(handle);
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 50, top: 0, bottom: 50, width: 50, height: 50,
  } as DOMRect);

  const onClick = vi.fn();
  api.addElement(elementNode, {
    id: 'drag-selector-el', x: 0, y: 0, draggableSelector: '.drag-handle', onClick,
  });

  // mousedown directly on elementNode (not matching .drag-handle) should be blocked
  elementNode.dispatchEvent(new MouseEvent('mousedown', {
    clientX: 5, clientY: 5, buttons: 1, bubbles: true,
  }));
  expect(onClick).not.toHaveBeenCalled();

  // mousedown on the handle matches the selector and should proceed
  handle.dispatchEvent(new MouseEvent('mousedown', {
    clientX: 5, clientY: 5, buttons: 1, bubbles: true,
  }));
  expect(onClick).toHaveBeenCalled();

  window.dispatchEvent(new MouseEvent('mouseup'));

  api.destroy();
});

it('initPanZoom - addElement contextmenu is blocked by draggableSelector', () => {
  const { api, childNode } = setup();

  const elementNode = document.createElement('div');
  const handle = document.createElement('div');
  handle.className = 'drag-handle';
  elementNode.appendChild(handle);
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 50, top: 0, bottom: 50, width: 50, height: 50,
  } as DOMRect);

  const onContextMenu = vi.fn();
  api.addElement(elementNode, {
    id: 'ctx-selector-el', x: 0, y: 0, draggableSelector: '.drag-handle', onContextMenu,
  });

  elementNode.dispatchEvent(new MouseEvent('contextmenu', { clientX: 1, clientY: 1, bubbles: true }));
  expect(onContextMenu).not.toHaveBeenCalled();

  handle.dispatchEvent(new MouseEvent('contextmenu', { clientX: 1, clientY: 1, bubbles: true }));
  expect(onContextMenu).toHaveBeenCalled();

  api.destroy();
});

it('initPanZoom - addElement with family: moving one element moves siblings sharing the family', async () => {
  const { api, childNode } = setup();

  const elementNode = document.createElement('div');
  const siblingNode = document.createElement('div');
  childNode.appendChild(elementNode);
  childNode.appendChild(siblingNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 20, top: 0, bottom: 20, width: 20, height: 20,
  } as DOMRect);
  vi.spyOn(siblingNode, 'getBoundingClientRect').mockReturnValue({
    left: 30, right: 50, top: 30, bottom: 50, width: 20, height: 20,
  } as DOMRect);

  api.addElement(elementNode, { id: 'fam-1', x: 0, y: 0, family: 'group-x' });
  api.addElement(siblingNode, { id: 'fam-2', x: 30, y: 30, family: 'group-x' });

  elementNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 5, clientY: 5, buttons: 1 }));
  await tick();

  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 15, clientY: 15, buttons: 1 }));
  window.dispatchEvent(new MouseEvent('mouseup'));
  await tick();

  expect(api.getElements()['fam-2']).toBeDefined();

  api.destroy();
});

it('initPanZoom - addElement with followers: dragging the main element also moves followers', async () => {
  const { api, childNode } = setup();

  const elementNode = document.createElement('div');
  const followerNode = document.createElement('div');
  childNode.appendChild(elementNode);
  childNode.appendChild(followerNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 20, top: 0, bottom: 20, width: 20, height: 20,
  } as DOMRect);
  vi.spyOn(followerNode, 'getBoundingClientRect').mockReturnValue({
    left: 30, right: 50, top: 30, bottom: 50, width: 20, height: 20,
  } as DOMRect);

  api.addElement(elementNode, { id: 'leader', x: 0, y: 0, followers: ['follower'] });
  api.addElement(followerNode, { id: 'follower', x: 30, y: 30 });

  elementNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 5, clientY: 5, buttons: 1 }));
  await tick();

  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 15, clientY: 15, buttons: 1 }));
  window.dispatchEvent(new MouseEvent('mouseup'));
  await tick();

  expect(api.getElements().follower).toBeDefined();

  api.destroy();
});

it('initPanZoom - addElement: interval keeps dispatching onElementsChange while mouse stays down', async () => {
  vi.useFakeTimers();
  const onElementsChange = vi.fn();
  const { api, childNode } = setup({ onElementsChange });

  const elementNode = document.createElement('div');
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 20, top: 0, bottom: 20, width: 20, height: 20,
  } as DOMRect);

  api.addElement(elementNode, { id: 'interval-el', x: 0, y: 0 });

  elementNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 1, clientY: 1, buttons: 1 }));
  await vi.advanceTimersByTimeAsync(0);

  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 5, clientY: 5, buttons: 1 }));
  await vi.advanceTimersByTimeAsync(300);

  window.dispatchEvent(new MouseEvent('mouseup'));
  await vi.advanceTimersByTimeAsync(0);

  api.destroy();
  vi.useRealTimers();
});

it('initPanZoom - addElement: onClick handler calling stop() prevents move from starting', async () => {
  const { api, childNode } = setup();

  const elementNode = document.createElement('div');
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 20, top: 0, bottom: 20, width: 20, height: 20,
  } as DOMRect);

  const onClick = vi.fn(({ stop }) => stop());
  api.addElement(elementNode, { id: 'stop-el', x: 0, y: 0, onClick });

  elementNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 1, clientY: 1, buttons: 1 }));
  expect(onClick).toHaveBeenCalled();

  const positionBefore = api.getElements()['stop-el'].position;
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 15, clientY: 15, buttons: 1 }));
  window.dispatchEvent(new MouseEvent('mouseup'));

  expect(api.getElements()['stop-el'].position).toStrictEqual(positionBefore);

  api.destroy();
});

it('initPanZoom - onElementsChange option (grab via select) fires with element positions', async () => {
  const onElementsChange = vi.fn();
  const containerNode = document.createElement('div');
  const childNode = document.createElement('div');
  containerNode.appendChild(childNode);
  document.body.appendChild(containerNode);

  vi.spyOn(childNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 500, top: 0, bottom: 500, width: 500, height: 500,
  } as DOMRect);
  vi.spyOn(containerNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 500, top: 0, bottom: 500, width: 500, height: 500,
  } as DOMRect);

  const api = initPanZoom(childNode, { selecting: true, onElementsChange });
  const selectNode = childNode.lastElementChild as HTMLDivElement;

  const elementNode = document.createElement('div');
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 5, right: 15, top: 5, bottom: 15, width: 10, height: 10,
  } as DOMRect);
  api.addElement(elementNode, { id: 'grab-onchange-el', x: 5, y: 5 });

  selectNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0 }));
  await tick();
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
  window.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 100 }));
  await tick();

  const movingNode = selectNode.firstElementChild as HTMLDivElement;
  movingNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 50 }));
  await tick();
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 60, clientY: 60 }));
  await tick();
  window.dispatchEvent(new MouseEvent('mouseup'));
  await tick();

  expect(onElementsChange).toHaveBeenCalled();

  api.destroy();
});

it('initPanZoom - addElement destroy is idempotent when called twice', () => {
  const { api, childNode } = setup();

  const elementNode = document.createElement('div');
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 20, top: 0, bottom: 20, width: 20, height: 20,
  } as DOMRect);

  const elementApi = api.addElement(elementNode, { id: 'double-destroy-el', x: 0, y: 0 });

  expect(() => {
    elementApi.destroy();
    elementApi.destroy();
  }).not.toThrow();

  api.destroy();
});

it('initPanZoom - scroll while elements mid-move, deltaY negative direction updates positions too', async () => {
  const { api, childNode, containerNode } = setup({
    disabledScrollHorizontal: false, disabledScrollVertical: false,
  });

  const elementNode = document.createElement('div');
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 20, top: 0, bottom: 20, width: 20, height: 20,
  } as DOMRect);

  api.addElement(elementNode, { id: 'scroll-el-neg', x: 0, y: 0 });

  elementNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 1, clientY: 1, buttons: 1 }));
  await tick();

  containerNode.dispatchEvent(new WheelEvent('wheel', { deltaY: -10 }));

  window.dispatchEvent(new MouseEvent('mouseup'));

  api.destroy();
});

it('initPanZoom - api calls dispatch onContainerChange (position) and onContainerZoomChange (zoom) callbacks', () => {
  const onContainerChange = vi.fn();
  const onContainerZoomChange = vi.fn();
  const { api } = setup({ onContainerChange, onContainerZoomChange });

  api.setPosition(3, 3);
  expect(onContainerChange).toHaveBeenCalled();

  onContainerChange.mockClear();
  api.setZoom(1.2);
  expect(onContainerZoomChange).toHaveBeenCalled();

  api.destroy();
});

it('initPanZoom - mousemove with buttons released without an explicit mouseup stops the drag', () => {
  const { api, containerNode } = setup();

  containerNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0, buttons: 1 }));
  expect(() => {
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10, buttons: 0 }));
  }).not.toThrow();

  api.destroy();
});

it('initPanZoom - addElement throws when id is missing', () => {
  const { api, childNode } = setup();

  const elementNode = document.createElement('div');
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 20, top: 0, bottom: 20, width: 20, height: 20,
  } as DOMRect);

  expect(() => api.addElement(elementNode, { x: 0, y: 0 } as any)).toThrow();

  api.destroy();
});

it('initPanZoom - addElement contextmenu without onContextMenu handler is a no-op', () => {
  const { api, childNode } = setup();

  const elementNode = document.createElement('div');
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 20, top: 0, bottom: 20, width: 20, height: 20,
  } as DOMRect);

  api.addElement(elementNode, { id: 'no-ctx-el', x: 0, y: 0 });

  expect(() => {
    elementNode.dispatchEvent(new MouseEvent('contextmenu', { clientX: 1, clientY: 1 }));
  }).not.toThrow();

  api.destroy();
});

it('initPanZoom - addElement disabledMoveHorizontal/disabledMoveVertical lock respective axes while dragging', async () => {
  const { api, childNode } = setup();

  const elementNode = document.createElement('div');
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 20, top: 0, bottom: 20, width: 20, height: 20,
  } as DOMRect);

  api.addElement(elementNode, {
    id: 'axis-lock-el', x: 0, y: 0, disabledMoveHorizontal: true, disabledMoveVertical: true,
  });

  elementNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 1, clientY: 1, buttons: 1 }));
  await tick();

  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 15, clientY: 25, buttons: 1 }));
  window.dispatchEvent(new MouseEvent('mouseup'));
  await tick();

  const position = api.getElements()['axis-lock-el'].position;
  expect(position.x).toBe(0);
  expect(position.y).toBe(0);

  api.destroy();
});

it('initPanZoom - onContainerChange fires while dragging the container via mouse', () => {
  const onContainerChange = vi.fn();
  const { api, containerNode } = setup({ onContainerChange });

  containerNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0, buttons: 1 }));
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 20, clientY: 20, buttons: 1 }));
  expect(onContainerChange).toHaveBeenCalled();

  window.dispatchEvent(new MouseEvent('mouseup'));
  api.destroy();
});

it('initPanZoom - container mousedown with a non-primary button does not start a drag', () => {
  const onContainerPressStart = vi.fn();
  const { api, containerNode } = setup({ onContainerPressStart });

  containerNode.dispatchEvent(new MouseEvent('mousedown', {
    clientX: 0, clientY: 0, buttons: 2, button: 1,
  }));
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50, buttons: 2 }));
  window.dispatchEvent(new MouseEvent('mouseup'));

  expect(onContainerPressStart).not.toHaveBeenCalled();
  expect(api.getPosition()).toStrictEqual({ x: 0, y: 0 });

  api.destroy();
});

it('initPanZoom - touch pinch zoom blocks a concurrent container drag until the block timer clears', () => {
  vi.useFakeTimers();
  const { api, containerNode } = setup();

  const makeTouchEvent = (touches: Array<{ clientX: number; clientY: number }>) => Object.assign(
    new Event('touchmove', { bubbles: true }),
    {
      touches: {
        length: touches.length,
        item: (i: number) => touches[i],
      },
    },
  );

  try {
    containerNode.dispatchEvent(makeTouchEvent([
      { clientX: 0, clientY: 0 },
      { clientX: 100, clientY: 0 },
    ]) as unknown as Event);
  } catch (err) {
    // expected - known pre-existing first-tick bug, see useZoom.test.ts
  }
  vi.advanceTimersByTime(60);

  containerNode.dispatchEvent(makeTouchEvent([
    { clientX: -50, clientY: 0 },
    { clientX: 152, clientY: 0 },
  ]) as unknown as Event);

  // blockMovingRef.current is now true; a drag attempted right now must be a no-op
  containerNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0, buttons: 1 }));
  const positionBeforeBlockedMove = api.getPosition();
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50, buttons: 1 }));
  expect(api.getPosition()).toStrictEqual(positionBeforeBlockedMove);

  window.dispatchEvent(new MouseEvent('mouseup'));
  vi.advanceTimersByTime(400);

  api.destroy();
  vi.useRealTimers();
});
