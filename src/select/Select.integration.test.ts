import {
  expect, it, vi, afterEach,
} from 'vitest';

import initPanZoom from '@/initPanZoom';

afterEach(() => {
  vi.restoreAllMocks();
});

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

const setup = () => {
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

  const api = initPanZoom(childNode, { selecting: true });
  const selectNode = childNode.lastElementChild as HTMLDivElement;

  return {
    api, childNode, containerNode, selectNode,
  };
};

it('select - drag to create boundary, then move it (grabbing elements inside)', async () => {
  const {
    api, childNode, selectNode,
  } = setup();

  const elementNode = document.createElement('div');
  childNode.appendChild(elementNode);
  vi.spyOn(elementNode, 'getBoundingClientRect').mockReturnValue({
    left: 5, right: 15, top: 5, bottom: 15, width: 10, height: 10,
  } as DOMRect);
  api.addElement(elementNode, { id: 'sel-el', x: 5, y: 5 });

  selectNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0 }));
  await tick();

  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
  window.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 100 }));
  await tick();

  const movingNode = selectNode.firstElementChild as HTMLDivElement;
  expect(movingNode).toBeTruthy();

  movingNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 50 }));
  await tick();

  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 60, clientY: 60 }));
  window.dispatchEvent(new MouseEvent('mouseup'));
  await tick();

  api.destroy();
});

it('select - mousedown directly on select area deselects boundary', async () => {
  const { selectNode } = setup();

  selectNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0 }));
  await tick();
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 30 }));
  window.dispatchEvent(new MouseEvent('mouseup', { clientX: 30, clientY: 30 }));
  await tick();

  selectNode.dispatchEvent(new MouseEvent('mousedown', { clientX: 1, clientY: 1 }));
  await tick();
});
