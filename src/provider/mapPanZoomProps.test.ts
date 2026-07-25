import { expect, it, vi } from 'vitest';

import mapPanZoomProps from './mapPanZoomProps';

it('provider/mapPanZoomProps - maps functions to Ref suffixed keys', () => {
  const onContainerChange = vi.fn();
  const result = mapPanZoomProps({ onContainerChange, disabled: true });

  expect(result.onContainerChangeRef).toBe(onContainerChange);
  expect(result.disabled).toBe(true);
});

it('provider/mapPanZoomProps - ignores disallowed and undefined props', () => {
  const result = mapPanZoomProps({ disabled: undefined, notAllowed: 'x' } as any);
  expect(result).toStrictEqual({});
});
