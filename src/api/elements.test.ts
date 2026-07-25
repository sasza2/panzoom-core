import { expect, it, vi } from 'vitest';

import { createRef } from '@/helpers/effects';
import {
  getElements, updateElementPosition, updateElementPositionSilent, grabElement,
} from './elements';

it('api/elements/getElements', () => {
  const elementsRef = createRef({ a: { id: 'a' } }) as any;
  expect(getElements({ elementsRef })()).toStrictEqual({ a: { id: 'a' } });
});

it('api/elements/updateElementPosition - updates and dispatches change', () => {
  const node = document.createElement('div');
  const elementsRef = createRef({
    a: { id: 'a', position: { x: 0, y: 0 }, node: { current: node } },
  }) as any;
  const onElementsChangeRef = createRef(vi.fn()) as any;

  updateElementPosition({ elementsRef, onElementsChangeRef })('a', { x: 10, y: 20 });

  expect(elementsRef.current.a.position).toStrictEqual({ x: 10, y: 20 });
  expect(node.style.transform).toContain('translate(10px, 20px)');
  expect(onElementsChangeRef.current).toHaveBeenCalledWith({ a: { x: 10, y: 20 } });
});

it('api/elements/updateElementPosition - no-op for missing element', () => {
  const elementsRef = createRef({}) as any;
  const onElementsChangeRef = createRef(vi.fn()) as any;

  updateElementPosition({ elementsRef, onElementsChangeRef })('missing', { x: 1, y: 1 });

  expect(onElementsChangeRef.current).toHaveBeenCalled();
});

it('api/elements/updateElementPositionSilent - does not dispatch change', () => {
  const node = document.createElement('div');
  const elementsRef = createRef({
    a: { id: 'a', position: { x: 0, y: 0 }, node: { current: node } },
  }) as any;

  updateElementPositionSilent({ elementsRef, onElementsChangeRef: createRef(undefined) as any })('a', { x: 5, y: 5 });

  expect(elementsRef.current.a.position).toStrictEqual({ x: 5, y: 5 });
});

it('api/elements/grabElement - returns null for missing element', () => {
  const elementsRef = createRef({}) as any;
  const elementsUpdatePositionApiRef = createRef({}) as any;

  expect(grabElement({ elementsRef, elementsUpdatePositionApiRef })('missing')).toBe(null);
});

it('api/elements/grabElement - returns null when no update api registered', () => {
  const elementsRef = createRef({ a: {} }) as any;
  const elementsUpdatePositionApiRef = createRef({}) as any;

  expect(grabElement({ elementsRef, elementsUpdatePositionApiRef })('a')).toBe(null);
});

it('api/elements/grabElement - triggers move api with default and given position, unmount clears it', () => {
  const setElementsInMove = vi.fn();
  const elementsRef = createRef({ a: {} }) as any;
  const elementsUpdatePositionApiRef = createRef({ a: setElementsInMove }) as any;

  const stop = grabElement({ elementsRef, elementsUpdatePositionApiRef })('a');
  expect(setElementsInMove).toHaveBeenCalledWith({ a: { x: 0, y: 0 } });

  stop();
  expect(setElementsInMove).toHaveBeenCalledWith(null);
});

it('api/elements/grabElement - uses passed position', () => {
  const setElementsInMove = vi.fn();
  const elementsRef = createRef({ a: {} }) as any;
  const elementsUpdatePositionApiRef = createRef({ a: setElementsInMove }) as any;

  grabElement({ elementsRef, elementsUpdatePositionApiRef })('a', { x: 3, y: 4 });
  expect(setElementsInMove).toHaveBeenCalledWith({ a: { x: 3, y: 4 } });
});
