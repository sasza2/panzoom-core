import {
  afterEach, beforeEach, expect, it, vi,
} from 'vitest';

import touchEventToZoomInit from './touchEventToZoomInit';

type FakeTouch = { clientX: number; clientY: number };

const makeTouchList = (touches: Array<FakeTouch>) => ({
  length: touches.length,
  item: (i: number) => touches[i] as unknown as Touch,
});

const makeTouchEvent = (touches: Array<FakeTouch>): TouchEvent => ({
  touches: makeTouchList(touches) as unknown as TouchList,
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
} as unknown as TouchEvent);

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('helpers/touchEventToZoomInit returns null when touches.length !== 2', () => {
  const [transform] = touchEventToZoomInit();

  const e = makeTouchEvent([{ clientX: 0, clientY: 0 }]);
  expect(transform(e)).toBeNull();
  expect(e.preventDefault).not.toHaveBeenCalled();
});

it('helpers/touchEventToZoomInit returns null on the first call (no previous center yet)', () => {
  const [transform] = touchEventToZoomInit();

  const e = makeTouchEvent([
    { clientX: 0, clientY: 0 },
    { clientX: 100, clientY: 0 },
  ]);

  expect(transform(e)).toBeNull();
  expect(e.preventDefault).toHaveBeenCalled();
  expect(e.stopPropagation).toHaveBeenCalled();
});

it('helpers/touchEventToZoomInit returns null when the center moved more than the pinch distance changed (panning)', () => {
  const [transform] = touchEventToZoomInit();

  const e1 = makeTouchEvent([
    { clientX: 0, clientY: 0 },
    { clientX: 100, clientY: 0 },
  ]);
  transform(e1);
  vi.advanceTimersByTime(60);

  // same pinch distance (100), but the center moved a lot
  const e2 = makeTouchEvent([
    { clientX: 200, clientY: 0 },
    { clientX: 300, clientY: 0 },
  ]);

  expect(transform(e2)).toBeNull();
});

it('helpers/touchEventToZoomInit returns a zero-delta zoom event when the pinch distance stays the same', () => {
  const [transform] = touchEventToZoomInit();

  const e1 = makeTouchEvent([
    { clientX: 0, clientY: 0 },
    { clientX: 100, clientY: 0 },
  ]);
  transform(e1);
  vi.advanceTimersByTime(60);

  const e2 = makeTouchEvent([
    { clientX: 200, clientY: 0 },
    { clientX: 300, clientY: 0 },
  ]);
  transform(e2);
  vi.advanceTimersByTime(60);

  // same center and same pinch distance as before (100)
  const e3 = makeTouchEvent([
    { clientX: 200, clientY: 0 },
    { clientX: 300, clientY: 0 },
  ]);

  const result = transform(e3);
  expect(result).toStrictEqual({
    deltaY: 0,
    clientX: 250,
    clientY: 0,
    isTouchEvent: true,
  });
});

it('helpers/touchEventToZoomInit returns deltaY -1 when the pinch distance increases (zoom in)', () => {
  const [transform] = touchEventToZoomInit();

  const e1 = makeTouchEvent([
    { clientX: 0, clientY: 0 },
    { clientX: 100, clientY: 0 },
  ]);
  transform(e1);
  vi.advanceTimersByTime(60);

  // center moved a little, pinch distance grew a lot (zooming in)
  const e2 = makeTouchEvent([
    { clientX: -50, clientY: 0 },
    { clientX: 152, clientY: 0 },
  ]);

  const result = transform(e2);
  expect(result).toStrictEqual({
    deltaY: -1,
    clientX: 51,
    clientY: 0,
    isTouchEvent: true,
  });
});

it('helpers/touchEventToZoomInit returns deltaY 1 when the pinch distance decreases (zoom out)', () => {
  const [transform] = touchEventToZoomInit();

  const e1 = makeTouchEvent([
    { clientX: 0, clientY: 0 },
    { clientX: 200, clientY: 0 },
  ]);
  transform(e1);
  vi.advanceTimersByTime(60);

  const e2 = makeTouchEvent([
    { clientX: 50, clientY: 0 },
    { clientX: 102, clientY: 0 },
  ]);

  const result = transform(e2);
  expect(result).toStrictEqual({
    deltaY: 1,
    clientX: 76,
    clientY: 0,
    isTouchEvent: true,
  });
});

it('helpers/touchEventToZoomInit reset clears internal state and pending timer', () => {
  const [transform, reset] = touchEventToZoomInit();

  const e1 = makeTouchEvent([
    { clientX: 0, clientY: 0 },
    { clientX: 100, clientY: 0 },
  ]);
  transform(e1);

  reset();

  const e2 = makeTouchEvent([
    { clientX: 200, clientY: 0 },
    { clientX: 300, clientY: 0 },
  ]);

  // after reset, state is fresh again - first call after reset returns null
  expect(transform(e2)).toBeNull();
});
