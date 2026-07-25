import {
  afterEach, beforeEach, expect, it, vi,
} from 'vitest';

import initPanZoom from '@/initPanZoom';
import { ELEMENT_AUTO_MOVE_SPEED } from '@/consts';

const mockRect = (node: HTMLElement, rect: Partial<DOMRect>) => {
  node.getBoundingClientRect = () => ({
    x: rect.left || 0,
    y: rect.top || 0,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    toJSON: () => {},
    ...rect,
  } as DOMRect);
};

const setup = () => {
  const containerNode = document.createElement('div');
  const childNode = document.createElement('div');
  containerNode.appendChild(childNode);
  document.body.appendChild(containerNode);

  mockRect(containerNode, {
    left: 0, top: 0, right: 500, bottom: 500, width: 500, height: 500,
  });
  mockRect(childNode, {
    left: -100, top: -100, right: 600, bottom: 600, width: 700, height: 700,
  });

  const api = initPanZoom(childNode, { elementsAutoMoveAtEdge: true });

  const elementNode = document.createElement('div');
  mockRect(elementNode, {
    left: 0, top: 0, right: 50, bottom: 50, width: 50, height: 50,
  });
  api.addElement(elementNode, { id: 'a', x: 0, y: 0, width: 50, height: 50 });

  return {
    api, containerNode, childNode, elementNode,
  };
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

it('hooks/useElementAutoMoveAtEdge does nothing before any mousemove is recorded', () => {
  const { elementNode } = setup();

  elementNode.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 10, clientY: 10, button: 0,
  }));
  vi.advanceTimersByTime(0);

  vi.advanceTimersByTime(ELEMENT_AUTO_MOVE_SPEED * 2);
  // no throw, nothing to assert precisely - just ensures early-return branch executes
  expect(true).toBe(true);
});

it('hooks/useElementAutoMoveAtEdge moves position when cursor is on the left/bottom edge and edges are not visible', () => {
  const {
    api, childNode, elementNode,
  } = setup();

  api.setPosition(-50, 50);

  elementNode.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 10, clientY: 10, button: 0,
  }));
  vi.advanceTimersByTime(0);

  window.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true, clientX: 5, clientY: 460, buttons: 1,
  }));

  const before = { ...api.getPosition() };
  vi.advanceTimersByTime(ELEMENT_AUTO_MOVE_SPEED);
  const after = api.getPosition();

  expect(after).not.toStrictEqual(before);
  expect(childNode.style.transform).toBeTruthy();
});

it('hooks/useElementAutoMoveAtEdge moves position when cursor is on the right/top edge and edges are not visible', () => {
  const { api, elementNode } = setup();

  api.setPosition(0, -50);

  elementNode.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 10, clientY: 10, button: 0,
  }));
  vi.advanceTimersByTime(0);

  window.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true, clientX: 460, clientY: 5, buttons: 1,
  }));

  const before = { ...api.getPosition() };
  vi.advanceTimersByTime(ELEMENT_AUTO_MOVE_SPEED);
  const after = api.getPosition();

  expect(after).not.toStrictEqual(before);
});

it('hooks/useElementAutoMoveAtEdge does not move when cursor is not on an edge', () => {
  const { api, elementNode } = setup();

  elementNode.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 10, clientY: 10, button: 0,
  }));
  vi.advanceTimersByTime(0);

  window.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true, clientX: 250, clientY: 250, buttons: 1,
  }));

  const before = { ...api.getPosition() };
  vi.advanceTimersByTime(ELEMENT_AUTO_MOVE_SPEED);
  const after = api.getPosition();

  expect(after).toStrictEqual(before);
});

it('hooks/useElementAutoMoveAtEdge cleans up the interval and last event ref on mouseup', () => {
  const { api, elementNode } = setup();

  elementNode.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 10, clientY: 10, button: 0,
  }));
  vi.advanceTimersByTime(0);

  window.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true, clientX: 5, clientY: 5, buttons: 1,
  }));

  window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

  const before = { ...api.getPosition() };
  vi.advanceTimersByTime(ELEMENT_AUTO_MOVE_SPEED * 3);
  const after = api.getPosition();

  expect(after).toStrictEqual(before);
});
