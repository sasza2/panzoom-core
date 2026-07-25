import { expect, it } from 'vitest';

import positionFromEvent from './positionFromEvent';

it('helpers/positionFromEvent - touch event', () => {
  const event = { touches: [{ clientX: 10, clientY: 20 }] } as unknown as TouchEvent;
  expect(positionFromEvent(event)).toStrictEqual({ clientX: 10, clientY: 20 });
});

it('helpers/positionFromEvent - mouse event', () => {
  const event = { clientX: 30, clientY: 40 } as MouseEvent;
  expect(positionFromEvent(event)).toStrictEqual({ clientX: 30, clientY: 40 });
});
