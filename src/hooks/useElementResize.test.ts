import {
  afterEach, beforeEach, expect, it, vi,
} from 'vitest';

import initPanZoom from '@/initPanZoom';

// jsdom doesn't implement DOMMatrixReadOnly - provide a minimal polyfill for
// this test file only (production code relies on the real browser API).
class DOMMatrixReadOnlyPolyfill {
  e = 0;

  f = 0;

  constructor(transformString?: string) {
    if (!transformString) return;
    const match = transformString.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
    if (match) {
      this.e = parseFloat(match[1]);
      this.f = parseFloat(match[2]);
    }
  }
}

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

beforeEach(() => {
  // @ts-expect-error test polyfill
  global.DOMMatrixReadOnly = DOMMatrixReadOnlyPolyfill;
});

afterEach(() => {
  delete (global as { DOMMatrixReadOnly?: unknown }).DOMMatrixReadOnly;
  document.body.innerHTML = '';
});

const setup = (elementOptions: Record<string, unknown> = {}) => {
  const containerNode = document.createElement('div');
  const childNode = document.createElement('div');
  containerNode.appendChild(childNode);
  document.body.appendChild(containerNode);

  mockRect(containerNode, {
    left: 0, top: 0, right: 500, bottom: 500, width: 500, height: 500,
  });
  mockRect(childNode, {
    left: 0, top: 0, right: 500, bottom: 500, width: 500, height: 500,
  });

  const api = initPanZoom(childNode);

  const elementNode = document.createElement('div');
  elementNode.style.transform = 'translate(100px, 50px)';
  mockRect(elementNode, {
    left: 100, top: 50, right: 300, bottom: 150, width: 200, height: 100,
  });

  const elementApi = api.addElement(elementNode, {
    id: 'a', x: 100, y: 50, width: 200, height: 100, ...elementOptions,
  });

  return {
    api, containerNode, childNode, elementNode, elementApi,
  };
};

it('hooks/useElementResize does not render resizer nodes when resizable is disabled', () => {
  const { elementNode } = setup({ resizable: false });
  expect(elementNode.children.length).toBe(0);
});

it('hooks/useElementResize does not render resizer nodes when disabled is true', () => {
  const { elementNode } = setup({ resizable: true, disabled: true });
  expect(elementNode.children.length).toBe(0);
});

it('hooks/useElementResize left resizer: drag beyond min width clamps and calls callbacks', () => {
  const onStartResizing = vi.fn();
  const onAfterResize = vi.fn();

  const { elementNode, api } = setup({
    resizable: true,
    resizedMinWidth: 50,
    resizedMaxWidth: 400,
    onStartResizing,
    onAfterResize,
  });

  const left = elementNode.children[0] as HTMLDivElement;
  expect(left.style.cursor).toBe('w-resize');

  // button !== 0 should be ignored
  left.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 150, clientY: 100, button: 1,
  }));
  expect(onStartResizing).not.toHaveBeenCalled();

  left.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 150, clientY: 100, button: 0,
  }));
  expect(onStartResizing).toHaveBeenCalledTimes(1);

  // move far to the right - shrinks width past resizedMinWidth
  window.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true, clientX: 350, clientY: 100,
  }));

  expect(parseFloat(elementNode.style.width)).toBe(50);

  window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  expect(onAfterResize).toHaveBeenCalledTimes(1);

  expect(api.getElements().a.position.x).toBeGreaterThan(0);
});

it('hooks/useElementResize left resizer: drag left clamps to resizedMaxWidth', () => {
  const { elementNode } = setup({
    resizable: true,
    resizedMinWidth: 10,
    resizedMaxWidth: 220,
  });

  const left = elementNode.children[0] as HTMLDivElement;

  left.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 150, clientY: 100, button: 0,
  }));

  // move far to the left - grows width past resizedMaxWidth
  window.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true, clientX: -200, clientY: 100,
  }));

  expect(parseFloat(elementNode.style.width)).toBe(220);

  window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
});

it('hooks/useElementResize right resizer: drag left clamps to resizedMinWidth (early return)', () => {
  const onAfterResize = vi.fn();

  const { elementNode, api } = setup({
    resizable: true,
    resizedMinWidth: 50,
    resizedMaxWidth: 400,
    onAfterResize,
    zIndex: 5,
  });

  const right = elementNode.children[1] as HTMLDivElement;
  expect(right.style.cursor).toBe('e-resize');

  right.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 300, clientY: 100, button: 0,
  }));

  window.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true, clientX: 100, clientY: 100,
  }));

  expect(parseFloat(elementNode.style.width)).toBe(50);

  window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  expect(onAfterResize).toHaveBeenCalledTimes(1);
  expect(api.getElements().a).toBeDefined();
});

it('hooks/useElementResize right resizer: drag right clamps to resizedMaxWidth', () => {
  const { elementNode } = setup({
    resizable: true,
    resizedMinWidth: 10,
    resizedMaxWidth: 250,
  });

  const right = elementNode.children[1] as HTMLDivElement;

  right.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 300, clientY: 100, button: 0,
  }));

  window.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true, clientX: 900, clientY: 100,
  }));

  expect(parseFloat(elementNode.style.width)).toBe(250);

  window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
});

