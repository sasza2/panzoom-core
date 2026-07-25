import { expect, it } from 'vitest';

import isEventMobileZoom from './isEventMobileZoom';

it('helpers/isEventMobileZoom - touch event with multiple touches', () => {
  const event = { touches: [{}, {}] } as unknown as TouchEvent;
  expect(isEventMobileZoom(event)).toBe(true);
});

it('helpers/isEventMobileZoom - touch event with single touch', () => {
  const event = { touches: [{}] } as unknown as TouchEvent;
  expect(isEventMobileZoom(event)).toBe(false);
});

it('helpers/isEventMobileZoom - mouse event', () => {
  const event = {} as MouseEvent;
  expect(isEventMobileZoom(event)).toBe(false);
});