it('hooks/useElementResize right resizer: unclamped resize within bounds', () => {
  const { elementNode } = setup({
    resizable: true,
  });

  const right = elementNode.children[1] as HTMLDivElement;

  right.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 300, clientY: 100, button: 0,
  }));

  window.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true, clientX: 320, clientY: 100,
  }));

  expect(parseFloat(elementNode.style.width)).toBe(220);

  window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
});

it('hooks/useElementResize removes resizer nodes on unmount / destroy', () => {
  const { elementNode, elementApi } = setup({ resizable: true });

  expect(elementNode.children.length).toBe(2);

  elementApi.destroy();

  expect(elementNode.children.length).toBe(0);
});

it('hooks/useElementResize does not render vertical resizer nodes when resizableVertical is disabled', () => {
  const { elementNode } = setup({ resizableVertical: false });
  expect(elementNode.children.length).toBe(0);
});

it('hooks/useElementResize renders both horizontal and vertical resizers when both options are set', () => {
  const { elementNode } = setup({ resizable: true, resizableVertical: true });
  expect(elementNode.children.length).toBe(4);
});

it('hooks/useElementResize top resizer: drag down beyond min height clamps and calls callbacks', () => {
  const onStartResizing = vi.fn();
  const onAfterResize = vi.fn();

  const { elementNode, api } = setup({
    resizableVertical: true,
    resizedMinHeight: 50,
    resizedMaxHeight: 400,
    onStartResizing,
    onAfterResize,
  });

  const top = elementNode.children[0] as HTMLDivElement;
  expect(top.style.cursor).toBe('n-resize');

  // button !== 0 should be ignored
  top.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 150, clientY: 100, button: 1,
  }));
  expect(onStartResizing).not.toHaveBeenCalled();

  top.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 150, clientY: 100, button: 0,
  }));
  expect(onStartResizing).toHaveBeenCalledTimes(1);

  // move far down - shrinks height past resizedMinHeight
  window.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true, clientX: 150, clientY: 300,
  }));

  expect(parseFloat(elementNode.style.height)).toBe(50);

  window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  expect(onAfterResize).toHaveBeenCalledTimes(1);

  expect(api.getElements().a.position.y).toBeGreaterThan(0);
});

it('hooks/useElementResize top resizer: drag up clamps to resizedMaxHeight', () => {
  const { elementNode } = setup({
    resizableVertical: true,
    resizedMinHeight: 10,
    resizedMaxHeight: 120,
  });

  const top = elementNode.children[0] as HTMLDivElement;

  top.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 150, clientY: 60, button: 0,
  }));

  // move far up - grows height past resizedMaxHeight
  window.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true, clientX: 150, clientY: -200,
  }));

  expect(parseFloat(elementNode.style.height)).toBe(120);

  window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
});

it('hooks/useElementResize bottom resizer: drag up clamps to resizedMinHeight (early return)', () => {
  const onAfterResize = vi.fn();

  const { elementNode, api } = setup({
    resizableVertical: true,
    resizedMinHeight: 50,
    resizedMaxHeight: 400,
    onAfterResize,
    zIndex: 5,
  });

  const bottom = elementNode.children[1] as HTMLDivElement;
  expect(bottom.style.cursor).toBe('s-resize');

  bottom.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 150, clientY: 150, button: 0,
  }));

  window.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true, clientX: 150, clientY: 50,
  }));

  expect(parseFloat(elementNode.style.height)).toBe(50);

  window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  expect(onAfterResize).toHaveBeenCalledTimes(1);
  expect(api.getElements().a).toBeDefined();
});

it('hooks/useElementResize bottom resizer: drag down clamps to resizedMaxHeight', () => {
  const { elementNode } = setup({
    resizableVertical: true,
    resizedMinHeight: 10,
    resizedMaxHeight: 200,
  });

  const bottom = elementNode.children[1] as HTMLDivElement;

  bottom.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 150, clientY: 150, button: 0,
  }));

  window.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true, clientX: 150, clientY: 900,
  }));

  expect(parseFloat(elementNode.style.height)).toBe(200);

  window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
});

it('hooks/useElementResize bottom resizer: unclamped resize within bounds', () => {
  const { elementNode } = setup({
    resizableVertical: true,
  });

  const bottom = elementNode.children[1] as HTMLDivElement;

  bottom.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, clientX: 150, clientY: 150, button: 0,
  }));

  window.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true, clientX: 150, clientY: 170,
  }));

  expect(parseFloat(elementNode.style.height)).toBe(120);

  window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
});

it('hooks/useElementResize removes vertical resizer nodes on unmount / destroy', () => {
  const { elementNode, elementApi } = setup({ resizableVertical: true });

  expect(elementNode.children.length).toBe(2);

  elementApi.destroy();

  expect(elementNode.children.length).toBe(0);
});
